import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
var e=`// Package client \u2014 the embedded runtime for generated Go SDKs. Hand-authored
// once and stitched into every generated client (see
// scripts/generate-runtime-sources.mjs), semantically in lockstep with the
// TypeScript runtime: auth OR-alternatives, a retry loop with Retry-After and
// full-jitter backoff, per-attempt timeouts, idempotency keys, and middleware
// hooks. Standard library only \u2014 a generated Go SDK has zero dependencies.
package client

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"math/rand"
	"mime/multipart"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"
)

// APIError is returned for a non-2xx response, carrying the decoded error body.
type APIError struct {
	URL        string
	Status     int
	StatusText string
	Body       any
}

func (e *APIError) Error() string {
	return fmt.Sprintf("request failed with status %d", e.Status)
}

// TimeoutError is returned when a request attempt exceeds the configured
// timeout \u2014 carrying the context a log line needs.
type TimeoutError struct {
	OperationID string
	Timeout     time.Duration
	Attempt     int
}

func (e *TimeoutError) Error() string {
	return fmt.Sprintf("request %q timed out after %s (attempt %d)", e.OperationID, e.Timeout, e.Attempt)
}

// SecuritySpec mirrors the descriptor table's security entries.
type SecuritySpec struct {
	Scheme string
	Kind   string // "bearer" | "basic" | "apiKey"
	Name   string // header/query/cookie name for apiKey
	In     string // "header" | "query" | "cookie"
}

// Auth holds the client credentials; zero value = anonymous.
type Auth struct {
	Bearer func() string
	Basic  *BasicAuth
	APIKey map[string]func() string
}

type BasicAuth struct {
	Username string
	Password string
}

// RetryConfig mirrors the TypeScript runtime's retry policy knobs.
type RetryConfig struct {
	Retries       int
	RetryDelay    time.Duration // base; default 1s
	RetryStrategy string        // "" (exponential) | "fixed"
	NoJitter      bool
	// RetryOn fully replaces the default predicate when set.
	RetryOn func(attempt int, resp *http.Response, err error) bool
}

// Middleware hooks run around every request (OnRequest before serialization order
// is N/A in Go \u2014 bodies are values; OnResponse runs in reverse registration order).
type Middleware struct {
	OnRequest  func(req *http.Request)
	OnResponse func(resp *http.Response)
}

// Date is an RFC 3339 full-date \u2014 a calendar date with no time component. Fields
// typed \`date\` under \`dateType: Date\` use it because encoding/json speaks only
// RFC 3339 date-time for time.Time, which a bare "2006-01-02" fails to satisfy.
type Date struct {
	time.Time
}

const dateLayout = "2006-01-02"

// UnmarshalJSON parses a "2006-01-02" string; an empty string leaves the zero value.
func (d *Date) UnmarshalJSON(data []byte) error {
	var raw string
	if err := json.Unmarshal(data, &raw); err != nil {
		return err
	}
	if raw == "" {
		return nil
	}
	parsed, err := time.Parse(dateLayout, raw)
	if err != nil {
		return err
	}
	d.Time = parsed
	return nil
}

// MarshalJSON writes the date back without a time component.
func (d Date) MarshalJSON() ([]byte, error) {
	return json.Marshal(d.Format(dateLayout))
}

// Config is the per-client configuration shared by every operation method.
type Config struct {
	ServerURL      string
	HTTPClient     *http.Client
	Headers        map[string]string
	Timeout        time.Duration
	Retry          RetryConfig
	Middleware     []Middleware
	IdempotencyKey func() string
	Auth           Auth
}

func resolveToken(provider func() string) string {
	if provider == nil {
		return ""
	}
	return provider()
}

func schemeConfigured(spec SecuritySpec, auth Auth) bool {
	switch spec.Kind {
	case "apiKey":
		_, ok := auth.APIKey[spec.Scheme]
		return ok
	case "bearer":
		return auth.Bearer != nil
	default:
		return auth.Basic != nil
	}
}

// resolveAuth applies the first fully-configured OR-alternative; when none is,
// the first alternative's configured schemes are still sent (the server rejects
// the request \u2014 same behavior as the TypeScript runtime).
func resolveAuth(security [][]SecuritySpec, auth Auth) (map[string]string, url.Values) {
	headers := map[string]string{}
	query := url.Values{}
	if len(security) == 0 {
		return headers, query
	}
	alternative := security[0]
	for _, candidate := range security {
		all := true
		for _, spec := range candidate {
			if !schemeConfigured(spec, auth) {
				all = false
				break
			}
		}
		if all {
			alternative = candidate
			break
		}
	}
	var cookies []string
	for _, spec := range alternative {
		switch spec.Kind {
		case "apiKey":
			provider, ok := auth.APIKey[spec.Scheme]
			if !ok {
				continue
			}
			value := resolveToken(provider)
			switch spec.In {
			case "query":
				query.Set(spec.Name, value)
			case "cookie":
				cookies = append(cookies, spec.Name+"="+url.QueryEscape(value))
			default:
				headers[spec.Name] = value
			}
		case "bearer":
			if auth.Bearer != nil {
				headers["Authorization"] = "Bearer " + resolveToken(auth.Bearer)
			}
		default:
			if auth.Basic != nil {
				token := base64.StdEncoding.EncodeToString([]byte(auth.Basic.Username + ":" + auth.Basic.Password))
				headers["Authorization"] = "Basic " + token
			}
		}
	}
	if len(cookies) > 0 {
		headers["Cookie"] = strings.Join(cookies, "; ")
	}
	return headers, query
}

// buildURL substitutes {param} path placeholders with percent-encoded values.
func buildURL(serverURL, path string, pathParams map[string]string) string {
	filled := path
	for name, value := range pathParams {
		filled = strings.ReplaceAll(filled, "{"+name+"}", url.PathEscape(value))
	}
	return strings.TrimRight(serverURL, "/") + filled
}

var transientStatus = map[int]bool{408: true, 429: true, 500: true, 502: true, 503: true, 504: true}

func defaultRetryOn(method string, headers map[string]string, resp *http.Response, err error) bool {
	safe := false
	switch strings.ToUpper(method) {
	case "GET", "HEAD", "PUT", "DELETE", "OPTIONS":
		safe = true
	}
	if _, ok := headers["Idempotency-Key"]; ok {
		safe = true
	}
	if !safe {
		return false
	}
	if err != nil {
		return true
	}
	return resp != nil && transientStatus[resp.StatusCode]
}

func retryDelay(retry RetryConfig, attempt int, retryAfter string) time.Duration {
	if retryAfter != "" {
		if seconds, err := strconv.ParseFloat(retryAfter, 64); err == nil {
			return time.Duration(seconds * float64(time.Second))
		}
	}
	base := retry.RetryDelay
	if base == 0 {
		base = time.Second
	}
	raw := base
	if retry.RetryStrategy != "fixed" {
		raw = base * time.Duration(1<<(attempt-1))
	}
	if retry.NoJitter {
		return raw
	}
	return time.Duration(rand.Int63n(int64(raw) + 1))
}

type requestSpec struct {
	OperationID    string
	Method         string
	URL            string
	Headers        map[string]string
	Query          url.Values
	Body           io.Reader
	ContentType    string
	Timeout        time.Duration
	Retry          *RetryConfig
	IdempotencyKey string
	// bodyBytes is retained so retries can replay the body.
	bodyBytes []byte
}

// send is the request core: header merge, idempotency keys, the retry loop
// (fresh timeout budget per attempt), and the middleware onion.
func send(ctx context.Context, config *Config, spec requestSpec) (*http.Response, error) {
	retry := config.Retry
	if spec.Retry != nil {
		retry = *spec.Retry
	}
	timeout := config.Timeout
	if spec.Timeout != 0 {
		timeout = spec.Timeout
	}
	headers := map[string]string{}
	for key, value := range config.Headers {
		headers[key] = value
	}
	for key, value := range spec.Headers {
		headers[key] = value
	}
	method := strings.ToUpper(spec.Method)
	if (method == "POST" || method == "PATCH") && headers["Idempotency-Key"] == "" {
		if spec.IdempotencyKey != "" {
			headers["Idempotency-Key"] = spec.IdempotencyKey
		} else if config.IdempotencyKey != nil {
			headers["Idempotency-Key"] = config.IdempotencyKey()
		}
	}
	httpClient := config.HTTPClient
	if httpClient == nil {
		httpClient = http.DefaultClient
	}
	if spec.Body != nil {
		payload, err := io.ReadAll(spec.Body)
		if err != nil {
			return nil, err
		}
		spec.bodyBytes = payload
	}
	fullURL := spec.URL
	if len(spec.Query) > 0 {
		separator := "?"
		if strings.Contains(fullURL, "?") {
			separator = "&"
		}
		fullURL += separator + spec.Query.Encode()
	}
	maxAttempts := 1 + retry.Retries
	for attempt := 1; ; attempt++ {
		attemptCtx := ctx
		var cancel context.CancelFunc
		if timeout > 0 {
			attemptCtx, cancel = context.WithTimeout(ctx, timeout)
		}
		var bodyReader io.Reader
		if spec.bodyBytes != nil {
			bodyReader = bytes.NewReader(spec.bodyBytes)
		}
		req, err := http.NewRequestWithContext(attemptCtx, method, fullURL, bodyReader)
		if err != nil {
			if cancel != nil {
				cancel()
			}
			return nil, err
		}
		for key, value := range headers {
			req.Header.Set(key, value)
		}
		if spec.ContentType != "" && spec.bodyBytes != nil {
			req.Header.Set("Content-Type", spec.ContentType)
		}
		for _, mw := range config.Middleware {
			if mw.OnRequest != nil {
				mw.OnRequest(req)
			}
		}
		resp, err := httpClient.Do(req)
		shouldRetry := retry.RetryOn
		retryable := false
		if shouldRetry != nil {
			retryable = shouldRetry(attempt, resp, err)
		} else {
			retryable = defaultRetryOn(method, headers, resp, err)
		}
		if err != nil {
			if cancel != nil {
				cancel()
			}
			timedOut := errors.Is(err, context.DeadlineExceeded) && ctx.Err() == nil
			if attempt < maxAttempts && retryable {
				time.Sleep(retryDelay(retry, attempt, ""))
				continue
			}
			if timedOut {
				return nil, &TimeoutError{OperationID: spec.OperationID, Timeout: timeout, Attempt: attempt}
			}
			return nil, err
		}
		for i := len(config.Middleware) - 1; i >= 0; i-- {
			if config.Middleware[i].OnResponse != nil {
				config.Middleware[i].OnResponse(resp)
			}
		}
		if resp.StatusCode >= 400 && attempt < maxAttempts && retryable {
			after := resp.Header.Get("Retry-After")
			io.Copy(io.Discard, resp.Body)
			resp.Body.Close()
			if cancel != nil {
				cancel()
			}
			time.Sleep(retryDelay(retry, attempt, after))
			continue
		}
		// The response body outlives this call; tie the attempt context's lifetime to it.
		if cancel != nil {
			resp.Body = &cancelOnClose{ReadCloser: resp.Body, cancel: cancel}
		}
		return resp, nil
	}
}

type cancelOnClose struct {
	io.ReadCloser
	cancel context.CancelFunc
}

func (c *cancelOnClose) Close() error {
	c.cancel()
	return c.ReadCloser.Close()
}

// decodeJSON decodes a response body into target; a nil target drains and closes.
func decodeJSON(resp *http.Response, target any) error {
	defer resp.Body.Close()
	if target == nil {
		_, err := io.Copy(io.Discard, resp.Body)
		return err
	}
	return json.NewDecoder(resp.Body).Decode(target)
}

// headerString returns the named response header, or nil when absent.
func headerString(header http.Header, name string) *string {
	value := header.Get(name)
	if value == "" {
		return nil
	}
	return &value
}

// headerInt64 parses the named header as an integer; nil when absent or unparsable.
func headerInt64(header http.Header, name string) *int64 {
	raw := strings.TrimSpace(header.Get(name))
	if raw == "" {
		return nil
	}
	value, err := strconv.ParseInt(raw, 10, 64)
	if err != nil {
		return nil
	}
	return &value
}

// headerFloat64 parses the named header as a number; nil when absent or unparsable.
func headerFloat64(header http.Header, name string) *float64 {
	raw := strings.TrimSpace(header.Get(name))
	if raw == "" {
		return nil
	}
	value, err := strconv.ParseFloat(raw, 64)
	if err != nil {
		return nil
	}
	return &value
}

// headerBool parses a \`true\`/\`false\` header; nil when absent or anything else.
func headerBool(header http.Header, name string) *bool {
	raw := strings.ToLower(strings.TrimSpace(header.Get(name)))
	if raw != "true" && raw != "false" {
		return nil
	}
	value := raw == "true"
	return &value
}

// apiErrorFrom builds the structured error for a non-2xx response.
func apiErrorFrom(resp *http.Response, requestURL string) error {
	defer resp.Body.Close()
	var body any
	data, _ := io.ReadAll(resp.Body)
	if len(data) > 0 {
		if err := json.Unmarshal(data, &body); err != nil {
			body = string(data)
		}
	}
	return &APIError{URL: requestURL, Status: resp.StatusCode, StatusText: resp.Status, Body: body}
}

// \u2500\u2500\u2500 Pagination \u2500\u2500\u2500

// PaginationSpec mirrors the descriptor table's pagination entries.
type PaginationSpec struct {
	Style      string
	Param      string
	NextCursor string
	HasMore    string
	LimitParam string
	Items      string
}

// resolvePointer walks an RFC 6901 JSON pointer over decoded JSON; nil on any miss.
func resolvePointer(data any, pointer string) any {
	if pointer == "" {
		return data
	}
	if !strings.HasPrefix(pointer, "/") {
		return nil
	}
	current := data
	for _, token := range strings.Split(pointer[1:], "/") {
		key := strings.ReplaceAll(strings.ReplaceAll(token, "~1", "/"), "~0", "~")
		switch typed := current.(type) {
		case map[string]any:
			current = typed[key]
		case []any:
			index, err := strconv.Atoi(key)
			if err != nil || index < 0 || index >= len(typed) {
				return nil
			}
			current = typed[index]
		default:
			return nil
		}
		if current == nil {
			return nil
		}
	}
	return current
}

// reencode converts decoded JSON (maps/slices) into a typed value via a JSON round-trip.
func reencode(raw any, target any) error {
	data, err := json.Marshal(raw)
	if err != nil {
		return err
	}
	return json.Unmarshal(data, target)
}

type pageCall func(params url.Values) (any, *http.Response, error)

// iterPages yields raw page JSON per the pagination spec \u2014 the same stop
// conditions and infinite-loop guards as the TypeScript runtime. The returned
// function is a range-over-func iterator (Go 1.23+) and plainly callable before that.
func iterPages(call pageCall, spec PaginationSpec, base url.Values) func(yield func(any, error) bool) {
	return func(yield func(any, error) bool) {
		switch spec.Style {
		case "cursor":
			var cursor any
			if values, ok := base[spec.Param]; ok && len(values) > 0 {
				cursor = values[0]
			}
			for {
				params := cloneValues(base)
				if cursor != nil {
					params.Set(spec.Param, fmt.Sprint(cursor))
				}
				page, _, err := call(params)
				if err != nil {
					yield(nil, err)
					return
				}
				if !yield(page, nil) {
					return
				}
				if spec.HasMore != "" {
					if more, ok := resolvePointer(page, spec.HasMore).(bool); ok && !more {
						return
					}
				}
				next := resolvePointer(page, spec.NextCursor)
				if next == nil || next == "" {
					return
				}
				switch next.(type) {
				case string, float64:
				default:
					yield(nil, fmt.Errorf("pagination cursor at %s is not a string or number", spec.NextCursor))
					return
				}
				if cursor != nil && fmt.Sprint(next) == fmt.Sprint(cursor) {
					yield(nil, errors.New("pagination did not advance: the operation returned the same cursor twice"))
					return
				}
				cursor = next
			}
		case "link":
			params := cloneValues(base)
			previous := ""
			for {
				page, resp, err := call(params)
				if err != nil {
					yield(nil, err)
					return
				}
				if !yield(page, nil) {
					return
				}
				target := linkNext(resp.Header.Get("Link"))
				if target == "" {
					return
				}
				pageURL := ""
				if resp.Request != nil && resp.Request.URL != nil {
					pageURL = resp.Request.URL.String()
				}
				baseURL, err := url.Parse(pageURL)
				if err != nil || pageURL == "" {
					baseURL, _ = url.Parse("http://relative.invalid")
				}
				targetURL, err := baseURL.Parse(target)
				if err != nil {
					yield(nil, err)
					return
				}
				next := targetURL.String()
				if next == previous || next == pageURL {
					yield(nil, errors.New(\`pagination did not advance: the Link rel="next" target repeats\`))
					return
				}
				previous = next
				params = cloneValues(base)
				for key, values := range targetURL.Query() {
					for _, value := range values {
						params.Add(key, value)
					}
				}
			}
		default: // offset / page
			position := 0
			if spec.Style == "page" {
				position = 1
			}
			if values, ok := base[spec.Param]; ok && len(values) > 0 && values[0] != "" {
				if parsed, err := strconv.Atoi(values[0]); err == nil {
					position = parsed
				}
			}
			previousItems := ""
			for {
				params := cloneValues(base)
				params.Set(spec.Param, strconv.Itoa(position))
				page, _, err := call(params)
				if err != nil {
					yield(nil, err)
					return
				}
				items, _ := resolvePointer(page, spec.Items).([]any)
				serialized := ""
				if items != nil {
					serialized = fmt.Sprint(items)
					if serialized == previousItems {
						yield(nil, errors.New("pagination did not advance: the operation returned the same page twice"))
						return
					}
				}
				if !yield(page, nil) {
					return
				}
				if len(items) == 0 {
					return
				}
				previousItems = serialized
				if spec.Style == "page" {
					position++
				} else {
					position += len(items)
				}
			}
		}
	}
}

func cloneValues(values url.Values) url.Values {
	out := url.Values{}
	for key, entries := range values {
		for _, entry := range entries {
			out.Add(key, entry)
		}
	}
	return out
}

func linkNext(header string) string {
	if header == "" {
		return ""
	}
	for _, entry := range strings.Split(header, ",") {
		parts := strings.Split(entry, ";")
		if len(parts) < 2 {
			continue
		}
		target := strings.TrimSpace(parts[0])
		if !strings.HasPrefix(target, "<") || !strings.HasSuffix(target, ">") {
			continue
		}
		for _, param := range parts[1:] {
			trimmed := strings.TrimSpace(param)
			if strings.HasPrefix(trimmed, "rel=") {
				rel := strings.Trim(strings.TrimPrefix(trimmed, "rel="), \`"\`)
				for _, kind := range strings.Fields(rel) {
					if kind == "next" {
						return strings.Trim(target, "<>")
					}
				}
			}
		}
	}
	return ""
}

// \u2500\u2500\u2500 Server-Sent Events \u2500\u2500\u2500

// ServerSentEvent is one decoded event; Data is the raw text (or parsed JSON
// for operations that declare a JSON event stream).
type ServerSentEvent struct {
	Event string
	Data  any
	ID    string
	Retry int
}

func parseSSEFrame(raw string, jsonData bool) (ServerSentEvent, bool, error) {
	event := ServerSentEvent{Retry: -1}
	sawField := false
	var dataLines []string
	normalized := strings.ReplaceAll(strings.ReplaceAll(raw, "\\r\\n", "\\n"), "\\r", "\\n")
	for _, line := range strings.Split(normalized, "\\n") {
		if line == "" || strings.HasPrefix(line, ":") {
			continue
		}
		field, value, _ := strings.Cut(line, ":")
		value = strings.TrimPrefix(value, " ")
		sawField = true
		switch field {
		case "event":
			event.Event = value
		case "data":
			dataLines = append(dataLines, value)
		case "id":
			event.ID = value
		case "retry":
			if parsed, err := strconv.Atoi(value); err == nil && parsed >= 0 && value != "" {
				event.Retry = parsed
			}
		}
	}
	if !sawField {
		return event, false, nil
	}
	text := strings.Join(dataLines, "\\n")
	event.Data = text
	if jsonData && text != "" {
		var parsed any
		if err := json.Unmarshal([]byte(text), &parsed); err != nil {
			return event, false, err
		}
		event.Data = parsed
	}
	return event, true, nil
}

// iterSSE streams events, reconnecting on dropped connections with Last-Event-ID
// (a fresh open call = fresh auth); a 4xx/5xx or a bad JSON payload is definitive.
func iterSSE(open func(extraHeaders map[string]string) (*http.Response, error), jsonData bool) func(yield func(ServerSentEvent, error) bool) {
	return func(yield func(ServerSentEvent, error) bool) {
		lastEventID := ""
		serverRetry := -1
		failures := 0
		for {
			headers := map[string]string{"Accept": "text/event-stream"}
			if lastEventID != "" {
				headers["Last-Event-ID"] = lastEventID
			}
			resp, err := open(headers)
			if err == nil && resp.StatusCode >= 400 {
				yield(ServerSentEvent{}, apiErrorFrom(resp, ""))
				return
			}
			if err == nil {
				failures = 0
				buffer := ""
				chunk := make([]byte, 4096)
				clean := false
				for {
					n, readErr := resp.Body.Read(chunk)
					buffer += string(chunk[:n])
					for {
						frame, rest, found := strings.Cut(buffer, "\\n\\n")
						if !found {
							break
						}
						buffer = rest
						event, ok, parseErr := parseSSEFrame(frame, jsonData)
						if parseErr != nil {
							resp.Body.Close()
							yield(ServerSentEvent{}, parseErr)
							return
						}
						if ok {
							if event.ID != "" {
								lastEventID = event.ID
							}
							if event.Retry >= 0 {
								serverRetry = event.Retry
							}
							if !yield(event, nil) {
								resp.Body.Close()
								return
							}
						}
					}
					if readErr == io.EOF {
						clean = true
						break
					}
					if readErr != nil {
						break
					}
				}
				resp.Body.Close()
				if clean {
					if strings.TrimSpace(buffer) != "" {
						if event, ok, parseErr := parseSSEFrame(buffer, jsonData); parseErr == nil && ok {
							yield(event, nil)
						}
					}
					return
				}
			}
			failures++
			base := time.Second
			if serverRetry >= 0 {
				base = time.Duration(serverRetry) * time.Millisecond
			}
			delay := base * time.Duration(1<<(failures-1))
			if delay > 30*time.Second {
				delay = 30 * time.Second
			}
			time.Sleep(time.Duration(rand.Int63n(int64(delay) + 1)))
		}
	}
}

// \u2500\u2500\u2500 Multipart \u2500\u2500\u2500

// toMultipart splits a typed body into a multipart/form-data payload: []byte
// values upload as file parts, everything else as form fields (nested values
// JSON-encoded) \u2014 mirroring the TypeScript runtime's FormData serialization.
func toMultipart(body any) (string, io.Reader, error) {
	var wire map[string]any
	if err := reencode(body, &wire); err != nil {
		return "", nil, err
	}
	buffer := &bytes.Buffer{}
	writer := multipart.NewWriter(buffer)
	for key, value := range wire {
		switch typed := value.(type) {
		case string:
			if err := writer.WriteField(key, typed); err != nil {
				return "", nil, err
			}
		case float64, bool:
			if err := writer.WriteField(key, fmt.Sprint(typed)); err != nil {
				return "", nil, err
			}
		default:
			encoded, err := json.Marshal(typed)
			if err != nil {
				return "", nil, err
			}
			if err := writer.WriteField(key, string(encoded)); err != nil {
				return "", nil, err
			}
		}
	}
	if err := writer.Close(); err != nil {
		return "", nil, err
	}
	return writer.FormDataContentType(), buffer, nil
}
`;var t=`<?php

// @redocly/client-generator PHP runtime \u2014 embedded into generated clients.
// PHP >= 8.1, zero Composer dependencies; HTTP over the curl extension.
// The generated file re-declares the namespace; the embed strips this header.

declare(strict_types=1);

namespace RedoclyClientRuntime;

/** A response with status >= 400, decoded body attached. */
final class ApiError extends \\RuntimeException
{
    public function __construct(
        public readonly string $url,
        public readonly int $status,
        public readonly string $reason,
        public readonly mixed $body,
    ) {
        parent::__construct("HTTP {$status} {$reason} for {$url}");
    }
}

/** Every attempt timed out or failed to connect. */
final class TimeoutError extends \\RuntimeException
{
    public function __construct(
        public readonly string $url,
        public readonly ?float $timeout,
        public readonly int $attempts,
    ) {
        $seconds = $timeout === null ? 'the configured timeout' : "{$timeout}s";
        parent::__construct("Request to {$url} timed out after {$seconds} ({$attempts} attempt(s))");
    }
}

/** One parsed \`text/event-stream\` frame. */
/** A \`<op>WithHeaders()\` result: the decoded body plus coerced declared headers. */
final class Envelope
{
    public function __construct(
        public readonly mixed $data,
        public readonly array $headers,
        public readonly int $status,
    ) {
    }
}

/** Coerce declared response headers per \`[name, key, type]\` specs; absent/unparsable omitted. */
function readEnvelopeHeaders(array $response, array $specs): array
{
    $headers = [];
    foreach ($specs as [$name, $key, $type]) {
        $raw = $response['headers'][$name] ?? null;
        if ($raw === null) {
            continue;
        }
        if ($type === 'integer' || $type === 'number') {
            if (is_numeric($raw)) {
                $headers[$key] = $type === 'integer' ? (int) $raw : (float) $raw;
            }
        } elseif ($type === 'boolean') {
            $lower = strtolower(trim($raw));
            if ($lower === 'true' || $lower === 'false') {
                $headers[$key] = $lower === 'true';
            }
        } else {
            $headers[$key] = $raw;
        }
    }
    return $headers;
}

final class ServerSentEvent
{
    public function __construct(
        public readonly string $event,
        public readonly mixed $data,
        public readonly ?string $id = null,
        public readonly ?int $retry = null,
    ) {
    }
}

/**
 * Per-instance configuration.
 * \`auth\`: \`['bearer' => string|callable, 'basic' => ['username' => ..., 'password' => ...], 'apiKey' => [scheme => string|callable]]\`.
 * \`retry\`: \`['attempts' => int, 'delay' => float, 'strategy' => 'exponential'|'fixed', 'retryOn' => callable]\`.
 * \`middleware\`: callables \`fn(array $request, callable $next): array\` around each attempt.
 */
final class Config
{
    public function __construct(
        public string $serverUrl = '',
        public array $auth = [],
        public ?float $timeout = null,
        public array $retry = [],
        public array $middleware = [],
        public string $clientHeader = 'redocly-client-generator',
    ) {
    }
}

/** Resolve a literal-or-callable credential to its string value. */
function resolveToken(mixed $provider): string
{
    return is_callable($provider) ? (string) $provider() : (string) $provider;
}

/**
 * Apply the first fully-configured security alternative. \`$security\` is an OR-list
 * of AND-sets of specs: \`['kind' => 'bearer'|'basic'|'apiKey', 'scheme' => ..., 'name' => ?, 'in' => ?]\`.
 * Returns \`[headers, query, cookies]\`.
 */
function resolveAuth(array $security, array $auth): array
{
    foreach ($security as $andSet) {
        $headers = [];
        $query = [];
        $cookies = [];
        $satisfied = true;
        foreach ($andSet as $spec) {
            if ($spec['kind'] === 'bearer' && isset($auth['bearer'])) {
                $headers['Authorization'] = 'Bearer ' . resolveToken($auth['bearer']);
            } elseif ($spec['kind'] === 'basic' && isset($auth['basic'])) {
                $headers['Authorization'] =
                    'Basic ' . base64_encode($auth['basic']['username'] . ':' . $auth['basic']['password']);
            } elseif ($spec['kind'] === 'apiKey' && isset($auth['apiKey'][$spec['scheme']])) {
                $value = resolveToken($auth['apiKey'][$spec['scheme']]);
                if ($spec['in'] === 'query') {
                    $query[$spec['name']] = $value;
                } elseif ($spec['in'] === 'cookie') {
                    $cookies[] = $spec['name'] . '=' . rawurlencode($value);
                } else {
                    $headers[$spec['name']] = $value;
                }
            } else {
                $satisfied = false;
                break;
            }
        }
        if ($satisfied) {
            return [$headers, $query, $cookies];
        }
    }
    return [[], [], []];
}

/** Substitute \`{param}\` templates with encoded values and prefix the server URL. */
function buildUrl(string $serverUrl, string $path, array $pathParams): string
{
    foreach ($pathParams as $name => $value) {
        $path = str_replace('{' . $name . '}', rawurlencode((string) $value), $path);
    }
    return rtrim($serverUrl, '/') . $path;
}

/** The default retry predicate: 5xx, 429, and transport timeouts/connect failures. */
function defaultRetryOn(array $context): bool
{
    if (($context['timedOut'] ?? false) === true) {
        return true;
    }
    $status = $context['status'] ?? 0;
    return $status >= 500 || $status === 429;
}

/** Delay before the next attempt: \`Retry-After\` wins; otherwise jittered (fixed|exponential) backoff. */
function retryDelay(int $attempt, array $retry, ?string $retryAfter): float
{
    if ($retryAfter !== null && ctype_digit($retryAfter)) {
        return (float) $retryAfter;
    }
    $base = (float) ($retry['delay'] ?? 1.0);
    $strategy = $retry['strategy'] ?? 'exponential';
    $delay = $strategy === 'fixed' ? $base : $base * (2 ** ($attempt - 1));
    return $delay * (0.5 + mt_rand() / mt_getrandmax() / 2);
}

/** Append query params in form style: list values repeat the key (\`tag=a&tag=b\`). */
function appendQuery(string $url, array $query): string
{
    $pairs = [];
    foreach ($query as $name => $value) {
        foreach (is_array($value) ? $value : [$value] as $single) {
            $encoded = is_bool($single) ? ($single ? 'true' : 'false') : (string) $single;
            $pairs[] = rawurlencode($name) . '=' . rawurlencode($encoded);
        }
    }
    if ($pairs === []) {
        return $url;
    }
    return $url . (str_contains($url, '?') ? '&' : '?') . implode('&', $pairs);
}

/** One raw curl exchange. Returns \`['status', 'reason', 'headers', 'body', 'url', 'timedOut']\`. */
function rawSend(Config $config, array $request): array
{
    $url = appendQuery($request['url'], $request['query'] ?? []);
    $handle = curl_init($url);
    $headerLines = [];
    foreach ($request['headers'] ?? [] as $name => $value) {
        $headerLines[] = $name . ': ' . $value;
    }
    $responseHeaders = [];
    curl_setopt_array($handle, [
        CURLOPT_CUSTOMREQUEST => $request['method'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_HTTPHEADER => $headerLines,
        CURLOPT_HEADERFUNCTION => function ($ch, string $line) use (&$responseHeaders): int {
            $parts = explode(':', $line, 2);
            if (count($parts) === 2) {
                $responseHeaders[strtolower(trim($parts[0]))] = trim($parts[1]);
            }
            return strlen($line);
        },
    ]);
    if (($request['body'] ?? null) !== null) {
        curl_setopt($handle, CURLOPT_POSTFIELDS, $request['body']);
    }
    if ($config->timeout !== null) {
        curl_setopt($handle, CURLOPT_TIMEOUT_MS, (int) round($config->timeout * 1000));
    }
    $body = curl_exec($handle);
    $errno = curl_errno($handle);
    $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
    $effectiveUrl = (string) curl_getinfo($handle, CURLINFO_EFFECTIVE_URL);
    if ($errno !== 0) {
        $timedOut = $errno === CURLE_OPERATION_TIMEDOUT || $errno === CURLE_COULDNT_CONNECT;
        return [
            'status' => 0,
            'reason' => curl_strerror($errno) ?? 'transport error',
            'headers' => [],
            'body' => '',
            'url' => $effectiveUrl,
            'timedOut' => $timedOut,
        ];
    }
    return [
        'status' => $status,
        'reason' => '',
        'headers' => $responseHeaders,
        'body' => is_string($body) ? $body : '',
        'url' => $effectiveUrl,
        'timedOut' => false,
    ];
}

/**
 * Send with retries and middleware. \`$request\` carries \`operationId\`, \`method\`, \`url\`,
 * \`headers\`, \`query\`, and optional \`body\`/\`contentType\`/\`idempotencyKey\`.
 * Returns the raw response array; callers map status >= 400 to \`ApiError\`.
 */
function send(Config $config, array $request): array
{
    $headers = $request['headers'] ?? [];
    $headers['X-Redocly-Client'] = $config->clientHeader;
    if (($request['contentType'] ?? null) !== null) {
        $headers['Content-Type'] = $request['contentType'];
    }
    if (($request['idempotencyKey'] ?? null) !== null) {
        $headers['Idempotency-Key'] = $request['idempotencyKey'];
    }
    $request['headers'] = $headers;

    $handler = fn (array $req): array => rawSend($config, $req);
    foreach (array_reverse($config->middleware) as $middleware) {
        $next = $handler;
        $handler = fn (array $req): array => $middleware($req, $next);
    }

    $attempts = max(1, (int) ($config->retry['attempts'] ?? 3));
    $retryOn = $config->retry['retryOn'] ?? __NAMESPACE__ . '\\\\defaultRetryOn';
    $response = null;
    for ($attempt = 1; $attempt <= $attempts; $attempt++) {
        $response = $handler($request);
        $context = [
            'status' => $response['status'],
            'timedOut' => $response['timedOut'],
            'attempt' => $attempt,
            'operationId' => $request['operationId'] ?? '',
        ];
        if ($attempt === $attempts || !$retryOn($context)) {
            break;
        }
        $seconds = retryDelay($attempt, $config->retry, $response['headers']['retry-after'] ?? null);
        usleep((int) round($seconds * 1_000_000));
    }
    if ($response['timedOut']) {
        throw new TimeoutError($response['url'], $config->timeout, $attempts);
    }
    if ($response['status'] === 0) {
        throw new \\RuntimeException("Request to {$response['url']} failed: {$response['reason']}");
    }
    return $response;
}

/** Decoded JSON body (assoc arrays), or null for empty bodies. */
function decodeJson(array $response): mixed
{
    if ($response['body'] === '') {
        return null;
    }
    return json_decode($response['body'], true);
}

/** \`ApiError\` from a non-2xx response. */
function apiErrorFrom(array $response): ApiError
{
    return new ApiError($response['url'], $response['status'], $response['reason'], decodeJson($response));
}

/** Walk an RFC 6901 JSON pointer over decoded JSON; null on any miss. */
function resolvePointer(mixed $data, string $pointer): mixed
{
    if ($pointer === '') {
        return $data;
    }
    foreach (explode('/', substr($pointer, 1)) as $token) {
        $key = str_replace(['~1', '~0'], ['/', '~'], $token);
        if (!is_array($data) || !array_key_exists($key, $data)) {
            return null;
        }
        $data = $data[$key];
    }
    return $data;
}

/** The \`rel="next"\` target of a \`Link\` header, or null. */
function linkNext(?string $header): ?string
{
    if ($header === null) {
        return null;
    }
    foreach (explode(',', $header) as $part) {
        if (preg_match('/<([^>]+)>\\s*;[^,]*rel="?next"?/', trim($part), $match) === 1) {
            return $match[1];
        }
    }
    return null;
}

/**
 * Auto-pagination: \`$call(array $params): [mixed rawPage, array $response]\`, \`$spec\` is the
 * normalized rule (\`style\`, \`param\`, \`nextCursor\`, \`hasMore\`, \`items\`), \`$base\` the caller's
 * query params. Yields raw decoded pages; generated wrappers hydrate them into models.
 */
function iterPages(callable $call, array $spec, array $base): \\Generator
{
    $params = $base;
    $style = $spec['style'];
    $seenCursors = [];
    $seenLinks = [];
    $offset = null;
    $page = null;
    while (true) {
        [$raw, $response] = $call($params);
        yield $raw;
        if ($style === 'cursor') {
            $next = resolvePointer($raw, $spec['nextCursor'] ?? '');
            if (isset($spec['hasMore']) && resolvePointer($raw, $spec['hasMore']) !== true) {
                return;
            }
            if (!is_string($next) || $next === '' || isset($seenCursors[$next])) {
                return;
            }
            $seenCursors[$next] = true;
            $params[$spec['param']] = $next;
        } elseif ($style === 'link') {
            $target = linkNext($response['headers']['link'] ?? null);
            if ($target === null || isset($seenLinks[$target])) {
                return;
            }
            $seenLinks[$target] = true;
            $parsed = parse_url($target);
            $linkParams = [];
            parse_str($parsed['query'] ?? '', $linkParams);
            $params = array_merge($params, $linkParams);
        } else {
            $items = resolvePointer($raw, $spec['items'] ?? '');
            $count = is_array($items) ? count($items) : 0;
            if ($count === 0) {
                return;
            }
            if ($style === 'offset') {
                $offset = ($offset ?? (int) ($base[$spec['param']] ?? 0)) + $count;
                $params[$spec['param']] = $offset;
            } else {
                $page = ($page ?? (int) ($base[$spec['param']] ?? 1)) + 1;
                $params[$spec['param']] = $page;
            }
        }
    }
}

/** Parse one SSE frame; returns \`[?ServerSentEvent, ?string lastEventId, ?int retryMs]\`. */
function parseSseFrame(string $frame, bool $jsonData): array
{
    $event = 'message';
    $dataLines = [];
    $id = null;
    $retry = null;
    foreach (explode("\\n", str_replace("\\r\\n", "\\n", $frame)) as $line) {
        if ($line === '' || str_starts_with($line, ':')) {
            continue;
        }
        $colon = strpos($line, ':');
        $field = $colon === false ? $line : substr($line, 0, $colon);
        $value = $colon === false ? '' : ltrim(substr($line, $colon + 1), ' ');
        if ($field === 'event') {
            $event = $value;
        } elseif ($field === 'data') {
            $dataLines[] = $value;
        } elseif ($field === 'id') {
            $id = $value;
        } elseif ($field === 'retry' && ctype_digit($value)) {
            $retry = (int) $value;
        }
    }
    if ($dataLines === [] && $id === null && $retry === null) {
        return [null, null, $retry];
    }
    $data = implode("\\n", $dataLines);
    $decoded = $jsonData && $data !== '' ? json_decode($data, true) : $data;
    return [new ServerSentEvent($event, $decoded, $id, $retry), $id, $retry];
}

/**
 * Stream server-sent events. \`$open(array $extraHeaders): \\CurlHandle\` returns a configured
 * (not yet executed) handle; this pump drives it with curl_multi, yields parsed frames, and
 * reconnects with \`Last-Event-ID\` on transient failures (4xx is definitive; backoff <= 30s).
 */
function iterSse(callable $open, bool $jsonData): \\Generator
{
    $lastEventId = null;
    $retryMs = 3000;
    while (true) {
        $extra = ['Accept' => 'text/event-stream'];
        if ($lastEventId !== null) {
            $extra['Last-Event-ID'] = $lastEventId;
        }
        $handle = $open($extra);
        $buffer = '';
        curl_setopt($handle, CURLOPT_WRITEFUNCTION, function ($ch, string $chunk) use (&$buffer): int {
            $buffer .= $chunk;
            return strlen($chunk);
        });
        $multi = curl_multi_init();
        curl_multi_add_handle($multi, $handle);
        do {
            curl_multi_exec($multi, $running);
            if ($running > 0) {
                curl_multi_select($multi, 0.1);
            }
            while (($split = strpos($buffer, "\\n\\n")) !== false || ($split = strpos($buffer, "\\r\\n\\r\\n")) !== false) {
                $frameLength = $buffer[$split] === "\\r" ? 4 : 2;
                $frame = substr($buffer, 0, $split);
                $buffer = substr($buffer, $split + $frameLength);
                [$event, $id, $retry] = parseSseFrame($frame, $jsonData);
                if ($id !== null) {
                    $lastEventId = $id;
                }
                if ($retry !== null) {
                    $retryMs = min($retry, 30000);
                }
                if ($event !== null) {
                    yield $event;
                }
            }
        } while ($running > 0);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $url = (string) curl_getinfo($handle, CURLINFO_EFFECTIVE_URL);
        curl_multi_remove_handle($multi, $handle);
        curl_multi_close($multi);
        if ($status >= 400 && $status < 500) {
            throw new ApiError($url, $status, '', $buffer);
        }
        // A clean 200 end-of-stream is done; anything else reconnects with Last-Event-ID.
        if ($status === 200) {
            return;
        }
        usleep($retryMs * 1000);
    }
}

/** Encode an assoc body as \`multipart/form-data\`; nested values are JSON parts. Returns \`[contentType, body]\`. */
function toMultipart(array $body): array
{
    $boundary = 'redocly-' . bin2hex(random_bytes(12));
    $parts = '';
    foreach ($body as $name => $value) {
        $parts .= "--{$boundary}\\r\\n";
        if (is_array($value)) {
            $parts .= "Content-Disposition: form-data; name=\\"{$name}\\"\\r\\n";
            $parts .= "Content-Type: application/json\\r\\n\\r\\n";
            $parts .= json_encode($value) . "\\r\\n";
        } else {
            $parts .= "Content-Disposition: form-data; name=\\"{$name}\\"\\r\\n\\r\\n";
            $parts .= (is_bool($value) ? ($value ? 'true' : 'false') : (string) $value) . "\\r\\n";
        }
    }
    $parts .= "--{$boundary}--\\r\\n";
    return ['multipart/form-data; boundary=' . $boundary, $parts];
}
`;var n={"_errors.py":`# Runtime errors and the result-mode envelope for generated Python clients.
# Hand-authored once, embedded into every generated client (see
# scripts/generate-runtime-sources.mjs) \u2014 mirror of the TypeScript runtime's
# errors.ts, kept semantically in lockstep.
from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Generic, Optional, TypeVar

T = TypeVar("T")
E = TypeVar("E")


class ApiError(Exception):
    """Raised (throw mode) for a non-2xx response, carrying the decoded error body."""

    def __init__(self, url: str, status: int, status_text: str, body: Any) -> None:
        super().__init__(f"Request failed with status {status}")
        self.url = url
        self.status = status
        self.status_text = status_text
        self.body = body


class ApiTimeoutError(Exception):
    """Raised when a request attempt exceeds the configured timeout \u2014 carries the
    context a log line needs (which operation, what budget, which attempt)."""

    def __init__(self, operation_id: str, timeout: float, attempt: int) -> None:
        super().__init__(
            f'Request "{operation_id}" timed out after {timeout} s (attempt {attempt})'
        )
        self.operation_id = operation_id
        self.timeout = timeout
        self.attempt = attempt


@dataclass
class Result(Generic[T, E]):
    """Result-mode return shape: exactly one of \`data\`/\`error\` is set."""

    data: Optional[T]
    error: Optional[E]
    response: Any  # httpx.Response

    @property
    def ok(self) -> bool:
        return self.error is None
`,"_auth.py":`# Auth resolution for generated Python clients \u2014 mirror of the TypeScript
# runtime's auth.ts: the first OR-alternative whose schemes are all configured
# is applied, so "bearer OR apiKey" works with either credential and never
# sends both. Cookie-borne api keys fold into a single Cookie header.
from __future__ import annotations

import base64
from typing import Any, Callable, Dict, List, Tuple, Union
from urllib.parse import quote

TokenProvider = Union[str, Callable[[], str]]


def _api_keys(auth: Dict[str, Any]) -> Dict[str, Any]:
    """The apiKey credentials. \`apiKey\` is the documented key (it matches the scheme
    kind and the other language SDKs); \`api_key\` is accepted too, so a snake_case
    config keeps working."""
    return {**(auth.get("api_key") or {}), **(auth.get("apiKey") or {})}

def _resolve_token(provider: TokenProvider) -> str:
    return provider() if callable(provider) else provider


def _is_configured(scheme: Dict[str, Any], auth: Dict[str, Any]) -> bool:
    kind = scheme["kind"]
    if kind == "apiKey":
        return scheme["scheme"] in _api_keys(auth)
    if kind == "bearer":
        return auth.get("bearer") is not None
    return auth.get("basic") is not None


def resolve_auth(
    security: List[List[Dict[str, Any]]], auth: Dict[str, Any]
) -> Tuple[Dict[str, str], Dict[str, str]]:
    """Build (headers, query) for one operation's security OR-alternatives from
    the client credentials. When no alternative is fully configured, the first
    alternative's configured schemes are still sent (the server rejects the
    request \u2014 same behavior as the TypeScript runtime)."""
    alternative = next(
        (schemes for schemes in security if all(_is_configured(s, auth) for s in schemes)),
        security[0] if security else [],
    )
    headers: Dict[str, str] = {}
    query: Dict[str, str] = {}
    cookies: List[str] = []
    for scheme in alternative:
        kind = scheme["kind"]
        if kind == "apiKey":
            provider = _api_keys(auth).get(scheme["scheme"])
            if provider is None:
                continue
            value = _resolve_token(provider)
            location = scheme.get("in", "header")
            if location == "header":
                headers[scheme["name"]] = value
            elif location == "query":
                query[scheme["name"]] = value
            else:
                # Reserved characters (\`;\`, \`=\`, space) must not break Cookie syntax.
                cookies.append(f"{scheme['name']}={quote(value, safe='')}")
        elif kind == "bearer":
            provider = auth.get("bearer")
            if provider is not None:
                headers["Authorization"] = f"Bearer {_resolve_token(provider)}"
        else:
            basic = auth.get("basic")
            if basic is not None:
                username, password = basic["username"], basic["password"]
                token = base64.b64encode(f"{username}:{password}".encode("utf-8")).decode("ascii")
                headers["Authorization"] = f"Basic {token}"
    if cookies:
        headers["Cookie"] = "; ".join(cookies)
    return headers, query
`,"_url.py":`# URL assembly for generated Python clients \u2014 path-parameter substitution with
# percent-encoding, mirroring the TypeScript runtime's url.ts semantics.
from __future__ import annotations

from typing import Any, Dict
from urllib.parse import quote


def build_url(server_url: str, path: str, path_params: Dict[str, Any]) -> str:
    filled = path
    for name, value in path_params.items():
        filled = filled.replace("{" + name + "}", quote(str(value), safe=""))
    return server_url.rstrip("/") + filled
`,"_decode.py":`# Reflective JSON <-> model conversion for generated Python clients. Models are
# plain dataclasses by default, or pydantic BaseModels under \`models: pydantic\`;
# one decoder serves both. For a dataclass it hydrates parsed JSON reflectively,
# honoring each class's \`_field_map\` (python name -> wire name) and the typing
# constructs the generator emits: Optional/Union, List, Dict, Enum, Literal, Any.
# For a pydantic model it defers to pydantic, which already knows the aliases.
# encode() mirrors whichever it was given back to wire shape.
from __future__ import annotations

import dataclasses
import typing
from datetime import date, datetime
from enum import Enum
from typing import Any, Dict, Tuple, get_args, get_origin, get_type_hints

# Discriminated unions: resolved Union annotation -> (wire property, {value: class}).
# The generated module registers its unions here; decode() dispatches through it
# before falling back to trying members in order.
DISCRIMINATORS: Dict[Any, Tuple[str, Dict[str, Any]]] = {}


def decode(type_: Any, data: Any):
    """Best-effort hydration: wire data -> the annotated Python shape. Unknown or
    mismatched shapes pass through unchanged (the server is the source of truth)."""
    if data is None or type_ is Any or type_ is None:
        return data
    # \`Annotated[Union[...], Field(discriminator=...)]\`: pydantic reads that annotation on a
    # model's own field, so here only the union underneath matters.
    if hasattr(type_, "__metadata__"):
        type_ = get_args(type_)[0]
    origin = get_origin(type_)
    if origin is typing.Union:
        discriminator = DISCRIMINATORS.get(type_)
        if discriminator is not None and isinstance(data, dict):
            wire_property, mapping = discriminator
            target = mapping.get(data.get(wire_property))
            if target is not None:
                try:
                    return decode(target, data)
                except (TypeError, ValueError, KeyError):
                    pass
        for member in get_args(type_):
            if member is type(None):
                continue
            try:
                return decode(member, data)
            except (TypeError, ValueError, KeyError):
                continue
        return data
    if origin is list:
        (item_type,) = get_args(type_) or (Any,)
        return [decode(item_type, item) for item in data]
    if origin is dict:
        args = get_args(type_)
        value_type = args[1] if len(args) == 2 else Any
        return {key: decode(value_type, value) for key, value in data.items()}
    if origin is typing.Literal:
        return data
    if isinstance(type_, type) and issubclass(type_, Enum):
        return type_(data)
    # \`dateType: Date\` annotates date/date-time fields as datetime objects; a value that
    # doesn't parse passes through unchanged (the server is the source of truth).
    if type_ is datetime or type_ is date:
        if not isinstance(data, str):
            return data
        try:
            # \`datetime\` accepts a bare date too; \`date\` rejects a timestamp, so trim it.
            return (
                datetime.fromisoformat(data)
                if type_ is datetime
                else date.fromisoformat(data[:10])
            )
        except ValueError:
            return data
    # A pydantic model validates itself, aliases included. \`ValidationError\`
    # subclasses \`ValueError\`, so union member probing above still works.
    if isinstance(type_, type) and hasattr(type_, "model_validate"):
        return type_.model_validate(data)
    if dataclasses.is_dataclass(type_):
        hints = get_type_hints(type_)
        field_map = getattr(type_, "_field_map", {})
        kwargs = {}
        for field in dataclasses.fields(type_):
            wire = field_map.get(field.name, field.name)
            if isinstance(data, dict) and wire in data:
                kwargs[field.name] = decode(hints.get(field.name, Any), data[wire])
        return type_(**kwargs)
    return data


def encode(value: Any):
    """Python shape -> wire (JSON) shape; inverse of decode for request bodies."""
    # \`mode="json"\` resolves datetimes and enums the same way the branches below do,
    # and \`exclude_none\` matches the dataclass path: an unset optional is not sent.
    if hasattr(value, "model_dump") and not isinstance(value, type):
        return value.model_dump(by_alias=True, exclude_none=True, mode="json")
    if dataclasses.is_dataclass(value) and not isinstance(value, type):
        field_map = getattr(type(value), "_field_map", {})
        out = {}
        for field in dataclasses.fields(value):
            item = getattr(value, field.name)
            if item is None:
                continue
            out[field_map.get(field.name, field.name)] = encode(item)
        return out
    if isinstance(value, Enum):
        return value.value
    # A date-only value must not gain a time component on the way out.
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if isinstance(value, list):
        return [encode(item) for item in value]
    if isinstance(value, dict):
        return {key: encode(item) for key, item in value.items()}
    return value
`,"_send.py":`# The request core for generated Python clients \u2014 mirror of the TypeScript
# runtime's send.ts: default + config + per-call headers, on_request middleware
# BEFORE serialization (mutations are sent), the retry loop (idempotent-methods
# default, Idempotency-Key opt-in makes POST/PATCH safe, Retry-After honored,
# exponential backoff with full jitter, a fresh timeout budget per attempt), and
# the reverse on_response onion.
from __future__ import annotations

import asyncio
import random
import time
import uuid
from dataclasses import dataclass
from typing import Any, Dict, Generic, List, Optional, Tuple, TypeVar

import httpx

from ._errors import ApiTimeoutError

T = TypeVar("T")


@dataclass
class Envelope(Generic[T]):
    """A *_with_headers() result: decoded body + coerced declared headers + raw response."""

    data: T
    headers: Dict[str, Any]
    response: httpx.Response


def read_envelope_headers(
    response: httpx.Response, specs: List[Tuple[str, str, str]]
) -> Dict[str, Any]:
    """Coerce declared response headers per (name, key, type) specs; absent/unparsable omitted."""
    headers: Dict[str, Any] = {}
    for name, key, type_ in specs:
        raw = response.headers.get(name)
        if raw is None:
            continue
        if type_ in ("integer", "number"):
            try:
                headers[key] = int(raw) if type_ == "integer" else float(raw)
            except ValueError:
                pass
        elif type_ == "boolean":
            lower = raw.strip().lower()
            if lower in ("true", "false"):
                headers[key] = lower == "true"
        else:
            headers[key] = raw
    return headers


_IDEMPOTENT_METHODS = {"GET", "HEAD", "PUT", "DELETE", "OPTIONS"}
_TRANSIENT_STATUS = {408, 429, 500, 502, 503, 504}


def _default_retry_on(method: str, headers: Dict[str, str], response: Optional[httpx.Response]) -> bool:
    safe = method.upper() in _IDEMPOTENT_METHODS or "Idempotency-Key" in headers
    if not safe:
        return False
    return response is None or response.status_code in _TRANSIENT_STATUS


def _retry_delay(retry: Dict[str, Any], attempt: int, retry_after: Optional[str]) -> float:
    if retry_after:
        try:
            return float(retry_after)
        except ValueError:
            pass  # HTTP-date form: fall through to backoff
    base = float(retry.get("retry_delay", 1.0))
    raw = base if retry.get("retry_strategy") == "fixed" else base * (2 ** (attempt - 1))
    return random.uniform(0, raw) if retry.get("jitter", True) is not False else raw


def send(
    client: httpx.Client,
    config: Dict[str, Any],
    op: Dict[str, Any],
    url: str,
    *,
    method: str,
    headers: Optional[Dict[str, str]] = None,
    params: Optional[Dict[str, Any]] = None,
    json_body: Any = None,
    content: Any = None,
    data: Any = None,
    files: Any = None,
    timeout: Optional[float] = None,
    idempotency_key: Any = None,
    retry: Optional[Dict[str, Any]] = None,
) -> httpx.Response:
    merged_retry: Dict[str, Any] = {**(config.get("retry") or {}), **(retry or {})}
    effective_timeout = timeout if timeout is not None else config.get("timeout")
    merged_headers: Dict[str, str] = {**(config.get("headers") or {}), **(headers or {})}

    # One stable key per LOGICAL call \u2014 set before the retry loop so every
    # attempt re-sends the same key; a caller-provided header always wins.
    key = idempotency_key if idempotency_key is not None else config.get("idempotency_key")
    if (
        key not in (None, False)
        and method.upper() in ("POST", "PATCH")
        and "Idempotency-Key" not in merged_headers
    ):
        merged_headers["Idempotency-Key"] = (
            key if isinstance(key, str) else key() if callable(key) else str(uuid.uuid4())
        )

    context = {
        "url": url,
        "method": method.upper(),
        "headers": merged_headers,
        "body": json_body,
        "operation": op,
    }
    middleware: List[Any] = config.get("middleware") or []
    for mw in middleware:
        on_request = getattr(mw, "on_request", None) or (mw.get("on_request") if isinstance(mw, dict) else None)
        if on_request:
            on_request(context)

    max_attempts = 1 + int(merged_retry.get("retries", 0))
    retry_on = merged_retry.get("retry_on") or (
        lambda ctx: _default_retry_on(context["method"], context["headers"], ctx.get("response"))
    )

    attempt = 0
    while True:
        attempt += 1
        try:
            response = client.request(
                context["method"],
                context["url"],
                headers=context["headers"],
                params=params,
                json=context["body"] if content is None and files is None and data is None else None,
                content=content,
                data=data,
                files=files,
                timeout=effective_timeout if effective_timeout is not None else httpx.USE_CLIENT_DEFAULT,
            )
        except httpx.TimeoutException:
            if attempt < max_attempts and retry_on({"attempt": attempt, "response": None}):
                time.sleep(_retry_delay(merged_retry, attempt, None))
                continue
            raise ApiTimeoutError(op.get("id", "?"), float(effective_timeout or 0), attempt) from None
        except httpx.TransportError:
            if attempt < max_attempts and retry_on({"attempt": attempt, "response": None}):
                time.sleep(_retry_delay(merged_retry, attempt, None))
                continue
            raise

        for mw in reversed(middleware):
            on_response = getattr(mw, "on_response", None) or (mw.get("on_response") if isinstance(mw, dict) else None)
            if on_response:
                replaced = on_response(response, context)
                if replaced is not None:
                    response = replaced

        if (
            not response.is_success
            and attempt < max_attempts
            and retry_on({"attempt": attempt, "response": response})
        ):
            time.sleep(_retry_delay(merged_retry, attempt, response.headers.get("retry-after")))
            continue
        return response


async def send_async(
    client: httpx.AsyncClient,
    config: Dict[str, Any],
    op: Dict[str, Any],
    url: str,
    *,
    method: str,
    headers: Optional[Dict[str, str]] = None,
    params: Optional[Dict[str, Any]] = None,
    json_body: Any = None,
    content: Any = None,
    data: Any = None,
    files: Any = None,
    timeout: Optional[float] = None,
    idempotency_key: Any = None,
    retry: Optional[Dict[str, Any]] = None,
) -> httpx.Response:
    """The async mirror of send() \u2014 same retry/timeout/idempotency semantics."""
    merged_retry: Dict[str, Any] = {**(config.get("retry") or {}), **(retry or {})}
    effective_timeout = timeout if timeout is not None else config.get("timeout")
    merged_headers: Dict[str, str] = {**(config.get("headers") or {}), **(headers or {})}
    key = idempotency_key if idempotency_key is not None else config.get("idempotency_key")
    if (
        key not in (None, False)
        and method.upper() in ("POST", "PATCH")
        and "Idempotency-Key" not in merged_headers
    ):
        merged_headers["Idempotency-Key"] = (
            key if isinstance(key, str) else key() if callable(key) else str(uuid.uuid4())
        )
    context = {
        "url": url,
        "method": method.upper(),
        "headers": merged_headers,
        "body": json_body,
        "operation": op,
    }
    middleware: List[Any] = config.get("middleware") or []
    for mw in middleware:
        on_request = getattr(mw, "on_request", None) or (mw.get("on_request") if isinstance(mw, dict) else None)
        if on_request:
            on_request(context)
    max_attempts = 1 + int(merged_retry.get("retries", 0))
    retry_on = merged_retry.get("retry_on") or (
        lambda ctx: _default_retry_on(context["method"], context["headers"], ctx.get("response"))
    )
    attempt = 0
    while True:
        attempt += 1
        try:
            response = await client.request(
                context["method"],
                context["url"],
                headers=context["headers"],
                params=params,
                json=context["body"] if content is None and files is None and data is None else None,
                content=content,
                data=data,
                files=files,
                timeout=effective_timeout if effective_timeout is not None else httpx.USE_CLIENT_DEFAULT,
            )
        except httpx.TimeoutException:
            if attempt < max_attempts and retry_on({"attempt": attempt, "response": None}):
                await asyncio.sleep(_retry_delay(merged_retry, attempt, None))
                continue
            raise ApiTimeoutError(op.get("id", "?"), float(effective_timeout or 0), attempt) from None
        except httpx.TransportError:
            if attempt < max_attempts and retry_on({"attempt": attempt, "response": None}):
                await asyncio.sleep(_retry_delay(merged_retry, attempt, None))
                continue
            raise
        for mw in reversed(middleware):
            on_response = getattr(mw, "on_response", None) or (mw.get("on_response") if isinstance(mw, dict) else None)
            if on_response:
                replaced = on_response(response, context)
                if replaced is not None:
                    response = replaced
        if (
            not response.is_success
            and attempt < max_attempts
            and retry_on({"attempt": attempt, "response": response})
        ):
            await asyncio.sleep(_retry_delay(merged_retry, attempt, response.headers.get("retry-after")))
            continue
        return response
`,"_paginate.py":`# Auto-pagination iterators for generated Python clients \u2014 the TypeScript
# runtime's paginate.ts semantics ported: cursor (next-cursor pointer, optional
# has-more flag, repeated-cursor guard), offset/page (advance by count/one,
# repeated-page guard, null start treated as absent), and link (RFC 8288
# \`Link: rel="next"\` following with relative resolution and a loop guard).
from __future__ import annotations

import re
from typing import Any, AsyncIterator, Awaitable, Callable, Dict, Iterator, Optional, Tuple
from urllib.parse import parse_qsl, urljoin, urlparse

# call(params) -> (parsed_json, httpx.Response)
PageCall = Callable[[Dict[str, Any]], Tuple[Any, Any]]


def resolve_pointer(data: Any, pointer: str) -> Any:
    """RFC 6901 JSON pointer over parsed JSON; None on any miss."""
    if pointer == "":
        return data
    if not pointer.startswith("/"):
        return None
    current = data
    for token in pointer[1:].split("/"):
        key = token.replace("~1", "/").replace("~0", "~")
        if isinstance(current, dict):
            current = current.get(key)
        elif isinstance(current, list) and key.isdigit():
            index = int(key)
            current = current[index] if index < len(current) else None
        else:
            return None
        if current is None:
            return None
    return current


def iter_pages(call: PageCall, spec: Dict[str, Any], params: Optional[Dict[str, Any]] = None) -> Iterator[Any]:
    """Yield raw page JSON per the pagination spec; every page is yielded before
    the stop condition is evaluated, so the last page always arrives."""
    style = spec["style"]
    base = dict(params or {})
    if style == "cursor":
        cursor = base.get(spec["param"])
        while True:
            page_params = dict(base)
            if cursor is not None:
                page_params[spec["param"]] = cursor
            page, _response = call(page_params)
            yield page
            if spec.get("has_more") is not None and resolve_pointer(page, spec["has_more"]) is False:
                return
            nxt = resolve_pointer(page, spec.get("next_cursor", ""))
            if nxt is None or nxt == "":
                return
            if not isinstance(nxt, (str, int, float)):
                raise ValueError(f"Pagination cursor at {spec['next_cursor']} is not a string or number")
            if nxt == cursor:
                raise ValueError("Pagination did not advance: the operation returned the same cursor twice")
            cursor = nxt
    elif style == "link":
        yield from _iter_pages_by_link(call, base)
    else:  # offset / page
        start = base.get(spec["param"])
        fallback = 1 if style == "page" else 0
        try:
            position = fallback if start in (None, "") else int(start)
        except (TypeError, ValueError):
            position = fallback
        previous_items = None
        while True:
            page, _response = call({**base, spec["param"]: position})
            items = resolve_pointer(page, spec.get("items", ""))
            serialized = repr(items) if isinstance(items, list) else None
            if serialized is not None and serialized == previous_items:
                raise ValueError("Pagination did not advance: the operation returned the same page twice")
            yield page
            if not isinstance(items, list) or len(items) == 0:
                return
            previous_items = serialized
            position += 1 if style == "page" else len(items)


def _link_next(header: Optional[str]) -> Optional[str]:
    if not header:
        return None
    for entry in re.split(r",\\s*(?=<)", header):
        match = re.match(r"^\\s*<([^>]*)>(.*)$", entry)
        if not match:
            continue
        rel = re.search(r';\\s*rel\\s*=\\s*"?([^";]+)"?', match.group(2), re.IGNORECASE)
        if rel and "next" in rel.group(1).split():
            return match.group(1)
    return None


def _iter_pages_by_link(call: PageCall, base: Dict[str, Any]) -> Iterator[Any]:
    params = dict(base)
    previous = None
    while True:
        page, response = call(params)
        yield page
        target = _link_next(response.headers.get("link"))
        if target is None:
            return
        page_url = str(response.request.url) if response.request is not None else ""
        nxt = urljoin(page_url or "http://relative.invalid", target)
        if nxt in (previous, page_url):
            raise ValueError('Pagination did not advance: the Link rel="next" target repeats')
        previous = nxt
        link_params: Dict[str, Any] = {}
        for key, value in parse_qsl(urlparse(nxt).query):
            if key in link_params:
                existing = link_params[key]
                link_params[key] = [*existing, value] if isinstance(existing, list) else [existing, value]
            else:
                link_params[key] = value
        params = {**base, **link_params}


def iter_items(call: PageCall, spec: Dict[str, Any], params: Optional[Dict[str, Any]] = None) -> Iterator[Any]:
    """Each page's \`items\` pointer, flattened."""
    for page in iter_pages(call, spec, params):
        items = resolve_pointer(page, spec.get("items", ""))
        if isinstance(items, list):
            yield from items


# call(params) -> awaitable of (parsed_json, httpx.Response)
AsyncPageCall = Callable[[Dict[str, Any]], Awaitable[Tuple[Any, Any]]]


async def aiter_pages(
    call: AsyncPageCall, spec: Dict[str, Any], params: Optional[Dict[str, Any]] = None
) -> AsyncIterator[Any]:
    """Async mirror of iter_pages \u2014 same stop conditions and guards."""
    style = spec["style"]
    base = dict(params or {})
    if style == "cursor":
        cursor = base.get(spec["param"])
        while True:
            page_params = dict(base)
            if cursor is not None:
                page_params[spec["param"]] = cursor
            page, _response = await call(page_params)
            yield page
            if spec.get("has_more") is not None and resolve_pointer(page, spec["has_more"]) is False:
                return
            nxt = resolve_pointer(page, spec.get("next_cursor", ""))
            if nxt is None or nxt == "":
                return
            if not isinstance(nxt, (str, int, float)):
                raise ValueError(f"Pagination cursor at {spec['next_cursor']} is not a string or number")
            if nxt == cursor:
                raise ValueError("Pagination did not advance: the operation returned the same cursor twice")
            cursor = nxt
    elif style == "link":
        previous = None
        link_params: Dict[str, Any] = dict(base)
        while True:
            page, response = await call(link_params)
            yield page
            target = _link_next(response.headers.get("link"))
            if target is None:
                return
            page_url = str(response.request.url) if response.request is not None else ""
            nxt = urljoin(page_url or "http://relative.invalid", target)
            if nxt in (previous, page_url):
                raise ValueError('Pagination did not advance: the Link rel="next" target repeats')
            previous = nxt
            merged: Dict[str, Any] = {}
            for key, value in parse_qsl(urlparse(nxt).query):
                if key in merged:
                    existing = merged[key]
                    merged[key] = [*existing, value] if isinstance(existing, list) else [existing, value]
                else:
                    merged[key] = value
            link_params = {**base, **merged}
    else:
        start = base.get(spec["param"])
        fallback = 1 if style == "page" else 0
        try:
            position = fallback if start in (None, "") else int(start)
        except (TypeError, ValueError):
            position = fallback
        previous_items = None
        while True:
            page, _response = await call({**base, spec["param"]: position})
            items = resolve_pointer(page, spec.get("items", ""))
            serialized = repr(items) if isinstance(items, list) else None
            if serialized is not None and serialized == previous_items:
                raise ValueError("Pagination did not advance: the operation returned the same page twice")
            yield page
            if not isinstance(items, list) or len(items) == 0:
                return
            previous_items = serialized
            position += 1 if style == "page" else len(items)


async def aiter_items(
    call: AsyncPageCall, spec: Dict[str, Any], params: Optional[Dict[str, Any]] = None
) -> AsyncIterator[Any]:
    async for page in aiter_pages(call, spec, params):
        items = resolve_pointer(page, spec.get("items", ""))
        if isinstance(items, list):
            for item in items:
                yield item
`,"_sse.py":`# Server-Sent Events for generated Python clients \u2014 the TypeScript runtime's
# sse.ts semantics ported: frame parsing per the EventSource spec (retry must be
# ASCII digits; comment-only frames skipped; multi-line data joined with \\n) and
# auto-reconnect resuming from the last event id via Last-Event-ID, with
# exponential backoff capped at 30s. JSON payloads are parsed when the operation
# declares a JSON event stream.
from __future__ import annotations

import asyncio
import json
import random
import time
from dataclasses import dataclass
from typing import Any, AsyncIterator, Callable, Dict, Iterator, Optional

import httpx

_FRAME_DELIMITER = "\\n\\n"


@dataclass
class ServerSentEvent:
    data: Any
    event: Optional[str] = None
    id: Optional[str] = None
    retry: Optional[int] = None


def parse_sse_frame(raw: str, data_kind: str = "text") -> Optional[ServerSentEvent]:
    event = None
    data_lines = []
    event_id = None
    retry = None
    saw_field = False
    for line in raw.replace("\\r\\n", "\\n").replace("\\r", "\\n").split("\\n"):
        if line == "" or line.startswith(":"):
            continue
        field, _, value = line.partition(":")
        if value.startswith(" "):
            value = value[1:]
        saw_field = True
        if field == "event":
            event = value
        elif field == "data":
            data_lines.append(value)
        elif field == "id":
            event_id = value
        elif field == "retry" and value.isdigit():
            retry = int(value)
    if not saw_field:
        return None
    text = "\\n".join(data_lines)
    data: Any = text
    if data_kind == "json" and text != "":
        data = json.loads(text)
    return ServerSentEvent(data=data, event=event, id=event_id, retry=retry)


def iter_sse(
    open_stream: Callable[[Dict[str, str]], Any],
    data_kind: str = "text",
    reconnect: bool = True,
    reconnect_delay: float = 1.0,
) -> Iterator[ServerSentEvent]:
    """Iterate an event stream. \`open_stream(extra_headers)\` must return an
    httpx streaming-response context manager; it is reopened on dropped
    connections with Last-Event-ID set (fresh call = fresh auth)."""
    last_event_id: Optional[str] = None
    server_retry: Optional[float] = None
    failures = 0
    while True:
        headers = {"Accept": "text/event-stream"}
        if last_event_id is not None:
            headers["Last-Event-ID"] = last_event_id
        try:
            with open_stream(headers) as response:
                if response.status_code >= 400:
                    response.read()
                    raise httpx.HTTPStatusError(
                        f"SSE request failed with status {response.status_code}",
                        request=response.request,
                        response=response,
                    )
                failures = 0
                buffer = ""
                for chunk in response.iter_text():
                    buffer += chunk
                    while _FRAME_DELIMITER in buffer:
                        raw, buffer = buffer.split(_FRAME_DELIMITER, 1)
                        parsed = parse_sse_frame(raw, data_kind)
                        if parsed is not None:
                            if parsed.id is not None:
                                last_event_id = parsed.id
                            if parsed.retry is not None:
                                server_retry = parsed.retry / 1000
                            yield parsed
                # Clean end: flush a trailing frame, then finish (no reconnect).
                if buffer.strip():
                    parsed = parse_sse_frame(buffer, data_kind)
                    if parsed is not None:
                        yield parsed
                return
        except httpx.HTTPStatusError:
            raise  # a 4xx/5xx is definitive, not a dropped connection
        except (httpx.TransportError, httpx.TimeoutException):
            if not reconnect:
                raise
        failures += 1
        base = server_retry if server_retry is not None else reconnect_delay
        time.sleep(random.uniform(0, min(base * (2 ** (failures - 1)), 30.0)))


async def aiter_sse(
    open_stream: Callable[[Dict[str, str]], Any],
    data_kind: str = "text",
    reconnect: bool = True,
    reconnect_delay: float = 1.0,
) -> AsyncIterator[ServerSentEvent]:
    """Async mirror of iter_sse; \`open_stream\` returns an async context manager."""
    last_event_id: Optional[str] = None
    server_retry: Optional[float] = None
    failures = 0
    while True:
        headers = {"Accept": "text/event-stream"}
        if last_event_id is not None:
            headers["Last-Event-ID"] = last_event_id
        try:
            async with open_stream(headers) as response:
                if response.status_code >= 400:
                    await response.aread()
                    raise httpx.HTTPStatusError(
                        f"SSE request failed with status {response.status_code}",
                        request=response.request,
                        response=response,
                    )
                failures = 0
                buffer = ""
                async for chunk in response.aiter_text():
                    buffer += chunk
                    while _FRAME_DELIMITER in buffer:
                        raw, buffer = buffer.split(_FRAME_DELIMITER, 1)
                        parsed = parse_sse_frame(raw, data_kind)
                        if parsed is not None:
                            if parsed.id is not None:
                                last_event_id = parsed.id
                            if parsed.retry is not None:
                                server_retry = parsed.retry / 1000
                            yield parsed
                if buffer.strip():
                    parsed = parse_sse_frame(buffer, data_kind)
                    if parsed is not None:
                        yield parsed
                return
        except httpx.HTTPStatusError:
            raise
        except (httpx.TransportError, httpx.TimeoutException):
            if not reconnect:
                raise
        failures += 1
        base = server_retry if server_retry is not None else reconnect_delay
        await asyncio.sleep(random.uniform(0, min(base * (2 ** (failures - 1)), 30.0)))
`,"_multipart.py":`# Multipart bodies for generated Python clients \u2014 a typed dict/dataclass body is
# split into httpx's (data, files): bytes and file-like values upload as parts,
# everything else is form data (nested values JSON-encoded, mirroring the
# TypeScript runtime's FormData serialization).
from __future__ import annotations

import json
from typing import Any, Dict, Tuple

from ._decode import encode


def to_multipart(body: Any) -> Tuple[Dict[str, Any], Dict[str, Any]]:
    wire = encode(body)
    data: Dict[str, Any] = {}
    files: Dict[str, Any] = {}
    for key, value in (wire or {}).items():
        if isinstance(value, (bytes, bytearray)) or hasattr(value, "read"):
            files[key] = value
        elif isinstance(value, (dict, list)):
            data[key] = json.dumps(value)
        else:
            data[key] = value
    return data, files
`};export{e as a,t as b,n as c};
