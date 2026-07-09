import { createRequire as __createRequire } from 'node:module';
const require = __createRequire(import.meta.url);
import {
  ValidationSession,
  coerceNumber,
  coerceString,
  createNormalizedExchange,
  decodeBody,
  iterateJsonArray,
  listFilesRecursively,
  loadOpenApiIndex,
  normalizeContentType,
  normalizeFsPath,
  parseCsv,
  pickHeaderContentType,
  readProbe,
  renderReport,
  streamNdjsonObjects
} from "./AAQTUNZI.js";
import {
  AbortFlowError,
  exitWithError
} from "./FL4Q7PMA.js";
import {
  isPlainObject,
  logger
} from "./MIPR6NCD.js";
import "./Z2I5YXYN.js";
import "./5ILQMFXK.js";

// src/commands/drift/index.ts
import { mkdir, writeFile } from "node:fs/promises";
import path5 from "node:path";

// src/commands/drift/log-formats/har.ts
import path from "node:path";
function formParamsToBody(mimeType, params) {
  if (normalizeContentType(mimeType) !== "application/x-www-form-urlencoded") {
    return void 0;
  }
  if (!Array.isArray(params)) {
    return void 0;
  }
  const searchParams = new URLSearchParams();
  for (const param of params) {
    if (!isPlainObject(param)) {
      continue;
    }
    const name = coerceString(param.name);
    if (name === void 0) {
      continue;
    }
    searchParams.append(name, coerceString(param.value) ?? "");
  }
  return searchParams.size > 0 ? searchParams.toString() : void 0;
}
function normalizeHarEntry(entry, index, source) {
  const request = entry?.request;
  const response = entry?.response;
  if (!request) {
    return null;
  }
  const postData = request?.postData;
  const requestContentType = coerceString(postData?.mimeType);
  const requestBody = postData?.text ?? formParamsToBody(requestContentType, postData?.params);
  const requestEncoding = coerceString(postData?.encoding);
  const responseBody = response?.content?.text;
  const responseEncoding = coerceString(response?.content?.encoding);
  const responseStatus = coerceNumber(response?.status);
  return createNormalizedExchange(
    {
      method: coerceString(request?.method),
      url: coerceString(request?.url),
      requestHeaders: request?.headers,
      requestBody: decodeBody(requestBody, requestEncoding),
      requestContentType,
      responseStatus: responseStatus === 0 ? void 0 : responseStatus,
      responseStatusText: coerceString(response?.statusText),
      responseHeaders: response?.headers,
      responseBody: decodeBody(responseBody, responseEncoding),
      responseContentType: coerceString(response?.content?.mimeType),
      startedAt: coerceString(entry?.startedDateTime),
      raw: entry
    },
    index,
    source
  );
}
var HarTrafficParser = class {
  id = "har";
  canParse(filePath, probe) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".har") {
      return true;
    }
    const normalizedProbe = probe.toLowerCase();
    return normalizedProbe.includes('"log"') && normalizedProbe.includes('"entries"');
  }
  async *parse(filePath) {
    let index = 0;
    for await (const entry of iterateJsonArray(filePath, "log.entries")) {
      const exchange = normalizeHarEntry(entry, index, filePath);
      if (exchange) {
        yield exchange;
      }
      index += 1;
    }
  }
};

// src/commands/drift/log-formats/kong.ts
import path2 from "node:path";
function buildKongUrl(request) {
  const directUrl = coerceString(request.url ?? request.uri);
  if (directUrl) {
    return { url: directUrl };
  }
  const host = coerceString(request.host ?? request.headers?.host);
  const requestPath = coerceString(request.path ?? request.request_uri);
  const explicitScheme = coerceString(request.scheme ?? request.forwarded_proto);
  if (host && requestPath) {
    return {
      url: `${explicitScheme ?? "http"}://${host}${requestPath}`,
      schemeKnown: Boolean(explicitScheme)
    };
  }
  return { url: requestPath, schemeKnown: Boolean(explicitScheme) };
}
function normalizeKongRecord(record, index, source) {
  const request = record?.request ?? record?.req ?? record?.http?.request;
  if (!request) {
    return null;
  }
  const response = record?.response ?? record?.res ?? record?.http?.response;
  const responseBody = response?.body ?? response?.raw_body ?? response?.payload ?? response?.data;
  const requestBody = request?.body ?? request?.raw_body ?? request?.payload ?? request?.data;
  const { url, schemeKnown } = buildKongUrl(request);
  return createNormalizedExchange(
    {
      method: coerceString(request?.method ?? request?.http_method),
      url,
      schemeKnown,
      requestHeaders: request?.headers,
      requestBody,
      requestContentType: pickHeaderContentType(request?.headers),
      responseStatus: coerceNumber(response?.status ?? response?.statusCode),
      responseHeaders: response?.headers,
      responseBody,
      responseContentType: pickHeaderContentType(response?.headers),
      startedAt: coerceString(record?.started_at ?? record?.startedAt ?? record?.timestamp),
      raw: record
    },
    index,
    source
  );
}
var KongTrafficParser = class {
  id = "kong";
  canParse(filePath, probe) {
    const ext = path2.extname(filePath).toLowerCase();
    if (ext === ".kong") {
      return true;
    }
    const lowerProbe = probe.toLowerCase();
    return lowerProbe.includes('"latencies"') || lowerProbe.includes('"request"') && lowerProbe.includes('"response"') && lowerProbe.includes('"route"');
  }
  async *parse(filePath) {
    const firstChar = (await readProbe(filePath, 16)).trim().slice(0, 1);
    let index = 0;
    if (firstChar === "[") {
      for await (const record of iterateJsonArray(filePath)) {
        const normalized = normalizeKongRecord(record, index, filePath);
        if (normalized) {
          yield normalized;
        }
        index += 1;
      }
      return;
    }
    for await (const record of streamNdjsonObjects(filePath)) {
      const normalized = normalizeKongRecord(record, index, filePath);
      if (normalized) {
        yield normalized;
      }
      index += 1;
    }
  }
};

// src/commands/drift/log-formats/ndjson.ts
import path3 from "node:path";
function getRequestCandidate(record) {
  return record?.request ?? record?.req ?? record?.httpRequest ?? record?.http?.request ?? record;
}
function getResponseCandidate(record) {
  return record?.response ?? record?.res ?? record?.httpResponse ?? record?.http?.response;
}
function buildUrl(record, request) {
  const directUrl = coerceString(
    request?.url ?? request?.uri ?? request?.requestUrl ?? record?.url
  );
  if (directUrl) {
    return { url: directUrl };
  }
  const host = coerceString(request?.host ?? request?.headers?.host ?? record?.host);
  const path6 = coerceString(request?.path ?? record?.path ?? request?.pathname);
  const explicitScheme = coerceString(request?.scheme ?? record?.scheme);
  if (host && path6) {
    return {
      url: `${explicitScheme ?? "http"}://${host}${path6}`,
      schemeKnown: Boolean(explicitScheme)
    };
  }
  return { url: path6, schemeKnown: Boolean(explicitScheme) };
}
function normalizeGenericRecord(record, index, source) {
  const request = getRequestCandidate(record);
  const response = getResponseCandidate(record);
  const requestBody = request?.body ?? request?.bodyText ?? request?.payload ?? request?.data ?? request?.rawBody;
  const responseBody = response?.body ?? response?.bodyText ?? response?.payload ?? response?.data ?? response?.rawBody;
  const { url, schemeKnown } = buildUrl(record, request);
  return createNormalizedExchange(
    {
      method: coerceString(
        request?.method ?? request?.httpMethod ?? record?.method ?? record?.httpMethod
      ),
      url,
      schemeKnown,
      requestHeaders: request?.headers,
      requestBody,
      requestContentType: pickHeaderContentType(request?.headers),
      responseStatus: coerceNumber(
        response?.status ?? response?.statusCode ?? record?.status ?? record?.statusCode
      ),
      responseHeaders: response?.headers,
      responseBody,
      responseContentType: pickHeaderContentType(response?.headers),
      startedAt: coerceString(record?.startedAt ?? record?.timestamp ?? record?.time),
      raw: record
    },
    index,
    source
  );
}
var NdjsonTrafficParser = class {
  id = "ndjson";
  canParse(filePath, probe) {
    const ext = path3.extname(filePath).toLowerCase();
    if (ext === ".ndjson" || ext === ".jsonl" || ext === ".jsonlines") {
      return true;
    }
    const lastNewlineIndex = probe.lastIndexOf("\n");
    const completeLines = lastNewlineIndex === -1 ? probe : probe.slice(0, lastNewlineIndex);
    const firstLine = completeLines.split("\n").map((line) => line.trim()).find(Boolean);
    if (!firstLine?.startsWith("{") || !firstLine.endsWith("}")) {
      return false;
    }
    try {
      JSON.parse(firstLine);
      return true;
    } catch {
      return false;
    }
  }
  async *parse(filePath) {
    let index = 0;
    for await (const record of streamNdjsonObjects(filePath)) {
      const normalized = normalizeGenericRecord(record, index, filePath);
      if (normalized) {
        yield normalized;
      }
      index += 1;
    }
  }
};

// src/commands/drift/log-formats/webserver-json.ts
import path4 from "node:path";
function parseRequestLine(requestLine) {
  if (!requestLine) {
    return {};
  }
  const parts = requestLine.trim().split(/\s+/);
  if (parts.length < 2) {
    return {};
  }
  return {
    method: parts[0],
    path: parts[1],
    protocol: parts[2]
  };
}
function buildUrl2(record, request) {
  const directUrl = coerceString(
    request?.url ?? request?.request_uri ?? request?.uri ?? record?.url ?? record?.request_url ?? record?.absolute_uri
  );
  const requestLine = parseRequestLine(coerceString(record?.request ?? request?.request_line));
  const requestPath = coerceString(
    request?.request_uri ?? request?.uri ?? request?.path ?? record?.request_uri ?? record?.uri
  ) ?? requestLine.path;
  if (directUrl?.startsWith("http://") || directUrl?.startsWith("https://")) {
    return { url: directUrl };
  }
  const host = coerceString(
    request?.host ?? request?.headers?.host ?? record?.host ?? record?.http_host ?? record?.server_name ?? record?.vhost
  );
  const explicitScheme = coerceString(record?.scheme ?? request?.scheme ?? record?.request_scheme);
  const schemeKnown = Boolean(explicitScheme);
  if (host && (directUrl || requestPath)) {
    const scheme = explicitScheme ?? "http";
    const targetPath = directUrl ?? requestPath;
    if (targetPath?.startsWith("/")) {
      return { url: `${scheme}://${host}${targetPath}`, schemeKnown };
    }
    return { url: `${scheme}://${host}/${targetPath}`, schemeKnown };
  }
  return { url: directUrl ?? requestPath, schemeKnown };
}
function normalizeWebServerRecord(record, index, source) {
  const request = isPlainObject(record?.request) ? record.request : record;
  const response = isPlainObject(record?.response) ? record.response : void 0;
  const requestLine = parseRequestLine(coerceString(record?.request));
  const method = coerceString(
    request?.method ?? request?.request_method ?? record?.request_method ?? record?.method
  ) ?? requestLine.method;
  const { url, schemeKnown } = buildUrl2(record, request);
  return createNormalizedExchange(
    {
      method,
      url,
      schemeKnown,
      requestHeaders: request?.headers ?? request?.request_headers ?? record?.request_headers ?? record?.headers,
      requestBody: request?.body ?? request?.request_body ?? record?.request_body ?? record?.body,
      requestContentType: pickHeaderContentType(
        request?.headers ?? request?.request_headers ?? record?.request_headers
      ),
      responseStatus: coerceNumber(
        response?.status ?? response?.status_code ?? record?.status ?? record?.status_code ?? record?.response_status
      ),
      responseHeaders: response?.headers ?? response?.response_headers ?? record?.response_headers ?? record?.headers_out,
      responseBody: response?.body ?? response?.response_body ?? record?.response_body,
      responseContentType: pickHeaderContentType(
        response?.headers ?? response?.response_headers ?? record?.response_headers
      ),
      startedAt: coerceString(
        record?.time_iso8601 ?? record?.timestamp ?? record?.time ?? record?.time_local ?? record?.["@timestamp"]
      ),
      raw: record
    },
    index,
    source
  );
}
async function* parseJsonFile(filePath) {
  const firstChar = (await readProbe(filePath, 16)).trim().slice(0, 1);
  if (firstChar === "[") {
    yield* iterateJsonArray(filePath);
    return;
  }
  for await (const record of streamNdjsonObjects(filePath)) {
    yield record;
  }
}
var NginxJsonTrafficParser = class {
  id = "nginx-json";
  canParse(filePath, probe) {
    const ext = path4.extname(filePath).toLowerCase();
    const lowerFilePath = filePath.toLowerCase();
    if (ext === ".ndjson" && lowerFilePath.includes("nginx")) {
      return true;
    }
    const lowerProbe = probe.toLowerCase();
    return lowerProbe.includes('"request_uri"') || lowerProbe.includes('"time_iso8601"') || lowerProbe.includes('"upstream_response_time"') || lowerProbe.includes('"remote_addr"');
  }
  async *parse(filePath) {
    let index = 0;
    for await (const record of parseJsonFile(filePath)) {
      const normalized = normalizeWebServerRecord(record, index, filePath);
      if (normalized) {
        yield normalized;
      }
      index += 1;
    }
  }
};
var ApacheJsonTrafficParser = class {
  id = "apache-json";
  canParse(filePath, probe) {
    const ext = path4.extname(filePath).toLowerCase();
    const lowerFilePath = filePath.toLowerCase();
    if (ext === ".ndjson" && lowerFilePath.includes("apache")) {
      return true;
    }
    const lowerProbe = probe.toLowerCase();
    return lowerProbe.includes('"request_method"') || lowerProbe.includes('"request_uri"') || lowerProbe.includes('"vhost"') || lowerProbe.includes('"response_status"');
  }
  async *parse(filePath) {
    let index = 0;
    for await (const record of parseJsonFile(filePath)) {
      const normalized = normalizeWebServerRecord(record, index, filePath);
      if (normalized) {
        yield normalized;
      }
      index += 1;
    }
  }
};

// src/commands/drift/log-formats/registry.ts
var PARSERS = [
  new HarTrafficParser(),
  new KongTrafficParser(),
  new NginxJsonTrafficParser(),
  new ApacheJsonTrafficParser(),
  new NdjsonTrafficParser()
];
async function selectTrafficParser(filePath, format) {
  if (format !== "auto") {
    const parser = PARSERS.find((candidate) => candidate.id === format);
    if (!parser) {
      throw new Error(`Unsupported parser format: ${format}`);
    }
    return parser;
  }
  const probe = await readProbe(filePath);
  return PARSERS.find((candidate) => candidate.canParse(filePath, probe));
}

// src/commands/drift/engine/runner.ts
async function runTrafficValidation(options) {
  const trafficFiles = await listFilesRecursively(options.trafficPath);
  if (trafficFiles.length === 0) {
    throw new Error("No traffic files found in the provided traffic path.");
  }
  const session = ValidationSession.create({
    openApiIndex: options.openApiIndex,
    matchMode: options.matchMode,
    ignoreCookies: options.ignoreCookies,
    previewFindingsLimit: options.previewFindingsLimit,
    activeRules: options.activeRules,
    server: options.server,
    minSeverity: options.minSeverity
  });
  let supportedTrafficFileCount = 0;
  let exchangeIndex = 0;
  for (const trafficFile of trafficFiles) {
    const parser = await selectTrafficParser(trafficFile, options.format);
    if (!parser) {
      logger.warn(`Skipping traffic file with unrecognized format: ${trafficFile}
`);
      continue;
    }
    supportedTrafficFileCount += 1;
    for await (const exchange of parser.parse(trafficFile)) {
      await session.process({ ...exchange, index: exchangeIndex });
      exchangeIndex += 1;
    }
  }
  if (supportedTrafficFileCount === 0) {
    throw new Error(
      "No supported traffic files found. In auto mode, files must match built-in traffic parser signatures."
    );
  }
  if (exchangeIndex === 0) {
    throw new Error("No HTTP exchanges were parsed from the provided traffic files.");
  }
  return session.finalize();
}

// src/commands/drift/index.ts
var USE_COLOR = Boolean(process.stdout.isTTY) && process.env.NO_COLOR === void 0;
function collectSpecServerUrls(openApiIndex) {
  const urls = /* @__PURE__ */ new Set();
  for (const operations of openApiIndex.operationsByMethod.values()) {
    for (const operation of operations) {
      for (const server of operation.servers) {
        urls.add(server.rawUrl);
      }
    }
  }
  return Array.from(urls).sort();
}
function warnWhenNothingMatched(summary, openApiIndex, server) {
  const validatedExchanges = summary.totalExchanges - summary.skippedExchanges;
  if (validatedExchanges === 0 && summary.skippedExchanges > 0) {
    logger.warn(
      `All ${summary.skippedExchanges} exchange(s) were outside the --server "${server}" and were skipped. Check that the server matches the traffic URLs.
`
    );
    return;
  }
  if (summary.documentedExchanges > 0 || validatedExchanges === 0) {
    return;
  }
  const serverUrls = collectSpecServerUrls(openApiIndex);
  const hint = server ? `Check that the --server "${server}" matches the traffic URLs and that the description paths align with the remainder.` : summary.hostCompatibleExchanges === validatedExchanges ? `The traffic hosts are compatible with the description servers (${serverUrls.join(
    ", "
  )}), so the endpoints are likely undocumented; if they should be documented, check that the description base paths and paths align with the traffic URLs, or use --server to declare the server the traffic was captured against.` : `Check that the traffic host and base path match the description servers (${serverUrls.join(
    ", "
  )}), or use --server to declare the server the traffic was captured against.`;
  logger.warn(
    `None of the ${validatedExchanges} validated exchange(s) matched a documented operation. ${hint}
`
  );
}
async function writeOutput(outputPath, content) {
  const resolved = normalizeFsPath(outputPath);
  await mkdir(path5.dirname(resolved), { recursive: true });
  await writeFile(resolved, content, "utf8");
}
async function handleDrift({ argv, config }) {
  const trafficPath = normalizeFsPath(argv.traffic);
  const trafficFormat = argv["traffic-format"];
  const activeRules = argv.rules ? parseCsv(argv.rules) : void 0;
  const server = argv.server;
  if (server && argv["match-mode"]) {
    return exitWithError(
      "The --server and --match-mode options are mutually exclusive: --match-mode controls how requests are located via the description servers, while --server replaces the description servers with the one the traffic was captured against."
    );
  }
  const matchMode = argv["match-mode"] ?? "strict-host";
  const specPath = normalizeFsPath(argv.api);
  const openApiIndex = await loadOpenApiIndex(specPath, config);
  if (openApiIndex.loadedOperations === 0) {
    return exitWithError(`No OpenAPI operations were loaded from: ${specPath}`);
  }
  const { runId, summary, findings } = await runTrafficValidation({
    trafficPath,
    format: trafficFormat,
    matchMode,
    ignoreCookies: argv["ignore-cookies"],
    previewFindingsLimit: argv["max-findings"],
    activeRules,
    openApiIndex,
    server,
    minSeverity: argv["min-severity"]
  });
  warnWhenNothingMatched(summary, openApiIndex, server);
  const report = renderReport(
    {
      runId,
      summary,
      findings,
      meta: {
        specSource: specPath,
        trafficPath,
        format: trafficFormat,
        matchMode,
        server
      }
    },
    {
      format: argv["report-format"],
      color: USE_COLOR && argv["report-format"] === "pretty" && !argv.output,
      maxFindings: argv["max-findings"]
    }
  );
  if (argv.output) {
    await writeOutput(argv.output, report);
    logger.info(`Drift report written to: ${normalizeFsPath(argv.output)}
`);
  } else {
    logger.output(report);
  }
  if (summary.findingsBySeverity.error > 0) {
    throw new AbortFlowError("Drift detected.");
  }
}
export {
  handleDrift
};
