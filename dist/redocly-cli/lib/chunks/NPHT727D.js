import { createRequire as __createRequire } from 'node:module';
const require = __createRequire(import.meta.url);
import {
  ValidationSession,
  createNormalizedExchange,
  isJsonMime,
  loadOpenApiIndex,
  normalizeFsPath,
  parseCsv,
  renderReport
} from "./AAQTUNZI.js";
import {
  AbortFlowError,
  exitWithError
} from "./FL4Q7PMA.js";
import {
  require_undici
} from "./XB6C62FW.js";
import {
  isPlainObject,
  logger
} from "./MIPR6NCD.js";
import "./Z2I5YXYN.js";
import {
  __toESM
} from "./5ILQMFXK.js";

// src/commands/proxy/har-writer.ts
import { createReadStream, createWriteStream, existsSync } from "node:fs";
import { appendFile, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { createInterface } from "node:readline";
var HarWriter = class {
  outputPath;
  entriesPath;
  creatorVersion;
  writeChain = Promise.resolve();
  directoryEnsured = false;
  started = false;
  count = 0;
  constructor(outputPath, creatorVersion) {
    this.outputPath = path.resolve(process.cwd(), outputPath);
    this.entriesPath = `${this.outputPath}.entries.tmp`;
    this.creatorVersion = creatorVersion;
  }
  get entryCount() {
    return this.count;
  }
  add(entry) {
    const line = `${JSON.stringify(entry)}
`;
    const append = this.writeChain.catch(() => void 0).then(() => this.append(line)).then(() => {
      this.count += 1;
    });
    this.writeChain = append.catch(() => void 0);
    return append;
  }
  async finalize() {
    await this.writeChain.catch(() => void 0);
    await this.ensureDirectory();
    await this.writeDocument();
    await rm(this.entriesPath, { force: true });
  }
  async append(line) {
    await this.ensureDirectory();
    if (!this.started) {
      await writeFile(this.entriesPath, line, "utf8");
      this.started = true;
      return;
    }
    await appendFile(this.entriesPath, line, "utf8");
  }
  async ensureDirectory() {
    if (this.directoryEnsured) {
      return;
    }
    await mkdir(path.dirname(this.outputPath), { recursive: true });
    this.directoryEnsured = true;
  }
  async writeDocument() {
    const stream = createWriteStream(this.outputPath, { encoding: "utf8" });
    const write = (chunk) => new Promise((resolve, reject) => {
      stream.write(chunk, (error) => error ? reject(error) : resolve());
    });
    try {
      const creator = JSON.stringify({ name: "redocly-cli proxy", version: this.creatorVersion });
      await write(
        `{
  "log": {
    "version": "1.2",
    "creator": ${creator},
    "entries": [`
      );
      let written = 0;
      if (existsSync(this.entriesPath)) {
        const lines = createInterface({
          input: createReadStream(this.entriesPath, { encoding: "utf8" }),
          crlfDelay: Infinity
        });
        for await (const line of lines) {
          if (!line.trim()) {
            continue;
          }
          await write(`${written === 0 ? "\n" : ",\n"}      ${line}`);
          written += 1;
        }
      }
      await write(written === 0 ? "]\n  }\n}\n" : "\n    ]\n  }\n}\n");
    } finally {
      await new Promise((resolve, reject) => {
        stream.on("error", reject);
        stream.end(() => resolve());
      });
    }
  }
};

// src/commands/proxy/server.ts
var import_undici = __toESM(require_undici(), 1);
import {
  createServer,
  STATUS_CODES
} from "node:http";
var HTTP_METHODS = ["GET", "HEAD", "POST", "PUT", "DELETE", "OPTIONS", "TRACE", "PATCH"];
function toHttpMethod(value) {
  const upper = (value ?? "GET").toUpperCase();
  return HTTP_METHODS.find((method) => method === upper);
}
var HOP_BY_HOP_HEADERS = /* @__PURE__ */ new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
]);
function readRequestBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}
function toForwardRequestHeaders(req) {
  const headers = {};
  for (const [name, value] of Object.entries(req.headers)) {
    if (value === void 0) {
      continue;
    }
    const lower = name.toLowerCase();
    if (HOP_BY_HOP_HEADERS.has(lower) || lower === "host" || lower === "content-length") {
      continue;
    }
    if (lower === "accept-encoding") {
      continue;
    }
    headers[name] = Array.isArray(value) ? value.join(", ") : value;
  }
  return headers;
}
function toClientResponseHeaders(headers) {
  const result = {};
  for (const [name, value] of Object.entries(headers)) {
    if (value === void 0 || HOP_BY_HOP_HEADERS.has(name.toLowerCase())) {
      continue;
    }
    result[name] = value;
  }
  return result;
}
function rawHeadersToHarHeaders(rawHeaders) {
  const headers = [];
  for (let index = 0; index < rawHeaders.length - 1; index += 2) {
    headers.push({ name: rawHeaders[index], value: rawHeaders[index + 1] });
  }
  return headers;
}
function responseHeadersToHarHeaders(headers) {
  const result = [];
  for (const [name, value] of Object.entries(headers)) {
    if (value === void 0) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        result.push({ name, value: item });
      }
      continue;
    }
    result.push({ name, value });
  }
  return result;
}
function toQueryString(url) {
  const query = [];
  for (const [name, value] of url.searchParams.entries()) {
    query.push({ name, value });
  }
  return query;
}
function parseCookieHeader(cookieHeader) {
  if (!cookieHeader) {
    return [];
  }
  const cookies = [];
  for (const pair of cookieHeader.split(";")) {
    const separatorIndex = pair.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }
    const name = pair.slice(0, separatorIndex).trim();
    const value = pair.slice(separatorIndex + 1).trim();
    if (name) {
      cookies.push({ name, value });
    }
  }
  return cookies;
}
function isTextualContentType(contentType) {
  if (!contentType) {
    return true;
  }
  if (isJsonMime(contentType)) {
    return true;
  }
  const mime = contentType.split(";")[0]?.trim().toLowerCase() ?? "";
  return mime.startsWith("text/") || mime === "application/xml" || mime === "application/x-www-form-urlencoded" || mime.endsWith("+xml");
}
function buildBodyPayload(body, contentType) {
  if (body.length === 0) {
    return { size: 0 };
  }
  if (isTextualContentType(contentType)) {
    return { text: body.toString("utf8"), size: body.length };
  }
  return { text: body.toString("base64"), encoding: "base64", size: body.length };
}
function buildPostData(body, contentType) {
  if (body.length === 0) {
    return void 0;
  }
  const payload = buildBodyPayload(body, contentType);
  return {
    mimeType: contentType ?? "application/octet-stream",
    text: payload.text ?? "",
    ...payload.encoding ? { encoding: payload.encoding } : {}
  };
}
function startProxyServer(options) {
  const targetUrl = new URL(options.target);
  let exchangeIndex = 0;
  const nextExchangeIndex = () => exchangeIndex++;
  const server = createServer((req, res) => {
    void handleRequest(req, res, targetUrl, options, nextExchangeIndex);
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, options.host, () => {
      server.removeListener("error", reject);
      const address = server.address();
      const boundPort = isPlainObject(address) ? address.port : options.port;
      resolve({
        url: `http://${options.host}:${boundPort}`,
        close: () => new Promise((resolveClose, rejectClose) => {
          server.close((error) => error ? rejectClose(error) : resolveClose());
        })
      });
    });
  });
}
function buildForwardUrl(requestUrl, targetUrl) {
  const requested = new URL(requestUrl, targetUrl);
  const basePath = targetUrl.pathname.endsWith("/") ? targetUrl.pathname.slice(0, -1) : targetUrl.pathname;
  const requestPath = requested.pathname;
  const alreadyPrefixed = requestPath === basePath || requestPath.startsWith(`${basePath}/`);
  const forwardUrl = new URL(targetUrl.toString());
  forwardUrl.pathname = basePath && !alreadyPrefixed ? `${basePath}${requestPath}` : requestPath;
  forwardUrl.search = requested.search;
  return forwardUrl;
}
async function handleRequest(req, res, targetUrl, options, nextExchangeIndex) {
  const startedAt = /* @__PURE__ */ new Date();
  const method = toHttpMethod(req.method);
  if (!method) {
    res.writeHead(501, { "content-type": "text/plain" });
    res.end(`Unsupported HTTP method: ${req.method}`);
    return;
  }
  const forwardUrl = buildForwardUrl(req.url ?? "/", targetUrl);
  let captured = null;
  try {
    const requestBody = await readRequestBody(req);
    const hasBody = method !== "GET" && method !== "HEAD" && requestBody.length > 0;
    const upstream = await (0, import_undici.request)(forwardUrl, {
      method,
      headers: toForwardRequestHeaders(req),
      body: hasBody ? requestBody : void 0
    });
    const responseBody = Buffer.from(await upstream.body.arrayBuffer());
    res.writeHead(upstream.statusCode, toClientResponseHeaders(upstream.headers));
    res.end(responseBody);
    const elapsedMs = Date.now() - startedAt.getTime();
    captured = buildCapturedExchange({
      index: nextExchangeIndex(),
      method,
      forwardUrl,
      req,
      requestBody,
      statusCode: upstream.statusCode,
      responseHeaders: upstream.headers,
      responseBody,
      startedAt,
      elapsedMs
    });
  } catch (error) {
    options.onError(error);
    if (!res.writableEnded) {
      if (!res.headersSent) {
        res.writeHead(502, { "content-type": "text/plain" });
      }
      res.end(`Proxy error: ${error.message}`);
    }
    return;
  }
  if (captured) {
    try {
      await options.onExchange(captured);
    } catch (error) {
      options.onError(error);
    }
  }
}
function buildCapturedExchange(params) {
  const requestContentType = singleHeader(params.req.headers["content-type"]);
  const responseContentType = singleHeader(params.responseHeaders["content-type"]);
  const exchange = createNormalizedExchange(
    {
      method: params.method,
      url: params.forwardUrl.toString(),
      requestHeaders: params.req.headers,
      requestBody: params.requestBody,
      requestContentType,
      responseStatus: params.statusCode,
      responseHeaders: params.responseHeaders,
      responseBody: params.responseBody,
      responseContentType,
      startedAt: params.startedAt.toISOString()
    },
    params.index,
    "(proxy)"
  );
  if (!exchange) {
    return null;
  }
  const responsePayload = buildBodyPayload(params.responseBody, responseContentType);
  const harEntry = {
    startedDateTime: params.startedAt.toISOString(),
    time: params.elapsedMs,
    request: {
      method: params.method,
      url: params.forwardUrl.toString(),
      httpVersion: `HTTP/${params.req.httpVersion}`,
      cookies: parseCookieHeader(singleHeader(params.req.headers.cookie)),
      headers: rawHeadersToHarHeaders(params.req.rawHeaders),
      queryString: toQueryString(params.forwardUrl),
      postData: buildPostData(params.requestBody, requestContentType),
      headersSize: -1,
      bodySize: params.requestBody.length
    },
    response: {
      status: params.statusCode,
      statusText: STATUS_CODES[params.statusCode] ?? "",
      httpVersion: "HTTP/1.1",
      cookies: [],
      headers: responseHeadersToHarHeaders(params.responseHeaders),
      content: {
        size: responsePayload.size,
        mimeType: responseContentType ?? "application/octet-stream",
        ...responsePayload.text !== void 0 ? { text: responsePayload.text } : {},
        ...responsePayload.encoding ? { encoding: responsePayload.encoding } : {}
      },
      redirectURL: singleHeader(params.responseHeaders.location) ?? "",
      headersSize: -1,
      bodySize: params.responseBody.length
    },
    cache: {},
    timings: { send: 0, wait: params.elapsedMs, receive: 0 }
  };
  return { exchange, harEntry };
}
function singleHeader(value) {
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

// src/commands/proxy/index.ts
var USE_COLOR = Boolean(process.stdout.isTTY) && process.env.NO_COLOR === void 0;
function severityIcon(severity) {
  if (severity === "error") return "\u2716";
  if (severity === "warning") return "\u25B2";
  return "\u25CF";
}
function formatLiveFinding(finding) {
  const status = finding.status !== void 0 ? ` (${finding.status})` : "";
  const operation = finding.operationId ? ` ${finding.operationId}` : "";
  return `${severityIcon(finding.severity)} ${finding.severity.toUpperCase()} ${finding.method} ${finding.path}${status}${operation} \u2192 [${finding.ruleId}] ${finding.message}`;
}
function waitForShutdownSignal() {
  return new Promise((resolve) => {
    process.once("SIGINT", () => resolve());
    process.once("SIGTERM", () => resolve());
  });
}
async function handleProxy({ argv, config, version }) {
  const targetInput = /^[a-z][a-z0-9+.-]*:\/\//i.test(argv.target) ? argv.target : `http://${argv.target}`;
  let target;
  try {
    target = new URL(targetInput);
  } catch {
    return exitWithError(`Invalid --target URL: ${argv.target}`);
  }
  const harPath = normalizeFsPath(argv.har);
  const harWriter = new HarWriter(harPath, version);
  let session = null;
  if (argv.api) {
    const specPath = normalizeFsPath(argv.api);
    const openApiIndex = await loadOpenApiIndex(specPath, config);
    if (openApiIndex.loadedOperations === 0) {
      return exitWithError(`No OpenAPI operations were loaded from: ${specPath}`);
    }
    session = ValidationSession.create({
      openApiIndex,
      matchMode: argv["match-mode"],
      ignoreCookies: argv["ignore-cookies"],
      previewFindingsLimit: argv["max-findings"],
      activeRules: argv.rules ? parseCsv(argv.rules) : void 0
    });
  }
  let exchangeQueue = Promise.resolve();
  let server;
  try {
    server = await startProxyServer({
      target: target.toString(),
      port: argv.port,
      host: argv.host,
      onExchange: ({ exchange, harEntry }) => {
        const task = exchangeQueue.then(async () => {
          try {
            await harWriter.add(harEntry);
          } catch (error) {
            logger.error(
              `Failed to write HAR entry, skipping validation for this exchange: ${error.message}
`
            );
            return;
          }
          if (!session) {
            return;
          }
          const findings2 = await session.process(exchange);
          for (const finding of findings2) {
            logger.info(`${formatLiveFinding(finding)}
`);
          }
        });
        exchangeQueue = task.catch(() => void 0);
        return task;
      },
      onError: (error) => {
        logger.error(`Proxy request failed: ${error.message}
`);
      }
    });
  } catch (error) {
    return exitWithError(`Failed to start proxy server: ${error.message}`);
  }
  logger.info(`Proxy listening on ${server.url} \u2192 forwarding to ${target.toString()}
`);
  logger.info(`Recording traffic to ${harPath}
`);
  if (session) {
    logger.info(`Validating live traffic against ${normalizeFsPath(argv.api)}
`);
  }
  logger.info("Press Ctrl+C to stop.\n");
  await waitForShutdownSignal();
  logger.info("\nShutting down proxy\u2026\n");
  await server.close();
  await exchangeQueue;
  await harWriter.finalize();
  logger.info(`Captured ${harWriter.entryCount} exchange(s) to ${harPath}
`);
  if (!session) {
    return;
  }
  const { runId, summary, findings } = session.finalize();
  const result = {
    runId,
    summary,
    findings,
    meta: {
      specSource: normalizeFsPath(argv.api),
      trafficPath: harPath,
      format: "har",
      matchMode: argv["match-mode"]
    }
  };
  const report = renderReport(result, {
    format: argv["report-format"],
    color: USE_COLOR && argv["report-format"] === "pretty",
    maxFindings: argv["max-findings"]
  });
  logger.output(report);
  if (summary.findingsBySeverity.error > 0) {
    throw new AbortFlowError("Drift detected.");
  }
}
export {
  handleProxy
};
