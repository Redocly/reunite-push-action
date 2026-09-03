import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{V as R,c as x}from"./OZMIIHFH.js";import{m}from"./HJYFWIVE.js";function O(e){return e.flatMap(n=>n.operations)}function P(e,n,s){let r=e.specName??e.name;if(s?.exclude?.includes(r))return{};let a=s?.operations?.[r];if(a!==void 0)return y(e,n,a,`pagination.operations["${r}"]`,!0);if(e.paginationExtension!==void 0)return y(e,n,e.paginationExtension,"x-redoclyPagination",!0);if(s?.style!==void 0){let{exclude:o,operations:c,...t}=s;return y(e,n,t,"pagination convention",!1)}return{}}function H(e,n){let s=new Map,r=[];for(let a of O(e.services)){let o=P(a,e,n);o.error!==void 0?r.push(o.error):o.spec!==void 0&&s.set(a.name,{spec:o.spec,itemSchema:o.itemSchema})}if(r.length>0)throw new Error(["Invalid pagination configuration:",...r].join(`
  - `));return s}function y(e,n,s,r,a){let o=`Pagination for operation "${e.name}" (${r})`,c=q(s);if(c!==void 0)return{error:`${o}: ${c}`};let t=s,d=i=>a?{error:`${o}: ${i}`}:{};if(e.sse!==void 0)return d("the operation is a Server-Sent Events stream");if(t.style!=="link"){let i=t.style==="cursor"?"cursorParam":"offsetParam",l=t.style==="cursor"?t.cursorParam:t.offsetParam,k=e.queryParams.find(u=>u.name===l);if(!k){let u=e.queryParams.map(E=>E.name).join(", ");return d(`query parameter "${l}" is not declared on the operation`+(u===""?"":` (declared: ${u})`))}let p=C(k.schema,n);if(!(p!==void 0&&(t.style==="cursor"?b(p,n):p.kind==="scalar"&&(p.scalar==="number"||p.scalar==="integer")))){let u=t.style==="cursor"?"a string":"a number";return d(`the "${i}" query parameter "${l}" must accept ${u} (got ${I(p)})`)}}let g=e.successResponses.find(i=>i.contentType.toLowerCase().includes("json"));if(!g)return d("the operation has no JSON success response");if(t.style==="link"){let i=e.successResponseHeaders?.some(l=>l.name==="link")===!0;if(!i&&!a)return{};i||R.warn(`generate-client: ${o.toLowerCase()} follows the Link header, but the success response does not document one.
`)}let h=m(g.schema,t.items,n);if(h===void 0)return d(`the "items" pointer "${t.items}" does not resolve in the success response schema`);if(h.kind!=="array")return d(`the "items" pointer "${t.items}" must point at an array (got ${h.kind})`);if(t.style==="cursor"){let i=m(g.schema,t.nextCursor,n);if(i===void 0)return d(`the "nextCursor" pointer "${t.nextCursor}" does not resolve in the success response schema`);if(!b(i,n))return d(`the "nextCursor" pointer "${t.nextCursor}" must point at a string (got ${i.kind})`);if(t.hasMore!==void 0){let l=m(g.schema,t.hasMore,n);if(l===void 0)return d(`the "hasMore" pointer "${t.hasMore}" does not resolve in the success response schema`);if(l.kind!=="scalar"||l.scalar!=="boolean")return d(`the "hasMore" pointer "${t.hasMore}" must point at a boolean (got ${l.kind})`)}}let f=t.limitParam!==void 0?{limitParam:t.limitParam}:{};return{spec:t.style==="cursor"?{style:"cursor",param:t.cursorParam,...f,nextCursor:t.nextCursor,...t.hasMore!==void 0?{hasMore:t.hasMore}:{},items:t.items}:t.style==="link"?{style:"link",...f,items:t.items}:{style:t.style,param:t.offsetParam,...f,items:t.items},itemSchema:h.items}}function q(e){if(!x(e))return"the rule must be an object";let{style:n,cursorParam:s,nextCursor:r,hasMore:a,offsetParam:o,limitParam:c,items:t}=e;if(n!=="cursor"&&n!=="offset"&&n!=="page"&&n!=="link")return`"style" must be one of "cursor" | "offset" | "page" | "link" (got ${JSON.stringify(n)})`;if(typeof t!="string"||t!==""&&!t.startsWith("/"))return'"items" must be a JSON pointer starting with "/" (or "" when the response body is the item array itself)';if(n==="cursor"){if(typeof s!="string"||s==="")return'cursor style requires a "cursorParam" query parameter name';if(typeof r!="string"||!r.startsWith("/"))return'cursor style requires a "nextCursor" JSON pointer starting with "/"';if(a!==void 0&&(typeof a!="string"||!a.startsWith("/")))return'"hasMore" must be a JSON pointer starting with "/"'}else if((n==="offset"||n==="page")&&(typeof o!="string"||o===""))return`${n} style requires an "offsetParam" query parameter name`;if(c!==void 0&&typeof c!="string")return'"limitParam" must be a query parameter name'}function I(e){return e===void 0?"an unresolvable ref":e.kind==="scalar"||e.kind==="enum"?e.scalar:e.kind}function C(e,n){let s=new Set,r=e;for(;r.kind==="ref";){let{name:a}=r;if(s.has(a))return;s.add(a);let o=n.schemas.find(c=>c.name===a);if(o===void 0)return;r=o.schema}return r}function b(e,n){return e.kind==="scalar"||e.kind==="enum"?e.scalar==="string":e.kind==="literal"?typeof e.value=="string":e.kind==="union"?e.members.every(s=>{let r=C(s,n);return r!==void 0&&(r.kind==="null"||r.kind!=="union"&&b(r,n))}):!1}var G={"types.ts":`/**
 * The public type surface of the client runtime \u2014 \`@redocly/client-generator\`'s
 * app-facing runtime module. Pure types, no runtime code (excluded from coverage).
 * The generator emits \`OPERATIONS\` literals typed
 * \`satisfies Record<string, OperationDescriptor>\` against this module, so an
 * incompatible runtime/generated pair fails the consumer's build (the semver skew guard).
 */

/** How one operation parameter is sent: its location plus OpenAPI query-serialization hints. */
export type ParamSpec = {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  style?: 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';
  explode?: boolean;
  allowReserved?: boolean;
};

/** One security scheme, denormalized onto the operation (\`scheme\` names the spec's scheme). */
export type SecuritySpec =
  | { scheme: string; kind: 'bearer' | 'basic' }
  | { scheme: string; kind: 'apiKey'; name: string; in: 'header' | 'query' | 'cookie' };

/**
 * How to auto-iterate a paginated operation (drives its \`.pages()\`/\`.items()\` members).
 * \`nextCursor\` and \`items\` are RFC 6901 JSON pointers into the page (response) value.
 */
export type PaginationSpec =
  | {
      style: 'cursor';
      /** The query param the iterator advances with the response's cursor. */
      param: string;
      /** Optional page-size query param (recorded for tooling; never set by the runtime). */
      limitParam?: string;
      /** Pointer to the next cursor in the page. */
      nextCursor: string;
      /** Optional pointer to a boolean "more pages" flag \u2014 \`false\` stops iteration. */
      hasMore?: string;
      /** Pointer to the page's item array. */
      items: string;
    }
  | {
      style: 'offset' | 'page';
      /** The numeric query param the iterator advances. */
      param: string;
      /** Optional page-size query param (recorded for tooling; never set by the runtime). */
      limitParam?: string;
      /** Pointer to the page's item array. */
      items: string;
    }
  | {
      /** RFC 8288: follow the response's \`Link\` header \`rel="next"\`; stop when absent. */
      style: 'link';
      /** Optional page-size query param (recorded for tooling; never set by the runtime). */
      limitParam?: string;
      /** Pointer to the page's item array. */
      items: string;
    };

/** The frozen data contract between generated code and the runtime: one operation's wire shape. */
export type OperationDescriptor = {
  id: string;
  method: string;
  path: string;
  tags?: readonly string[];
  params?: readonly ParamSpec[];
  /** \`multipart: true\` marks a typed object body serialized to FormData by the runtime. */
  body?: { contentType: string; multipart?: boolean };
  /** Defaults to \`'json'\` (content-type negotiation on parse). */
  responseKind?: 'json' | 'text' | 'blob' | 'void' | 'sse';
  sseDataKind?: 'json' | 'text';
  /** OR-alternatives, each an AND-set: the runtime applies the first fully-configured one. */
  security?: readonly (readonly SecuritySpec[])[];
  pagination?: PaginationSpec;
  /**
   * \`'grouped'\` marks an operation that takes its inputs namespaced by layer even on a
   * \`argsStyle: 'flat'\` client \u2014 the generator sets it where a merged call could not carry
   * one name for two layers, and the operation's own input type says the same.
   */
  argsStyle?: 'grouped';
  /**
   * Declared success-response headers for throw-mode \`{ envelope: true }\`.
   * \`name\` is the lowercased wire name; \`key\` is the camelCase envelope property.
   */
  responseHeaders?: readonly ResponseHeaderSpec[];
};

/** One declared response header the runtime coerces into the envelope \`headers\` object. */
export type ResponseHeaderSpec = {
  name: string;
  key: string;
  type: 'string' | 'number' | 'boolean';
};

/** A query value: scalars, arrays of scalars, or objects (serialized as deepObject brackets). */
export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>
  | Record<string, unknown>;

/** A credential: a literal, or a (possibly async) function resolved per request (refresh flows). */
export type TokenProvider = string | (() => string | Promise<string>);

/** Per-instance credentials, keyed by the scheme kinds the runtime can inject. */
export type AuthCredentials = {
  bearer?: TokenProvider;
  basic?: { username: string; password: string };
  apiKey?: Record<string, TokenProvider>;
};

/** Backoff shape: 'fixed' = constant delay; 'exponential' = doubling per attempt. */
export type RetryStrategy = 'fixed' | 'exponential';

/**
 * The operation's identity, exposed to middleware for targeting (\`ctx.operation\`).
 * Generated clients instantiate the type parameters with the spec's literal unions
 * (\`OperationId\`/\`OperationPath\`/\`OperationTag\`) so a misspelled operation id in a
 * middleware comparison fails to compile; the string defaults keep every
 * spec-independent consumer (\`runtime-contract.ts\`, the runtime internals) working
 * with the base shape. \`tags\` stays mutable (\`Tag[]\`) so setup-contract types
 * (byte-locked to generated output) remain assignable through middleware callbacks.
 */
export type OperationContext<
  Id extends string = string,
  Path extends string = string,
  Tag extends string = string,
> = { id: Id; path: Path; tags: Tag[] };

/** The mutable request context threaded through the middleware chain. */
export type RequestContext<Op extends OperationContext = OperationContext> = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  operation: Op;
};

/** The failed attempt handed to a custom \`retryOn\`: exactly one of \`response\`/\`error\` is set. */
export type RetryContext<Op extends OperationContext = OperationContext> = {
  attempt: number;
  request: RequestContext<Op>;
  response?: Response;
  error?: unknown;
};

/** Opt-in retry policy; a per-call override merges field-by-field over the config policy. */
export type RetryConfig<Op extends OperationContext = OperationContext> = {
  retries?: number;
  retryDelay?: number;
  retryStrategy?: RetryStrategy;
  jitter?: boolean;
  retryOn?: (ctx: RetryContext<Op>) => boolean | Promise<boolean>;
};

/**
 * Structural stand-in for the runtime's ApiError so this module stays import-free
 * (pure types); the real \`ApiError\` class is assignable to it.
 */
export type ApiErrorLike = globalThis.Error & {
  url: string;
  status: number;
  statusText: string;
  body: unknown;
};

/** One interceptor: any subset of the three hooks. */
export type Middleware<Op extends OperationContext = OperationContext> = {
  onRequest?: (ctx: RequestContext<Op>) => void | Promise<void>;
  onResponse?: (
    response: Response,
    ctx: RequestContext<Op>
  ) => Response | void | Promise<Response | void>;
  /** Throw mode only: may map/replace the error. */
  // \`globalThis.Error\` so a spec schema named \`Error\` cannot shadow it in inline mode.
  onError?: (
    error: ApiErrorLike,
    ctx: RequestContext<Op>
  ) => globalThis.Error | Promise<globalThis.Error>;
};

/** Client configuration: transport, defaults, retry policy, middleware, and credentials. */
export type ClientConfig<Op extends OperationContext = OperationContext> = {
  serverUrl?: string;
  fetch?: typeof fetch;
  headers?:
    | Record<string, string>
    | (() => Record<string, string> | Promise<Record<string, string>>);
  retry?: RetryConfig<Op>;
  /** Milliseconds before a request attempt aborts (covers the body read too; each retry
   * attempt gets a fresh budget). Per-call \`timeout\` overrides it, \`0\` disables it.
   * SSE streams are long-lived by design and never inherit this value. */
  timeout?: number;
  /** Send an \`Idempotency-Key\` header on POST/PATCH (one stable key per logical call,
   * reused across retry attempts) \u2014 which also makes those retries safe under the
   * default retry policy. \`true\` generates a UUID per call; a function supplies the key. */
  idempotencyKey?: boolean | (() => string);
  /** Identifies this client to the API via an \`X-Redocly-Client\` header (the generator
   * bakes a default). Sent only OUTSIDE browsers \u2014 a custom header would force a CORS
   * preflight. Override with your own value, or \`false\` to disable. */
  clientHeader?: string | false;
  middleware?: Middleware<Op>[];
  auth?: AuthCredentials;
  /** Fixed at generate time by the generator (\`'throw'\` when omitted); \`configure()\` ignores it. */
  errorMode?: 'throw' | 'result';
  /**
   * How each call spells its inputs: \`'grouped'\` (the default) namespaces them by layer \u2014
   * \`{ path, query, headers, cookies, body }\` \u2014 and \`'flat'\` takes one merged object.
   * Fixed at generate time, like \`errorMode\`, because it shapes the static types.
   */
  argsStyle?: 'grouped' | 'flat';
  onRequest?: Middleware<Op>['onRequest'];
  onResponse?: Middleware<Op>['onResponse'];
  onError?: Middleware<Op>['onError'];
};

/** Response readers for the per-call \`parseAs\` override. */
export type ParseAs = 'auto' | 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'stream';

/** Per-call options: standard \`RequestInit\` plus a retry override, a timeout override
 * (\`0\` disables the config default), and a forced reader. */
export type RequestOptions = RequestInit & {
  retry?: RetryConfig;
  timeout?: number;
  /** Per-call idempotency key: a literal key, \`true\` to generate one, \`false\` to skip. */
  idempotencyKey?: string | boolean | (() => string);
  parseAs?: ParseAs;
  /**
   * Throw mode only: return \`{ data, headers, response }\` instead of the parsed body;
   * ignored in result mode. The explicit \`| undefined\` keeps the wrappers' emitted
   * \`envelope: undefined\` strip legal under \`exactOptionalPropertyTypes\`.
   */
  envelope?: boolean | undefined;
};

/** Throw-mode success envelope when \`RequestOptions.envelope\` is \`true\`. */
export type Envelope<TData, THeaders = Record<string, never>> = {
  data: TData;
  headers: THeaders;
  response: Response;
};

/** Per-call options for an SSE stream; reconnect defaults to true. */
export type SseOptions = RequestInit & { reconnect?: boolean; reconnectDelay?: number };

/** A single decoded Server-Sent Event with its payload typed from the spec. */
export type ServerSentEvent<T> = { event?: string; data: T; id?: string; retry?: number };

/** Result-mode return shape: exactly one of \`data\`/\`error\` is set. */
export type Result<TData, TError> =
  | { data: TData; error: undefined; response: Response }
  | { data: undefined; error: TError; response: Response };

/**
 * The generated \`Ops\` type's shape: per-operation args/result, plus \`kind: 'sse'\` for
 * streams and, for paginated operations, \`item\` (the page's element type) and \u2014 on
 * result-mode clients only \u2014 \`page\` (the RAW page type \`.pages()\` yields, since
 * iteration unwraps the \`Result\` envelope the one-shot \`result\` carries).
 */
export type OpsShape = Record<
  string,
  {
    args: object;
    result: unknown;
    kind?: 'sse';
    item?: unknown;
    page?: unknown;
    /** Declared success-response headers for \`{ envelope: true }\` (camelCase keys). */
    headers?: object;
    /** Result-mode entries ignore the throw-only \`envelope\` option. */
    mode?: 'result';
  }
>;

/** The always-present client members (assigned after the operation loop \u2014 they win collisions). */
export type ClientCore<Op extends OperationContext = OperationContext> = {
  /** Merge into the config; note \`middleware\` REPLACES the chain (use \`use()\` to compose). */
  configure(config: ClientConfig<Op>): void;
  /** Append interceptors (composes with baked/publisher middleware). */
  use(...middleware: Middleware<Op>[]): void;
  auth: {
    bearer(token: TokenProvider): void;
    basic(username: string, password: string): void;
    apiKey(scheme: string, value: TokenProvider): void;
  };
};

/**
 * The standard TypeScript optionality probe: \`{}\` has no required members, so
 * \`{} extends A\` is true exactly when every member of \`A\` is optional.
 */
// oxlint-disable-next-line typescript/no-empty-object-type
type NoRequiredKeys<A> = {} extends A ? true : false;

/**
 * The page type \`.pages()\` yields: the RAW page declared by \`page\` (the generator
 * writes it only on result-mode paginated entries, whose \`result\` is the envelope),
 * or the method's own \`result\` (throw mode \u2014 already the raw page).
 */
type PageOf<Entry extends OpsShape[string]> = Entry extends { page: unknown }
  ? Entry['page']
  : Entry['result'];

/**
 * The auto-pagination members intersected onto a paginated method \u2014 present exactly when
 * the Ops entry declares \`item\` (the generator writes it only for paginated operations).
 * Args optionality mirrors the method's own; \`unknown\` otherwise (identity under \`&\`).
 * Iteration is error-mode-agnostic: \`.pages()\`/\`.items()\` yield raw pages/items, and a
 * failed page aborts iteration by throwing \`ApiError\`, even on result-mode clients; the
 * \`onError\` middleware hook (throw-mode-only) is not invoked.
 */
type Paginated<Entry extends OpsShape[string]> = 'item' extends keyof Entry
  ? NoRequiredKeys<Entry['args']> extends true
    ? {
        pages(args?: Entry['args'], init?: RequestOptions): AsyncGenerator<PageOf<Entry>>;
        items(args?: Entry['args'], init?: RequestOptions): AsyncGenerator<Entry['item']>;
      }
    : {
        pages(args: Entry['args'], init?: RequestOptions): AsyncGenerator<PageOf<Entry>>;
        items(args: Entry['args'], init?: RequestOptions): AsyncGenerator<Entry['item']>;
      }
  : unknown;

/**
 * The stable identity every client method carries: the SPEC operationId (also set as
 * \`fn.name\`, but \`operationId\` is the explicit, minification-proof form) \u2014 a robust
 * cache key for consumer wrappers (react-query keys and the like).
 */
export type OperationMethodIdentity = { readonly operationId: string };

/** Declared response-header bag for an Ops entry; empty object when none are declared. */
type HeadersOf<Entry extends OpsShape[string]> = 'headers' extends keyof Entry
  ? NonNullable<Entry['headers']>
  : Record<string, never>;

/**
 * Return type of a throw-mode call: the body by default, \`Envelope<\u2026>\` for a literal
 * \`envelope: true\`, their union when the flag is a widened \`boolean\`. Exact
 * \`RequestOptions\` stays the body \u2014 pre-envelope package-mode flat sugar typed every
 * \`init\` parameter as \`RequestOptions\`, and widening that would break upgrades without
 * a regenerate. The \`keyof\` presence gate keeps \`{ headers }\` / \`{ signal }\` as the body
 * (\`TInit['envelope']\` through \`TInit & RequestOptions\` would otherwise be
 * \`boolean | undefined\`).
 */
export type EnvelopeResult<
  TData,
  THeaders,
  TInit extends RequestOptions | undefined,
> = TInit extends undefined
  ? TData
  : RequestOptions extends TInit
    ? TInit extends RequestOptions
      ? TData
      : EnvelopeResultForKnownInit<TData, THeaders, TInit>
    : EnvelopeResultForKnownInit<TData, THeaders, TInit>;

type EnvelopeResultForKnownInit<TData, THeaders, TInit> = 'envelope' extends keyof TInit
  ? [TInit['envelope' & keyof TInit]] extends [true]
    ? Envelope<TData, THeaders>
    : [TInit['envelope' & keyof TInit]] extends [false | undefined]
      ? TData
      : TData | Envelope<TData, THeaders>
  : TData;

/** A one-shot method whose return shape never varies with per-call options. */
type BodyMethod<Entry extends OpsShape[string]> =
  NoRequiredKeys<Entry['args']> extends true
    ? (args?: Entry['args'], init?: RequestOptions) => Promise<Entry['result']>
    : (args: Entry['args'], init?: RequestOptions) => Promise<Entry['result']>;

/**
 * One-shot (non-SSE) method: default returns the body; \`{ envelope: true }\` returns
 * \`{ data, headers, response }\` with typed declared headers.
 */
type ThrowMethod<Entry extends OpsShape[string]> =
  NoRequiredKeys<Entry['args']> extends true
    ? <Init extends RequestOptions | undefined = undefined>(
        args?: Entry['args'],
        init?: Init
      ) => Promise<EnvelopeResult<Entry['result'], HeadersOf<Entry>, Init>>
    : <Init extends RequestOptions | undefined = undefined>(
        args: Entry['args'],
        init?: Init
      ) => Promise<EnvelopeResult<Entry['result'], HeadersOf<Entry>, Init>>;

/** The typed instance client: one bound method per operation plus the core members. */
export type Client<Ops extends OpsShape, Op extends OperationContext = OperationContext> = {
  [K in keyof Ops]: Ops[K] extends { kind: 'sse' }
    ? (NoRequiredKeys<Ops[K]['args']> extends true
        ? (
            args?: Ops[K]['args'],
            init?: SseOptions
          ) => AsyncGenerator<ServerSentEvent<Ops[K]['result']>>
        : (
            args: Ops[K]['args'],
            init?: SseOptions
          ) => AsyncGenerator<ServerSentEvent<Ops[K]['result']>>) &
        OperationMethodIdentity
    : (Ops[K] extends { mode: 'result' } ? BodyMethod<Ops[K]> : ThrowMethod<Ops[K]>) &
        OperationMethodIdentity &
        Paginated<Ops[K]>;
} & ClientCore<Op>;
`,"errors.ts":`/** The error thrown (throw mode) for a non-2xx response, carrying the decoded error body. */
export class ApiError extends Error {
  public readonly url: string;
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: unknown;
  constructor(url: string, status: number, statusText: string, body: unknown) {
    super(\`Request failed with status \${status}\`);
    this.name = 'ApiError';
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

/** The error thrown when a request attempt exceeds the configured \`timeout\` \u2014 carries
 * the context a log line needs (which operation, what budget, which attempt). */
export class TimeoutError extends Error {
  public readonly operationId: string;
  public readonly timeout: number;
  public readonly attempt: number;
  constructor(operationId: string, timeout: number, attempt: number) {
    super(\`Request "\${operationId}" timed out after \${timeout} ms (attempt \${attempt})\`);
    this.name = 'TimeoutError';
    this.operationId = operationId;
    this.timeout = timeout;
    this.attempt = attempt;
  }
}

/** The error to throw for an aborted request: the caller's abort reason when it is an Error. */
// \`globalThis.Error\` (not bare \`Error\`) so a spec schema named \`Error\` cannot shadow it
// when this module is embedded alongside generated types (inline mode).
export function abortError(signal: AbortSignal): globalThis.Error {
  const reason = (signal as { reason?: unknown }).reason;
  if (reason instanceof Error) return reason;
  return new DOMException('The operation was aborted.', 'AbortError');
}
`,"url.ts":`import type { ParamSpec, QueryValue } from './types.js';

/**
 * The RESOLVED OpenAPI serialization spec for one query parameter \u2014 callers apply the
 * OpenAPI defaults (\`style: 'form'\`, \`explode: true\`) before building one.
 */
export type QueryStyle = {
  style: NonNullable<ParamSpec['style']>;
  explode: boolean;
  allowReserved?: boolean;
};

/**
 * Encode everything except the RFC-3986 reserved set, for \`allowReserved: true\` params \u2014
 * \`filter=a/b\` survives instead of \`filter=a%2Fb\`.
 */
export function encodeReserved(value: string): string {
  return encodeURIComponent(value).replace(
    /%(3A|2F|3F|23|5B|5D|40|21|24|26|27|28|29|2A|2B|2C|3B|3D)/g,
    (match) => decodeURIComponent(match)
  );
}

/** Substitute \`{name}\` template segments with encoded values; a missing value is a caller bug. */
export function substitutePath(template: string, values: Record<string, unknown>): string {
  return template.replace(/\\{([^{}]+)\\}/g, (_match, name: string) => {
    const value = values[name];
    if (value === undefined) throw new Error(\`Missing path parameter "\${name}"\`);
    return encodeURIComponent(String(value));
  });
}

/**
 * Build the request URL: \`serverUrl\` (trailing slash trimmed) + path + serialized query.
 * Query parameters honor their OpenAPI \`style\`/\`explode\`/\`allowReserved\` (from \`styles\`);
 * without a spec, arrays repeat the key (\`form\`+\`explode\`), objects serialize as
 * \`deepObject\` brackets, and \`null\`/\`undefined\` entries are skipped.
 */
export function buildUrl(
  serverUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
  styles?: Record<string, QueryStyle>
): string {
  // Trim trailing slashes with a scan, not \`/\\/+$/\` \u2014 an anchored \`+\` regex is
  // quadratic on adversarial many-slash input (the server URL is caller data).
  let end = serverUrl.length;
  while (end > 0 && serverUrl.charCodeAt(end - 1) === 47 /* '/' */) end--;
  const url = serverUrl.slice(0, end) + path;
  if (!query) return url;
  const params = new URLSearchParams();
  const raw: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    const spec = styles?.[key];
    if (!spec) {
      if (Array.isArray(value)) {
        for (const v of value) {
          if (v !== undefined && v !== null) params.append(key, String(v));
        }
      } else if (Object(value) === value) {
        // Object-valued query params use \`deepObject\` style: key[subKey]=subValue.
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subValue !== undefined && subValue !== null) {
            params.append(\`\${key}[\${subKey}]\`, String(subValue));
          }
        }
      } else {
        params.append(key, String(value));
      }
      continue;
    }
    if (Array.isArray(value)) {
      const items = value.filter((v) => v !== undefined && v !== null).map(String);
      if (spec.style === 'form' && spec.explode) {
        for (const v of items) {
          if (spec.allowReserved) raw.push(\`\${key}=\${encodeReserved(v)}\`);
          else params.append(key, v);
        }
      } else {
        // Delimited styles put the LITERAL delimiter on the wire; only the
        // values are encoded. \`%20\` (not \`+\`) is the literal space delimiter.
        const delim =
          spec.style === 'pipeDelimited' ? '|' : spec.style === 'spaceDelimited' ? '%20' : ',';
        const enc = spec.allowReserved ? encodeReserved : encodeURIComponent;
        raw.push(\`\${encodeURIComponent(key)}=\${items.map(enc).join(delim)}\`);
      }
    } else if (Object(value) === value) {
      // \`deepObject\` (and any object spec, for now): key[subKey]=subValue.
      for (const [subKey, subValue] of Object.entries(value)) {
        if (subValue !== undefined && subValue !== null) {
          if (spec.allowReserved) raw.push(\`\${key}[\${subKey}]=\${encodeReserved(String(subValue))}\`);
          else params.append(\`\${key}[\${subKey}]\`, String(subValue));
        }
      }
    } else if (spec.allowReserved) {
      raw.push(\`\${key}=\${encodeReserved(String(value))}\`);
    } else {
      params.append(key, String(value));
    }
  }
  const qs = [params.toString(), ...raw].filter(Boolean).join('&');
  return qs ? \`\${url}?\${qs}\` : url;
}
`,"parse.ts":`import type { ParseAs } from './types.js';

/**
 * Read the response body per \`kind\`. \`'auto'\` negotiates from the content type
 * (JSON, then \`text/*\`, then Blob); \`204\` responses read nothing. A \`'void'\`
 * operation (no declared 2xx content) still returns a JSON body the server
 * actually sends: the static type stays \`void\`, but silently dropping real data
 * behind a spec gap is the worse failure \u2014 consumers can reach it with a cast
 * while the API description catches up.
 */
export async function parse(response: Response, kind: ParseAs | 'void'): Promise<unknown> {
  if (kind === 'void') {
    if (response.status === 204 || response.status === 205 || response.status === 304) {
      return undefined;
    }
    const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
    if (!contentType.includes('json')) return undefined;
    // Best-effort: an empty or malformed body on an undeclared response stays undefined.
    const text = await response.text().catch(() => '');
    if (text === '') return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }
  if (response.status === 204) return undefined;
  if (kind === 'stream') return response.body;
  if (kind === 'blob') return response.blob();
  if (kind === 'arrayBuffer') return response.arrayBuffer();
  if (kind === 'formData') return response.formData();
  if (kind === 'text') return response.text();
  if (kind === 'json') return response.json();
  // 'auto' \u2014 negotiate from the response's content type (case-insensitively:
  // \`Text/Plain\` and \`application/JSON\` are valid per RFC 9110).
  const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
  if (contentType.includes('json')) return response.json();
  if (contentType.startsWith('text/')) return response.text();
  // An untyped body reads as a Blob \u2014 but an EMPTY one resolves to undefined: a 2xx
  // with \`Content-Length: 0\` must not yield a truthy \`new Blob([])\` that silently
  // defeats every \`!data\` guard downstream.
  const blob = await response.blob();
  return blob.size > 0 ? blob : undefined;
}

/** Best-effort decode of a non-2xx body (JSON when declared, else text; undefined on failure). */
export async function readError(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.toLowerCase().includes('json')) {
    return response.json().catch(() => undefined);
  }
  return response.text().catch(() => undefined);
}
`,"retry.ts":`import { abortError } from './errors.js';
import type { RetryConfig, RetryContext } from './types.js';

const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']);
const TRANSIENT_STATUS = new Set([408, 429, 500, 502, 503, 504]);

/**
 * The default retry predicate: idempotent methods \u2014 or any request carrying an
 * \`Idempotency-Key\` header, which makes re-sending safe \u2014 on a transport error or a
 * transient status. A custom \`retryOn\` fully replaces this (no method check kept).
 */
export function defaultRetryOn(ctx: RetryContext): boolean {
  const safeToResend =
    IDEMPOTENT_METHODS.has(ctx.request.method.toUpperCase()) ||
    'Idempotency-Key' in ctx.request.headers ||
    'idempotency-key' in ctx.request.headers;
  if (!safeToResend) return false;
  return ctx.response === undefined || TRANSIENT_STATUS.has(ctx.response.status);
}

/**
 * The delay before the next attempt: a \`Retry-After\` header (seconds or HTTP-date)
 * wins; otherwise fixed/exponential backoff over \`retryDelay\`, with full jitter
 * unless \`jitter === false\`.
 */
export function retryDelay(retry: RetryConfig, attempt: number, retryAfter: string | null): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (!Number.isNaN(seconds)) return seconds * 1000;
    const when = Date.parse(retryAfter);
    if (!Number.isNaN(when)) return Math.max(0, when - Date.now());
  }
  const base = retry.retryDelay ?? 1000;
  const raw = retry.retryStrategy === 'fixed' ? base : base * Math.pow(2, attempt - 1);
  return retry.jitter === false ? raw : Math.random() * raw;
}

/** Abort-aware sleep: resolves after \`ms\`, rejects with the abort reason immediately on abort. */
export function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError(signal));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError(signal as AbortSignal));
    };
    const timer = setTimeout(() => {
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    if (signal) signal.addEventListener('abort', onAbort, { once: true });
  });
}
`,"multipart.ts":`/**
 * Serialize a plain object into \`FormData\` for a typed \`multipart/form-data\` body
 * (capability module \u2014 wired into \`createClient\`, never imported by the send core).
 * \`Blob\`/\`File\` and strings pass through; \`Date\`s become ISO strings; arrays append
 * one field per item; other objects are JSON-encoded; everything else is stringified.
 * \`undefined\`/\`null\` entries are skipped.
 */
export function toFormData(body: Record<string, unknown>): FormData {
  const fd = new FormData();
  const append = (key: string, value: unknown): void => {
    if (value === undefined || value === null) return;
    if (value instanceof Blob || typeof value === 'string') fd.append(key, value);
    else if (value instanceof Date) fd.append(key, value.toISOString());
    else if (Object(value) === value) fd.append(key, JSON.stringify(value));
    else fd.append(key, String(value));
  };
  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) for (const item of value) append(key, item);
    else append(key, value);
  }
  return fd;
}
`,"auth.ts":`import type { ClientConfig, SecuritySpec, TokenProvider } from './types.js';

/** Resolve a credential: a literal passes through; a function is awaited per request. */
async function resolveToken(provider: TokenProvider): Promise<string> {
  return typeof provider === 'function' ? await provider() : provider;
}

/** UTF-8-safe base64: bare \`btoa\` throws on non-Latin-1 credentials (RFC 7617 allows UTF-8). */
function encodeBase64(text: string): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Whether a credential for this scheme is configured on the instance. */
function isConfigured(scheme: SecuritySpec, config: ClientConfig): boolean {
  if (scheme.kind === 'apiKey') return config.auth?.apiKey?.[scheme.scheme] !== undefined;
  if (scheme.kind === 'bearer') return config.auth?.bearer !== undefined;
  return config.auth?.basic !== undefined;
}

/**
 * Build the auth headers/query for one operation's \`security\` OR-alternatives from the
 * instance credentials (\`config.auth\`) \u2014 capability module, wired into \`createClient\`.
 * The first alternative whose schemes (an AND-set) are all configured is applied, so
 * "bearer OR apiKey" works with either credential and never sends both. When none is
 * fully configured, the first alternative's configured schemes are still sent (the
 * server rejects the request, mirroring the previous behavior).
 * Cookie-borne apiKeys fold into a single \`Cookie\` header joined with \`; \`.
 */
export async function resolveAuth(
  security: readonly (readonly SecuritySpec[])[],
  config: ClientConfig
): Promise<{ headers: Record<string, string>; query: Record<string, string> }> {
  const alternative =
    security.find((schemes) => schemes.every((scheme) => isConfigured(scheme, config))) ??
    security[0] ??
    [];
  const headers: Record<string, string> = {};
  const query: Record<string, string> = {};
  const cookies: string[] = [];
  for (const scheme of alternative) {
    if (scheme.kind === 'apiKey') {
      const provider = config.auth?.apiKey?.[scheme.scheme];
      if (provider === undefined) continue;
      const value = await resolveToken(provider);
      if (scheme.in === 'header') headers[scheme.name] = value;
      else if (scheme.in === 'query') query[scheme.name] = value;
      // Cookie values may contain reserved characters (\`;\`, \`=\`, space, \u2026); percent-encode
      // so the credential can't break the \`Cookie\` header syntax.
      else cookies.push(\`\${scheme.name}=\${encodeURIComponent(value)}\`);
    } else if (scheme.kind === 'bearer') {
      const provider = config.auth?.bearer;
      if (provider !== undefined) headers.Authorization = \`Bearer \${await resolveToken(provider)}\`;
    } else {
      const basic = config.auth?.basic;
      if (basic !== undefined) {
        headers.Authorization = \`Basic \${encodeBase64(\`\${basic.username}:\${basic.password}\`)}\`;
      }
    }
  }
  if (cookies.length > 0) headers.Cookie = cookies.join('; ');
  return { headers, query };
}
`,"setup.ts":`import type { ClientConfig, Middleware } from './types.js';

/**
 * Merge a publisher's baked setup (\`defineClientSetup({...})\`) with the app's config:
 * app config fields win per-field over baked defaults, while middleware composes \u2014
 * baked middleware runs first, then the app's.
 */
export function mergeSetup(
  setup: { config?: ClientConfig; middleware?: Middleware[] } | undefined,
  config: ClientConfig = {}
): ClientConfig {
  return {
    ...setup?.config,
    ...config,
    middleware: [...(setup?.middleware ?? []), ...(config.middleware ?? [])],
  };
}
`,"send.ts":`import { abortError, TimeoutError } from './errors.js';
import { defaultRetryOn, retryDelay, sleep } from './retry.js';
import type {
  ClientConfig,
  Middleware,
  OperationContext,
  RequestContext,
  RequestOptions,
  RetryConfig,
} from './types.js';

/**
 * Optional behaviors the send core can use but never statically imports \u2014 wired by
 * \`createClient\` (the same seam the future inline-mode assembler relies on).
 */
export type SendCapabilities = {
  /** Serialize a typed multipart body (a plain object) to FormData. */
  serializeMultipart?: (body: Record<string, unknown>) => FormData;
};

/**
 * Normalize a caller's \`HeadersInit\` (plain record, \`Headers\` instance, or entry pairs)
 * to a plain record \u2014 spreading a \`Headers\` or an array contributes no entries.
 */
export function toHeaderRecord(headers: HeadersInit | undefined): Record<string, string> {
  if (headers === undefined) return {};
  if (headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
}

/**
 * The effective middleware chain for a request: the single \`onRequest\`/\`onResponse\`/
 * \`onError\` config hooks as one implicit first middleware, then \`config.middleware\`.
 */
export function middlewareChain(config: ClientConfig): Middleware[] {
  const single =
    config.onRequest || config.onResponse || config.onError
      ? [{ onRequest: config.onRequest, onResponse: config.onResponse, onError: config.onError }]
      : [];
  return [...single, ...(config.middleware ?? [])];
}

/**
 * The fetch core shared by every operation: default + config + per-call headers, the
 * \`onRequest\` chain (BEFORE body serialization, so mutations are sent), body
 * serialization (JSON, or FormData via the multipart capability), the retry loop
 * (idempotent-only defaults, \`Retry-After\`, abandoned-body drain), and the reverse
 * \`onResponse\` onion. Returns the final response plus the request context.
 */
export async function send(
  config: ClientConfig,
  op: OperationContext,
  url: string,
  init: RequestOptions,
  body: unknown | undefined,
  bodySpec: { contentType: string; multipart?: boolean } | undefined,
  caps: SendCapabilities,
  accept = 'application/json'
): Promise<{ response: Response; context: RequestContext }> {
  const { retry: callRetry, timeout: callTimeout, idempotencyKey: callKey, ...fetchInit } = init;
  const retry: RetryConfig = { ...config.retry, ...callRetry };
  const timeout = callTimeout ?? config.timeout;
  const idempotency = callKey ?? config.idempotencyKey;
  const extra = typeof config.headers === 'function' ? await config.headers() : config.headers;
  const headers: Record<string, string> = {
    Accept: accept,
    ...extra,
    ...toHeaderRecord(fetchInit.headers),
  };
  const method = (fetchInit.method ?? 'GET').toUpperCase();
  // One stable key per LOGICAL call \u2014 set before the retry loop so every attempt
  // re-sends the same key; a caller-provided header always wins.
  if (
    idempotency !== undefined &&
    idempotency !== false &&
    (method === 'POST' || method === 'PATCH') &&
    !('Idempotency-Key' in headers) &&
    !('idempotency-key' in headers)
  ) {
    headers['Idempotency-Key'] =
      typeof idempotency === 'string'
        ? idempotency
        : typeof idempotency === 'function'
          ? idempotency()
          : crypto.randomUUID();
  }
  // Client identification for the API owner's telemetry \u2014 never in browsers, where a
  // custom header would force a CORS preflight the API may not allow.
  if (
    typeof config.clientHeader === 'string' &&
    typeof document === 'undefined' &&
    !('X-Redocly-Client' in headers) &&
    !('x-redocly-client' in headers)
  ) {
    headers['X-Redocly-Client'] = config.clientHeader;
  }
  const context: RequestContext = {
    url,
    method: fetchInit.method ?? 'GET',
    headers,
    body,
    operation: op,
  };
  const middleware = middlewareChain(config);
  for (const mw of middleware) if (mw.onRequest) await mw.onRequest(context);
  // Serialize AFTER onRequest so body mutations (case conversion, enveloping, signing) take effect.
  let payload: BodyInit | undefined;
  if (context.body !== undefined) {
    const value = context.body;
    const isBinary =
      value instanceof Blob ||
      value instanceof ArrayBuffer ||
      ArrayBuffer.isView(value as ArrayBufferView);
    const isFormData = typeof FormData !== 'undefined' && value instanceof FormData;
    const isURLSearchParams = value instanceof URLSearchParams;
    if (isFormData || isURLSearchParams || isBinary || typeof value === 'string') {
      payload = value as BodyInit;
    } else if (bodySpec?.multipart === true) {
      if (!caps.serializeMultipart) {
        throw new Error('Multipart capability not wired: cannot serialize the request body');
      }
      payload = caps.serializeMultipart(value as Record<string, unknown>);
    } else {
      payload = JSON.stringify(value);
      if (!('Content-Type' in context.headers) && !('content-type' in context.headers)) {
        // The spec's declared request content type (e.g. application/merge-patch+json).
        context.headers['Content-Type'] = bodySpec?.contentType ?? 'application/json';
      }
    }
  }
  const doFetch = config.fetch ?? fetch;
  const maxAttempts = 1 + (retry.retries ?? 0);
  const retryOn = retry.retryOn ?? defaultRetryOn;
  const signal = fetchInit.signal ?? undefined;

  let attempt = 0;
  while (true) {
    attempt++;
    if (signal?.aborted) throw abortError(signal);
    // A fresh timeout budget per attempt; the caller's signal still wins the race.
    // The composed signal also governs reading the response body.
    const attemptSignal = timeout
      ? signal
        ? AbortSignal.any([signal, AbortSignal.timeout(timeout)])
        : AbortSignal.timeout(timeout)
      : signal;
    let response: Response;
    try {
      response = await doFetch(context.url, {
        ...fetchInit,
        signal: attemptSignal,
        method: context.method,
        headers: context.headers,
        body: payload,
      });
    } catch (error) {
      if (
        attempt < maxAttempts &&
        !signal?.aborted &&
        (await retryOn({ attempt, request: context, error }))
      ) {
        await sleep(retryDelay(retry, attempt, null), signal);
        continue;
      }
      // Our timeout fired (never the caller's own abort \u2014 that rethrows untouched):
      // wrap the bare DOMException with the context a log line needs.
      if (
        timeout &&
        !signal?.aborted &&
        error instanceof DOMException &&
        error.name === 'TimeoutError'
      ) {
        throw new TimeoutError(op.id, timeout, attempt);
      }
      throw error;
    }
    // Reverse order: the last-registered middleware wraps closest to the network (onion).
    for (let i = middleware.length - 1; i >= 0; i--) {
      const onResponse = middleware[i].onResponse;
      if (onResponse) {
        const replaced = await onResponse(response, context);
        if (replaced && replaced !== response) {
          // Cancel the abandoned original's body \u2014 like the retry path, an unread body
          // keeps its connection checked out under Node/undici.
          await response.body?.cancel().catch(() => undefined);
          response = replaced;
        }
      }
    }
    if (
      !response.ok &&
      attempt < maxAttempts &&
      !signal?.aborted &&
      (await retryOn({ attempt, request: context, response }))
    ) {
      const retryAfter = response.headers.get('retry-after');
      // Drain the abandoned response body before the next attempt: an unread body
      // keeps the connection checked out (and can stall the pool) under Node/undici
      // and other strict HTTP clients. Ignore errors (e.g. a middleware already read it).
      await response.body?.cancel().catch(() => undefined);
      await sleep(retryDelay(retry, attempt, retryAfter), signal);
      continue;
    }
    return { response, context };
  }
}
`,"sse.ts":`import { ApiError } from './errors.js';
import { readError } from './parse.js';
import { sleep } from './retry.js';
import { send, toHeaderRecord } from './send.js';
import type { ClientConfig, OperationContext, ServerSentEvent, SseOptions } from './types.js';

/**
 * A frame delimiter: two consecutive line terminators (each CR, LF, or CRLF, per the SSE
 * spec \u2014 so mixed endings like \`\\n\\r\\n\` are valid boundaries, not just matching pairs).
 */
const FRAME_DELIMITER = /(?:\\r\\n|\\r|\\n){2}/;

/**
 * A terminally malformed event stream \u2014 unparseable JSON \`data\` or an unbounded frame.
 * A stable bad payload, not a dropped connection, so the stream never reconnects on it.
 */
export class SseParseError extends Error {}

/**
 * Consume a \`text/event-stream\` operation as typed events (capability module \u2014 wired
 * into \`createClient\`). Auto-reconnects on dropped connections, resuming from the last
 * seen event id via \`Last-Event-ID\` (backoff: the server's \`retry:\` value, then
 * \`reconnectDelay\`, then 1s \u2014 exponential with jitter, capped at 30s). A clean stream
 * end flushes a trailing frame and finishes; \`break\`/abort end the iterator cleanly.
 */
export async function* sse<T>(
  config: ClientConfig,
  op: OperationContext,
  prepare: () => Promise<{ url: string; init: SseOptions; body?: unknown }>,
  dataKind: 'json' | 'text' = 'text'
): AsyncGenerator<ServerSentEvent<T>> {
  let lastEventId: string | undefined;
  let serverRetry: number | undefined;
  let failures = 0;
  while (true) {
    // Re-prepare each attempt so a refresh-style TokenProvider yields a fresh credential
    // on reconnect (the auth is baked into \`url\` query + \`init.headers\`). \`reconnect\`,
    // \`reconnectDelay\`, and \`signal\` come from the caller's original options unchanged.
    const { url, init, body: requestBody } = await prepare();
    const { reconnect = true, reconnectDelay, ...rest } = init;
    const signal = rest.signal ?? undefined;
    if (signal?.aborted) return;
    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      ...toHeaderRecord(rest.headers),
    };
    const sendHeaders =
      lastEventId === undefined ? headers : { ...headers, 'Last-Event-ID': lastEventId };
    try {
      const { response } = await send(
        config,
        op,
        url,
        // \`timeout: 0\` opts the stream out of a config-level timeout \u2014 an event stream
        // is long-lived by design and must not be severed after N milliseconds.
        { ...rest, method: rest.method ?? 'GET', headers: sendHeaders, timeout: 0 },
        requestBody,
        undefined,
        {}
      );
      if (!response.ok) {
        const errorBody = await readError(response);
        throw new ApiError(url, response.status, response.statusText, errorBody);
      }
      failures = 0;
      const body = response.body;
      if (!body) return;
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
          let match: RegExpExecArray | null;
          while ((match = FRAME_DELIMITER.exec(buffer)) !== null) {
            const raw = buffer.slice(0, match.index);
            buffer = buffer.slice(match.index + match[0].length);
            const event = parseSseFrame(raw, dataKind);
            if (event) {
              if (event.id !== undefined) lastEventId = event.id;
              if (event.retry !== undefined) serverRetry = event.retry;
              yield event as ServerSentEvent<T>;
            }
          }
          if (done) {
            // Stream closed cleanly. Flush a final event that arrived without a trailing
            // delimiter, then finish \u2014 a clean end is not a dropped connection, so do not reconnect.
            const event = buffer.length > 0 ? parseSseFrame(buffer, dataKind) : undefined;
            if (event) {
              if (event.id !== undefined) lastEventId = event.id;
              if (event.retry !== undefined) serverRetry = event.retry;
              yield event as ServerSentEvent<T>;
            }
            return;
          }
          // Bound memory: a server that never sends a frame delimiter would otherwise
          // grow \`buffer\` without limit. 1 MiB is far above any real SSE frame.
          if (buffer.length > 1048576) {
            throw new SseParseError('SSE frame exceeded 1048576 characters without a delimiter');
          }
        }
      } finally {
        await reader.cancel().catch(() => undefined);
      }
    } catch (error) {
      if (signal?.aborted) return;
      // A non-OK HTTP response (4xx/5xx) or an unparseable JSON payload is a definitive
      // error, not a transient drop \u2014 surface it instead of reconnecting in a loop (a
      // stable bad payload would otherwise reconnect forever).
      if (error instanceof ApiError || error instanceof SseParseError) throw error;
      // A transport failure (connect/DNS/reset) when opening the request, or a mid-stream
      // read error, is a dropped connection: fall through to backoff/reconnect when enabled.
      if (!reconnect) throw error;
    }
    // Only the swallowed-drop path reaches here: reconnect is on and the signal not aborted.
    failures++;
    const base = serverRetry ?? reconnectDelay ?? 1000;
    const delay = Math.min(base * Math.pow(2, failures - 1), 30_000);
    try {
      await sleep(Math.random() * delay, signal);
    } catch {
      return; // sleep rejects only on abort \u2014 end the iterator cleanly
    }
  }
}

/** Parse one raw SSE frame (its lines) into an event; returns undefined for comment-only frames. */
export function parseSseFrame(
  raw: string,
  dataKind: 'json' | 'text'
): ServerSentEvent<unknown> | undefined {
  let event: string | undefined;
  const dataLines: string[] = [];
  let id: string | undefined;
  let retry: number | undefined;
  let sawField = false;
  for (const line of raw.split(/\\r\\n|\\n|\\r/)) {
    if (line === '' || line.startsWith(':')) continue;
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let val = colon === -1 ? '' : line.slice(colon + 1);
    if (val.startsWith(' ')) val = val.slice(1);
    sawField = true;
    if (field === 'event') event = val;
    else if (field === 'data') dataLines.push(val);
    else if (field === 'id') id = val;
    else if (field === 'retry') {
      // ASCII digits only, per the EventSource spec \u2014 anything else is ignored
      // (\`Number('')\` is 0 and would zero the reconnect backoff).
      if (/^\\d+$/.test(val)) retry = Number(val);
    }
  }
  if (!sawField) return undefined;
  const dataText = dataLines.join('\\n');
  let data: unknown = dataText;
  if (dataKind === 'json' && dataText !== '') {
    try {
      data = JSON.parse(dataText);
    } catch (error) {
      throw new SseParseError(
        \`Failed to parse SSE event data as JSON: \${error instanceof Error ? error.message : String(error)}\`
      );
    }
  }
  return { event, data, id, retry };
}
`,"create-client.ts":`import { ApiError } from './errors.js';
import { parse, readError } from './parse.js';
import { middlewareChain, send, toHeaderRecord, type SendCapabilities } from './send.js';
import type {
  ApiErrorLike,
  Client,
  ClientConfig,
  Middleware,
  OperationContext,
  OperationDescriptor,
  OpsShape,
  PaginationSpec,
  ParseAs,
  QueryValue,
  RequestOptions,
  ResponseHeaderSpec,
  SecuritySpec,
  ServerSentEvent,
  SseOptions,
  TokenProvider,
} from './types.js';
import { buildUrl, substitutePath, type QueryStyle } from './url.js';

/**
 * The optional behaviors \`createClientCore\` can dispatch to but never statically
 * imports. The package's public \`createClient\` wires the full set; the future
 * inline-mode assembler wires only the capabilities a spec needs.
 */
export type Capabilities = SendCapabilities & {
  resolveAuth?: (
    security: readonly (readonly SecuritySpec[])[],
    config: ClientConfig
  ) => Promise<{ headers: Record<string, string>; query: Record<string, string> }>;
  sse?: (
    config: ClientConfig,
    op: OperationContext,
    // Re-preparing per (re)connect (not a frozen url/init) lets a refresh-style
    // TokenProvider issue a fresh credential after a dropped stream reconnects.
    prepare: () => Promise<{ url: string; init: SseOptions }>,
    dataKind: 'json' | 'text'
  ) => AsyncGenerator<ServerSentEvent<unknown>>;
  paginate?: {
    pages: (
      call: (args?: OperationArgs, init?: RequestOptions) => Promise<unknown>,
      spec: PaginationSpec,
      args?: OperationArgs,
      init?: RequestOptions
    ) => AsyncGenerator<unknown>;
    items: (
      call: (args?: OperationArgs, init?: RequestOptions) => Promise<unknown>,
      spec: PaginationSpec,
      args?: OperationArgs,
      init?: RequestOptions
    ) => AsyncGenerator<unknown>;
    // The \`link\`-style iterators need the raw \`Link\` header + page URL, which the
    // parsed-page call above cannot carry (the shape mirrors paginate's \`LinkPageCall\`).
    pagesByLink: (
      call: (
        args?: OperationArgs,
        init?: RequestOptions
      ) => Promise<{ page: unknown; linkHeader: string | null; url: string }>,
      args?: OperationArgs,
      init?: RequestOptions
    ) => AsyncGenerator<unknown>;
    itemsByLink: (
      call: (
        args?: OperationArgs,
        init?: RequestOptions
      ) => Promise<{ page: unknown; linkHeader: string | null; url: string }>,
      spec: PaginationSpec,
      args?: OperationArgs,
      init?: RequestOptions
    ) => AsyncGenerator<unknown>;
  };
};

/**
 * One call's inputs, namespaced by transport layer. \`argsStyle: 'flat'\` clients accept the
 * merged form instead (every parameter and body property at one level) \u2014 \`namespaceArgs\`
 * converts it to this shape before anything downstream reads it.
 */
export type OperationArgs = {
  path?: Record<string, unknown>;
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
} & Record<string, unknown>;

/** The five layer keys, and the only top-level keys a namespaced call may carry. */
const LAYERS: readonly string[] = ['path', 'query', 'body', 'headers', 'cookies'];

/** Where a declared parameter's \`in\` value puts it. */
const LAYER_OF: Record<string, 'path' | 'query' | 'headers' | 'cookies'> = {
  path: 'path',
  query: 'query',
  header: 'headers',
  cookie: 'cookies',
};

/**
 * Merged (\`argsStyle: 'flat'\`) args \u2192 the namespaced shape. A key that names a declared
 * parameter goes to that parameter's layer; anything else is a property of the request
 * body, which is how a flat call spells an object body. \`body\` stays reserved for the
 * operations a flat call cannot merge (an array, a scalar, or a binary body).
 */
function namespaceArgs(op: OperationDescriptor, args: OperationArgs): OperationArgs {
  const layers: Record<string, Record<string, unknown>> = {};
  let body: unknown;
  let properties: Record<string, unknown> | undefined;
  const layerOfParam = new Map((op.params ?? []).map((param) => [param.name, param.in]));
  for (const [key, value] of Object.entries(args)) {
    const layer = LAYER_OF[layerOfParam.get(key) ?? ''];
    if (layer !== undefined) {
      (layers[layer] ??= {})[key] = value;
    } else if (key === 'body' && op.body !== undefined) {
      body = value;
    } else if (op.body !== undefined) {
      (properties ??= {})[key] = value;
    } else {
      throw new TypeError(
        \`Unknown argument "\${key}" for operation "\${op.id}": it names no declared parameter, and the operation takes no request body.\`
      );
    }
  }
  const namespaced: OperationArgs = {};
  if (layers.path) namespaced.path = layers.path;
  // The flat surface types every query value, so the collected bag is one by construction.
  if (layers.query) namespaced.query = layers.query as Record<string, QueryValue>;
  if (layers.headers) namespaced.headers = layers.headers;
  if (layers.cookies) namespaced.cookies = layers.cookies;
  if (properties !== undefined) namespaced.body = properties;
  else if (body !== undefined) namespaced.body = body;
  return namespaced;
}

/** The response reader implied by the descriptor (before any per-call \`parseAs\` override). */
/**
 * The \`Accept\` header matching how the response will be read \u2014 a blob/text operation
 * must not ask for \`application/json\` (a content-negotiating server would 406 or
 * answer with a JSON error body instead of the payload). Caller \`init.headers\` and
 * \`config.headers\` still override.
 */
function acceptFor(kind: ParseAs | 'void'): string {
  if (kind === 'text') return 'text/*';
  if (kind === 'blob' || kind === 'arrayBuffer' || kind === 'stream' || kind === 'formData') {
    return '*/*';
  }
  return 'application/json'; // json | auto | void
}

function kindFor(op: OperationDescriptor): ParseAs | 'void' {
  if (op.responseKind === 'void' || op.responseKind === 'blob' || op.responseKind === 'text') {
    return op.responseKind;
  }
  return 'auto';
}

/**
 * The call's inputs in namespaced form, converting first on a flat-style client. An
 * operation the generator marked \`argsStyle: 'grouped'\` is already namespaced \u2014 its names
 * could not be merged, so its input type never offered the flat shape.
 */
function inputOf(
  op: OperationDescriptor,
  args: OperationArgs,
  config: ClientConfig
): OperationArgs {
  const merged = config.argsStyle === 'flat' && op.argsStyle !== 'grouped';
  return merged ? namespaceArgs(op, args) : args;
}

/** Route the namespaced args to the request pieces. */
function splitArgs(op: OperationDescriptor, args: OperationArgs) {
  // An unknown layer key can only be a bug (usually flat-style args on a namespaced
  // client). TypeScript catches it, but a transpiler that skips type-checking would
  // otherwise ship a request that silently drops the value \u2014 fail the call loudly.
  for (const key of Object.keys(args)) {
    if (!LAYERS.includes(key)) {
      throw new TypeError(
        \`Unknown argument "\${key}" for operation "\${op.id}". Inputs are grouped by layer: \${LAYERS.join(', ')}.\`
      );
    }
  }
  return {
    path: args.path ?? {},
    query: args.query,
    body: args.body,
    headers: args.headers,
    cookies: args.cookies,
  };
}

/**
 * The query-serialization hints for the descriptor's query params. A spec is built only
 * when the param deviates from the OpenAPI defaults (\`form\` + \`explode: true\`, encoded),
 * and always fully resolved \u2014 so \`explode: false\` or \`allowReserved\` alone (no \`style\`)
 * are honored, and an omitted \`explode\` keeps the exploded default.
 */
function queryStyles(op: OperationDescriptor): Record<string, QueryStyle> | undefined {
  let styles: Record<string, QueryStyle> | undefined;
  for (const param of op.params ?? []) {
    if (param.in !== 'query') continue;
    const deviates =
      (param.style !== undefined && param.style !== 'form') ||
      param.explode === false ||
      param.allowReserved === true;
    if (!deviates) continue;
    styles ??= {};
    styles[param.name] = {
      style: param.style ?? 'form',
      explode: param.explode ?? true,
      allowReserved: param.allowReserved,
    };
  }
  return styles;
}

/** Stringify caller-supplied extra headers, skipping empty entries. */
function stringHeaders(headers: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers ?? {})) {
    if (value !== undefined && value !== null) out[key] = String(value);
  }
  return out;
}

/** Build the request pieces an attempt needs: the final URL and the merged per-call init. */
async function prepareRequest(
  config: ClientConfig,
  op: OperationDescriptor,
  args: OperationArgs,
  init: RequestOptions | SseOptions,
  caps: Capabilities
): Promise<{ url: string; init: RequestOptions; body: unknown }> {
  const { path, query, body, headers, cookies } = splitArgs(op, args);
  const authed: { headers: Record<string, string>; query: Record<string, string> } =
    op.security?.length && caps.resolveAuth
      ? await caps.resolveAuth(op.security, config)
      : { headers: {}, query: {} };
  // Cookie params join the auth-injected cookies in one \`Cookie\` header (values
  // percent-encoded, like auth cookies). Server-side only \u2014 browsers own the header.
  const cookiePairs = Object.entries(cookies ?? {})
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([cookieName, value]) => \`\${cookieName}=\${encodeURIComponent(String(value))}\`);
  if (cookiePairs.length > 0) {
    authed.headers.Cookie = [authed.headers.Cookie, ...cookiePairs].filter(Boolean).join('; ');
  }
  const fullQuery: Record<string, QueryValue> = { ...query, ...authed.query };
  const url = buildUrl(
    config.serverUrl ?? '',
    substitutePath(op.path, path),
    Object.keys(fullQuery).length > 0 ? fullQuery : undefined,
    queryStyles(op)
  );
  const mergedInit: RequestOptions = {
    ...init,
    method: op.method.toUpperCase(),
    // Precedence, lowest \u2192 highest (later spreads win): injected auth \u2192 explicit
    // header params \u2192 caller \`init.headers\` \u2014 the caller always overrides both.
    headers: {
      ...authed.headers,
      ...stringHeaders(headers),
      ...toHeaderRecord(init.headers),
    },
  };
  return { url, init: mergedInit, body };
}

/** Coerce a single declared response header value; omit when absent or unparsable. */
function coerceResponseHeader(
  raw: string | null,
  type: ResponseHeaderSpec['type']
): string | number | boolean | undefined {
  if (raw === null) return undefined;
  if (type === 'number') {
    if (raw.trim() === '') return undefined;
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  }
  if (type === 'boolean') {
    const value = raw.trim().toLowerCase();
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }
  return raw;
}

/** Build the camelCase declared-header bag for a throw-mode envelope. */
function readEnvelopeHeaders(
  response: Response,
  specs: readonly ResponseHeaderSpec[] | undefined
): Record<string, string | number | boolean> {
  const headers: Record<string, string | number | boolean> = {};
  for (const spec of specs ?? []) {
    const value = coerceResponseHeader(response.headers.get(spec.name), spec.type);
    if (value !== undefined) headers[spec.key] = value;
  }
  return headers;
}

/** One non-SSE call: send, then branch on the configured error mode. */
async function execute(
  config: ClientConfig,
  op: OperationDescriptor,
  args: OperationArgs,
  init: RequestOptions,
  caps: Capabilities
): Promise<unknown> {
  const prepared = await prepareRequest(config, op, args, init, caps);
  const opCtx: OperationContext = { id: op.id, path: op.path, tags: [...(op.tags ?? [])] };
  // \`parseAs\` / \`envelope\` are client options, not fetch RequestInit fields.
  const { parseAs, envelope, ...sendInit } = prepared.init;
  const readKind = parseAs ?? kindFor(op);
  const { response, context } = await send(
    config,
    opCtx,
    prepared.url,
    sendInit,
    prepared.body,
    op.body,
    caps,
    acceptFor(readKind)
  );
  if (config.errorMode === 'result') {
    if (!response.ok) {
      return { data: undefined, error: await readError(response), response };
    }
    return { data: await parse(response, readKind), error: undefined, response };
  }
  if (!response.ok) {
    let error: globalThis.Error = new ApiError(
      context.url,
      response.status,
      response.statusText,
      await readError(response)
    );
    // Thread the error through each middleware's onError in turn (each may replace it).
    for (const mw of middlewareChain(config)) {
      if (mw.onError) error = await mw.onError(error as ApiErrorLike, context);
    }
    throw error;
  }
  const data = await parse(response, readKind);
  if (envelope === true) {
    return {
      data,
      headers: readEnvelopeHeaders(response, op.responseHeaders),
      response,
    };
  }
  return data;
}

/** The paginate capability, or a descriptive throw when a paginated op is iterated unwired. */
function paginateCapability(caps: Capabilities, op: OperationDescriptor) {
  if (!caps.paginate) {
    throw new Error(\`Pagination capability not wired: cannot iterate operation "\${op.id}"\`);
  }
  return caps.paginate;
}

/**
 * The per-page call the iterators drive: the method itself in throw mode; in result
 * mode a wrapper that unwraps the \`{ data, error, response }\` envelope \u2014 the page
 * pointers are data-rooted \u2014 rethrowing a failed page as \`ApiError\` (iteration is
 * error-mode-agnostic; the throw-mode-only \`onError\` middleware hook is not invoked).
 */
function pageCall(
  method: (args?: OperationArgs, init?: RequestOptions) => Promise<unknown>,
  config: ClientConfig
) {
  const callWithoutEnvelope = (args?: OperationArgs, init?: RequestOptions) => {
    if (!init || init.envelope === undefined) return method(args, init);
    const { envelope: _envelope, ...pageInit } = init;
    return method(args, pageInit);
  };
  if (config.errorMode !== 'result') return callWithoutEnvelope;
  return async (args?: OperationArgs, init?: RequestOptions) => {
    const envelope = (await callWithoutEnvelope(args, init)) as {
      data: unknown;
      error: unknown;
      response: Response;
    };
    // Failure is \`!response.ok\` \u2014 NOT \`data === undefined\`: a successful bodyless page
    // (204/void) also parses to undefined data, and a failed page's \`error\` can be
    // undefined too (unreadable body). The pointers then miss on the undefined data
    // and iteration stops cleanly, which is the correct semantics for an empty page.
    if (!envelope.response.ok) {
      const { response } = envelope;
      throw new ApiError(response.url, response.status, response.statusText, envelope.error);
    }
    return envelope.data;
  };
}

/**
 * The per-page call the \`link\`-style iterators drive: like \`execute\`, but returning the
 * parsed page together with the raw \`Link\` header and the page's own URL (for resolving
 * a relative \`rel="next"\` target). Error-mode-agnostic like all iteration: a failed
 * page throws \`ApiError\` even on result-mode clients.
 */
function linkPageCall(config: ClientConfig, op: OperationDescriptor, caps: Capabilities) {
  return async (args: OperationArgs = {}, init: RequestOptions = {}) => {
    const prepared = await prepareRequest(config, op, args, init, caps);
    const { parseAs, envelope: _envelope, ...sendInit } = prepared.init;
    const readKind = parseAs ?? kindFor(op);
    const opCtx: OperationContext = { id: op.id, path: op.path, tags: [...(op.tags ?? [])] };
    const { response } = await send(
      config,
      opCtx,
      prepared.url,
      sendInit,
      prepared.body,
      op.body,
      caps,
      acceptFor(readKind)
    );
    if (!response.ok) {
      throw new ApiError(
        prepared.url,
        response.status,
        response.statusText,
        await readError(response)
      );
    }
    return {
      page: await parse(response, readKind),
      linkHeader: response.headers.get('link'),
      // Some \`Response\` implementations leave \`url\` empty (mocks, constructed responses).
      url: response.url === '' ? prepared.url : response.url,
    };
  };
}

/**
 * Build a typed instance client over operation descriptors: one real bound method per
 * operation (attached by a construction-time loop \u2014 no Proxy), plus the core members
 * (\`configure\`/\`use\`/\`auth\`), which are assigned AFTER the loop so they win any name
 * collision with an operation. All behavior dispatches through the capability seam.
 */
export function createClientCore<
  Ops extends OpsShape,
  Id extends string = string,
  Path extends string = string,
  Tag extends string = string,
>(
  operations: Record<string, OperationDescriptor>,
  initial: ClientConfig<OperationContext<Id, Path, Tag>> = {},
  caps: Capabilities = {}
): Client<Ops, OperationContext<Id, Path, Tag>> {
  // The literal-union narrowing is a compile-time DX contract only; internally the
  // runtime works with the base (string-typed) context. One cast at this boundary \u2014
  // \`ClientConfig<Narrow>\` is not assignable to \`ClientConfig\` (middleware ctx
  // params are contravariant).
  const given = initial as ClientConfig;
  // Private mutable config; the middleware array is copied so \`use()\` never mutates the caller's.
  const config: ClientConfig = { ...given, middleware: [...(given.middleware ?? [])] };
  const client = {} as Record<string, unknown>;

  for (const [name, op] of Object.entries(operations)) {
    if (op.responseKind === 'sse') {
      const method = (given: OperationArgs = {}, init: SseOptions = {}) => {
        const args = inputOf(op, given, config);
        if (!caps.sse) {
          throw new Error(\`SSE capability not wired: cannot stream operation "\${op.id}"\`);
        }
        const stream = caps.sse;
        return (async function* () {
          const opCtx: OperationContext = { id: op.id, path: op.path, tags: [...(op.tags ?? [])] };
          // A thunk the stream re-runs on every (re)connect, so auth (which \`prepareRequest\`
          // resolves) is refreshed per attempt rather than frozen at the first connect.
          const prepare = async () => {
            const prepared = await prepareRequest(config, op, args, init, caps);
            return { url: prepared.url, init: prepared.init as SseOptions, body: prepared.body };
          };
          yield* stream(config, opCtx, prepare, op.sseDataKind ?? 'text');
        })();
      };
      // Consumers key off the function reference (cache keys, \`OPERATIONS[fn.name]\`), so
      // each closure carries its operationId instead of an inferred binding name.
      // \`operationId\` is the explicit, minification-proof form of the same identity
      // (the SPEC operationId \u2014 \`name\` is the emitted key, which a collision may rename).
      Object.defineProperty(method, 'name', { value: name });
      Object.defineProperty(method, 'operationId', { value: op.id });
      client[name] = method;
    } else {
      // \`raw\` takes namespaced args; \`method\` is the public entry that accepts whichever
      // style the client was generated with. The iterators namespace once and then drive
      // \`raw\`, so a flat call is never converted twice.
      const raw = (args: OperationArgs = {}, init: RequestOptions = {}) =>
        execute(config, op, args, init, caps);
      const method = (args: OperationArgs = {}, init: RequestOptions = {}) =>
        raw(inputOf(op, args, config), init);
      Object.defineProperty(method, 'name', { value: name });
      Object.defineProperty(method, 'operationId', { value: op.id });
      const spec = op.pagination;
      // Paginated ops keep their one-shot call and gain \`.pages\`/\`.items\`, dispatching
      // through the capability seam (like SSE: absent capability throws descriptively).
      // Iteration is error-mode-agnostic: the iterators' pointers are data-rooted, so on
      // a result-mode client (\`errorMode\` is fixed at construction \u2014 \`configure()\`
      // ignores it) each page's envelope is unwrapped before it reaches the capability.
      // A failed page aborts iteration by throwing ApiError, even on result-mode
      // clients; the \`onError\` middleware hook (throw-mode-only) is not invoked.
      client[name] =
        spec === undefined
          ? method
          : spec.style === 'link'
            ? Object.assign(method, {
                pages: (args?: OperationArgs, init?: RequestOptions) =>
                  paginateCapability(caps, op).pagesByLink(
                    linkPageCall(config, op, caps),
                    inputOf(op, args ?? {}, config),
                    init
                  ),
                items: (args?: OperationArgs, init?: RequestOptions) =>
                  paginateCapability(caps, op).itemsByLink(
                    linkPageCall(config, op, caps),
                    spec,
                    inputOf(op, args ?? {}, config),
                    init
                  ),
              })
            : Object.assign(method, {
                pages: (args?: OperationArgs, init?: RequestOptions) =>
                  paginateCapability(caps, op).pages(
                    pageCall(raw, config),
                    spec,
                    inputOf(op, args ?? {}, config),
                    init
                  ),
                items: (args?: OperationArgs, init?: RequestOptions) =>
                  paginateCapability(caps, op).items(
                    pageCall(raw, config),
                    spec,
                    inputOf(op, args ?? {}, config),
                    init
                  ),
              });
    }
  }

  // Core members are assigned AFTER the operation loop \u2014 they win over colliding op names.
  client.configure = (next: ClientConfig): void => {
    // \`errorMode\` and \`argsStyle\` are fixed at generate time (they shape the static types);
    // flipping either at runtime would silently desync the calls from \`Client<Ops>\`, so both
    // are ignored here.
    const { errorMode: _fixedMode, argsStyle: _fixedStyle, auth, ...rest } = next;
    Object.assign(config, rest);
    // \`auth\` merges into existing credentials (like the \`auth.*\` setters) rather than
    // replacing wholesale \u2014 so \`configure({ auth: { bearer } })\` keeps a previously set
    // basic/apiKey. \`apiKey\` merges per scheme.
    if (auth) {
      config.auth = {
        ...config.auth,
        ...auth,
        ...(auth.apiKey ? { apiKey: { ...config.auth?.apiKey, ...auth.apiKey } } : {}),
      };
    }
  };
  client.use = (...middleware: Middleware[]): void => {
    // Reassign (don't push) so a caller-provided \`middleware\` array isn't mutated.
    config.middleware = [...(config.middleware ?? []), ...middleware];
  };
  client.auth = {
    bearer(token: TokenProvider): void {
      config.auth = { ...config.auth, bearer: token };
    },
    basic(username: string, password: string): void {
      config.auth = { ...config.auth, basic: { username, password } };
    },
    apiKey(scheme: string, value: TokenProvider): void {
      config.auth = { ...config.auth, apiKey: { ...config.auth?.apiKey, [scheme]: value } };
    },
  };

  return client as Client<Ops, OperationContext<Id, Path, Tag>>;
}
`,"paginate.ts":`import type { OperationArgs } from './create-client.js';
import type { PaginationSpec, QueryValue, RequestOptions } from './types.js';

/**
 * Auto-pagination (capability module \u2014 wired into \`createClient\`, dispatched by the
 * method's \`.pages()\`/\`.items()\`): walk an operation's pages by advancing the descriptor's
 * \`param\` query parameter, per its \`style\`. The caller's args are never mutated \u2014 each
 * request gets a fresh \`query\` clone \u2014 and \`init\` is forwarded to every call.
 *
 * Iteration is error-mode-agnostic: \`call\` always resolves to the RAW page (on a
 * result-mode client the attachment unwraps the envelope first), so a failed page
 * aborts iteration by throwing \`ApiError\`, even on result-mode clients; the \`onError\`
 * middleware hook (throw-mode-only) is not invoked.
 */

/**
 * Resolve an RFC 6901 JSON pointer (\`~1\` \u2192 \`/\`, \`~0\` \u2192 \`~\`) against a value.
 * The empty pointer is the whole document; anything else must start with \`/\`.
 * Returns \`undefined\` on any miss (bad token, absent key, non-object step) \u2014 never throws.
 */
export function resolvePointer(value: unknown, pointer: string): unknown {
  if (pointer === '') return value;
  if (!pointer.startsWith('/')) return undefined;
  let current = value;
  for (const token of pointer.slice(1).split('/')) {
    const key = token.replaceAll('~1', '/').replaceAll('~0', '~');
    if (Array.isArray(current)) {
      if (!/^(0|[1-9]\\d*)$/.test(key)) return undefined;
      current = current[Number(key)];
    } else if (Object(current) === current && key in (current as object)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Iterate an operation's full page results. Every page is yielded before the stop
 * condition is evaluated, so the last page always arrives. Cursor style resumes from a
 * caller-provided \`query[spec.param]\`, stops when the optional \`hasMore\` pointer
 * resolves to \`false\` or when \`nextCursor\` resolves to \`undefined\`/\`null\`/\`''\`, and
 * throws if the next cursor is not a string or number, or
 * if the same cursor comes back twice in a row (infinite-loop guards). Offset/page
 * styles advance by item count / by one and stop when
 * the \`items\` pointer misses or the array is empty.
 */
export async function* pages<TPage>(
  call: (args?: OperationArgs, init?: RequestOptions) => Promise<TPage>,
  spec: PaginationSpec,
  args: OperationArgs = {},
  init?: RequestOptions
): AsyncGenerator<TPage> {
  if (spec.style === 'cursor') {
    let cursor: unknown = args.query?.[spec.param];
    while (true) {
      const query = { ...args.query };
      if (cursor !== undefined) query[spec.param] = cursor as QueryValue;
      const page = await call({ ...args, query }, init);
      yield page;
      // Connection-style APIs keep a non-null cursor on the last page and signal the
      // end via a boolean flag \u2014 honor it before the cursor check to skip the
      // follow-up empty request. Strictly \`false\`: a missing pointer falls through.
      if (spec.hasMore !== undefined && resolvePointer(page, spec.hasMore) === false) return;
      const next = resolvePointer(page, spec.nextCursor);
      if (next === undefined || next === null || next === '') return;
      if (typeof next !== 'string' && typeof next !== 'number') {
        // A fresh non-scalar cursor never compares equal, so without this guard a lying
        // server would slip past the did-not-advance check into an infinite loop.
        throw new Error(\`Pagination cursor at \${spec.nextCursor} is not a string or number\`);
      }
      if (next === cursor) {
        throw new Error('Pagination did not advance: operation returned the same cursor twice');
      }
      cursor = next;
    }
  } else if (spec.style === 'link') {
    // \`link\` iteration needs the response's \`Link\` header, which the parsed-page \`call\`
    // cannot carry \u2014 the client wires those operations to \`pagesByLink\` instead.
    throw new Error('link-style pagination iterates via pagesByLink');
  } else {
    // Coerce the starting position to a number: a caller may pass \`query[spec.param]\` as a
    // string (common from URL/form input), and \`+=\` on a string would concatenate. \`null\`
    // and \`''\` count as absent \u2014 \`Number\` would turn them into 0, but a one-shot call
    // omits the param for those values, so the iterator must not start at position 0.
    const start = args.query?.[spec.param];
    const fallback = spec.style === 'page' ? 1 : 0;
    const absent = start === undefined || start === null || start === '';
    let position = absent || Number.isNaN(Number(start)) ? fallback : Number(start);
    let previousItems: string | undefined;
    while (true) {
      const page = await call({ ...args, query: { ...args.query, [spec.param]: position } }, init);
      const pageItems = resolvePointer(page, spec.items);
      // Some APIs clamp a past-the-end offset/page to the last non-empty page instead
      // of returning an empty one \u2014 the repeated page would otherwise loop forever
      // (the position always "advances", so a cursor-style token check can't catch it).
      const serialized = Array.isArray(pageItems) ? JSON.stringify(pageItems) : undefined;
      if (serialized !== undefined && serialized === previousItems) {
        throw new Error('Pagination did not advance: the operation returned the same page twice');
      }
      yield page;
      if (!Array.isArray(pageItems) || pageItems.length === 0) return;
      previousItems = serialized;
      position += spec.style === 'page' ? 1 : pageItems.length;
    }
  }
}

/**
 * Iterate the operation's individual items: each page's \`items\` pointer, flattened.
 * A cursor-style page whose pointer misses yields nothing but pagination continues;
 * for offset/page styles a miss has already stopped \`pages\`.
 */
export async function* items<TItem>(
  call: (args?: OperationArgs, init?: RequestOptions) => Promise<unknown>,
  spec: PaginationSpec,
  args?: OperationArgs,
  init?: RequestOptions
): AsyncGenerator<TItem> {
  for await (const page of pages(call, spec, args, init)) {
    const pageItems = resolvePointer(page, spec.items);
    if (Array.isArray(pageItems)) yield* pageItems as TItem[];
  }
}

/**
 * The per-page call the \`link\`-style iterators drive: the parsed page plus the raw
 * \`Link\` header and the page's own URL (for resolving a relative \`next\` target).
 */
export type LinkPageCall = (
  args?: OperationArgs,
  init?: RequestOptions
) => Promise<{ page: unknown; linkHeader: string | null; url: string }>;

/** The \`rel="next"\` target of an RFC 8288 \`Link\` header, or \`undefined\` when absent. */
export function linkNext(header: string | null): string | undefined {
  if (header === null) return undefined;
  // Entries are \`<url>; rel="next"\`, comma-separated; the URL is inside \`<>\`, so split
  // on commas that precede a \`<\` and a comma inside a target cannot break an entry.
  for (const entry of header.split(/,\\s*(?=<)/)) {
    const target = /^\\s*<([^>]*)>(.*)$/.exec(entry);
    if (!target) continue;
    const rel = /;\\s*rel\\s*=\\s*"?([^";]+)"?/i.exec(target[2]);
    // \`rel\` may carry several space-separated relation types (RFC 8288 \xA73.3).
    if (rel && rel[1].split(/\\s+/).includes('next')) return target[1];
  }
  return undefined;
}

/**
 * Iterate a \`link\`-style operation's pages: follow the \`Link\` header's \`rel="next"\`
 * target by merging ITS query params into the next call \u2014 every page goes through the
 * same declared endpoint, so auth, middleware, and \`serverUrl\` handling apply
 * unchanged, and credentials can never be handed to a cross-origin \`next\` URL.
 * Stops when no \`rel="next"\` is present; throws when the link does not advance
 * (the same target twice, or a self-link \u2014 an infinite-loop guard).
 */
export async function* pagesByLink<TPage>(
  call: LinkPageCall,
  args: OperationArgs = {},
  init?: RequestOptions
): AsyncGenerator<TPage> {
  let query = args.query;
  let previous: string | undefined;
  while (true) {
    const { page, linkHeader, url } = await call({ ...args, query }, init);
    yield page as TPage;
    const target = linkNext(linkHeader);
    if (target === undefined) return;
    // A relative target resolves against the page's own URL (RFC 8288 \xA73.1) \u2014 which may
    // itself be relative (relative \`serverUrl\`, mocked fetch), so both resolve against a
    // placeholder origin. It never reaches the wire: only the target's query params
    // carry into the next call.
    const pageUrl = new URL(url, 'http://relative.invalid');
    const next = new URL(target, pageUrl).toString();
    if (next === previous || next === pageUrl.toString()) {
      throw new Error('Pagination did not advance: the Link rel="next" target repeats');
    }
    previous = next;
    // A repeated key (\`?tag=a&tag=b\`) folds into an array \u2014 the query serializer
    // expands arrays back into repeated pairs.
    const linkParams: Record<string, string | string[]> = {};
    for (const [key, value] of new URL(next).searchParams) {
      const seen = linkParams[key];
      if (seen === undefined) linkParams[key] = value;
      else if (Array.isArray(seen)) seen.push(value);
      else linkParams[key] = [seen, value];
    }
    query = { ...args.query, ...linkParams };
  }
}

/** Iterate a \`link\`-style operation's individual items: each page's \`items\` pointer, flattened. */
export async function* itemsByLink<TItem>(
  call: LinkPageCall,
  spec: PaginationSpec,
  args?: OperationArgs,
  init?: RequestOptions
): AsyncGenerator<TItem> {
  for await (const page of pagesByLink(call, args, init)) {
    const pageItems = resolvePointer(page, spec.items);
    if (Array.isArray(pageItems)) yield* pageItems as TItem[];
  }
}
`,"cli.ts":`// The generated-CLI engine: a pure argv parser plus a dispatcher that drives the
// instance client and maps outcomes to the documented exit-code contract
// (0 success, 1 API error, 2 auth, 3 validation, 4 usage). Node-only by nature,
// but every effect (env, stdin, files, output) is injected through the wiring so
// the module itself stays dependency-free and fully unit-testable; the emitted
// entry fills the defaults with real \`node:fs\`/\`process\` bindings.

/** One flag derived from a query parameter. */
export type CliFlag = {
  /** Kebab-cased flag name (\`--page-size\`). */
  name: string;
  /** Original wire parameter name. */
  param: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  enum?: string[];
  description?: string;
};

/** One executable command, derived from the IR at generate time. Pure data. */
export type CliCommand = {
  /** Tag; absent = flat/untagged. */
  group?: string;
  name: string;
  summary?: string;
  method: string;
  path: string;
  /** Path params, in path-template order. Always required \u2014 that is what a path is. */
  positionals: Array<{
    name: string;
    type?: CliFlag['type'];
    description?: string;
  }>;
  flags: CliFlag[];
  /**
   * Present when the operation takes a JSON request body. \`merged\` marks a body whose own
   * properties a flat-style call spells at the top level (the generator decides this from
   * the schema, so the CLI and the client can never disagree).
   */
  body?: { required: boolean; merged?: boolean };
  /**
   * The content type of a request body that is NOT JSON (multipart, url-encoded, binary).
   * \`--json\` cannot build one, so the command is reported as library-only rather than
   * offered as if it were runnable.
   */
  unsupportedBody?: string;
  paginated?: boolean;
  /** \`'grouped'\` marks a command whose client method takes namespaced inputs even on a
   * flat-style client, because its merged names would collide. */
  argsStyle?: 'grouped';
  sse?: boolean;
  blob?: boolean;
  /** IR schemas for the \`schema\` command, serialized verbatim. */
  schemas?: { request?: unknown; response?: unknown };
};

export type CliAuthScheme = { key: string; kind: 'bearer' | 'basic' | 'apiKey' };

export type CliWiring = {
  /** The name the CLI is invoked as, for help output only. The generated entry reads it
   * from \`process.argv[1]\`, so help never names a command that is not installed. */
  name: string;
  /** Credential variable prefix, constant-cased: \`CAFE\` gives \`CAFE_TOKEN\`. Fixed at
   * generation from the output file name, so renaming the binary keeps the variables
   * a published CLI already documents. A composed entry sets one per api alias. */
  envPrefix: string;
  /** The generated instance client. */
  client: Record<string, unknown>;
  /** How that client takes its inputs. Defaults to \`'grouped'\`, the generated default. */
  argsStyle?: 'grouped' | 'flat';
  configure: (config: Record<string, unknown>) => void;
  /** Security schemes of the API \u2014 drives env-var credential resolution. */
  schemes?: CliAuthScheme[];
  env?: Record<string, string | undefined>;
  stdin?: () => string;
  readFile?: (path: string) => string;
  writeFile?: (path: string, data: Uint8Array) => void;
  stdout: (line: string) => void;
  stderr: (line: string) => void;
};

export type CliGlobals = {
  serverUrl?: string;
  format?: 'json' | 'ndjson';
  dryRun?: boolean;
  pageAll?: boolean;
  output?: string;
  token?: string;
  json?: string;
};

export type CliInvocation =
  | { kind: 'help'; topic?: CliCommand | string }
  | { kind: 'schema'; command: CliCommand }
  | {
      kind: 'run';
      command: CliCommand;
      positionals: Record<string, string>;
      params: Record<string, unknown>;
      globals: CliGlobals;
    }
  | { kind: 'usage-error'; message: string };

/**
 * A hand-written command composed NEXT TO the generated ones: the same data shape plus a
 * \`handler\`, so it inherits help, parsing, \`schema\`, and the exit-code contract. This is
 * how behavior that is not in the description (a \`login\`, a doctor command) joins the
 * binary without the generator ever learning what it does.
 */
export type CustomCommand = {
  name: string;
  group?: string;
  summary?: string;
  positionals?: CliCommand['positionals'];
  flags?: CliFlag[];
  /** Returns the process exit code; throwing exits 1 with the standard error JSON. */
  handler: (context: CommandContext) => number | Promise<number>;
};

export type CommandContext = {
  positionals: Record<string, string>;
  params: Record<string, unknown>;
  globals: CliGlobals;
  wiring: CliWiring;
};

/** One API's contribution to a composed binary: its commands behind a namespace, with its
 * OWN wiring (base URL, schemes, credentials). A namespace-less source sits at the root. */
export type CommandSource = {
  namespace?: string;
  commands: Array<CliCommand | CustomCommand>;
  /** Absent = inherit the first wired source's \u2014 a root \`login\` shares the binary's identity. */
  wiring?: CliWiring;
};

type ResolvedCommand = CliCommand & { handler?: CustomCommand['handler'] };

/** Custom commands as the command shape the parser reads; generated ones pass through. */
function normalizeCommands(commands: Array<CliCommand | CustomCommand>): ResolvedCommand[] {
  return commands.map((command) =>
    'handler' in command
      ? { method: '', path: '', positionals: [], flags: [], ...command }
      : command
  );
}

/**
 * The name of a custom command that shadows another command. Rejected at startup: an
 * operator typing an operationId must never silently run something else.
 */
function shadowedCommandName(commands: ResolvedCommand[]): string | undefined {
  const seen = new Map<string, ResolvedCommand[]>();
  for (const command of commands) {
    const key = \`\${command.group ?? ''}\\u0000\${command.name}\`;
    seen.set(key, [...(seen.get(key) ?? []), command]);
  }
  for (const clashing of seen.values()) {
    if (clashing.length > 1 && clashing.some((command) => command.handler !== undefined)) {
      return clashing[0].name;
    }
  }
  return undefined;
}

const GLOBAL_FLAGS: Record<string, { key: keyof CliGlobals; boolean?: boolean }> = {
  'server-url': { key: 'serverUrl' },
  format: { key: 'format' },
  'dry-run': { key: 'dryRun', boolean: true },
  'page-all': { key: 'pageAll', boolean: true },
  output: { key: 'output' },
  token: { key: 'token' },
  json: { key: 'json' },
};

/**
 * The name to print in help: the command the CLI was invoked as. A global install resolves
 * \`argv[1]\` to the bin itself, so its basename is exactly what the user typed. A Windows
 * \`.cmd\` shim, a \`node dist/cafe.cli.js\`, and a \`tsx client.cli.ts\` run all pass the script
 * path instead \u2014 printing that would name a command nobody can type, so a script extension
 * and the \`.cli\` marker come off: \`cafe.cli.js\` prints \`cafe\`.
 */
export function invokedName(scriptPath: string | undefined, fallback: string): string {
  if (scriptPath === undefined) return fallback;
  const base = scriptPath.replace(/^.*[\\\\/]/, '');
  const withoutExtension = base.replace(/\\.(mjs|cjs|js|mts|cts|ts|cmd|bat|ps1|exe)$/i, '');
  const name = withoutExtension.replace(/\\.cli$/i, '');
  return name === '' ? fallback : name;
}

/**
 * The shell-typable form of a group name: an OpenAPI tag can contain spaces ("Some
 * multi-word tag"), which only resolves if the user quotes it. Commands are addressed by
 * this slug; help still shows the original tag.
 */
export function groupSlug(group: string): string {
  return group
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-');
}

/** A description on ONE line: newlines in an OpenAPI description wreck help alignment. */
function oneLine(text: string): string {
  return text.replace(/\\s+/g, ' ').trim();
}

/**
 * The parsed argv as one call input, in the style the wired client takes: grouped by layer
 * (the default) or merged into one object.
 */
function callInputs(
  command: CliCommand,
  positionals: Record<string, string>,
  params: Record<string, unknown>,
  body: unknown,
  argsStyle: CliWiring['argsStyle']
): Record<string, unknown> | undefined {
  const inputs: Record<string, unknown> = {};
  // A command the generator marked \`grouped\` keeps the namespaced shape even here.
  if (argsStyle === 'flat' && command.argsStyle !== 'grouped') {
    Object.assign(inputs, positionals, params);
    if (body !== undefined) {
      if (command.body?.merged === true) Object.assign(inputs, body as Record<string, unknown>);
      else inputs.body = body;
    }
  } else {
    if (Object.keys(positionals).length > 0) inputs.path = positionals;
    if (Object.keys(params).length > 0) inputs.query = params;
    if (body !== undefined) inputs.body = body;
  }
  return Object.keys(inputs).length > 0 ? inputs : undefined;
}

/** Resolve argv against the command table. Pure \u2014 no I/O, no env. */
export function parseInvocation(commands: CliCommand[], argv: string[]): CliInvocation {
  if (argv.length === 0 || argv[0] === '--help') return { kind: 'help' };

  if (argv[0] === 'schema') {
    const command = commands.find((candidate) => candidate.name === argv[1]);
    return command
      ? { kind: 'schema', command }
      : { kind: 'usage-error', message: \`Unknown command: schema \${argv[1] ?? ''}\`.trim() };
  }

  const slugs = new Set(commands.filter((c) => c.group).map((c) => groupSlug(c.group as string)));
  // An untagged operation is only ever addressed by its bare name, so when that name is also
  // a group slug the name wins \u2014 reading it as the group would leave the command unreachable.
  // A tagged operation in the same position keeps yielding to group help: it is still
  // reachable as \`<its group> <name>\`.
  const untagged = commands.some((c) => c.group === undefined && c.name === argv[0]);
  let command: CliCommand | undefined;
  let rest: string[];
  if (!untagged && slugs.has(argv[0])) {
    if (argv[1] === '--help' || argv[1] === undefined) return { kind: 'help', topic: argv[0] };
    command = commands.find((c) => c.group && groupSlug(c.group) === argv[0] && c.name === argv[1]);
    if (!command) return { kind: 'usage-error', message: \`Unknown command: \${argv[0]} \${argv[1]}\` };
    rest = argv.slice(2);
  } else {
    // An ungrouped command, or a bare operationId \u2014 knowing the group shouldn't be
    // required when the name alone is unambiguous.
    const named = commands.filter((c) => c.name === argv[0]);
    command =
      named.find((c) => c.group === undefined) ?? (named.length === 1 ? named[0] : undefined);
    if (!command) {
      const ambiguous = named.length > 1;
      return {
        kind: 'usage-error',
        message: ambiguous
          ? \`Ambiguous command: \${argv[0]} \u2014 prefix it with its group (\${named
              .map((c) => groupSlug(c.group as string))
              .join(', ')})\`
          : \`Unknown command: \${argv[0]}\`,
      };
    }
    rest = argv.slice(1);
  }
  if (rest.includes('--help')) return { kind: 'help', topic: command };

  const positionals: Record<string, string> = {};
  const params: Record<string, unknown> = {};
  const globals: CliGlobals = {};
  let positionalIndex = 0;
  for (let index = 0; index < rest.length; index++) {
    const token = rest[index];
    if (!token.startsWith('--')) {
      const slot = command.positionals[positionalIndex++];
      if (!slot) return { kind: 'usage-error', message: \`Unexpected argument: \${token}\` };
      positionals[slot.name] = token;
      continue;
    }
    const equals = token.indexOf('=');
    const flagName = equals === -1 ? token.slice(2) : token.slice(2, equals);
    const inlineValue = equals === -1 ? undefined : token.slice(equals + 1);
    const takeValue = (): string | undefined =>
      inlineValue !== undefined ? inlineValue : rest[++index];

    const global = GLOBAL_FLAGS[flagName];
    if (global) {
      if (global.boolean) {
        (globals[global.key] as boolean) = true;
        continue;
      }
      const value = takeValue();
      if (value === undefined) {
        return { kind: 'usage-error', message: \`Flag --\${flagName} expects a value\` };
      }
      if (global.key === 'format' && value !== 'json' && value !== 'ndjson') {
        return { kind: 'usage-error', message: \`--format must be one of: json, ndjson\` };
      }
      (globals[global.key] as string) = value;
      continue;
    }

    const flag = command.flags.find((candidate) => candidate.name === flagName);
    if (!flag) return { kind: 'usage-error', message: \`Unknown flag: --\${flagName}\` };
    if (flag.type === 'boolean') {
      params[flag.param] = true;
      continue;
    }
    const value = takeValue();
    if (value === undefined) {
      return { kind: 'usage-error', message: \`Flag --\${flagName} expects a value\` };
    }
    if (flag.enum && !flag.enum.includes(value)) {
      return {
        kind: 'usage-error',
        message: \`--\${flagName} must be one of: \${flag.enum.join(', ')}\`,
      };
    }
    if (flag.type === 'number') {
      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        return { kind: 'usage-error', message: \`--\${flagName} expects a number, got "\${value}"\` };
      }
      params[flag.param] = numeric;
    } else if (flag.type === 'array') {
      const existing = params[flag.param];
      params[flag.param] = Array.isArray(existing) ? [...existing, value] : [value];
    } else {
      params[flag.param] = value;
    }
  }

  for (const slot of command.positionals) {
    if (!(slot.name in positionals)) {
      return { kind: 'usage-error', message: \`Missing required argument: <\${slot.name}>\` };
    }
  }
  for (const flag of command.flags) {
    if (flag.required && !(flag.param in params)) {
      return { kind: 'usage-error', message: \`Missing required flag: --\${flag.name}\` };
    }
  }
  if (globals.json !== undefined && !command.body) {
    return { kind: 'usage-error', message: \`\${command.name} does not accept a request body\` };
  }
  if (command.body?.required && globals.json === undefined) {
    return {
      kind: 'usage-error',
      message: \`\${command.name} requires a request body: pass --json '<json>', --json @file.json, or --json @-\`,
    };
  }
  if (globals.pageAll && !command.paginated) {
    return {
      kind: 'usage-error',
      message: \`\${command.name} is not paginated; --page-all only applies to paginated operations\`,
    };
  }
  return { kind: 'run', command, positionals, params, globals };
}

/** \`cafe-api\` \u2192 \`CAFE_API\`: the casing of every credential variable this CLI reads. */
export function constantCase(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase();
}

function resolveAuth(wiring: CliWiring, token: string | undefined): Record<string, unknown> {
  const env = wiring.env ?? {};
  const prefix = wiring.envPrefix;
  const auth: Record<string, unknown> = {};
  for (const scheme of wiring.schemes ?? []) {
    if (scheme.kind === 'bearer') {
      const value = token ?? env[\`\${prefix}_TOKEN\`];
      if (value !== undefined) auth.bearer = value;
    } else if (scheme.kind === 'basic') {
      const username = env[\`\${prefix}_USERNAME\`];
      const password = env[\`\${prefix}_PASSWORD\`];
      if (username !== undefined && password !== undefined) auth.basic = { username, password };
    } else {
      const value = env[\`\${prefix}_API_KEY_\${constantCase(scheme.key)}\`];
      if (value !== undefined) {
        auth.apiKey = {
          ...(auth.apiKey as Record<string, string> | undefined),
          [scheme.key]: value,
        };
      }
    }
  }
  return auth;
}

/**
 * One command's complete contract as plain data \u2014 what \`schema <command>\` prints. It has
 * to carry the parameters: 'GET' operations have no body, so without them the output says
 * nothing a caller could act on, and the only alternative is scraping \`--help\`, which is
 * prose written for humans.
 */
function commandContract(command: CliCommand): Record<string, unknown> {
  return {
    operationId: command.name,
    ...(command.group === undefined ? {} : { group: groupSlug(command.group) }),
    ...(command.summary === undefined ? {} : { summary: oneLine(command.summary) }),
    ...(command.method === '' ? {} : { method: command.method }),
    ...(command.path === '' ? {} : { path: command.path }),
    parameters: {
      path: command.positionals.map((positional) => ({
        name: positional.name,
        type: positional.type ?? 'string',
        required: true,
        ...(positional.description === undefined
          ? {}
          : { description: oneLine(positional.description) }),
      })),
      // \`name\` is what you type (\`--max-total\`); \`param\` is the wire name it becomes.
      query: command.flags.map((flag) => ({
        name: flag.name,
        param: flag.param,
        type: flag.type,
        required: flag.required,
        ...(flag.enum === undefined ? {} : { enum: flag.enum }),
        ...(flag.description === undefined ? {} : { description: oneLine(flag.description) }),
      })),
    },
    ...(command.body === undefined ? {} : { body: command.body }),
    ...(command.unsupportedBody === undefined ? {} : { unsupportedBody: command.unsupportedBody }),
    ...(command.paginated === true ? { paginated: true } : {}),
    ...(command.sse === true ? { sse: true } : {}),
    ...(command.blob === true ? { blob: true } : {}),
    ...(command.schemas ?? {}),
  };
}

function renderHelp(
  commands: CliCommand[],
  name: string,
  schemes: CliAuthScheme[],
  prefix: string,
  topic?: CliCommand | string
): string[] {
  if (topic !== undefined && typeof topic !== 'string') {
    const command = topic;
    const usage = [
      name,
      ...(command.group ? [groupSlug(command.group)] : []),
      command.name,
      ...command.positionals.map((slot) => \`<\${slot.name}>\`),
      ...(command.flags.length > 0 ? ['[flags]'] : []),
      ...(command.body ? ["--json '<json>' | @file | @-"] : []),
    ].join(' ');
    const lines = [\`Usage: \${usage}\`];
    if (command.summary) lines.push('', command.summary);
    if (command.unsupportedBody !== undefined) {
      lines.push(
        '',
        \`This operation takes a \${command.unsupportedBody} body, which the CLI cannot build \u2014 call it through the generated client instead.\`
      );
    }
    if (command.flags.length > 0) {
      lines.push('', 'Flags:');
      for (const flag of command.flags) {
        const choices = flag.enum ? \` (one of: \${flag.enum.join(', ')})\` : '';
        const required = flag.required ? ' [required]' : '';
        lines.push(
          \`  --\${flag.name} <\${flag.type}>\${choices}\${required}  \${oneLine(flag.description ?? '')}\`.trimEnd()
        );
      }
    }
    return lines;
  }
  const scope =
    typeof topic === 'string'
      ? commands.filter((c) => c.group && groupSlug(c.group) === topic)
      : commands;
  const lines =
    typeof topic === 'string'
      ? [\`Usage: \${name} \${topic} <command> \u2026\`, '', 'Commands:']
      : [\`Usage: \${name} [group] <command> \u2026\`, '', 'Commands:'];
  const seenGroups = new Set<string>();
  const grouped = commands.some((c) => c.group);
  for (const command of scope) {
    if (typeof topic !== 'string' && command.group) {
      const slug = groupSlug(command.group);
      if (seenGroups.has(slug)) continue;
      seenGroups.add(slug);
      // The slug is what you type; the tag is what you recognize.
      const title = slug === command.group ? '' : \`  (\${command.group})\`;
      lines.push(\`  \${slug} <command>\${title}\`);
      continue;
    }
    lines.push(
      \`  \${[command.group === undefined ? undefined : groupSlug(command.group), command.name]
        .filter(Boolean)
        .join(' ')}  \${oneLine(command.summary ?? '')}\`.trimEnd()
    );
  }
  // Flags that apply to every command, and the env vars credentials come from: a flag
  // absent from --help may as well not exist \u2014 and one this API cannot use should not be
  // listed at all, since the operator would spend the debugging session on their token.
  const kinds = new Set(schemes.map((scheme) => scheme.kind));
  const credentials = [
    ...(kinds.has('bearer') ? [\`\${prefix}_TOKEN\`] : []),
    ...(kinds.has('basic') ? [\`\${prefix}_USERNAME\`, \`\${prefix}_PASSWORD\`] : []),
    ...schemes
      .filter((scheme) => scheme.kind === 'apiKey')
      .map((scheme) => \`\${prefix}_API_KEY_\${constantCase(scheme.key)}\`),
  ];
  lines.push(
    '',
    'Global flags:',
    '  --server-url <url>      Override the baked server URL',
    '  --format <json|ndjson>  Output format',
    '  --dry-run               Print the prepared request without sending it',
    '  --page-all              Follow pagination, one JSON page per line',
    '  --output <path>         Write the response body to a file (required for binary)',
    ...(kinds.has('bearer') ? ['  --token <token>         Bearer token'] : []),
    \`  --json <json|@file|@->  Request body\`,
    ...(credentials.length > 0 ? ['', 'Environment:', \`  \${credentials.join(', ')}\`] : []),
    '',
    \`Run \${name} \${grouped ? '<group> <command>' : '<command>'} --help for command details; \${name} schema <command> prints its schemas.\`
  );
  return lines;
}

function loadBody(source: string, wiring: CliWiring): unknown {
  const raw =
    source === '@-'
      ? (wiring.stdin ?? (() => ''))()
      : source.startsWith('@')
        ? (wiring.readFile ?? (() => ''))(source.slice(1))
        : source;
  return JSON.parse(raw);
}

/** Replace header values containing a known credential with \`***\`. */
function redactHeaders(headers: Record<string, string>, secrets: string[]): Record<string, string> {
  const redacted: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    redacted[name] = secrets.some((secret) => secret !== '' && value.includes(secret))
      ? '***'
      : value;
  }
  return redacted;
}

/** Parse argv, resolve env auth, dispatch through the client, print, return the exit code. */
export async function runCli(
  commands: Array<CliCommand | CustomCommand>,
  wiring: CliWiring,
  argv: string[]
): Promise<number>;
/** The composed form: one binary over several sources, each namespaced with its own wiring. */
export async function runCli(sources: CommandSource[], argv: string[]): Promise<number>;
export async function runCli(
  commandsOrSources: Array<CliCommand | CustomCommand> | CommandSource[],
  wiringOrArgv: CliWiring | string[],
  argv?: string[]
): Promise<number> {
  if (Array.isArray(wiringOrArgv)) {
    return runSources(commandsOrSources as CommandSource[], wiringOrArgv);
  }
  return runSingle(
    commandsOrSources as Array<CliCommand | CustomCommand>,
    wiringOrArgv,
    argv ?? []
  );
}

/** Route the first token to its source; the namespace-less source owns the root. */
async function runSources(sources: CommandSource[], argv: string[]): Promise<number> {
  // A source without wiring inherits the first wired one, so the documented root-source
  // shape \`{ commands: [login] }\` works: the login shares the composed binary's identity.
  const inherited = sources.find((source) => source.wiring !== undefined)?.wiring;
  const wiringOf = (source: CommandSource): CliWiring => source.wiring ?? (inherited as CliWiring);
  // Top-level output goes through the first source: with a root source that is the one
  // carrying the shared commands, otherwise the first API listed.
  const top = wiringOf(sources[0]);
  const fail = (code: number, message: string): number => {
    top.stderr(JSON.stringify({ error: { code, message } }));
    return code;
  };
  const namespaced = sources.filter(
    (source): source is CommandSource & { namespace: string } => source.namespace !== undefined
  );
  const root = sources.find((source) => source.namespace === undefined);
  if (root !== undefined) {
    const clash = root.commands.find((command) =>
      namespaced.some((source) => source.namespace === command.name)
    );
    if (clash !== undefined) {
      return fail(
        4,
        \`Root command "\${clash.name}" collides with the "\${clash.name}" namespace \u2014 rename one of them.\`
      );
    }
  }
  if (argv.length === 0 || argv[0] === '--help') {
    for (const line of renderComposedHelp(sources, top.name)) top.stdout(line);
    return 0;
  }
  const source = namespaced.find((candidate) => candidate.namespace === argv[0]);
  if (source !== undefined) return runSingle(source.commands, wiringOf(source), argv.slice(1));
  const rootTakes =
    root !== undefined &&
    (argv[0] === 'schema' ||
      root.commands.some(
        (command) =>
          command.name === argv[0] ||
          (command.group !== undefined && groupSlug(command.group) === argv[0])
      ));
  if (rootTakes)
    return runSingle((root as CommandSource).commands, wiringOf(root as CommandSource), argv);
  return fail(
    4,
    \`Unknown command: \${argv[0]} \u2014 expected an API namespace (\${namespaced
      .map((candidate) => candidate.namespace)
      .join(', ')})\${root !== undefined ? ' or a root command' : ''}\`
  );
}

/** The composed top-level help: namespaces, root commands, and how to descend. */
function renderComposedHelp(sources: CommandSource[], name: string): string[] {
  const lines = [\`Usage: \${name} <api> <command> \u2026\`, '', 'APIs:'];
  for (const source of sources) {
    if (source.namespace !== undefined) lines.push(\`  \${source.namespace}\`);
  }
  const root = sources.find((source) => source.namespace === undefined);
  if (root !== undefined && root.commands.length > 0) {
    lines.push('', 'Commands:');
    for (const command of root.commands) {
      lines.push(\`  \${command.name}  \${oneLine(command.summary ?? '')}\`.trimEnd());
    }
  }
  lines.push('', \`Run \${name} <api> --help for that API's commands.\`);
  return lines;
}

async function runSingle(
  rawCommands: Array<CliCommand | CustomCommand>,
  wiring: CliWiring,
  argv: string[]
): Promise<number> {
  const { stdout, stderr } = wiring;
  const commands = normalizeCommands(rawCommands);
  const shadowed = shadowedCommandName(commands);
  if (shadowed !== undefined) {
    stderr(
      JSON.stringify({
        error: {
          code: 4,
          message: \`Custom command "\${shadowed}" collides with another command of the same name \u2014 rename it.\`,
        },
      })
    );
    return 4;
  }
  const fail = (code: number, error: Record<string, unknown>): number => {
    stderr(JSON.stringify({ error: { code, ...error } }));
    return code;
  };

  const invocation = parseInvocation(commands, argv);
  if (invocation.kind === 'usage-error') return fail(4, { message: invocation.message });
  if (invocation.kind === 'help') {
    for (const line of renderHelp(
      commands,
      wiring.name,
      wiring.schemes ?? [],
      wiring.envPrefix,
      invocation.topic
    ))
      stdout(line);
    return 0;
  }
  if (invocation.kind === 'schema') {
    stdout(JSON.stringify(commandContract(invocation.command), null, 2));
    return 0;
  }

  const { command, positionals, params, globals } = invocation;
  // A credential the user passed explicitly must never be dropped in silence: without a
  // bearer scheme the request would go out unauthenticated and come back 401, which reads
  // as "my token is wrong" rather than "that flag does nothing here".
  const schemes = wiring.schemes ?? [];
  if (globals.token !== undefined && !schemes.some((scheme) => scheme.kind === 'bearer')) {
    const declared = schemes.map((scheme) => \`\${scheme.key} (\${scheme.kind})\`).join(', ');
    return fail(4, {
      message:
        \`--token is a bearer credential, and this API declares no bearer scheme. \` +
        (declared === '' ? 'It declares no security schemes at all.' : \`It accepts: \${declared}.\`),
    });
  }
  if (command.blob && globals.output === undefined) {
    return fail(4, {
      message: \`\${command.name} downloads a file: pass --output <path>\`,
      operationId: command.name,
    });
  }
  let body: unknown;
  if (globals.json !== undefined) {
    try {
      body = loadBody(globals.json, wiring);
    } catch (error) {
      return fail(4, {
        message: \`Invalid --json body: \${(error as Error).message}\`,
        operationId: command.name,
      });
    }
  }

  const auth = resolveAuth(wiring, globals.token);
  if (Object.keys(auth).length > 0) wiring.configure({ auth });
  if (globals.serverUrl !== undefined) wiring.configure({ serverUrl: globals.serverUrl });

  // Redaction matches these against header VALUES \u2014 so basic auth must contribute the
  // form the wire actually carries (\`Basic \${base64(user:pass)}\`), not just the raw
  // password, which never appears in the encoded header.
  const basic = auth.basic as { username: string; password: string } | undefined;
  const secrets = [
    ...(typeof auth.bearer === 'string' ? [auth.bearer] : []),
    ...(basic ? [basic.password, btoa(\`\${basic.username}:\${basic.password}\`)] : []),
    ...Object.values((auth.apiKey as Record<string, string> | undefined) ?? {}),
  ];
  let captured: Record<string, unknown> | undefined;
  if (globals.dryRun) {
    wiring.configure({
      fetch: async (
        url: string,
        init: { method?: string; headers?: Record<string, string>; body?: unknown }
      ) => {
        captured = {
          url,
          method: init.method,
          headers: redactHeaders(init.headers ?? {}, secrets),
          ...(init.body !== undefined && init.body !== null ? { body: String(init.body) } : {}),
        };
        return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
      },
    });
  }

  const argument = callInputs(command, positionals, params, body, wiring.argsStyle);

  // The client's methods are typed per-operation; the dispatcher only needs "callable
  // by name", so one localized widening here keeps the emitted wiring cast-free.
  const methods = wiring.client as Record<string, unknown>;
  try {
    const resolved = command as ResolvedCommand;
    if (resolved.handler !== undefined) {
      return await resolved.handler({ positionals, params, globals, wiring });
    }
    if (globals.pageAll && !globals.dryRun) {
      const paginated = methods[command.name] as {
        pages: (variables?: unknown) => AsyncIterable<unknown>;
      };
      for await (const page of paginated.pages(argument)) stdout(JSON.stringify(page));
      return 0;
    }
    const method = methods[command.name] as (variables?: unknown) => Promise<unknown>;
    const result = await method(argument);
    if (globals.dryRun) {
      // An SSE method returns a lazy stream \u2014 drain the stubbed response so its fetch
      // actually runs and captures the request.
      if (command.sse) for await (const _event of result as AsyncIterable<unknown>);
      stdout(JSON.stringify(captured, null, 2));
      return 0;
    }
    if (command.sse) {
      for await (const event of result as AsyncIterable<unknown>) stdout(JSON.stringify(event));
      return 0;
    }
    if (command.blob) {
      const bytes = new Uint8Array(await (result as Blob).arrayBuffer());
      (wiring.writeFile ?? (() => {}))(globals.output as string, bytes);
      stdout(JSON.stringify({ saved: globals.output, bytes: bytes.length }));
      return 0;
    }
    if (result !== undefined && result !== null) stdout(JSON.stringify(result, null, 2));
    return 0;
  } catch (error) {
    const thrown = error as Error & { status?: number; issues?: unknown };
    const detail = {
      message: thrown.message,
      operationId: command.name,
      ...(thrown.status !== undefined ? { status: thrown.status } : {}),
      ...(thrown.issues !== undefined ? { issues: thrown.issues } : {}),
    };
    if (thrown.name === 'ZodValidationError') return fail(3, detail);
    if (thrown.name === 'ApiError' && (thrown.status === 401 || thrown.status === 403)) {
      return fail(2, detail);
    }
    return fail(1, detail);
  }
}
`},W={"types.ts":`/**
 * The public type surface of the client runtime \u2014 \`@redocly/client-generator\`'s
 * app-facing runtime module. Pure types, no runtime code (excluded from coverage).
 * The generator emits \`OPERATIONS\` literals typed
 * \`satisfies Record<string, OperationDescriptor>\` against this module, so an
 * incompatible runtime/generated pair fails the consumer's build (the semver skew guard).
 */

/** How one operation parameter is sent: its location plus OpenAPI query-serialization hints. */
export type ParamSpec = {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  style?: 'form' | 'spaceDelimited' | 'pipeDelimited' | 'deepObject';
  explode?: boolean;
  allowReserved?: boolean;
};

/** One security scheme, denormalized onto the operation (\`scheme\` names the spec's scheme). */
export type SecuritySpec =
  | { scheme: string; kind: 'bearer' | 'basic' }
  | { scheme: string; kind: 'apiKey'; name: string; in: 'header' | 'query' | 'cookie' };

/**
 * How to auto-iterate a paginated operation (drives its \`.pages()\`/\`.items()\` members).
 * \`nextCursor\` and \`items\` are RFC 6901 JSON pointers into the page (response) value.
 */
export type PaginationSpec =
  | {
      style: 'cursor';
      /** The query param the iterator advances with the response's cursor. */
      param: string;
      /** Optional page-size query param (recorded for tooling; never set by the runtime). */
      limitParam?: string;
      /** Pointer to the next cursor in the page. */
      nextCursor: string;
      /** Optional pointer to a boolean "more pages" flag \u2014 \`false\` stops iteration. */
      hasMore?: string;
      /** Pointer to the page's item array. */
      items: string;
    }
  | {
      style: 'offset' | 'page';
      /** The numeric query param the iterator advances. */
      param: string;
      /** Optional page-size query param (recorded for tooling; never set by the runtime). */
      limitParam?: string;
      /** Pointer to the page's item array. */
      items: string;
    }
  | {
      /** RFC 8288: follow the response's \`Link\` header \`rel="next"\`; stop when absent. */
      style: 'link';
      /** Optional page-size query param (recorded for tooling; never set by the runtime). */
      limitParam?: string;
      /** Pointer to the page's item array. */
      items: string;
    };

/** The frozen data contract between generated code and the runtime: one operation's wire shape. */
export type OperationDescriptor = {
  id: string;
  method: string;
  path: string;
  tags?: readonly string[];
  params?: readonly ParamSpec[];
  /** \`multipart: true\` marks a typed object body serialized to FormData by the runtime. */
  body?: { contentType: string; multipart?: boolean };
  /** Defaults to \`'json'\` (content-type negotiation on parse). */
  responseKind?: 'json' | 'text' | 'blob' | 'void' | 'sse';
  sseDataKind?: 'json' | 'text';
  /** OR-alternatives, each an AND-set: the runtime applies the first fully-configured one. */
  security?: readonly (readonly SecuritySpec[])[];
  pagination?: PaginationSpec;
  /**
   * \`'grouped'\` marks an operation that takes its inputs namespaced by layer even on a
   * \`argsStyle: 'flat'\` client \u2014 the generator sets it where a merged call could not carry
   * one name for two layers, and the operation's own input type says the same.
   */
  argsStyle?: 'grouped';
  /**
   * Declared success-response headers for throw-mode \`{ envelope: true }\`.
   * \`name\` is the lowercased wire name; \`key\` is the camelCase envelope property.
   */
  responseHeaders?: readonly ResponseHeaderSpec[];
};

/** One declared response header the runtime coerces into the envelope \`headers\` object. */
export type ResponseHeaderSpec = {
  name: string;
  key: string;
  type: 'string' | 'number' | 'boolean';
};

/** A query value: scalars, arrays of scalars, or objects (serialized as deepObject brackets). */
export type QueryValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | Array<string | number | boolean | null | undefined>
  | Record<string, unknown>;

/** A credential: a literal, or a (possibly async) function resolved per request (refresh flows). */
export type TokenProvider = string | (() => string | Promise<string>);

/** Per-instance credentials, keyed by the scheme kinds the runtime can inject. */
export type AuthCredentials = {
  bearer?: TokenProvider;
  basic?: { username: string; password: string };
  apiKey?: Record<string, TokenProvider>;
};

/** Backoff shape: 'fixed' = constant delay; 'exponential' = doubling per attempt. */
export type RetryStrategy = 'fixed' | 'exponential';

/**
 * The operation's identity, exposed to middleware for targeting (\`ctx.operation\`).
 * Generated clients instantiate the type parameters with the spec's literal unions
 * (\`OperationId\`/\`OperationPath\`/\`OperationTag\`) so a misspelled operation id in a
 * middleware comparison fails to compile; the string defaults keep every
 * spec-independent consumer (\`runtime-contract.ts\`, the runtime internals) working
 * with the base shape. \`tags\` stays mutable (\`Tag[]\`) so setup-contract types
 * (byte-locked to generated output) remain assignable through middleware callbacks.
 */
export type OperationContext<
  Id extends string = string,
  Path extends string = string,
  Tag extends string = string,
> = { id: Id; path: Path; tags: Tag[] };

/** The mutable request context threaded through the middleware chain. */
export type RequestContext<Op extends OperationContext = OperationContext> = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  operation: Op;
};

/** The failed attempt handed to a custom \`retryOn\`: exactly one of \`response\`/\`error\` is set. */
export type RetryContext<Op extends OperationContext = OperationContext> = {
  attempt: number;
  request: RequestContext<Op>;
  response?: Response;
  error?: unknown;
};

/** Opt-in retry policy; a per-call override merges field-by-field over the config policy. */
export type RetryConfig<Op extends OperationContext = OperationContext> = {
  retries?: number;
  retryDelay?: number;
  retryStrategy?: RetryStrategy;
  jitter?: boolean;
  retryOn?: (ctx: RetryContext<Op>) => boolean | Promise<boolean>;
};

/**
 * Structural stand-in for the runtime's ApiError so this module stays import-free
 * (pure types); the real \`ApiError\` class is assignable to it.
 */
export type ApiErrorLike = globalThis.Error & {
  url: string;
  status: number;
  statusText: string;
  body: unknown;
};

/** One interceptor: any subset of the three hooks. */
export type Middleware<Op extends OperationContext = OperationContext> = {
  onRequest?: (ctx: RequestContext<Op>) => void | Promise<void>;
  onResponse?: (
    response: Response,
    ctx: RequestContext<Op>
  ) => Response | void | Promise<Response | void>;
  /** Throw mode only: may map/replace the error. */
  // \`globalThis.Error\` so a spec schema named \`Error\` cannot shadow it in inline mode.
  onError?: (
    error: ApiErrorLike,
    ctx: RequestContext<Op>
  ) => globalThis.Error | Promise<globalThis.Error>;
};

/** Client configuration: transport, defaults, retry policy, middleware, and credentials. */
export type ClientConfig<Op extends OperationContext = OperationContext> = {
  serverUrl?: string;
  fetch?: typeof fetch;
  headers?:
    | Record<string, string>
    | (() => Record<string, string> | Promise<Record<string, string>>);
  retry?: RetryConfig<Op>;
  /** Milliseconds before a request attempt aborts (covers the body read too; each retry
   * attempt gets a fresh budget). Per-call \`timeout\` overrides it, \`0\` disables it.
   * SSE streams are long-lived by design and never inherit this value. */
  timeout?: number;
  /** Send an \`Idempotency-Key\` header on POST/PATCH (one stable key per logical call,
   * reused across retry attempts) \u2014 which also makes those retries safe under the
   * default retry policy. \`true\` generates a UUID per call; a function supplies the key. */
  idempotencyKey?: boolean | (() => string);
  /** Identifies this client to the API via an \`X-Redocly-Client\` header (the generator
   * bakes a default). Sent only OUTSIDE browsers \u2014 a custom header would force a CORS
   * preflight. Override with your own value, or \`false\` to disable. */
  clientHeader?: string | false;
  middleware?: Middleware<Op>[];
  auth?: AuthCredentials;
  /** Fixed at generate time by the generator (\`'throw'\` when omitted); \`configure()\` ignores it. */
  errorMode?: 'throw' | 'result';
  /**
   * How each call spells its inputs: \`'grouped'\` (the default) namespaces them by layer \u2014
   * \`{ path, query, headers, cookies, body }\` \u2014 and \`'flat'\` takes one merged object.
   * Fixed at generate time, like \`errorMode\`, because it shapes the static types.
   */
  argsStyle?: 'grouped' | 'flat';
  onRequest?: Middleware<Op>['onRequest'];
  onResponse?: Middleware<Op>['onResponse'];
  onError?: Middleware<Op>['onError'];
};

/** Response readers for the per-call \`parseAs\` override. */
export type ParseAs = 'auto' | 'json' | 'text' | 'blob' | 'arrayBuffer' | 'formData' | 'stream';

/** Per-call options: standard \`RequestInit\` plus a retry override, a timeout override
 * (\`0\` disables the config default), and a forced reader. */
export type RequestOptions = RequestInit & {
  retry?: RetryConfig;
  timeout?: number;
  /** Per-call idempotency key: a literal key, \`true\` to generate one, \`false\` to skip. */
  idempotencyKey?: string | boolean | (() => string);
  parseAs?: ParseAs;
  /**
   * Throw mode only: return \`{ data, headers, response }\` instead of the parsed body;
   * ignored in result mode. The explicit \`| undefined\` keeps the wrappers' emitted
   * \`envelope: undefined\` strip legal under \`exactOptionalPropertyTypes\`.
   */
  envelope?: boolean | undefined;
};

/** Throw-mode success envelope when \`RequestOptions.envelope\` is \`true\`. */
export type Envelope<TData, THeaders = Record<string, never>> = {
  data: TData;
  headers: THeaders;
  response: Response;
};

/** Per-call options for an SSE stream; reconnect defaults to true. */
export type SseOptions = RequestInit & { reconnect?: boolean; reconnectDelay?: number };

/** A single decoded Server-Sent Event with its payload typed from the spec. */
export type ServerSentEvent<T> = { event?: string; data: T; id?: string; retry?: number };

/** Result-mode return shape: exactly one of \`data\`/\`error\` is set. */
export type Result<TData, TError> =
  | { data: TData; error: undefined; response: Response }
  | { data: undefined; error: TError; response: Response };

/**
 * The generated \`Ops\` type's shape: per-operation args/result, plus \`kind: 'sse'\` for
 * streams and, for paginated operations, \`item\` (the page's element type) and \u2014 on
 * result-mode clients only \u2014 \`page\` (the RAW page type \`.pages()\` yields, since
 * iteration unwraps the \`Result\` envelope the one-shot \`result\` carries).
 */
export type OpsShape = Record<
  string,
  {
    args: object;
    result: unknown;
    kind?: 'sse';
    item?: unknown;
    page?: unknown;
    /** Declared success-response headers for \`{ envelope: true }\` (camelCase keys). */
    headers?: object;
    /** Result-mode entries ignore the throw-only \`envelope\` option. */
    mode?: 'result';
  }
>;

/** The always-present client members (assigned after the operation loop \u2014 they win collisions). */
export type ClientCore<Op extends OperationContext = OperationContext> = {
  /** Merge into the config; note \`middleware\` REPLACES the chain (use \`use()\` to compose). */
  configure(config: ClientConfig<Op>): void;
  /** Append interceptors (composes with baked/publisher middleware). */
  use(...middleware: Middleware<Op>[]): void;
  auth: {
    bearer(token: TokenProvider): void;
    basic(username: string, password: string): void;
    apiKey(scheme: string, value: TokenProvider): void;
  };
};

/**
 * The standard TypeScript optionality probe: \`{}\` has no required members, so
 * \`{} extends A\` is true exactly when every member of \`A\` is optional.
 */
// oxlint-disable-next-line typescript/no-empty-object-type
type NoRequiredKeys<A> = {} extends A ? true : false;

/**
 * The page type \`.pages()\` yields: the RAW page declared by \`page\` (the generator
 * writes it only on result-mode paginated entries, whose \`result\` is the envelope),
 * or the method's own \`result\` (throw mode \u2014 already the raw page).
 */
type PageOf<Entry extends OpsShape[string]> = Entry extends { page: unknown }
  ? Entry['page']
  : Entry['result'];

/**
 * The auto-pagination members intersected onto a paginated method \u2014 present exactly when
 * the Ops entry declares \`item\` (the generator writes it only for paginated operations).
 * Args optionality mirrors the method's own; \`unknown\` otherwise (identity under \`&\`).
 * Iteration is error-mode-agnostic: \`.pages()\`/\`.items()\` yield raw pages/items, and a
 * failed page aborts iteration by throwing \`ApiError\`, even on result-mode clients; the
 * \`onError\` middleware hook (throw-mode-only) is not invoked.
 */
type Paginated<Entry extends OpsShape[string]> = 'item' extends keyof Entry
  ? NoRequiredKeys<Entry['args']> extends true
    ? {
        pages(args?: Entry['args'], init?: RequestOptions): AsyncGenerator<PageOf<Entry>>;
        items(args?: Entry['args'], init?: RequestOptions): AsyncGenerator<Entry['item']>;
      }
    : {
        pages(args: Entry['args'], init?: RequestOptions): AsyncGenerator<PageOf<Entry>>;
        items(args: Entry['args'], init?: RequestOptions): AsyncGenerator<Entry['item']>;
      }
  : unknown;

/**
 * The stable identity every client method carries: the SPEC operationId (also set as
 * \`fn.name\`, but \`operationId\` is the explicit, minification-proof form) \u2014 a robust
 * cache key for consumer wrappers (react-query keys and the like).
 */
export type OperationMethodIdentity = { readonly operationId: string };

/** Declared response-header bag for an Ops entry; empty object when none are declared. */
type HeadersOf<Entry extends OpsShape[string]> = 'headers' extends keyof Entry
  ? NonNullable<Entry['headers']>
  : Record<string, never>;

/**
 * Return type of a throw-mode call: the body by default, \`Envelope<\u2026>\` for a literal
 * \`envelope: true\`, their union when the flag is a widened \`boolean\`. Exact
 * \`RequestOptions\` stays the body \u2014 pre-envelope package-mode flat sugar typed every
 * \`init\` parameter as \`RequestOptions\`, and widening that would break upgrades without
 * a regenerate. The \`keyof\` presence gate keeps \`{ headers }\` / \`{ signal }\` as the body
 * (\`TInit['envelope']\` through \`TInit & RequestOptions\` would otherwise be
 * \`boolean | undefined\`).
 */
export type EnvelopeResult<
  TData,
  THeaders,
  TInit extends RequestOptions | undefined,
> = TInit extends undefined
  ? TData
  : RequestOptions extends TInit
    ? TInit extends RequestOptions
      ? TData
      : EnvelopeResultForKnownInit<TData, THeaders, TInit>
    : EnvelopeResultForKnownInit<TData, THeaders, TInit>;

type EnvelopeResultForKnownInit<TData, THeaders, TInit> = 'envelope' extends keyof TInit
  ? [TInit['envelope' & keyof TInit]] extends [true]
    ? Envelope<TData, THeaders>
    : [TInit['envelope' & keyof TInit]] extends [false | undefined]
      ? TData
      : TData | Envelope<TData, THeaders>
  : TData;

/** A one-shot method whose return shape never varies with per-call options. */
type BodyMethod<Entry extends OpsShape[string]> =
  NoRequiredKeys<Entry['args']> extends true
    ? (args?: Entry['args'], init?: RequestOptions) => Promise<Entry['result']>
    : (args: Entry['args'], init?: RequestOptions) => Promise<Entry['result']>;

/**
 * One-shot (non-SSE) method: default returns the body; \`{ envelope: true }\` returns
 * \`{ data, headers, response }\` with typed declared headers.
 */
type ThrowMethod<Entry extends OpsShape[string]> =
  NoRequiredKeys<Entry['args']> extends true
    ? <Init extends RequestOptions | undefined = undefined>(
        args?: Entry['args'],
        init?: Init
      ) => Promise<EnvelopeResult<Entry['result'], HeadersOf<Entry>, Init>>
    : <Init extends RequestOptions | undefined = undefined>(
        args: Entry['args'],
        init?: Init
      ) => Promise<EnvelopeResult<Entry['result'], HeadersOf<Entry>, Init>>;

/** The typed instance client: one bound method per operation plus the core members. */
export type Client<Ops extends OpsShape, Op extends OperationContext = OperationContext> = {
  [K in keyof Ops]: Ops[K] extends { kind: 'sse' }
    ? (NoRequiredKeys<Ops[K]['args']> extends true
        ? (
            args?: Ops[K]['args'],
            init?: SseOptions
          ) => AsyncGenerator<ServerSentEvent<Ops[K]['result']>>
        : (
            args: Ops[K]['args'],
            init?: SseOptions
          ) => AsyncGenerator<ServerSentEvent<Ops[K]['result']>>) &
        OperationMethodIdentity
    : (Ops[K] extends { mode: 'result' } ? BodyMethod<Ops[K]> : ThrowMethod<Ops[K]>) &
        OperationMethodIdentity &
        Paginated<Ops[K]>;
} & ClientCore<Op>;`,"errors.ts":`/** The error thrown (throw mode) for a non-2xx response, carrying the decoded error body. */
export class ApiError extends Error {
  public readonly url: string;
  public readonly status: number;
  public readonly statusText: string;
  public readonly body: unknown;
  constructor(url: string, status: number, statusText: string, body: unknown) {
    super(\`Request failed with status \${status}\`);
    this.name = 'ApiError';
    this.url = url;
    this.status = status;
    this.statusText = statusText;
    this.body = body;
  }
}

/** The error thrown when a request attempt exceeds the configured \`timeout\` \u2014 carries
 * the context a log line needs (which operation, what budget, which attempt). */
export class TimeoutError extends Error {
  public readonly operationId: string;
  public readonly timeout: number;
  public readonly attempt: number;
  constructor(operationId: string, timeout: number, attempt: number) {
    super(\`Request "\${operationId}" timed out after \${timeout} ms (attempt \${attempt})\`);
    this.name = 'TimeoutError';
    this.operationId = operationId;
    this.timeout = timeout;
    this.attempt = attempt;
  }
}

/** The error to throw for an aborted request: the caller's abort reason when it is an Error. */
// \`globalThis.Error\` (not bare \`Error\`) so a spec schema named \`Error\` cannot shadow it
// when this module is embedded alongside generated types (inline mode).
function abortError(signal: AbortSignal): globalThis.Error {
  const reason = (signal as { reason?: unknown }).reason;
  if (reason instanceof Error) return reason;
  return new DOMException('The operation was aborted.', 'AbortError');
}`,"url.ts":`/**
 * The RESOLVED OpenAPI serialization spec for one query parameter \u2014 callers apply the
 * OpenAPI defaults (\`style: 'form'\`, \`explode: true\`) before building one.
 */
type QueryStyle = {
  style: NonNullable<ParamSpec['style']>;
  explode: boolean;
  allowReserved?: boolean;
};

/**
 * Encode everything except the RFC-3986 reserved set, for \`allowReserved: true\` params \u2014
 * \`filter=a/b\` survives instead of \`filter=a%2Fb\`.
 */
function encodeReserved(value: string): string {
  return encodeURIComponent(value).replace(
    /%(3A|2F|3F|23|5B|5D|40|21|24|26|27|28|29|2A|2B|2C|3B|3D)/g,
    (match) => decodeURIComponent(match)
  );
}

/** Substitute \`{name}\` template segments with encoded values; a missing value is a caller bug. */
function substitutePath(template: string, values: Record<string, unknown>): string {
  return template.replace(/\\{([^{}]+)\\}/g, (_match, name: string) => {
    const value = values[name];
    if (value === undefined) throw new Error(\`Missing path parameter "\${name}"\`);
    return encodeURIComponent(String(value));
  });
}

/**
 * Build the request URL: \`serverUrl\` (trailing slash trimmed) + path + serialized query.
 * Query parameters honor their OpenAPI \`style\`/\`explode\`/\`allowReserved\` (from \`styles\`);
 * without a spec, arrays repeat the key (\`form\`+\`explode\`), objects serialize as
 * \`deepObject\` brackets, and \`null\`/\`undefined\` entries are skipped.
 */
function buildUrl(
  serverUrl: string,
  path: string,
  query?: Record<string, QueryValue>,
  styles?: Record<string, QueryStyle>
): string {
  // Trim trailing slashes with a scan, not \`/\\/+$/\` \u2014 an anchored \`+\` regex is
  // quadratic on adversarial many-slash input (the server URL is caller data).
  let end = serverUrl.length;
  while (end > 0 && serverUrl.charCodeAt(end - 1) === 47 /* '/' */) end--;
  const url = serverUrl.slice(0, end) + path;
  if (!query) return url;
  const params = new URLSearchParams();
  const raw: string[] = [];
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    const spec = styles?.[key];
    if (!spec) {
      if (Array.isArray(value)) {
        for (const v of value) {
          if (v !== undefined && v !== null) params.append(key, String(v));
        }
      } else if (Object(value) === value) {
        // Object-valued query params use \`deepObject\` style: key[subKey]=subValue.
        for (const [subKey, subValue] of Object.entries(value)) {
          if (subValue !== undefined && subValue !== null) {
            params.append(\`\${key}[\${subKey}]\`, String(subValue));
          }
        }
      } else {
        params.append(key, String(value));
      }
      continue;
    }
    if (Array.isArray(value)) {
      const items = value.filter((v) => v !== undefined && v !== null).map(String);
      if (spec.style === 'form' && spec.explode) {
        for (const v of items) {
          if (spec.allowReserved) raw.push(\`\${key}=\${encodeReserved(v)}\`);
          else params.append(key, v);
        }
      } else {
        // Delimited styles put the LITERAL delimiter on the wire; only the
        // values are encoded. \`%20\` (not \`+\`) is the literal space delimiter.
        const delim =
          spec.style === 'pipeDelimited' ? '|' : spec.style === 'spaceDelimited' ? '%20' : ',';
        const enc = spec.allowReserved ? encodeReserved : encodeURIComponent;
        raw.push(\`\${encodeURIComponent(key)}=\${items.map(enc).join(delim)}\`);
      }
    } else if (Object(value) === value) {
      // \`deepObject\` (and any object spec, for now): key[subKey]=subValue.
      for (const [subKey, subValue] of Object.entries(value)) {
        if (subValue !== undefined && subValue !== null) {
          if (spec.allowReserved) raw.push(\`\${key}[\${subKey}]=\${encodeReserved(String(subValue))}\`);
          else params.append(\`\${key}[\${subKey}]\`, String(subValue));
        }
      }
    } else if (spec.allowReserved) {
      raw.push(\`\${key}=\${encodeReserved(String(value))}\`);
    } else {
      params.append(key, String(value));
    }
  }
  const qs = [params.toString(), ...raw].filter(Boolean).join('&');
  return qs ? \`\${url}?\${qs}\` : url;
}`,"parse.ts":`/**
 * Read the response body per \`kind\`. \`'auto'\` negotiates from the content type
 * (JSON, then \`text/*\`, then Blob); \`204\` responses read nothing. A \`'void'\`
 * operation (no declared 2xx content) still returns a JSON body the server
 * actually sends: the static type stays \`void\`, but silently dropping real data
 * behind a spec gap is the worse failure \u2014 consumers can reach it with a cast
 * while the API description catches up.
 */
async function parse(response: Response, kind: ParseAs | 'void'): Promise<unknown> {
  if (kind === 'void') {
    if (response.status === 204 || response.status === 205 || response.status === 304) {
      return undefined;
    }
    const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
    if (!contentType.includes('json')) return undefined;
    // Best-effort: an empty or malformed body on an undeclared response stays undefined.
    const text = await response.text().catch(() => '');
    if (text === '') return undefined;
    try {
      return JSON.parse(text);
    } catch {
      return undefined;
    }
  }
  if (response.status === 204) return undefined;
  if (kind === 'stream') return response.body;
  if (kind === 'blob') return response.blob();
  if (kind === 'arrayBuffer') return response.arrayBuffer();
  if (kind === 'formData') return response.formData();
  if (kind === 'text') return response.text();
  if (kind === 'json') return response.json();
  // 'auto' \u2014 negotiate from the response's content type (case-insensitively:
  // \`Text/Plain\` and \`application/JSON\` are valid per RFC 9110).
  const contentType = (response.headers.get('content-type') ?? '').toLowerCase();
  if (contentType.includes('json')) return response.json();
  if (contentType.startsWith('text/')) return response.text();
  // An untyped body reads as a Blob \u2014 but an EMPTY one resolves to undefined: a 2xx
  // with \`Content-Length: 0\` must not yield a truthy \`new Blob([])\` that silently
  // defeats every \`!data\` guard downstream.
  const blob = await response.blob();
  return blob.size > 0 ? blob : undefined;
}

/** Best-effort decode of a non-2xx body (JSON when declared, else text; undefined on failure). */
async function readError(response: Response): Promise<unknown> {
  const contentType = response.headers.get('content-type') ?? '';
  if (contentType.toLowerCase().includes('json')) {
    return response.json().catch(() => undefined);
  }
  return response.text().catch(() => undefined);
}`,"retry.ts":`const IDEMPOTENT_METHODS = new Set(['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']);
const TRANSIENT_STATUS = new Set([408, 429, 500, 502, 503, 504]);

/**
 * The default retry predicate: idempotent methods \u2014 or any request carrying an
 * \`Idempotency-Key\` header, which makes re-sending safe \u2014 on a transport error or a
 * transient status. A custom \`retryOn\` fully replaces this (no method check kept).
 */
export function defaultRetryOn(ctx: RetryContext): boolean {
  const safeToResend =
    IDEMPOTENT_METHODS.has(ctx.request.method.toUpperCase()) ||
    'Idempotency-Key' in ctx.request.headers ||
    'idempotency-key' in ctx.request.headers;
  if (!safeToResend) return false;
  return ctx.response === undefined || TRANSIENT_STATUS.has(ctx.response.status);
}

/**
 * The delay before the next attempt: a \`Retry-After\` header (seconds or HTTP-date)
 * wins; otherwise fixed/exponential backoff over \`retryDelay\`, with full jitter
 * unless \`jitter === false\`.
 */
function retryDelay(retry: RetryConfig, attempt: number, retryAfter: string | null): number {
  if (retryAfter) {
    const seconds = Number(retryAfter);
    if (!Number.isNaN(seconds)) return seconds * 1000;
    const when = Date.parse(retryAfter);
    if (!Number.isNaN(when)) return Math.max(0, when - Date.now());
  }
  const base = retry.retryDelay ?? 1000;
  const raw = retry.retryStrategy === 'fixed' ? base : base * Math.pow(2, attempt - 1);
  return retry.jitter === false ? raw : Math.random() * raw;
}

/** Abort-aware sleep: resolves after \`ms\`, rejects with the abort reason immediately on abort. */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError(signal));
      return;
    }
    const onAbort = () => {
      clearTimeout(timer);
      reject(abortError(signal as AbortSignal));
    };
    const timer = setTimeout(() => {
      if (signal) signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    if (signal) signal.addEventListener('abort', onAbort, { once: true });
  });
}`,"multipart.ts":`/**
 * Serialize a plain object into \`FormData\` for a typed \`multipart/form-data\` body
 * (capability module \u2014 wired into \`createClient\`, never imported by the send core).
 * \`Blob\`/\`File\` and strings pass through; \`Date\`s become ISO strings; arrays append
 * one field per item; other objects are JSON-encoded; everything else is stringified.
 * \`undefined\`/\`null\` entries are skipped.
 */
function toFormData(body: Record<string, unknown>): FormData {
  const fd = new FormData();
  const append = (key: string, value: unknown): void => {
    if (value === undefined || value === null) return;
    if (value instanceof Blob || typeof value === 'string') fd.append(key, value);
    else if (value instanceof Date) fd.append(key, value.toISOString());
    else if (Object(value) === value) fd.append(key, JSON.stringify(value));
    else fd.append(key, String(value));
  };
  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) for (const item of value) append(key, item);
    else append(key, value);
  }
  return fd;
}`,"auth.ts":`/** Resolve a credential: a literal passes through; a function is awaited per request. */
async function resolveToken(provider: TokenProvider): Promise<string> {
  return typeof provider === 'function' ? await provider() : provider;
}

/** UTF-8-safe base64: bare \`btoa\` throws on non-Latin-1 credentials (RFC 7617 allows UTF-8). */
function encodeBase64(text: string): string {
  let binary = '';
  for (const byte of new TextEncoder().encode(text)) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** Whether a credential for this scheme is configured on the instance. */
function isConfigured(scheme: SecuritySpec, config: ClientConfig): boolean {
  if (scheme.kind === 'apiKey') return config.auth?.apiKey?.[scheme.scheme] !== undefined;
  if (scheme.kind === 'bearer') return config.auth?.bearer !== undefined;
  return config.auth?.basic !== undefined;
}

/**
 * Build the auth headers/query for one operation's \`security\` OR-alternatives from the
 * instance credentials (\`config.auth\`) \u2014 capability module, wired into \`createClient\`.
 * The first alternative whose schemes (an AND-set) are all configured is applied, so
 * "bearer OR apiKey" works with either credential and never sends both. When none is
 * fully configured, the first alternative's configured schemes are still sent (the
 * server rejects the request, mirroring the previous behavior).
 * Cookie-borne apiKeys fold into a single \`Cookie\` header joined with \`; \`.
 */
async function resolveAuth(
  security: readonly (readonly SecuritySpec[])[],
  config: ClientConfig
): Promise<{ headers: Record<string, string>; query: Record<string, string> }> {
  const alternative =
    security.find((schemes) => schemes.every((scheme) => isConfigured(scheme, config))) ??
    security[0] ??
    [];
  const headers: Record<string, string> = {};
  const query: Record<string, string> = {};
  const cookies: string[] = [];
  for (const scheme of alternative) {
    if (scheme.kind === 'apiKey') {
      const provider = config.auth?.apiKey?.[scheme.scheme];
      if (provider === undefined) continue;
      const value = await resolveToken(provider);
      if (scheme.in === 'header') headers[scheme.name] = value;
      else if (scheme.in === 'query') query[scheme.name] = value;
      // Cookie values may contain reserved characters (\`;\`, \`=\`, space, \u2026); percent-encode
      // so the credential can't break the \`Cookie\` header syntax.
      else cookies.push(\`\${scheme.name}=\${encodeURIComponent(value)}\`);
    } else if (scheme.kind === 'bearer') {
      const provider = config.auth?.bearer;
      if (provider !== undefined) headers.Authorization = \`Bearer \${await resolveToken(provider)}\`;
    } else {
      const basic = config.auth?.basic;
      if (basic !== undefined) {
        headers.Authorization = \`Basic \${encodeBase64(\`\${basic.username}:\${basic.password}\`)}\`;
      }
    }
  }
  if (cookies.length > 0) headers.Cookie = cookies.join('; ');
  return { headers, query };
}`,"setup.ts":`/**
 * Merge a publisher's baked setup (\`defineClientSetup({...})\`) with the app's config:
 * app config fields win per-field over baked defaults, while middleware composes \u2014
 * baked middleware runs first, then the app's.
 */
export function mergeSetup(
  setup: { config?: ClientConfig; middleware?: Middleware[] } | undefined,
  config: ClientConfig = {}
): ClientConfig {
  return {
    ...setup?.config,
    ...config,
    middleware: [...(setup?.middleware ?? []), ...(config.middleware ?? [])],
  };
}`,"send.ts":`/**
 * Optional behaviors the send core can use but never statically imports \u2014 wired by
 * \`createClient\` (the same seam the future inline-mode assembler relies on).
 */
type SendCapabilities = {
  /** Serialize a typed multipart body (a plain object) to FormData. */
  serializeMultipart?: (body: Record<string, unknown>) => FormData;
};

/**
 * Normalize a caller's \`HeadersInit\` (plain record, \`Headers\` instance, or entry pairs)
 * to a plain record \u2014 spreading a \`Headers\` or an array contributes no entries.
 */
function toHeaderRecord(headers: HeadersInit | undefined): Record<string, string> {
  if (headers === undefined) return {};
  if (headers instanceof Headers) {
    const record: Record<string, string> = {};
    headers.forEach((value, key) => {
      record[key] = value;
    });
    return record;
  }
  if (Array.isArray(headers)) return Object.fromEntries(headers);
  return headers;
}

/**
 * The effective middleware chain for a request: the single \`onRequest\`/\`onResponse\`/
 * \`onError\` config hooks as one implicit first middleware, then \`config.middleware\`.
 */
function middlewareChain(config: ClientConfig): Middleware[] {
  const single =
    config.onRequest || config.onResponse || config.onError
      ? [{ onRequest: config.onRequest, onResponse: config.onResponse, onError: config.onError }]
      : [];
  return [...single, ...(config.middleware ?? [])];
}

/**
 * The fetch core shared by every operation: default + config + per-call headers, the
 * \`onRequest\` chain (BEFORE body serialization, so mutations are sent), body
 * serialization (JSON, or FormData via the multipart capability), the retry loop
 * (idempotent-only defaults, \`Retry-After\`, abandoned-body drain), and the reverse
 * \`onResponse\` onion. Returns the final response plus the request context.
 */
async function send(
  config: ClientConfig,
  op: OperationContext,
  url: string,
  init: RequestOptions,
  body: unknown | undefined,
  bodySpec: { contentType: string; multipart?: boolean } | undefined,
  caps: SendCapabilities,
  accept = 'application/json'
): Promise<{ response: Response; context: RequestContext }> {
  const { retry: callRetry, timeout: callTimeout, idempotencyKey: callKey, ...fetchInit } = init;
  const retry: RetryConfig = { ...config.retry, ...callRetry };
  const timeout = callTimeout ?? config.timeout;
  const idempotency = callKey ?? config.idempotencyKey;
  const extra = typeof config.headers === 'function' ? await config.headers() : config.headers;
  const headers: Record<string, string> = {
    Accept: accept,
    ...extra,
    ...toHeaderRecord(fetchInit.headers),
  };
  const method = (fetchInit.method ?? 'GET').toUpperCase();
  // One stable key per LOGICAL call \u2014 set before the retry loop so every attempt
  // re-sends the same key; a caller-provided header always wins.
  if (
    idempotency !== undefined &&
    idempotency !== false &&
    (method === 'POST' || method === 'PATCH') &&
    !('Idempotency-Key' in headers) &&
    !('idempotency-key' in headers)
  ) {
    headers['Idempotency-Key'] =
      typeof idempotency === 'string'
        ? idempotency
        : typeof idempotency === 'function'
          ? idempotency()
          : crypto.randomUUID();
  }
  // Client identification for the API owner's telemetry \u2014 never in browsers, where a
  // custom header would force a CORS preflight the API may not allow.
  if (
    typeof config.clientHeader === 'string' &&
    typeof document === 'undefined' &&
    !('X-Redocly-Client' in headers) &&
    !('x-redocly-client' in headers)
  ) {
    headers['X-Redocly-Client'] = config.clientHeader;
  }
  const context: RequestContext = {
    url,
    method: fetchInit.method ?? 'GET',
    headers,
    body,
    operation: op,
  };
  const middleware = middlewareChain(config);
  for (const mw of middleware) if (mw.onRequest) await mw.onRequest(context);
  // Serialize AFTER onRequest so body mutations (case conversion, enveloping, signing) take effect.
  let payload: BodyInit | undefined;
  if (context.body !== undefined) {
    const value = context.body;
    const isBinary =
      value instanceof Blob ||
      value instanceof ArrayBuffer ||
      ArrayBuffer.isView(value as ArrayBufferView);
    const isFormData = typeof FormData !== 'undefined' && value instanceof FormData;
    const isURLSearchParams = value instanceof URLSearchParams;
    if (isFormData || isURLSearchParams || isBinary || typeof value === 'string') {
      payload = value as BodyInit;
    } else if (bodySpec?.multipart === true) {
      if (!caps.serializeMultipart) {
        throw new Error('Multipart capability not wired: cannot serialize the request body');
      }
      payload = caps.serializeMultipart(value as Record<string, unknown>);
    } else {
      payload = JSON.stringify(value);
      if (!('Content-Type' in context.headers) && !('content-type' in context.headers)) {
        // The spec's declared request content type (e.g. application/merge-patch+json).
        context.headers['Content-Type'] = bodySpec?.contentType ?? 'application/json';
      }
    }
  }
  const doFetch = config.fetch ?? fetch;
  const maxAttempts = 1 + (retry.retries ?? 0);
  const retryOn = retry.retryOn ?? defaultRetryOn;
  const signal = fetchInit.signal ?? undefined;

  let attempt = 0;
  while (true) {
    attempt++;
    if (signal?.aborted) throw abortError(signal);
    // A fresh timeout budget per attempt; the caller's signal still wins the race.
    // The composed signal also governs reading the response body.
    const attemptSignal = timeout
      ? signal
        ? AbortSignal.any([signal, AbortSignal.timeout(timeout)])
        : AbortSignal.timeout(timeout)
      : signal;
    let response: Response;
    try {
      response = await doFetch(context.url, {
        ...fetchInit,
        signal: attemptSignal,
        method: context.method,
        headers: context.headers,
        body: payload,
      });
    } catch (error) {
      if (
        attempt < maxAttempts &&
        !signal?.aborted &&
        (await retryOn({ attempt, request: context, error }))
      ) {
        await sleep(retryDelay(retry, attempt, null), signal);
        continue;
      }
      // Our timeout fired (never the caller's own abort \u2014 that rethrows untouched):
      // wrap the bare DOMException with the context a log line needs.
      if (
        timeout &&
        !signal?.aborted &&
        error instanceof DOMException &&
        error.name === 'TimeoutError'
      ) {
        throw new TimeoutError(op.id, timeout, attempt);
      }
      throw error;
    }
    // Reverse order: the last-registered middleware wraps closest to the network (onion).
    for (let i = middleware.length - 1; i >= 0; i--) {
      const onResponse = middleware[i].onResponse;
      if (onResponse) {
        const replaced = await onResponse(response, context);
        if (replaced && replaced !== response) {
          // Cancel the abandoned original's body \u2014 like the retry path, an unread body
          // keeps its connection checked out under Node/undici.
          await response.body?.cancel().catch(() => undefined);
          response = replaced;
        }
      }
    }
    if (
      !response.ok &&
      attempt < maxAttempts &&
      !signal?.aborted &&
      (await retryOn({ attempt, request: context, response }))
    ) {
      const retryAfter = response.headers.get('retry-after');
      // Drain the abandoned response body before the next attempt: an unread body
      // keeps the connection checked out (and can stall the pool) under Node/undici
      // and other strict HTTP clients. Ignore errors (e.g. a middleware already read it).
      await response.body?.cancel().catch(() => undefined);
      await sleep(retryDelay(retry, attempt, retryAfter), signal);
      continue;
    }
    return { response, context };
  }
}`,"sse.ts":`/**
 * A frame delimiter: two consecutive line terminators (each CR, LF, or CRLF, per the SSE
 * spec \u2014 so mixed endings like \`\\n\\r\\n\` are valid boundaries, not just matching pairs).
 */
const FRAME_DELIMITER = /(?:\\r\\n|\\r|\\n){2}/;

/**
 * A terminally malformed event stream \u2014 unparseable JSON \`data\` or an unbounded frame.
 * A stable bad payload, not a dropped connection, so the stream never reconnects on it.
 */
class SseParseError extends Error {}

/**
 * Consume a \`text/event-stream\` operation as typed events (capability module \u2014 wired
 * into \`createClient\`). Auto-reconnects on dropped connections, resuming from the last
 * seen event id via \`Last-Event-ID\` (backoff: the server's \`retry:\` value, then
 * \`reconnectDelay\`, then 1s \u2014 exponential with jitter, capped at 30s). A clean stream
 * end flushes a trailing frame and finishes; \`break\`/abort end the iterator cleanly.
 */
async function* sse<T>(
  config: ClientConfig,
  op: OperationContext,
  prepare: () => Promise<{ url: string; init: SseOptions; body?: unknown }>,
  dataKind: 'json' | 'text' = 'text'
): AsyncGenerator<ServerSentEvent<T>> {
  let lastEventId: string | undefined;
  let serverRetry: number | undefined;
  let failures = 0;
  while (true) {
    // Re-prepare each attempt so a refresh-style TokenProvider yields a fresh credential
    // on reconnect (the auth is baked into \`url\` query + \`init.headers\`). \`reconnect\`,
    // \`reconnectDelay\`, and \`signal\` come from the caller's original options unchanged.
    const { url, init, body: requestBody } = await prepare();
    const { reconnect = true, reconnectDelay, ...rest } = init;
    const signal = rest.signal ?? undefined;
    if (signal?.aborted) return;
    const headers: Record<string, string> = {
      Accept: 'text/event-stream',
      ...toHeaderRecord(rest.headers),
    };
    const sendHeaders =
      lastEventId === undefined ? headers : { ...headers, 'Last-Event-ID': lastEventId };
    try {
      const { response } = await send(
        config,
        op,
        url,
        // \`timeout: 0\` opts the stream out of a config-level timeout \u2014 an event stream
        // is long-lived by design and must not be severed after N milliseconds.
        { ...rest, method: rest.method ?? 'GET', headers: sendHeaders, timeout: 0 },
        requestBody,
        undefined,
        {}
      );
      if (!response.ok) {
        const errorBody = await readError(response);
        throw new ApiError(url, response.status, response.statusText, errorBody);
      }
      failures = 0;
      const body = response.body;
      if (!body) return;
      const reader = body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          buffer += done ? decoder.decode() : decoder.decode(value, { stream: true });
          let match: RegExpExecArray | null;
          while ((match = FRAME_DELIMITER.exec(buffer)) !== null) {
            const raw = buffer.slice(0, match.index);
            buffer = buffer.slice(match.index + match[0].length);
            const event = parseSseFrame(raw, dataKind);
            if (event) {
              if (event.id !== undefined) lastEventId = event.id;
              if (event.retry !== undefined) serverRetry = event.retry;
              yield event as ServerSentEvent<T>;
            }
          }
          if (done) {
            // Stream closed cleanly. Flush a final event that arrived without a trailing
            // delimiter, then finish \u2014 a clean end is not a dropped connection, so do not reconnect.
            const event = buffer.length > 0 ? parseSseFrame(buffer, dataKind) : undefined;
            if (event) {
              if (event.id !== undefined) lastEventId = event.id;
              if (event.retry !== undefined) serverRetry = event.retry;
              yield event as ServerSentEvent<T>;
            }
            return;
          }
          // Bound memory: a server that never sends a frame delimiter would otherwise
          // grow \`buffer\` without limit. 1 MiB is far above any real SSE frame.
          if (buffer.length > 1048576) {
            throw new SseParseError('SSE frame exceeded 1048576 characters without a delimiter');
          }
        }
      } finally {
        await reader.cancel().catch(() => undefined);
      }
    } catch (error) {
      if (signal?.aborted) return;
      // A non-OK HTTP response (4xx/5xx) or an unparseable JSON payload is a definitive
      // error, not a transient drop \u2014 surface it instead of reconnecting in a loop (a
      // stable bad payload would otherwise reconnect forever).
      if (error instanceof ApiError || error instanceof SseParseError) throw error;
      // A transport failure (connect/DNS/reset) when opening the request, or a mid-stream
      // read error, is a dropped connection: fall through to backoff/reconnect when enabled.
      if (!reconnect) throw error;
    }
    // Only the swallowed-drop path reaches here: reconnect is on and the signal not aborted.
    failures++;
    const base = serverRetry ?? reconnectDelay ?? 1000;
    const delay = Math.min(base * Math.pow(2, failures - 1), 30_000);
    try {
      await sleep(Math.random() * delay, signal);
    } catch {
      return; // sleep rejects only on abort \u2014 end the iterator cleanly
    }
  }
}

/** Parse one raw SSE frame (its lines) into an event; returns undefined for comment-only frames. */
function parseSseFrame(
  raw: string,
  dataKind: 'json' | 'text'
): ServerSentEvent<unknown> | undefined {
  let event: string | undefined;
  const dataLines: string[] = [];
  let id: string | undefined;
  let retry: number | undefined;
  let sawField = false;
  for (const line of raw.split(/\\r\\n|\\n|\\r/)) {
    if (line === '' || line.startsWith(':')) continue;
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let val = colon === -1 ? '' : line.slice(colon + 1);
    if (val.startsWith(' ')) val = val.slice(1);
    sawField = true;
    if (field === 'event') event = val;
    else if (field === 'data') dataLines.push(val);
    else if (field === 'id') id = val;
    else if (field === 'retry') {
      // ASCII digits only, per the EventSource spec \u2014 anything else is ignored
      // (\`Number('')\` is 0 and would zero the reconnect backoff).
      if (/^\\d+$/.test(val)) retry = Number(val);
    }
  }
  if (!sawField) return undefined;
  const dataText = dataLines.join('\\n');
  let data: unknown = dataText;
  if (dataKind === 'json' && dataText !== '') {
    try {
      data = JSON.parse(dataText);
    } catch (error) {
      throw new SseParseError(
        \`Failed to parse SSE event data as JSON: \${error instanceof Error ? error.message : String(error)}\`
      );
    }
  }
  return { event, data, id, retry };
}`,"create-client.ts":`/**
 * The optional behaviors \`createClientCore\` can dispatch to but never statically
 * imports. The package's public \`createClient\` wires the full set; the future
 * inline-mode assembler wires only the capabilities a spec needs.
 */
type Capabilities = SendCapabilities & {
  resolveAuth?: (
    security: readonly (readonly SecuritySpec[])[],
    config: ClientConfig
  ) => Promise<{ headers: Record<string, string>; query: Record<string, string> }>;
  sse?: (
    config: ClientConfig,
    op: OperationContext,
    // Re-preparing per (re)connect (not a frozen url/init) lets a refresh-style
    // TokenProvider issue a fresh credential after a dropped stream reconnects.
    prepare: () => Promise<{ url: string; init: SseOptions }>,
    dataKind: 'json' | 'text'
  ) => AsyncGenerator<ServerSentEvent<unknown>>;
  paginate?: {
    pages: (
      call: (args?: OperationArgs, init?: RequestOptions) => Promise<unknown>,
      spec: PaginationSpec,
      args?: OperationArgs,
      init?: RequestOptions
    ) => AsyncGenerator<unknown>;
    items: (
      call: (args?: OperationArgs, init?: RequestOptions) => Promise<unknown>,
      spec: PaginationSpec,
      args?: OperationArgs,
      init?: RequestOptions
    ) => AsyncGenerator<unknown>;
    // The \`link\`-style iterators need the raw \`Link\` header + page URL, which the
    // parsed-page call above cannot carry (the shape mirrors paginate's \`LinkPageCall\`).
    pagesByLink: (
      call: (
        args?: OperationArgs,
        init?: RequestOptions
      ) => Promise<{ page: unknown; linkHeader: string | null; url: string }>,
      args?: OperationArgs,
      init?: RequestOptions
    ) => AsyncGenerator<unknown>;
    itemsByLink: (
      call: (
        args?: OperationArgs,
        init?: RequestOptions
      ) => Promise<{ page: unknown; linkHeader: string | null; url: string }>,
      spec: PaginationSpec,
      args?: OperationArgs,
      init?: RequestOptions
    ) => AsyncGenerator<unknown>;
  };
};

/**
 * One call's inputs, namespaced by transport layer. \`argsStyle: 'flat'\` clients accept the
 * merged form instead (every parameter and body property at one level) \u2014 \`namespaceArgs\`
 * converts it to this shape before anything downstream reads it.
 */
type OperationArgs = {
  path?: Record<string, unknown>;
  query?: Record<string, QueryValue>;
  body?: unknown;
  headers?: Record<string, unknown>;
  cookies?: Record<string, unknown>;
} & Record<string, unknown>;

/** The five layer keys, and the only top-level keys a namespaced call may carry. */
const LAYERS: readonly string[] = ['path', 'query', 'body', 'headers', 'cookies'];

/** Where a declared parameter's \`in\` value puts it. */
const LAYER_OF: Record<string, 'path' | 'query' | 'headers' | 'cookies'> = {
  path: 'path',
  query: 'query',
  header: 'headers',
  cookie: 'cookies',
};

/**
 * Merged (\`argsStyle: 'flat'\`) args \u2192 the namespaced shape. A key that names a declared
 * parameter goes to that parameter's layer; anything else is a property of the request
 * body, which is how a flat call spells an object body. \`body\` stays reserved for the
 * operations a flat call cannot merge (an array, a scalar, or a binary body).
 */
function namespaceArgs(op: OperationDescriptor, args: OperationArgs): OperationArgs {
  const layers: Record<string, Record<string, unknown>> = {};
  let body: unknown;
  let properties: Record<string, unknown> | undefined;
  const layerOfParam = new Map((op.params ?? []).map((param) => [param.name, param.in]));
  for (const [key, value] of Object.entries(args)) {
    const layer = LAYER_OF[layerOfParam.get(key) ?? ''];
    if (layer !== undefined) {
      (layers[layer] ??= {})[key] = value;
    } else if (key === 'body' && op.body !== undefined) {
      body = value;
    } else if (op.body !== undefined) {
      (properties ??= {})[key] = value;
    } else {
      throw new TypeError(
        \`Unknown argument "\${key}" for operation "\${op.id}": it names no declared parameter, and the operation takes no request body.\`
      );
    }
  }
  const namespaced: OperationArgs = {};
  if (layers.path) namespaced.path = layers.path;
  // The flat surface types every query value, so the collected bag is one by construction.
  if (layers.query) namespaced.query = layers.query as Record<string, QueryValue>;
  if (layers.headers) namespaced.headers = layers.headers;
  if (layers.cookies) namespaced.cookies = layers.cookies;
  if (properties !== undefined) namespaced.body = properties;
  else if (body !== undefined) namespaced.body = body;
  return namespaced;
}

/** The response reader implied by the descriptor (before any per-call \`parseAs\` override). */
/**
 * The \`Accept\` header matching how the response will be read \u2014 a blob/text operation
 * must not ask for \`application/json\` (a content-negotiating server would 406 or
 * answer with a JSON error body instead of the payload). Caller \`init.headers\` and
 * \`config.headers\` still override.
 */
function acceptFor(kind: ParseAs | 'void'): string {
  if (kind === 'text') return 'text/*';
  if (kind === 'blob' || kind === 'arrayBuffer' || kind === 'stream' || kind === 'formData') {
    return '*/*';
  }
  return 'application/json'; // json | auto | void
}

function kindFor(op: OperationDescriptor): ParseAs | 'void' {
  if (op.responseKind === 'void' || op.responseKind === 'blob' || op.responseKind === 'text') {
    return op.responseKind;
  }
  return 'auto';
}

/**
 * The call's inputs in namespaced form, converting first on a flat-style client. An
 * operation the generator marked \`argsStyle: 'grouped'\` is already namespaced \u2014 its names
 * could not be merged, so its input type never offered the flat shape.
 */
function inputOf(
  op: OperationDescriptor,
  args: OperationArgs,
  config: ClientConfig
): OperationArgs {
  const merged = config.argsStyle === 'flat' && op.argsStyle !== 'grouped';
  return merged ? namespaceArgs(op, args) : args;
}

/** Route the namespaced args to the request pieces. */
function splitArgs(op: OperationDescriptor, args: OperationArgs) {
  // An unknown layer key can only be a bug (usually flat-style args on a namespaced
  // client). TypeScript catches it, but a transpiler that skips type-checking would
  // otherwise ship a request that silently drops the value \u2014 fail the call loudly.
  for (const key of Object.keys(args)) {
    if (!LAYERS.includes(key)) {
      throw new TypeError(
        \`Unknown argument "\${key}" for operation "\${op.id}". Inputs are grouped by layer: \${LAYERS.join(', ')}.\`
      );
    }
  }
  return {
    path: args.path ?? {},
    query: args.query,
    body: args.body,
    headers: args.headers,
    cookies: args.cookies,
  };
}

/**
 * The query-serialization hints for the descriptor's query params. A spec is built only
 * when the param deviates from the OpenAPI defaults (\`form\` + \`explode: true\`, encoded),
 * and always fully resolved \u2014 so \`explode: false\` or \`allowReserved\` alone (no \`style\`)
 * are honored, and an omitted \`explode\` keeps the exploded default.
 */
function queryStyles(op: OperationDescriptor): Record<string, QueryStyle> | undefined {
  let styles: Record<string, QueryStyle> | undefined;
  for (const param of op.params ?? []) {
    if (param.in !== 'query') continue;
    const deviates =
      (param.style !== undefined && param.style !== 'form') ||
      param.explode === false ||
      param.allowReserved === true;
    if (!deviates) continue;
    styles ??= {};
    styles[param.name] = {
      style: param.style ?? 'form',
      explode: param.explode ?? true,
      allowReserved: param.allowReserved,
    };
  }
  return styles;
}

/** Stringify caller-supplied extra headers, skipping empty entries. */
function stringHeaders(headers: Record<string, unknown> | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers ?? {})) {
    if (value !== undefined && value !== null) out[key] = String(value);
  }
  return out;
}

/** Build the request pieces an attempt needs: the final URL and the merged per-call init. */
async function prepareRequest(
  config: ClientConfig,
  op: OperationDescriptor,
  args: OperationArgs,
  init: RequestOptions | SseOptions,
  caps: Capabilities
): Promise<{ url: string; init: RequestOptions; body: unknown }> {
  const { path, query, body, headers, cookies } = splitArgs(op, args);
  const authed: { headers: Record<string, string>; query: Record<string, string> } =
    op.security?.length && caps.resolveAuth
      ? await caps.resolveAuth(op.security, config)
      : { headers: {}, query: {} };
  // Cookie params join the auth-injected cookies in one \`Cookie\` header (values
  // percent-encoded, like auth cookies). Server-side only \u2014 browsers own the header.
  const cookiePairs = Object.entries(cookies ?? {})
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([cookieName, value]) => \`\${cookieName}=\${encodeURIComponent(String(value))}\`);
  if (cookiePairs.length > 0) {
    authed.headers.Cookie = [authed.headers.Cookie, ...cookiePairs].filter(Boolean).join('; ');
  }
  const fullQuery: Record<string, QueryValue> = { ...query, ...authed.query };
  const url = buildUrl(
    config.serverUrl ?? '',
    substitutePath(op.path, path),
    Object.keys(fullQuery).length > 0 ? fullQuery : undefined,
    queryStyles(op)
  );
  const mergedInit: RequestOptions = {
    ...init,
    method: op.method.toUpperCase(),
    // Precedence, lowest \u2192 highest (later spreads win): injected auth \u2192 explicit
    // header params \u2192 caller \`init.headers\` \u2014 the caller always overrides both.
    headers: {
      ...authed.headers,
      ...stringHeaders(headers),
      ...toHeaderRecord(init.headers),
    },
  };
  return { url, init: mergedInit, body };
}

/** Coerce a single declared response header value; omit when absent or unparsable. */
function coerceResponseHeader(
  raw: string | null,
  type: ResponseHeaderSpec['type']
): string | number | boolean | undefined {
  if (raw === null) return undefined;
  if (type === 'number') {
    if (raw.trim() === '') return undefined;
    const value = Number(raw);
    return Number.isFinite(value) ? value : undefined;
  }
  if (type === 'boolean') {
    const value = raw.trim().toLowerCase();
    if (value === 'true') return true;
    if (value === 'false') return false;
    return undefined;
  }
  return raw;
}

/** Build the camelCase declared-header bag for a throw-mode envelope. */
function readEnvelopeHeaders(
  response: Response,
  specs: readonly ResponseHeaderSpec[] | undefined
): Record<string, string | number | boolean> {
  const headers: Record<string, string | number | boolean> = {};
  for (const spec of specs ?? []) {
    const value = coerceResponseHeader(response.headers.get(spec.name), spec.type);
    if (value !== undefined) headers[spec.key] = value;
  }
  return headers;
}

/** One non-SSE call: send, then branch on the configured error mode. */
async function execute(
  config: ClientConfig,
  op: OperationDescriptor,
  args: OperationArgs,
  init: RequestOptions,
  caps: Capabilities
): Promise<unknown> {
  const prepared = await prepareRequest(config, op, args, init, caps);
  const opCtx: OperationContext = { id: op.id, path: op.path, tags: [...(op.tags ?? [])] };
  // \`parseAs\` / \`envelope\` are client options, not fetch RequestInit fields.
  const { parseAs, envelope, ...sendInit } = prepared.init;
  const readKind = parseAs ?? kindFor(op);
  const { response, context } = await send(
    config,
    opCtx,
    prepared.url,
    sendInit,
    prepared.body,
    op.body,
    caps,
    acceptFor(readKind)
  );
  if (config.errorMode === 'result') {
    if (!response.ok) {
      return { data: undefined, error: await readError(response), response };
    }
    return { data: await parse(response, readKind), error: undefined, response };
  }
  if (!response.ok) {
    let error: globalThis.Error = new ApiError(
      context.url,
      response.status,
      response.statusText,
      await readError(response)
    );
    // Thread the error through each middleware's onError in turn (each may replace it).
    for (const mw of middlewareChain(config)) {
      if (mw.onError) error = await mw.onError(error as ApiErrorLike, context);
    }
    throw error;
  }
  const data = await parse(response, readKind);
  if (envelope === true) {
    return {
      data,
      headers: readEnvelopeHeaders(response, op.responseHeaders),
      response,
    };
  }
  return data;
}

/** The paginate capability, or a descriptive throw when a paginated op is iterated unwired. */
function paginateCapability(caps: Capabilities, op: OperationDescriptor) {
  if (!caps.paginate) {
    throw new Error(\`Pagination capability not wired: cannot iterate operation "\${op.id}"\`);
  }
  return caps.paginate;
}

/**
 * The per-page call the iterators drive: the method itself in throw mode; in result
 * mode a wrapper that unwraps the \`{ data, error, response }\` envelope \u2014 the page
 * pointers are data-rooted \u2014 rethrowing a failed page as \`ApiError\` (iteration is
 * error-mode-agnostic; the throw-mode-only \`onError\` middleware hook is not invoked).
 */
function pageCall(
  method: (args?: OperationArgs, init?: RequestOptions) => Promise<unknown>,
  config: ClientConfig
) {
  const callWithoutEnvelope = (args?: OperationArgs, init?: RequestOptions) => {
    if (!init || init.envelope === undefined) return method(args, init);
    const { envelope: _envelope, ...pageInit } = init;
    return method(args, pageInit);
  };
  if (config.errorMode !== 'result') return callWithoutEnvelope;
  return async (args?: OperationArgs, init?: RequestOptions) => {
    const envelope = (await callWithoutEnvelope(args, init)) as {
      data: unknown;
      error: unknown;
      response: Response;
    };
    // Failure is \`!response.ok\` \u2014 NOT \`data === undefined\`: a successful bodyless page
    // (204/void) also parses to undefined data, and a failed page's \`error\` can be
    // undefined too (unreadable body). The pointers then miss on the undefined data
    // and iteration stops cleanly, which is the correct semantics for an empty page.
    if (!envelope.response.ok) {
      const { response } = envelope;
      throw new ApiError(response.url, response.status, response.statusText, envelope.error);
    }
    return envelope.data;
  };
}

/**
 * The per-page call the \`link\`-style iterators drive: like \`execute\`, but returning the
 * parsed page together with the raw \`Link\` header and the page's own URL (for resolving
 * a relative \`rel="next"\` target). Error-mode-agnostic like all iteration: a failed
 * page throws \`ApiError\` even on result-mode clients.
 */
function linkPageCall(config: ClientConfig, op: OperationDescriptor, caps: Capabilities) {
  return async (args: OperationArgs = {}, init: RequestOptions = {}) => {
    const prepared = await prepareRequest(config, op, args, init, caps);
    const { parseAs, envelope: _envelope, ...sendInit } = prepared.init;
    const readKind = parseAs ?? kindFor(op);
    const opCtx: OperationContext = { id: op.id, path: op.path, tags: [...(op.tags ?? [])] };
    const { response } = await send(
      config,
      opCtx,
      prepared.url,
      sendInit,
      prepared.body,
      op.body,
      caps,
      acceptFor(readKind)
    );
    if (!response.ok) {
      throw new ApiError(
        prepared.url,
        response.status,
        response.statusText,
        await readError(response)
      );
    }
    return {
      page: await parse(response, readKind),
      linkHeader: response.headers.get('link'),
      // Some \`Response\` implementations leave \`url\` empty (mocks, constructed responses).
      url: response.url === '' ? prepared.url : response.url,
    };
  };
}

/**
 * Build a typed instance client over operation descriptors: one real bound method per
 * operation (attached by a construction-time loop \u2014 no Proxy), plus the core members
 * (\`configure\`/\`use\`/\`auth\`), which are assigned AFTER the loop so they win any name
 * collision with an operation. All behavior dispatches through the capability seam.
 */
function createClientCore<
  Ops extends OpsShape,
  Id extends string = string,
  Path extends string = string,
  Tag extends string = string,
>(
  operations: Record<string, OperationDescriptor>,
  initial: ClientConfig<OperationContext<Id, Path, Tag>> = {},
  caps: Capabilities = {}
): Client<Ops, OperationContext<Id, Path, Tag>> {
  // The literal-union narrowing is a compile-time DX contract only; internally the
  // runtime works with the base (string-typed) context. One cast at this boundary \u2014
  // \`ClientConfig<Narrow>\` is not assignable to \`ClientConfig\` (middleware ctx
  // params are contravariant).
  const given = initial as ClientConfig;
  // Private mutable config; the middleware array is copied so \`use()\` never mutates the caller's.
  const config: ClientConfig = { ...given, middleware: [...(given.middleware ?? [])] };
  const client = {} as Record<string, unknown>;

  for (const [name, op] of Object.entries(operations)) {
    if (op.responseKind === 'sse') {
      const method = (given: OperationArgs = {}, init: SseOptions = {}) => {
        const args = inputOf(op, given, config);
        if (!caps.sse) {
          throw new Error(\`SSE capability not wired: cannot stream operation "\${op.id}"\`);
        }
        const stream = caps.sse;
        return (async function* () {
          const opCtx: OperationContext = { id: op.id, path: op.path, tags: [...(op.tags ?? [])] };
          // A thunk the stream re-runs on every (re)connect, so auth (which \`prepareRequest\`
          // resolves) is refreshed per attempt rather than frozen at the first connect.
          const prepare = async () => {
            const prepared = await prepareRequest(config, op, args, init, caps);
            return { url: prepared.url, init: prepared.init as SseOptions, body: prepared.body };
          };
          yield* stream(config, opCtx, prepare, op.sseDataKind ?? 'text');
        })();
      };
      // Consumers key off the function reference (cache keys, \`OPERATIONS[fn.name]\`), so
      // each closure carries its operationId instead of an inferred binding name.
      // \`operationId\` is the explicit, minification-proof form of the same identity
      // (the SPEC operationId \u2014 \`name\` is the emitted key, which a collision may rename).
      Object.defineProperty(method, 'name', { value: name });
      Object.defineProperty(method, 'operationId', { value: op.id });
      client[name] = method;
    } else {
      // \`raw\` takes namespaced args; \`method\` is the public entry that accepts whichever
      // style the client was generated with. The iterators namespace once and then drive
      // \`raw\`, so a flat call is never converted twice.
      const raw = (args: OperationArgs = {}, init: RequestOptions = {}) =>
        execute(config, op, args, init, caps);
      const method = (args: OperationArgs = {}, init: RequestOptions = {}) =>
        raw(inputOf(op, args, config), init);
      Object.defineProperty(method, 'name', { value: name });
      Object.defineProperty(method, 'operationId', { value: op.id });
      const spec = op.pagination;
      // Paginated ops keep their one-shot call and gain \`.pages\`/\`.items\`, dispatching
      // through the capability seam (like SSE: absent capability throws descriptively).
      // Iteration is error-mode-agnostic: the iterators' pointers are data-rooted, so on
      // a result-mode client (\`errorMode\` is fixed at construction \u2014 \`configure()\`
      // ignores it) each page's envelope is unwrapped before it reaches the capability.
      // A failed page aborts iteration by throwing ApiError, even on result-mode
      // clients; the \`onError\` middleware hook (throw-mode-only) is not invoked.
      client[name] =
        spec === undefined
          ? method
          : spec.style === 'link'
            ? Object.assign(method, {
                pages: (args?: OperationArgs, init?: RequestOptions) =>
                  paginateCapability(caps, op).pagesByLink(
                    linkPageCall(config, op, caps),
                    inputOf(op, args ?? {}, config),
                    init
                  ),
                items: (args?: OperationArgs, init?: RequestOptions) =>
                  paginateCapability(caps, op).itemsByLink(
                    linkPageCall(config, op, caps),
                    spec,
                    inputOf(op, args ?? {}, config),
                    init
                  ),
              })
            : Object.assign(method, {
                pages: (args?: OperationArgs, init?: RequestOptions) =>
                  paginateCapability(caps, op).pages(
                    pageCall(raw, config),
                    spec,
                    inputOf(op, args ?? {}, config),
                    init
                  ),
                items: (args?: OperationArgs, init?: RequestOptions) =>
                  paginateCapability(caps, op).items(
                    pageCall(raw, config),
                    spec,
                    inputOf(op, args ?? {}, config),
                    init
                  ),
              });
    }
  }

  // Core members are assigned AFTER the operation loop \u2014 they win over colliding op names.
  client.configure = (next: ClientConfig): void => {
    // \`errorMode\` and \`argsStyle\` are fixed at generate time (they shape the static types);
    // flipping either at runtime would silently desync the calls from \`Client<Ops>\`, so both
    // are ignored here.
    const { errorMode: _fixedMode, argsStyle: _fixedStyle, auth, ...rest } = next;
    Object.assign(config, rest);
    // \`auth\` merges into existing credentials (like the \`auth.*\` setters) rather than
    // replacing wholesale \u2014 so \`configure({ auth: { bearer } })\` keeps a previously set
    // basic/apiKey. \`apiKey\` merges per scheme.
    if (auth) {
      config.auth = {
        ...config.auth,
        ...auth,
        ...(auth.apiKey ? { apiKey: { ...config.auth?.apiKey, ...auth.apiKey } } : {}),
      };
    }
  };
  client.use = (...middleware: Middleware[]): void => {
    // Reassign (don't push) so a caller-provided \`middleware\` array isn't mutated.
    config.middleware = [...(config.middleware ?? []), ...middleware];
  };
  client.auth = {
    bearer(token: TokenProvider): void {
      config.auth = { ...config.auth, bearer: token };
    },
    basic(username: string, password: string): void {
      config.auth = { ...config.auth, basic: { username, password } };
    },
    apiKey(scheme: string, value: TokenProvider): void {
      config.auth = { ...config.auth, apiKey: { ...config.auth?.apiKey, [scheme]: value } };
    },
  };

  return client as Client<Ops, OperationContext<Id, Path, Tag>>;
}`,"paginate.ts":`/**
 * Auto-pagination (capability module \u2014 wired into \`createClient\`, dispatched by the
 * method's \`.pages()\`/\`.items()\`): walk an operation's pages by advancing the descriptor's
 * \`param\` query parameter, per its \`style\`. The caller's args are never mutated \u2014 each
 * request gets a fresh \`query\` clone \u2014 and \`init\` is forwarded to every call.
 *
 * Iteration is error-mode-agnostic: \`call\` always resolves to the RAW page (on a
 * result-mode client the attachment unwraps the envelope first), so a failed page
 * aborts iteration by throwing \`ApiError\`, even on result-mode clients; the \`onError\`
 * middleware hook (throw-mode-only) is not invoked.
 */

/**
 * Resolve an RFC 6901 JSON pointer (\`~1\` \u2192 \`/\`, \`~0\` \u2192 \`~\`) against a value.
 * The empty pointer is the whole document; anything else must start with \`/\`.
 * Returns \`undefined\` on any miss (bad token, absent key, non-object step) \u2014 never throws.
 */
function resolvePointer(value: unknown, pointer: string): unknown {
  if (pointer === '') return value;
  if (!pointer.startsWith('/')) return undefined;
  let current = value;
  for (const token of pointer.slice(1).split('/')) {
    const key = token.replaceAll('~1', '/').replaceAll('~0', '~');
    if (Array.isArray(current)) {
      if (!/^(0|[1-9]\\d*)$/.test(key)) return undefined;
      current = current[Number(key)];
    } else if (Object(current) === current && key in (current as object)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return undefined;
    }
  }
  return current;
}

/**
 * Iterate an operation's full page results. Every page is yielded before the stop
 * condition is evaluated, so the last page always arrives. Cursor style resumes from a
 * caller-provided \`query[spec.param]\`, stops when the optional \`hasMore\` pointer
 * resolves to \`false\` or when \`nextCursor\` resolves to \`undefined\`/\`null\`/\`''\`, and
 * throws if the next cursor is not a string or number, or
 * if the same cursor comes back twice in a row (infinite-loop guards). Offset/page
 * styles advance by item count / by one and stop when
 * the \`items\` pointer misses or the array is empty.
 */
async function* pages<TPage>(
  call: (args?: OperationArgs, init?: RequestOptions) => Promise<TPage>,
  spec: PaginationSpec,
  args: OperationArgs = {},
  init?: RequestOptions
): AsyncGenerator<TPage> {
  if (spec.style === 'cursor') {
    let cursor: unknown = args.query?.[spec.param];
    while (true) {
      const query = { ...args.query };
      if (cursor !== undefined) query[spec.param] = cursor as QueryValue;
      const page = await call({ ...args, query }, init);
      yield page;
      // Connection-style APIs keep a non-null cursor on the last page and signal the
      // end via a boolean flag \u2014 honor it before the cursor check to skip the
      // follow-up empty request. Strictly \`false\`: a missing pointer falls through.
      if (spec.hasMore !== undefined && resolvePointer(page, spec.hasMore) === false) return;
      const next = resolvePointer(page, spec.nextCursor);
      if (next === undefined || next === null || next === '') return;
      if (typeof next !== 'string' && typeof next !== 'number') {
        // A fresh non-scalar cursor never compares equal, so without this guard a lying
        // server would slip past the did-not-advance check into an infinite loop.
        throw new Error(\`Pagination cursor at \${spec.nextCursor} is not a string or number\`);
      }
      if (next === cursor) {
        throw new Error('Pagination did not advance: operation returned the same cursor twice');
      }
      cursor = next;
    }
  } else if (spec.style === 'link') {
    // \`link\` iteration needs the response's \`Link\` header, which the parsed-page \`call\`
    // cannot carry \u2014 the client wires those operations to \`pagesByLink\` instead.
    throw new Error('link-style pagination iterates via pagesByLink');
  } else {
    // Coerce the starting position to a number: a caller may pass \`query[spec.param]\` as a
    // string (common from URL/form input), and \`+=\` on a string would concatenate. \`null\`
    // and \`''\` count as absent \u2014 \`Number\` would turn them into 0, but a one-shot call
    // omits the param for those values, so the iterator must not start at position 0.
    const start = args.query?.[spec.param];
    const fallback = spec.style === 'page' ? 1 : 0;
    const absent = start === undefined || start === null || start === '';
    let position = absent || Number.isNaN(Number(start)) ? fallback : Number(start);
    let previousItems: string | undefined;
    while (true) {
      const page = await call({ ...args, query: { ...args.query, [spec.param]: position } }, init);
      const pageItems = resolvePointer(page, spec.items);
      // Some APIs clamp a past-the-end offset/page to the last non-empty page instead
      // of returning an empty one \u2014 the repeated page would otherwise loop forever
      // (the position always "advances", so a cursor-style token check can't catch it).
      const serialized = Array.isArray(pageItems) ? JSON.stringify(pageItems) : undefined;
      if (serialized !== undefined && serialized === previousItems) {
        throw new Error('Pagination did not advance: the operation returned the same page twice');
      }
      yield page;
      if (!Array.isArray(pageItems) || pageItems.length === 0) return;
      previousItems = serialized;
      position += spec.style === 'page' ? 1 : pageItems.length;
    }
  }
}

/**
 * Iterate the operation's individual items: each page's \`items\` pointer, flattened.
 * A cursor-style page whose pointer misses yields nothing but pagination continues;
 * for offset/page styles a miss has already stopped \`pages\`.
 */
async function* items<TItem>(
  call: (args?: OperationArgs, init?: RequestOptions) => Promise<unknown>,
  spec: PaginationSpec,
  args?: OperationArgs,
  init?: RequestOptions
): AsyncGenerator<TItem> {
  for await (const page of pages(call, spec, args, init)) {
    const pageItems = resolvePointer(page, spec.items);
    if (Array.isArray(pageItems)) yield* pageItems as TItem[];
  }
}

/**
 * The per-page call the \`link\`-style iterators drive: the parsed page plus the raw
 * \`Link\` header and the page's own URL (for resolving a relative \`next\` target).
 */
type LinkPageCall = (
  args?: OperationArgs,
  init?: RequestOptions
) => Promise<{ page: unknown; linkHeader: string | null; url: string }>;

/** The \`rel="next"\` target of an RFC 8288 \`Link\` header, or \`undefined\` when absent. */
function linkNext(header: string | null): string | undefined {
  if (header === null) return undefined;
  // Entries are \`<url>; rel="next"\`, comma-separated; the URL is inside \`<>\`, so split
  // on commas that precede a \`<\` and a comma inside a target cannot break an entry.
  for (const entry of header.split(/,\\s*(?=<)/)) {
    const target = /^\\s*<([^>]*)>(.*)$/.exec(entry);
    if (!target) continue;
    const rel = /;\\s*rel\\s*=\\s*"?([^";]+)"?/i.exec(target[2]);
    // \`rel\` may carry several space-separated relation types (RFC 8288 \xA73.3).
    if (rel && rel[1].split(/\\s+/).includes('next')) return target[1];
  }
  return undefined;
}

/**
 * Iterate a \`link\`-style operation's pages: follow the \`Link\` header's \`rel="next"\`
 * target by merging ITS query params into the next call \u2014 every page goes through the
 * same declared endpoint, so auth, middleware, and \`serverUrl\` handling apply
 * unchanged, and credentials can never be handed to a cross-origin \`next\` URL.
 * Stops when no \`rel="next"\` is present; throws when the link does not advance
 * (the same target twice, or a self-link \u2014 an infinite-loop guard).
 */
async function* pagesByLink<TPage>(
  call: LinkPageCall,
  args: OperationArgs = {},
  init?: RequestOptions
): AsyncGenerator<TPage> {
  let query = args.query;
  let previous: string | undefined;
  while (true) {
    const { page, linkHeader, url } = await call({ ...args, query }, init);
    yield page as TPage;
    const target = linkNext(linkHeader);
    if (target === undefined) return;
    // A relative target resolves against the page's own URL (RFC 8288 \xA73.1) \u2014 which may
    // itself be relative (relative \`serverUrl\`, mocked fetch), so both resolve against a
    // placeholder origin. It never reaches the wire: only the target's query params
    // carry into the next call.
    const pageUrl = new URL(url, 'http://relative.invalid');
    const next = new URL(target, pageUrl).toString();
    if (next === previous || next === pageUrl.toString()) {
      throw new Error('Pagination did not advance: the Link rel="next" target repeats');
    }
    previous = next;
    // A repeated key (\`?tag=a&tag=b\`) folds into an array \u2014 the query serializer
    // expands arrays back into repeated pairs.
    const linkParams: Record<string, string | string[]> = {};
    for (const [key, value] of new URL(next).searchParams) {
      const seen = linkParams[key];
      if (seen === undefined) linkParams[key] = value;
      else if (Array.isArray(seen)) seen.push(value);
      else linkParams[key] = [seen, value];
    }
    query = { ...args.query, ...linkParams };
  }
}

/** Iterate a \`link\`-style operation's individual items: each page's \`items\` pointer, flattened. */
async function* itemsByLink<TItem>(
  call: LinkPageCall,
  spec: PaginationSpec,
  args?: OperationArgs,
  init?: RequestOptions
): AsyncGenerator<TItem> {
  for await (const page of pagesByLink(call, args, init)) {
    const pageItems = resolvePointer(page, spec.items);
    if (Array.isArray(pageItems)) yield* pageItems as TItem[];
  }
}`,"cli.ts":`// The generated-CLI engine: a pure argv parser plus a dispatcher that drives the
// instance client and maps outcomes to the documented exit-code contract
// (0 success, 1 API error, 2 auth, 3 validation, 4 usage). Node-only by nature,
// but every effect (env, stdin, files, output) is injected through the wiring so
// the module itself stays dependency-free and fully unit-testable; the emitted
// entry fills the defaults with real \`node:fs\`/\`process\` bindings.

/** One flag derived from a query parameter. */
type CliFlag = {
  /** Kebab-cased flag name (\`--page-size\`). */
  name: string;
  /** Original wire parameter name. */
  param: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  enum?: string[];
  description?: string;
};

/** One executable command, derived from the IR at generate time. Pure data. */
type CliCommand = {
  /** Tag; absent = flat/untagged. */
  group?: string;
  name: string;
  summary?: string;
  method: string;
  path: string;
  /** Path params, in path-template order. Always required \u2014 that is what a path is. */
  positionals: Array<{
    name: string;
    type?: CliFlag['type'];
    description?: string;
  }>;
  flags: CliFlag[];
  /**
   * Present when the operation takes a JSON request body. \`merged\` marks a body whose own
   * properties a flat-style call spells at the top level (the generator decides this from
   * the schema, so the CLI and the client can never disagree).
   */
  body?: { required: boolean; merged?: boolean };
  /**
   * The content type of a request body that is NOT JSON (multipart, url-encoded, binary).
   * \`--json\` cannot build one, so the command is reported as library-only rather than
   * offered as if it were runnable.
   */
  unsupportedBody?: string;
  paginated?: boolean;
  /** \`'grouped'\` marks a command whose client method takes namespaced inputs even on a
   * flat-style client, because its merged names would collide. */
  argsStyle?: 'grouped';
  sse?: boolean;
  blob?: boolean;
  /** IR schemas for the \`schema\` command, serialized verbatim. */
  schemas?: { request?: unknown; response?: unknown };
};

type CliAuthScheme = { key: string; kind: 'bearer' | 'basic' | 'apiKey' };

type CliWiring = {
  /** The name the CLI is invoked as, for help output only. The generated entry reads it
   * from \`process.argv[1]\`, so help never names a command that is not installed. */
  name: string;
  /** Credential variable prefix, constant-cased: \`CAFE\` gives \`CAFE_TOKEN\`. Fixed at
   * generation from the output file name, so renaming the binary keeps the variables
   * a published CLI already documents. A composed entry sets one per api alias. */
  envPrefix: string;
  /** The generated instance client. */
  client: Record<string, unknown>;
  /** How that client takes its inputs. Defaults to \`'grouped'\`, the generated default. */
  argsStyle?: 'grouped' | 'flat';
  configure: (config: Record<string, unknown>) => void;
  /** Security schemes of the API \u2014 drives env-var credential resolution. */
  schemes?: CliAuthScheme[];
  env?: Record<string, string | undefined>;
  stdin?: () => string;
  readFile?: (path: string) => string;
  writeFile?: (path: string, data: Uint8Array) => void;
  stdout: (line: string) => void;
  stderr: (line: string) => void;
};

type CliGlobals = {
  serverUrl?: string;
  format?: 'json' | 'ndjson';
  dryRun?: boolean;
  pageAll?: boolean;
  output?: string;
  token?: string;
  json?: string;
};

type CliInvocation =
  | { kind: 'help'; topic?: CliCommand | string }
  | { kind: 'schema'; command: CliCommand }
  | {
      kind: 'run';
      command: CliCommand;
      positionals: Record<string, string>;
      params: Record<string, unknown>;
      globals: CliGlobals;
    }
  | { kind: 'usage-error'; message: string };

/**
 * A hand-written command composed NEXT TO the generated ones: the same data shape plus a
 * \`handler\`, so it inherits help, parsing, \`schema\`, and the exit-code contract. This is
 * how behavior that is not in the description (a \`login\`, a doctor command) joins the
 * binary without the generator ever learning what it does.
 */
type CustomCommand = {
  name: string;
  group?: string;
  summary?: string;
  positionals?: CliCommand['positionals'];
  flags?: CliFlag[];
  /** Returns the process exit code; throwing exits 1 with the standard error JSON. */
  handler: (context: CommandContext) => number | Promise<number>;
};

type CommandContext = {
  positionals: Record<string, string>;
  params: Record<string, unknown>;
  globals: CliGlobals;
  wiring: CliWiring;
};

/** One API's contribution to a composed binary: its commands behind a namespace, with its
 * OWN wiring (base URL, schemes, credentials). A namespace-less source sits at the root. */
type CommandSource = {
  namespace?: string;
  commands: Array<CliCommand | CustomCommand>;
  /** Absent = inherit the first wired source's \u2014 a root \`login\` shares the binary's identity. */
  wiring?: CliWiring;
};

type ResolvedCommand = CliCommand & { handler?: CustomCommand['handler'] };

/** Custom commands as the command shape the parser reads; generated ones pass through. */
function normalizeCommands(commands: Array<CliCommand | CustomCommand>): ResolvedCommand[] {
  return commands.map((command) =>
    'handler' in command
      ? { method: '', path: '', positionals: [], flags: [], ...command }
      : command
  );
}

/**
 * The name of a custom command that shadows another command. Rejected at startup: an
 * operator typing an operationId must never silently run something else.
 */
function shadowedCommandName(commands: ResolvedCommand[]): string | undefined {
  const seen = new Map<string, ResolvedCommand[]>();
  for (const command of commands) {
    const key = \`\${command.group ?? ''}\\u0000\${command.name}\`;
    seen.set(key, [...(seen.get(key) ?? []), command]);
  }
  for (const clashing of seen.values()) {
    if (clashing.length > 1 && clashing.some((command) => command.handler !== undefined)) {
      return clashing[0].name;
    }
  }
  return undefined;
}

const GLOBAL_FLAGS: Record<string, { key: keyof CliGlobals; boolean?: boolean }> = {
  'server-url': { key: 'serverUrl' },
  format: { key: 'format' },
  'dry-run': { key: 'dryRun', boolean: true },
  'page-all': { key: 'pageAll', boolean: true },
  output: { key: 'output' },
  token: { key: 'token' },
  json: { key: 'json' },
};

/**
 * The name to print in help: the command the CLI was invoked as. A global install resolves
 * \`argv[1]\` to the bin itself, so its basename is exactly what the user typed. A Windows
 * \`.cmd\` shim, a \`node dist/cafe.cli.js\`, and a \`tsx client.cli.ts\` run all pass the script
 * path instead \u2014 printing that would name a command nobody can type, so a script extension
 * and the \`.cli\` marker come off: \`cafe.cli.js\` prints \`cafe\`.
 */
function invokedName(scriptPath: string | undefined, fallback: string): string {
  if (scriptPath === undefined) return fallback;
  const base = scriptPath.replace(/^.*[\\\\/]/, '');
  const withoutExtension = base.replace(/\\.(mjs|cjs|js|mts|cts|ts|cmd|bat|ps1|exe)$/i, '');
  const name = withoutExtension.replace(/\\.cli$/i, '');
  return name === '' ? fallback : name;
}

/**
 * The shell-typable form of a group name: an OpenAPI tag can contain spaces ("Some
 * multi-word tag"), which only resolves if the user quotes it. Commands are addressed by
 * this slug; help still shows the original tag.
 */
function groupSlug(group: string): string {
  return group
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-');
}

/** A description on ONE line: newlines in an OpenAPI description wreck help alignment. */
function oneLine(text: string): string {
  return text.replace(/\\s+/g, ' ').trim();
}

/**
 * The parsed argv as one call input, in the style the wired client takes: grouped by layer
 * (the default) or merged into one object.
 */
function callInputs(
  command: CliCommand,
  positionals: Record<string, string>,
  params: Record<string, unknown>,
  body: unknown,
  argsStyle: CliWiring['argsStyle']
): Record<string, unknown> | undefined {
  const inputs: Record<string, unknown> = {};
  // A command the generator marked \`grouped\` keeps the namespaced shape even here.
  if (argsStyle === 'flat' && command.argsStyle !== 'grouped') {
    Object.assign(inputs, positionals, params);
    if (body !== undefined) {
      if (command.body?.merged === true) Object.assign(inputs, body as Record<string, unknown>);
      else inputs.body = body;
    }
  } else {
    if (Object.keys(positionals).length > 0) inputs.path = positionals;
    if (Object.keys(params).length > 0) inputs.query = params;
    if (body !== undefined) inputs.body = body;
  }
  return Object.keys(inputs).length > 0 ? inputs : undefined;
}

/** Resolve argv against the command table. Pure \u2014 no I/O, no env. */
function parseInvocation(commands: CliCommand[], argv: string[]): CliInvocation {
  if (argv.length === 0 || argv[0] === '--help') return { kind: 'help' };

  if (argv[0] === 'schema') {
    const command = commands.find((candidate) => candidate.name === argv[1]);
    return command
      ? { kind: 'schema', command }
      : { kind: 'usage-error', message: \`Unknown command: schema \${argv[1] ?? ''}\`.trim() };
  }

  const slugs = new Set(commands.filter((c) => c.group).map((c) => groupSlug(c.group as string)));
  // An untagged operation is only ever addressed by its bare name, so when that name is also
  // a group slug the name wins \u2014 reading it as the group would leave the command unreachable.
  // A tagged operation in the same position keeps yielding to group help: it is still
  // reachable as \`<its group> <name>\`.
  const untagged = commands.some((c) => c.group === undefined && c.name === argv[0]);
  let command: CliCommand | undefined;
  let rest: string[];
  if (!untagged && slugs.has(argv[0])) {
    if (argv[1] === '--help' || argv[1] === undefined) return { kind: 'help', topic: argv[0] };
    command = commands.find((c) => c.group && groupSlug(c.group) === argv[0] && c.name === argv[1]);
    if (!command) return { kind: 'usage-error', message: \`Unknown command: \${argv[0]} \${argv[1]}\` };
    rest = argv.slice(2);
  } else {
    // An ungrouped command, or a bare operationId \u2014 knowing the group shouldn't be
    // required when the name alone is unambiguous.
    const named = commands.filter((c) => c.name === argv[0]);
    command =
      named.find((c) => c.group === undefined) ?? (named.length === 1 ? named[0] : undefined);
    if (!command) {
      const ambiguous = named.length > 1;
      return {
        kind: 'usage-error',
        message: ambiguous
          ? \`Ambiguous command: \${argv[0]} \u2014 prefix it with its group (\${named
              .map((c) => groupSlug(c.group as string))
              .join(', ')})\`
          : \`Unknown command: \${argv[0]}\`,
      };
    }
    rest = argv.slice(1);
  }
  if (rest.includes('--help')) return { kind: 'help', topic: command };

  const positionals: Record<string, string> = {};
  const params: Record<string, unknown> = {};
  const globals: CliGlobals = {};
  let positionalIndex = 0;
  for (let index = 0; index < rest.length; index++) {
    const token = rest[index];
    if (!token.startsWith('--')) {
      const slot = command.positionals[positionalIndex++];
      if (!slot) return { kind: 'usage-error', message: \`Unexpected argument: \${token}\` };
      positionals[slot.name] = token;
      continue;
    }
    const equals = token.indexOf('=');
    const flagName = equals === -1 ? token.slice(2) : token.slice(2, equals);
    const inlineValue = equals === -1 ? undefined : token.slice(equals + 1);
    const takeValue = (): string | undefined =>
      inlineValue !== undefined ? inlineValue : rest[++index];

    const global = GLOBAL_FLAGS[flagName];
    if (global) {
      if (global.boolean) {
        (globals[global.key] as boolean) = true;
        continue;
      }
      const value = takeValue();
      if (value === undefined) {
        return { kind: 'usage-error', message: \`Flag --\${flagName} expects a value\` };
      }
      if (global.key === 'format' && value !== 'json' && value !== 'ndjson') {
        return { kind: 'usage-error', message: \`--format must be one of: json, ndjson\` };
      }
      (globals[global.key] as string) = value;
      continue;
    }

    const flag = command.flags.find((candidate) => candidate.name === flagName);
    if (!flag) return { kind: 'usage-error', message: \`Unknown flag: --\${flagName}\` };
    if (flag.type === 'boolean') {
      params[flag.param] = true;
      continue;
    }
    const value = takeValue();
    if (value === undefined) {
      return { kind: 'usage-error', message: \`Flag --\${flagName} expects a value\` };
    }
    if (flag.enum && !flag.enum.includes(value)) {
      return {
        kind: 'usage-error',
        message: \`--\${flagName} must be one of: \${flag.enum.join(', ')}\`,
      };
    }
    if (flag.type === 'number') {
      const numeric = Number(value);
      if (Number.isNaN(numeric)) {
        return { kind: 'usage-error', message: \`--\${flagName} expects a number, got "\${value}"\` };
      }
      params[flag.param] = numeric;
    } else if (flag.type === 'array') {
      const existing = params[flag.param];
      params[flag.param] = Array.isArray(existing) ? [...existing, value] : [value];
    } else {
      params[flag.param] = value;
    }
  }

  for (const slot of command.positionals) {
    if (!(slot.name in positionals)) {
      return { kind: 'usage-error', message: \`Missing required argument: <\${slot.name}>\` };
    }
  }
  for (const flag of command.flags) {
    if (flag.required && !(flag.param in params)) {
      return { kind: 'usage-error', message: \`Missing required flag: --\${flag.name}\` };
    }
  }
  if (globals.json !== undefined && !command.body) {
    return { kind: 'usage-error', message: \`\${command.name} does not accept a request body\` };
  }
  if (command.body?.required && globals.json === undefined) {
    return {
      kind: 'usage-error',
      message: \`\${command.name} requires a request body: pass --json '<json>', --json @file.json, or --json @-\`,
    };
  }
  if (globals.pageAll && !command.paginated) {
    return {
      kind: 'usage-error',
      message: \`\${command.name} is not paginated; --page-all only applies to paginated operations\`,
    };
  }
  return { kind: 'run', command, positionals, params, globals };
}

/** \`cafe-api\` \u2192 \`CAFE_API\`: the casing of every credential variable this CLI reads. */
function constantCase(value: string): string {
  return value
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
    .toUpperCase();
}

function resolveAuth(wiring: CliWiring, token: string | undefined): Record<string, unknown> {
  const env = wiring.env ?? {};
  const prefix = wiring.envPrefix;
  const auth: Record<string, unknown> = {};
  for (const scheme of wiring.schemes ?? []) {
    if (scheme.kind === 'bearer') {
      const value = token ?? env[\`\${prefix}_TOKEN\`];
      if (value !== undefined) auth.bearer = value;
    } else if (scheme.kind === 'basic') {
      const username = env[\`\${prefix}_USERNAME\`];
      const password = env[\`\${prefix}_PASSWORD\`];
      if (username !== undefined && password !== undefined) auth.basic = { username, password };
    } else {
      const value = env[\`\${prefix}_API_KEY_\${constantCase(scheme.key)}\`];
      if (value !== undefined) {
        auth.apiKey = {
          ...(auth.apiKey as Record<string, string> | undefined),
          [scheme.key]: value,
        };
      }
    }
  }
  return auth;
}

/**
 * One command's complete contract as plain data \u2014 what \`schema <command>\` prints. It has
 * to carry the parameters: 'GET' operations have no body, so without them the output says
 * nothing a caller could act on, and the only alternative is scraping \`--help\`, which is
 * prose written for humans.
 */
function commandContract(command: CliCommand): Record<string, unknown> {
  return {
    operationId: command.name,
    ...(command.group === undefined ? {} : { group: groupSlug(command.group) }),
    ...(command.summary === undefined ? {} : { summary: oneLine(command.summary) }),
    ...(command.method === '' ? {} : { method: command.method }),
    ...(command.path === '' ? {} : { path: command.path }),
    parameters: {
      path: command.positionals.map((positional) => ({
        name: positional.name,
        type: positional.type ?? 'string',
        required: true,
        ...(positional.description === undefined
          ? {}
          : { description: oneLine(positional.description) }),
      })),
      // \`name\` is what you type (\`--max-total\`); \`param\` is the wire name it becomes.
      query: command.flags.map((flag) => ({
        name: flag.name,
        param: flag.param,
        type: flag.type,
        required: flag.required,
        ...(flag.enum === undefined ? {} : { enum: flag.enum }),
        ...(flag.description === undefined ? {} : { description: oneLine(flag.description) }),
      })),
    },
    ...(command.body === undefined ? {} : { body: command.body }),
    ...(command.unsupportedBody === undefined ? {} : { unsupportedBody: command.unsupportedBody }),
    ...(command.paginated === true ? { paginated: true } : {}),
    ...(command.sse === true ? { sse: true } : {}),
    ...(command.blob === true ? { blob: true } : {}),
    ...(command.schemas ?? {}),
  };
}

function renderHelp(
  commands: CliCommand[],
  name: string,
  schemes: CliAuthScheme[],
  prefix: string,
  topic?: CliCommand | string
): string[] {
  if (topic !== undefined && typeof topic !== 'string') {
    const command = topic;
    const usage = [
      name,
      ...(command.group ? [groupSlug(command.group)] : []),
      command.name,
      ...command.positionals.map((slot) => \`<\${slot.name}>\`),
      ...(command.flags.length > 0 ? ['[flags]'] : []),
      ...(command.body ? ["--json '<json>' | @file | @-"] : []),
    ].join(' ');
    const lines = [\`Usage: \${usage}\`];
    if (command.summary) lines.push('', command.summary);
    if (command.unsupportedBody !== undefined) {
      lines.push(
        '',
        \`This operation takes a \${command.unsupportedBody} body, which the CLI cannot build \u2014 call it through the generated client instead.\`
      );
    }
    if (command.flags.length > 0) {
      lines.push('', 'Flags:');
      for (const flag of command.flags) {
        const choices = flag.enum ? \` (one of: \${flag.enum.join(', ')})\` : '';
        const required = flag.required ? ' [required]' : '';
        lines.push(
          \`  --\${flag.name} <\${flag.type}>\${choices}\${required}  \${oneLine(flag.description ?? '')}\`.trimEnd()
        );
      }
    }
    return lines;
  }
  const scope =
    typeof topic === 'string'
      ? commands.filter((c) => c.group && groupSlug(c.group) === topic)
      : commands;
  const lines =
    typeof topic === 'string'
      ? [\`Usage: \${name} \${topic} <command> \u2026\`, '', 'Commands:']
      : [\`Usage: \${name} [group] <command> \u2026\`, '', 'Commands:'];
  const seenGroups = new Set<string>();
  const grouped = commands.some((c) => c.group);
  for (const command of scope) {
    if (typeof topic !== 'string' && command.group) {
      const slug = groupSlug(command.group);
      if (seenGroups.has(slug)) continue;
      seenGroups.add(slug);
      // The slug is what you type; the tag is what you recognize.
      const title = slug === command.group ? '' : \`  (\${command.group})\`;
      lines.push(\`  \${slug} <command>\${title}\`);
      continue;
    }
    lines.push(
      \`  \${[command.group === undefined ? undefined : groupSlug(command.group), command.name]
        .filter(Boolean)
        .join(' ')}  \${oneLine(command.summary ?? '')}\`.trimEnd()
    );
  }
  // Flags that apply to every command, and the env vars credentials come from: a flag
  // absent from --help may as well not exist \u2014 and one this API cannot use should not be
  // listed at all, since the operator would spend the debugging session on their token.
  const kinds = new Set(schemes.map((scheme) => scheme.kind));
  const credentials = [
    ...(kinds.has('bearer') ? [\`\${prefix}_TOKEN\`] : []),
    ...(kinds.has('basic') ? [\`\${prefix}_USERNAME\`, \`\${prefix}_PASSWORD\`] : []),
    ...schemes
      .filter((scheme) => scheme.kind === 'apiKey')
      .map((scheme) => \`\${prefix}_API_KEY_\${constantCase(scheme.key)}\`),
  ];
  lines.push(
    '',
    'Global flags:',
    '  --server-url <url>      Override the baked server URL',
    '  --format <json|ndjson>  Output format',
    '  --dry-run               Print the prepared request without sending it',
    '  --page-all              Follow pagination, one JSON page per line',
    '  --output <path>         Write the response body to a file (required for binary)',
    ...(kinds.has('bearer') ? ['  --token <token>         Bearer token'] : []),
    \`  --json <json|@file|@->  Request body\`,
    ...(credentials.length > 0 ? ['', 'Environment:', \`  \${credentials.join(', ')}\`] : []),
    '',
    \`Run \${name} \${grouped ? '<group> <command>' : '<command>'} --help for command details; \${name} schema <command> prints its schemas.\`
  );
  return lines;
}

function loadBody(source: string, wiring: CliWiring): unknown {
  const raw =
    source === '@-'
      ? (wiring.stdin ?? (() => ''))()
      : source.startsWith('@')
        ? (wiring.readFile ?? (() => ''))(source.slice(1))
        : source;
  return JSON.parse(raw);
}

/** Replace header values containing a known credential with \`***\`. */
function redactHeaders(headers: Record<string, string>, secrets: string[]): Record<string, string> {
  const redacted: Record<string, string> = {};
  for (const [name, value] of Object.entries(headers)) {
    redacted[name] = secrets.some((secret) => secret !== '' && value.includes(secret))
      ? '***'
      : value;
  }
  return redacted;
}

/** Parse argv, resolve env auth, dispatch through the client, print, return the exit code. */
async function runCli(
  commands: Array<CliCommand | CustomCommand>,
  wiring: CliWiring,
  argv: string[]
): Promise<number>;
/** The composed form: one binary over several sources, each namespaced with its own wiring. */
async function runCli(sources: CommandSource[], argv: string[]): Promise<number>;
async function runCli(
  commandsOrSources: Array<CliCommand | CustomCommand> | CommandSource[],
  wiringOrArgv: CliWiring | string[],
  argv?: string[]
): Promise<number> {
  if (Array.isArray(wiringOrArgv)) {
    return runSources(commandsOrSources as CommandSource[], wiringOrArgv);
  }
  return runSingle(
    commandsOrSources as Array<CliCommand | CustomCommand>,
    wiringOrArgv,
    argv ?? []
  );
}

/** Route the first token to its source; the namespace-less source owns the root. */
async function runSources(sources: CommandSource[], argv: string[]): Promise<number> {
  // A source without wiring inherits the first wired one, so the documented root-source
  // shape \`{ commands: [login] }\` works: the login shares the composed binary's identity.
  const inherited = sources.find((source) => source.wiring !== undefined)?.wiring;
  const wiringOf = (source: CommandSource): CliWiring => source.wiring ?? (inherited as CliWiring);
  // Top-level output goes through the first source: with a root source that is the one
  // carrying the shared commands, otherwise the first API listed.
  const top = wiringOf(sources[0]);
  const fail = (code: number, message: string): number => {
    top.stderr(JSON.stringify({ error: { code, message } }));
    return code;
  };
  const namespaced = sources.filter(
    (source): source is CommandSource & { namespace: string } => source.namespace !== undefined
  );
  const root = sources.find((source) => source.namespace === undefined);
  if (root !== undefined) {
    const clash = root.commands.find((command) =>
      namespaced.some((source) => source.namespace === command.name)
    );
    if (clash !== undefined) {
      return fail(
        4,
        \`Root command "\${clash.name}" collides with the "\${clash.name}" namespace \u2014 rename one of them.\`
      );
    }
  }
  if (argv.length === 0 || argv[0] === '--help') {
    for (const line of renderComposedHelp(sources, top.name)) top.stdout(line);
    return 0;
  }
  const source = namespaced.find((candidate) => candidate.namespace === argv[0]);
  if (source !== undefined) return runSingle(source.commands, wiringOf(source), argv.slice(1));
  const rootTakes =
    root !== undefined &&
    (argv[0] === 'schema' ||
      root.commands.some(
        (command) =>
          command.name === argv[0] ||
          (command.group !== undefined && groupSlug(command.group) === argv[0])
      ));
  if (rootTakes)
    return runSingle((root as CommandSource).commands, wiringOf(root as CommandSource), argv);
  return fail(
    4,
    \`Unknown command: \${argv[0]} \u2014 expected an API namespace (\${namespaced
      .map((candidate) => candidate.namespace)
      .join(', ')})\${root !== undefined ? ' or a root command' : ''}\`
  );
}

/** The composed top-level help: namespaces, root commands, and how to descend. */
function renderComposedHelp(sources: CommandSource[], name: string): string[] {
  const lines = [\`Usage: \${name} <api> <command> \u2026\`, '', 'APIs:'];
  for (const source of sources) {
    if (source.namespace !== undefined) lines.push(\`  \${source.namespace}\`);
  }
  const root = sources.find((source) => source.namespace === undefined);
  if (root !== undefined && root.commands.length > 0) {
    lines.push('', 'Commands:');
    for (const command of root.commands) {
      lines.push(\`  \${command.name}  \${oneLine(command.summary ?? '')}\`.trimEnd());
    }
  }
  lines.push('', \`Run \${name} <api> --help for that API's commands.\`);
  return lines;
}

async function runSingle(
  rawCommands: Array<CliCommand | CustomCommand>,
  wiring: CliWiring,
  argv: string[]
): Promise<number> {
  const { stdout, stderr } = wiring;
  const commands = normalizeCommands(rawCommands);
  const shadowed = shadowedCommandName(commands);
  if (shadowed !== undefined) {
    stderr(
      JSON.stringify({
        error: {
          code: 4,
          message: \`Custom command "\${shadowed}" collides with another command of the same name \u2014 rename it.\`,
        },
      })
    );
    return 4;
  }
  const fail = (code: number, error: Record<string, unknown>): number => {
    stderr(JSON.stringify({ error: { code, ...error } }));
    return code;
  };

  const invocation = parseInvocation(commands, argv);
  if (invocation.kind === 'usage-error') return fail(4, { message: invocation.message });
  if (invocation.kind === 'help') {
    for (const line of renderHelp(
      commands,
      wiring.name,
      wiring.schemes ?? [],
      wiring.envPrefix,
      invocation.topic
    ))
      stdout(line);
    return 0;
  }
  if (invocation.kind === 'schema') {
    stdout(JSON.stringify(commandContract(invocation.command), null, 2));
    return 0;
  }

  const { command, positionals, params, globals } = invocation;
  // A credential the user passed explicitly must never be dropped in silence: without a
  // bearer scheme the request would go out unauthenticated and come back 401, which reads
  // as "my token is wrong" rather than "that flag does nothing here".
  const schemes = wiring.schemes ?? [];
  if (globals.token !== undefined && !schemes.some((scheme) => scheme.kind === 'bearer')) {
    const declared = schemes.map((scheme) => \`\${scheme.key} (\${scheme.kind})\`).join(', ');
    return fail(4, {
      message:
        \`--token is a bearer credential, and this API declares no bearer scheme. \` +
        (declared === '' ? 'It declares no security schemes at all.' : \`It accepts: \${declared}.\`),
    });
  }
  if (command.blob && globals.output === undefined) {
    return fail(4, {
      message: \`\${command.name} downloads a file: pass --output <path>\`,
      operationId: command.name,
    });
  }
  let body: unknown;
  if (globals.json !== undefined) {
    try {
      body = loadBody(globals.json, wiring);
    } catch (error) {
      return fail(4, {
        message: \`Invalid --json body: \${(error as Error).message}\`,
        operationId: command.name,
      });
    }
  }

  const auth = resolveAuth(wiring, globals.token);
  if (Object.keys(auth).length > 0) wiring.configure({ auth });
  if (globals.serverUrl !== undefined) wiring.configure({ serverUrl: globals.serverUrl });

  // Redaction matches these against header VALUES \u2014 so basic auth must contribute the
  // form the wire actually carries (\`Basic \${base64(user:pass)}\`), not just the raw
  // password, which never appears in the encoded header.
  const basic = auth.basic as { username: string; password: string } | undefined;
  const secrets = [
    ...(typeof auth.bearer === 'string' ? [auth.bearer] : []),
    ...(basic ? [basic.password, btoa(\`\${basic.username}:\${basic.password}\`)] : []),
    ...Object.values((auth.apiKey as Record<string, string> | undefined) ?? {}),
  ];
  let captured: Record<string, unknown> | undefined;
  if (globals.dryRun) {
    wiring.configure({
      fetch: async (
        url: string,
        init: { method?: string; headers?: Record<string, string>; body?: unknown }
      ) => {
        captured = {
          url,
          method: init.method,
          headers: redactHeaders(init.headers ?? {}, secrets),
          ...(init.body !== undefined && init.body !== null ? { body: String(init.body) } : {}),
        };
        return new Response('{}', { status: 200, headers: { 'content-type': 'application/json' } });
      },
    });
  }

  const argument = callInputs(command, positionals, params, body, wiring.argsStyle);

  // The client's methods are typed per-operation; the dispatcher only needs "callable
  // by name", so one localized widening here keeps the emitted wiring cast-free.
  const methods = wiring.client as Record<string, unknown>;
  try {
    const resolved = command as ResolvedCommand;
    if (resolved.handler !== undefined) {
      return await resolved.handler({ positionals, params, globals, wiring });
    }
    if (globals.pageAll && !globals.dryRun) {
      const paginated = methods[command.name] as {
        pages: (variables?: unknown) => AsyncIterable<unknown>;
      };
      for await (const page of paginated.pages(argument)) stdout(JSON.stringify(page));
      return 0;
    }
    const method = methods[command.name] as (variables?: unknown) => Promise<unknown>;
    const result = await method(argument);
    if (globals.dryRun) {
      // An SSE method returns a lazy stream \u2014 drain the stubbed response so its fetch
      // actually runs and captures the request.
      if (command.sse) for await (const _event of result as AsyncIterable<unknown>);
      stdout(JSON.stringify(captured, null, 2));
      return 0;
    }
    if (command.sse) {
      for await (const event of result as AsyncIterable<unknown>) stdout(JSON.stringify(event));
      return 0;
    }
    if (command.blob) {
      const bytes = new Uint8Array(await (result as Blob).arrayBuffer());
      (wiring.writeFile ?? (() => {}))(globals.output as string, bytes);
      stdout(JSON.stringify({ saved: globals.output, bytes: bytes.length }));
      return 0;
    }
    if (result !== undefined && result !== null) stdout(JSON.stringify(result, null, 2));
    return 0;
  } catch (error) {
    const thrown = error as Error & { status?: number; issues?: unknown };
    const detail = {
      message: thrown.message,
      operationId: command.name,
      ...(thrown.status !== undefined ? { status: thrown.status } : {}),
      ...(thrown.issues !== undefined ? { issues: thrown.issues } : {}),
    };
    if (thrown.name === 'ZodValidationError') return fail(3, detail);
    if (thrown.name === 'ApiError' && (thrown.status === 401 || thrown.status === 403)) {
      return fail(2, detail);
    }
    return fail(1, detail);
  }
}`},S=["ApiError","ApiErrorLike","AuthCredentials","BodyMethod","Capabilities","CliAuthScheme","CliCommand","CliFlag","CliGlobals","CliInvocation","CliWiring","Client","ClientConfig","ClientCore","CommandContext","CommandSource","CustomCommand","Envelope","EnvelopeResult","EnvelopeResultForKnownInit","FRAME_DELIMITER","GLOBAL_FLAGS","HeadersOf","IDEMPOTENT_METHODS","LAYERS","LAYER_OF","LinkPageCall","Middleware","NoRequiredKeys","OperationArgs","OperationContext","OperationDescriptor","OperationMethodIdentity","OpsShape","PageOf","Paginated","PaginationSpec","ParamSpec","ParseAs","QueryStyle","QueryValue","RequestContext","RequestOptions","ResolvedCommand","ResponseHeaderSpec","Result","RetryConfig","RetryContext","RetryStrategy","SecuritySpec","SendCapabilities","ServerSentEvent","SseOptions","SseParseError","TRANSIENT_STATUS","ThrowMethod","TimeoutError","TokenProvider","abortError","acceptFor","buildUrl","callInputs","coerceResponseHeader","commandContract","constantCase","createClientCore","defaultRetryOn","encodeBase64","encodeReserved","execute","groupSlug","inputOf","invokedName","isConfigured","items","itemsByLink","kindFor","linkNext","linkPageCall","loadBody","mergeSetup","middlewareChain","namespaceArgs","normalizeCommands","oneLine","pageCall","pages","pagesByLink","paginateCapability","parse","parseInvocation","parseSseFrame","prepareRequest","queryStyles","readEnvelopeHeaders","readError","redactHeaders","renderComposedHelp","renderHelp","resolveAuth","resolvePointer","resolveToken","retryDelay","runCli","runSingle","runSources","send","shadowedCommandName","sleep","splitArgs","sse","stringHeaders","substitutePath","toFormData","toHeaderRecord"];var j=["client","OPERATIONS","Ops","OperationId","OperationPath","OperationTag","createClient","mergeSetup","ApiError","TimeoutError","configure","use","auth","defaultRetryOn","ClientConfig","RequestOptions","SseOptions","Middleware","OperationDescriptor","ServerSentEvent","Result","Envelope","EnvelopeResult","TokenProvider","__redoclySetup"],$=["z","http","HttpResponse","handlers","faker","queryOptions","useSWR","useSWRMutation","__Writable"],N=["AbortSignal","Array","ArrayBuffer","ArrayBufferView","AsyncGenerator","AsyncIterable","Blob","BodyInit","Boolean","DOMException","Date","Error","Extract","FormData","Headers","HeadersInit","JSON","Map","Math","NonNullable","Number","Object","Omit","Partial","Promise","ReadableStream","Record","RegExp","RegExpExecArray","Request","RequestInit","Response","Set","String","TextDecoder","TextEncoder","TypeError","Uint8Array","URL","URLSearchParams","btoa","clearTimeout","crypto","decodeURIComponent","document","encodeURIComponent","fetch","globalThis","setTimeout","undefined"],v;function Q(){return v===void 0&&(v=new Set([...j,...$,...N,...S])),v}var A={name:"@redocly/client-generator",version:"0.4.5",description:"Generate typed, zero-dependency TypeScript clients (fetch, auth, retries, middleware, SSE) from OpenAPI descriptions.",type:"module",types:"lib/index.d.ts",sideEffects:!1,exports:{".":{types:"./lib/index.d.ts",import:"./lib/index.js",default:"./lib/index.js"},"./generate":{types:"./lib/generate.d.ts",import:"./lib/generate.js",default:"./lib/generate.js"},"./printers/python":{types:"./lib/printers/python.d.ts",import:"./lib/printers/python.js",default:"./lib/printers/python.js"},"./printers/go":{types:"./lib/printers/go.d.ts",import:"./lib/printers/go.js",default:"./lib/printers/go.js"},"./printers/php":{types:"./lib/printers/php.d.ts",import:"./lib/printers/php.js",default:"./lib/printers/php.js"},"./printers/typescript":{types:"./lib/printers/typescript.d.ts",import:"./lib/printers/typescript.js",default:"./lib/printers/typescript.js"},"./printers":{types:"./lib/printers/index.d.ts",import:"./lib/printers/index.js",default:"./lib/printers/index.js"},"./contracts/typescript":{types:"./lib/contracts/typescript.d.ts",import:"./lib/contracts/typescript.js",default:"./lib/contracts/typescript.js"},"./runtime-sources":{types:"./lib/runtime-sources.d.ts",import:"./lib/runtime-sources.js",default:"./lib/runtime-sources.js"},"./package.json":"./package.json"},engines:{node:">=22.12.0 || >=20.19.0 <21.0.0",npm:">=10"},engineStrict:!0,publishConfig:{access:"public"},scripts:{"examples:regen":"node scripts/regenerate-examples.mjs",prepare:"node scripts/generate-runtime-sources.mjs && node scripts/generate-eject-assets.mjs","typecheck:examples":"node scripts/typecheck-examples.mjs"},license:"MIT",repository:{type:"git",url:"git+https://github.com/Redocly/redocly-cli.git"},homepage:"https://github.com/Redocly/redocly-cli",keywords:["OpenAPI","Swagger","TypeScript","client","generator","codegen","fetch"],contributors:["Roman Marshevskyi <roman.marshevskyy@redocly.com> (https://redocly.com/)"],dependencies:{"@redocly/openapi-core":"2.51.1"},peerDependencies:{typescript:">=5.5.0"},peerDependenciesMeta:{typescript:{optional:!0}},devDependencies:{typescript:"6.0.2"},files:["lib","eject-assets"]};var ee=A.version;function T(e){let n=/^(\d+)\.(\d+)\.(\d+)(?:[-+].*)?$/.exec(e.trim());return n===null?void 0:[Number(n[1]),Number(n[2]),Number(n[3])]}function w(e,n){return e[0]-n[0]||e[1]-n[1]||e[2]-n[2]}function ne(e,n){let s=/^[\^~]|^>=/.exec(n.trim())?.[0]??"",r=T(n.trim().slice(s.length)),a=T(e);if(!(r===void 0||a===void 0))return w(a,r)<0?!1:s===">="?!0:s===""?w(a,r)===0:s==="~"?a[0]===r[0]&&a[1]===r[1]:r[0]!==0?a[0]===r[0]:r[1]!==0?a[0]===0&&a[1]===r[1]:w(a,r)===0}export{O as a,H as b,G as c,W as d,j as e,Q as f,A as g,ee as h,ne as i};
