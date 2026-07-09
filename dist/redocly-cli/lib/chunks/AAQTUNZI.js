import { createRequire as __createRequire } from 'node:module';
const require = __createRequire(import.meta.url);
import {
  BaseResolver,
  blue,
  bold,
  bundle,
  cyan,
  detectSpec,
  dim,
  getMajorSpecVersion,
  getTypes,
  gray,
  green,
  isPlainObject,
  logger,
  normalizeTypes,
  normalizeVisitors,
  red,
  require__,
  require_dist,
  walkDocument,
  yellow
} from "./MIPR6NCD.js";
import {
  __toESM
} from "./5ILQMFXK.js";

// src/commands/drift/engine/reporter.ts
import path from "node:path";

// src/commands/drift/utils/finding-groups.ts
var KEY_SEPARATOR = "";
function normalizePart(value) {
  if (!value) {
    return "";
  }
  return value.trim();
}
function createProblemKey(finding) {
  const operationOrPath = normalizePart(finding.operationId) || normalizePart(finding.path);
  return [
    normalizePart(finding.ruleId),
    normalizePart(finding.severity),
    normalizePart(finding.message),
    operationOrPath,
    normalizePart(finding.target),
    normalizePart(finding.schemaPath)
  ].join(KEY_SEPARATOR);
}

// src/commands/drift/engine/reporter.ts
var cyanBold = (text) => bold(cyan(text));
function mapSeverityToSarifLevel(severity) {
  if (severity === "error") return "error";
  if (severity === "warning") return "warning";
  return "note";
}
function escapeCsvCell(value) {
  if (value === void 0 || value === null) {
    return "";
  }
  const stringValue = String(value);
  if (!stringValue.includes(",") && !stringValue.includes('"') && !stringValue.includes("\n")) {
    return stringValue;
  }
  return `"${stringValue.replace(/"/g, '""')}"`;
}
function toRelativeSpecPath(specSource) {
  if (!path.isAbsolute(specSource)) {
    return specSource;
  }
  const relativePath = path.relative(process.cwd(), specSource);
  return relativePath || ".";
}
function getOperationTemplatePath(details) {
  if (!details) {
    return null;
  }
  const maybePath = details.operationPathTemplate;
  return typeof maybePath === "string" && maybePath.length > 0 ? maybePath : null;
}
function sortRuleCounts(findingsByRule) {
  return Object.entries(findingsByRule).sort((a, b) => {
    const countDiff = b[1] - a[1];
    if (countDiff !== 0) {
      return countDiff;
    }
    return a[0].localeCompare(b[0]);
  });
}
function groupFindingsIntoProblems(findings) {
  const problems = [];
  const keyToIndex = /* @__PURE__ */ new Map();
  for (const finding of findings) {
    const key = createProblemKey({
      ruleId: finding.ruleId,
      severity: finding.severity,
      message: finding.message,
      operationId: finding.operationId,
      path: finding.path,
      target: finding.target,
      schemaPath: finding.schemaPath
    });
    const existingIndex = keyToIndex.get(key);
    if (existingIndex !== void 0) {
      problems[existingIndex].occurrences += 1;
      continue;
    }
    keyToIndex.set(key, problems.length);
    problems.push({ finding, occurrences: 1 });
  }
  return problems;
}
function formatJson(result) {
  const problems = groupFindingsIntoProblems(result.findings).map((problem) => ({
    occurrences: problem.occurrences,
    exchangeIndex: problem.finding.exchangeIndex,
    ruleId: problem.finding.ruleId,
    severity: problem.finding.severity,
    category: problem.finding.category,
    message: problem.finding.message,
    operationId: problem.finding.operationId,
    specSource: problem.finding.specSource,
    target: problem.finding.target,
    schemaPath: problem.finding.schemaPath,
    dataPath: problem.finding.dataPath,
    details: problem.finding.details,
    method: problem.finding.method,
    url: problem.finding.url,
    path: problem.finding.path,
    status: problem.finding.status
  }));
  const payload = {
    run: {
      id: result.runId,
      specSource: result.meta.specSource,
      trafficPath: result.meta.trafficPath,
      format: result.meta.format,
      matchMode: result.meta.matchMode,
      server: result.meta.server,
      totalExchanges: result.summary.totalExchanges,
      documentedExchanges: result.summary.documentedExchanges,
      undocumentedExchanges: result.summary.undocumentedExchanges,
      skippedExchanges: result.summary.skippedExchanges,
      findingsBySeverity: result.summary.findingsBySeverity,
      findingsByRule: result.summary.findingsByRule,
      totalProblems: result.summary.totalProblemGroups,
      durationMs: result.summary.durationMs
    },
    problems
  };
  return `${JSON.stringify(payload, null, 2)}
`;
}
function formatCsv(result) {
  const header = [
    "run_id",
    "finding_id",
    "exchange_index",
    "severity",
    "category",
    "rule_id",
    "message",
    "method",
    "path",
    "url",
    "status",
    "operation_id",
    "spec_source",
    "target",
    "schema_path",
    "data_path"
  ];
  const rows = result.findings.map((finding) => [
    result.runId,
    finding.id,
    finding.exchangeIndex,
    finding.severity,
    finding.category,
    finding.ruleId,
    finding.message,
    finding.method,
    finding.path,
    finding.url,
    finding.status,
    finding.operationId,
    finding.specSource,
    finding.target,
    finding.schemaPath,
    finding.dataPath
  ]);
  const csvRows = [header, ...rows].map((row) => row.map(escapeCsvCell).join(","));
  return `${csvRows.join("\n")}
`;
}
function formatSarif(result) {
  const ruleSet = /* @__PURE__ */ new Map();
  for (const finding of result.findings) {
    if (!ruleSet.has(finding.ruleId)) {
      ruleSet.set(finding.ruleId, {
        id: finding.ruleId,
        name: finding.ruleId,
        shortDescription: { text: `${finding.category} detection` }
      });
    }
  }
  const results = result.findings.map((finding) => {
    const locationUri = finding.specSource ?? finding.url ?? void 0;
    return {
      ruleId: finding.ruleId,
      level: mapSeverityToSarifLevel(finding.severity),
      message: { text: finding.message },
      locations: locationUri ? [{ physicalLocation: { artifactLocation: { uri: locationUri } } }] : void 0,
      properties: {
        runId: result.runId,
        exchangeIndex: finding.exchangeIndex,
        method: finding.method,
        path: finding.path,
        status: finding.status,
        operationId: finding.operationId,
        target: finding.target,
        schemaPath: finding.schemaPath,
        dataPath: finding.dataPath
      }
    };
  });
  const sarifPayload = {
    $schema: "https://json.schemastore.org/sarif-2.1.0.json",
    version: "2.1.0",
    runs: [{ tool: { driver: { name: "drift", rules: Array.from(ruleSet.values()) } }, results }]
  };
  return `${JSON.stringify(sarifPayload, null, 2)}
`;
}
function totalFindings(summary) {
  return summary.findingsBySeverity.error + summary.findingsBySeverity.warning + summary.findingsBySeverity.info;
}
function statusColor(status) {
  if (status >= 500) return red;
  if (status >= 400) return yellow;
  if (status >= 300) return blue;
  if (status >= 200) return green;
  return gray;
}
function formatPretty(result, color, maxFindings) {
  const colorize = (text, paint) => color ? paint(text) : text;
  const severityIcon = (severity) => severity === "error" ? colorize("\u2716", red) : severity === "warning" ? colorize("\u25B2", yellow) : colorize("\u25CF", blue);
  const severityLabel = (severity) => severity === "error" ? colorize("ERROR", red) : severity === "warning" ? colorize("WARN", yellow) : colorize("INFO", blue);
  const { summary, meta } = result;
  const findingsCount = totalFindings(summary);
  const findingsToRender = summary.previewFindings.slice(0, maxFindings);
  const lines = [];
  lines.push(colorize("\u250F\u2501 Drift Report", cyanBold));
  lines.push(`\u2503 Run: ${result.runId}`);
  lines.push(`\u2503 Spec: ${meta.specSource}`);
  lines.push(`\u2503 Traffic: ${meta.trafficPath}`);
  lines.push(
    meta.server ? `\u2503 Server: ${meta.server} (overrides description servers)` : `\u2503 Match mode: ${meta.matchMode}`
  );
  lines.push(`\u2503 Traffic format: ${meta.format}${meta.format === "auto" ? " (auto-detect)" : ""}`);
  lines.push(
    `\u2503 Exchanges: total=${summary.totalExchanges} documented=${summary.documentedExchanges} undocumented=${summary.undocumentedExchanges}${summary.skippedExchanges > 0 ? ` skipped=${summary.skippedExchanges}` : ""}`
  );
  lines.push(
    `\u2503 Findings: total=${findingsCount} ${colorize(`error=${summary.findingsBySeverity.error}`, red)} ${colorize(
      `warning=${summary.findingsBySeverity.warning}`,
      yellow
    )} ${colorize(`info=${summary.findingsBySeverity.info}`, blue)}`
  );
  lines.push(`\u2503 Problems: total=${summary.totalProblemGroups}`);
  lines.push(`\u2517 Duration: ${summary.durationMs}ms`);
  if (findingsCount === 0) {
    lines.push("");
    lines.push(colorize("\u2714 No findings.", cyan));
    return `${lines.join("\n")}
`;
  }
  lines.push("");
  lines.push(colorize(`Types (${Object.keys(summary.problemGroupsByRule).length})`, cyanBold));
  for (const [ruleId, problemsCount] of sortRuleCounts(summary.problemGroupsByRule)) {
    const findingsForRule = summary.findingsByRule[ruleId] ?? problemsCount;
    lines.push(
      `  ${colorize("\u2022", gray)} ${ruleId}: ${problemsCount} problems / ${findingsForRule} findings`
    );
  }
  const groupedFindings = /* @__PURE__ */ new Map();
  for (const finding of findingsToRender) {
    if (!groupedFindings.has(finding.ruleId)) {
      groupedFindings.set(finding.ruleId, []);
    }
    groupedFindings.get(finding.ruleId).push(finding);
  }
  const orderedRuleIds = Array.from(groupedFindings.keys()).sort((a, b) => {
    const countDiff = (summary.problemGroupsByRule[b] ?? 0) - (summary.problemGroupsByRule[a] ?? 0);
    if (countDiff !== 0) {
      return countDiff;
    }
    return a.localeCompare(b);
  });
  lines.push("");
  lines.push(
    colorize(
      `Problems by type (showing first ${findingsToRender.length} of ${summary.totalProblemGroups})`,
      cyanBold
    )
  );
  let renderedIndex = 0;
  for (const ruleId of orderedRuleIds) {
    const group = groupedFindings.get(ruleId);
    if (!group || group.length === 0) {
      continue;
    }
    const ruleProblemTotal = summary.problemGroupsByRule[ruleId] ?? group.length;
    const ruleFindingTotal = summary.findingsByRule[ruleId] ?? ruleProblemTotal;
    lines.push("");
    lines.push(
      `${colorize("\u25C9", cyan)} ${colorize(ruleId, cyanBold)} ${colorize(
        `(${group.length} problems shown / ${ruleProblemTotal} total, ${ruleFindingTotal} findings)`,
        gray
      )}`
    );
    for (const finding of group) {
      renderedIndex += 1;
      const occurrences = finding.occurrences;
      const statusText = finding.status !== void 0 ? colorize(String(finding.status), statusColor(finding.status)) : colorize("-", gray);
      const displayPath = getOperationTemplatePath(finding.details) ?? finding.path;
      const operationLabel = finding.operationId ? ` ${colorize(finding.operationId, dim)}` : "";
      lines.push(
        `${severityIcon(finding.severity)} ${severityLabel(finding.severity)} #${renderedIndex}${occurrences > 1 ? ` ${colorize(`\xD7${occurrences}`, gray)}` : ""} ${colorize("\u2192", gray)} ${finding.message}`
      );
      lines.push(
        `  \u21B3 sample exchange=${finding.exchangeIndex} ${colorize(finding.method, cyan)} ${displayPath} (${statusText})${operationLabel}`
      );
      lines.push("");
      lines.push(`    ${colorize(finding.url, gray)}`);
      if (finding.specSource || finding.schemaPath || finding.dataPath) {
        lines.push("");
        if (finding.specSource) {
          lines.push(
            `    ${colorize("spec:", dim)} ${colorize(toRelativeSpecPath(finding.specSource), cyan)}`
          );
        }
        if (finding.schemaPath) {
          lines.push(`    ${colorize("schemaPath=", dim)} ${colorize(finding.schemaPath, dim)}`);
        }
        if (finding.dataPath) {
          lines.push(`    ${colorize("dataPath=", dim)} ${colorize(finding.dataPath, cyan)}`);
        }
      }
      if (finding.details) {
        lines.push("");
        if (finding.ruleId === "security-baseline" && typeof finding.details.summary === "string") {
          lines.push(`    ${colorize("security:", dim)} ${finding.details.summary}`);
        } else if (finding.ruleId === "owasp-api-top10" && typeof finding.details.summary === "string") {
          const issueId = typeof finding.details.issueId === "string" ? finding.details.issueId : null;
          const issueTitle = typeof finding.details.issueTitle === "string" ? finding.details.issueTitle : null;
          lines.push(`    ${colorize("owasp:", dim)} ${finding.details.summary}`);
          if (issueId || issueTitle) {
            lines.push(
              `    ${colorize("issue:", dim)} ${[issueId, issueTitle].filter(Boolean).join(" - ")}`
            );
          }
        } else if (finding.ruleId === "schema-consistency" && typeof finding.details.summary === "string") {
          const detailPath = typeof finding.details.path === "string" ? finding.details.path : null;
          const expected = typeof finding.details.expected === "string" ? finding.details.expected : null;
          const actual = typeof finding.details.actual === "string" ? finding.details.actual : null;
          const suggestion = typeof finding.details.suggestion === "string" ? finding.details.suggestion : null;
          lines.push(`    ${colorize("schema:", dim)} ${finding.details.summary}`);
          if (detailPath) {
            lines.push(`    ${colorize("path:", dim)} ${colorize(detailPath, cyan)}`);
          }
          if (expected) {
            lines.push(`    ${colorize("expected:", dim)} ${expected}`);
          }
          if (actual) {
            lines.push(`    ${colorize("actual:", dim)} ${actual}`);
          }
          if (suggestion) {
            lines.push(`    ${colorize("hint:", dim)}`);
            for (const suggestionLine of suggestion.split("\n")) {
              lines.push(`      ${suggestionLine}`);
            }
          }
        } else {
          lines.push(`    ${colorize("details:", dim)} ${JSON.stringify(finding.details)}`);
        }
      }
      lines.push("");
    }
  }
  const omittedProblemsCount = summary.totalProblemGroups - findingsToRender.length;
  if (omittedProblemsCount > 0) {
    if (lines[lines.length - 1] !== "") {
      lines.push("");
    }
    lines.push(
      colorize(
        `\u2026 ${omittedProblemsCount} problems omitted from terminal output. Use --format json/csv/sarif for the complete export.`,
        gray
      )
    );
  } else if (lines[lines.length - 1] === "") {
    lines.pop();
  }
  return `${lines.join("\n")}
`;
}
function renderReport(result, options) {
  const maxFindings = options.maxFindings ?? 10;
  switch (options.format) {
    case "json":
      return formatJson(result);
    case "csv":
      return formatCsv(result);
    case "sarif":
      return formatSarif(result);
    case "pretty":
      return formatPretty(result, options.color ?? false, maxFindings);
    default:
      throw new Error(`Unsupported report format: ${options.format}`);
  }
}

// src/commands/drift/utils/files.ts
import { open, readdir, stat } from "node:fs/promises";
import path2 from "node:path";
var SPEC_FILE_EXTENSIONS = /* @__PURE__ */ new Set([".yaml", ".yml", ".json"]);
async function listOpenApiFiles(rootDir) {
  const output = [];
  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const absolutePath = path2.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      if (entry.isFile() && SPEC_FILE_EXTENSIONS.has(path2.extname(entry.name).toLowerCase())) {
        output.push(absolutePath);
      }
    }
  }
  await walk(rootDir);
  output.sort();
  return output;
}
async function readProbe(filePath, maxBytes = 4096) {
  const fileHandle = await open(filePath, "r");
  try {
    const buffer = Buffer.allocUnsafe(maxBytes);
    const { bytesRead } = await fileHandle.read(buffer, 0, maxBytes, 0);
    return buffer.toString("utf8", 0, bytesRead);
  } finally {
    await fileHandle.close();
  }
}
function normalizeFsPath(value) {
  return path2.resolve(process.cwd(), value);
}
async function listFilesRecursively(rootPath) {
  const stats = await stat(rootPath);
  if (stats.isFile()) {
    return [rootPath];
  }
  if (!stats.isDirectory()) {
    return [];
  }
  const output = [];
  async function walk(currentDir) {
    const entries = await readdir(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name.startsWith(".")) {
        continue;
      }
      const absolutePath = path2.join(currentDir, entry.name);
      if (entry.isDirectory()) {
        await walk(absolutePath);
        continue;
      }
      if (entry.isFile()) {
        output.push(absolutePath);
      }
    }
  }
  await walk(rootPath);
  output.sort();
  return output;
}

// src/commands/drift/engine/validation-session.ts
import { randomUUID } from "node:crypto";

// src/commands/drift/utils/http.ts
var DUMMY_HOST = "drift.local";
var DUMMY_BASE_URL = `http://${DUMMY_HOST}`;
function isSyntheticHost(host) {
  return host === DUMMY_HOST;
}
var IGNORED_UNDOCUMENTED_HEADERS = /* @__PURE__ */ new Set([
  "accept",
  "accept-charset",
  "accept-encoding",
  "accept-language",
  "authorization",
  "baggage",
  "cache-control",
  "cdn-loop",
  "cookie",
  "connection",
  "content-length",
  "content-type",
  "dpr",
  "dnt",
  "downlink",
  "ect",
  "forwarded",
  "host",
  "if-match",
  "if-modified-since",
  "if-none-match",
  "if-range",
  "if-unmodified-since",
  "origin",
  "pragma",
  "priority",
  "range",
  "referer",
  "sec-fetch-dest",
  "sec-fetch-mode",
  "sec-fetch-site",
  "sec-fetch-user",
  "sec-gpc",
  "sentry-trace",
  "te",
  "traceparent",
  "tracestate",
  "upgrade",
  "upgrade-insecure-requests",
  "user-agent",
  "via",
  "x-amzn-trace-id",
  "x-client-trace-id",
  "x-cloud-trace-context",
  "x-correlation-id",
  "x-http-method-override",
  "x-method-override",
  "x-real-ip",
  "x-request-id",
  "x-forwarded-for",
  "x-forwarded-host",
  "x-forwarded-port",
  "x-forwarded-proto"
]);
var IGNORED_UNDOCUMENTED_HEADER_PREFIXES = [
  "cf-",
  "sec-ch-",
  "sec-fetch-",
  "x-b3-",
  "x-envoy-",
  "x-forwarded-"
];
var SET_COOKIE_SEPARATOR = "\n";
function splitSetCookieHeader(value) {
  return value.split(SET_COOKIE_SEPARATOR);
}
function appendHeaderValue(result, name, value) {
  const key = name.toLowerCase();
  const existing = result[key];
  if (existing === void 0) {
    result[key] = value;
    return;
  }
  result[key] = key === "set-cookie" ? `${existing}${SET_COOKIE_SEPARATOR}${value}` : `${existing},${value}`;
}
function normalizeHeaders(input) {
  if (!isPlainObject(input) && !Array.isArray(input)) {
    return {};
  }
  const result = {};
  if (Array.isArray(input)) {
    for (const item of input) {
      if (!isPlainObject(item)) {
        continue;
      }
      const { name, value } = item;
      if (typeof name === "string" && value !== void 0) {
        appendHeaderValue(result, name, String(value));
      }
    }
    return result;
  }
  for (const [key, value] of Object.entries(input)) {
    if (value === void 0 || value === null) {
      continue;
    }
    if (Array.isArray(value)) {
      for (const item of value) {
        appendHeaderValue(result, key, String(item));
      }
      continue;
    }
    appendHeaderValue(result, key, String(value));
  }
  return result;
}
function parseUrl(input) {
  try {
    return new URL(input);
  } catch {
    return new URL(input, DUMMY_BASE_URL);
  }
}
function getPathWithoutTrailingSlash(pathname) {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}
function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function compileOpenApiPath(pathTemplate) {
  const params = [];
  let score = 0;
  const absolutePath = pathTemplate.startsWith("/") ? pathTemplate : `/${pathTemplate}`;
  const normalizedPath = getPathWithoutTrailingSlash(absolutePath);
  const regexBody = normalizedPath.split("/").map((segment) => {
    if (!segment) {
      return "";
    }
    const paramMatch = segment.match(/^\{([^}]+)\}$/);
    if (paramMatch) {
      params.push(paramMatch[1]);
      return "([^/]+)";
    }
    score += 2;
    return escapeRegex(segment);
  }).join("/");
  return {
    regex: new RegExp(`^${regexBody || "/"}$`),
    params,
    score
  };
}
function parseJsonBodyIfPresent(contentType, bodyText) {
  if (!bodyText) {
    return void 0;
  }
  if (!isJsonMime(contentType)) {
    return void 0;
  }
  try {
    return JSON.parse(bodyText);
  } catch {
    return void 0;
  }
}
function normalizeContentType(contentType) {
  if (!contentType) {
    return "";
  }
  return contentType.split(";")[0]?.trim().toLowerCase() ?? "";
}
function isJsonMime(contentType) {
  const mime = normalizeContentType(contentType);
  return mime === "application/json" || mime.endsWith("+json");
}
function pickSchemaByMime(contentMap, contentType) {
  const requestedMime = normalizeContentType(contentType);
  if (!requestedMime) {
    return contentMap["application/json"] ?? contentMap["*/*"];
  }
  if (contentMap[requestedMime] !== void 0) {
    return contentMap[requestedMime];
  }
  const [type, subtype] = requestedMime.split("/");
  if (type && subtype) {
    const wildcardSubtype = `${type}/*`;
    if (contentMap[wildcardSubtype] !== void 0) {
      return contentMap[wildcardSubtype];
    }
  }
  return contentMap["*/*"];
}
function shouldIgnoreHeaderAsUndocumented(headerName) {
  const normalizedHeaderName = headerName.toLowerCase();
  if (normalizedHeaderName.startsWith(":")) {
    return true;
  }
  return IGNORED_UNDOCUMENTED_HEADERS.has(normalizedHeaderName) || IGNORED_UNDOCUMENTED_HEADER_PREFIXES.some((prefix) => normalizedHeaderName.startsWith(prefix));
}

// src/commands/drift/openapi/matcher.ts
function toRelativePath(requestPath, server) {
  const normalizedRequestPath = getPathWithoutTrailingSlash(requestPath || "/") || "/";
  const normalizedBasePath = getPathWithoutTrailingSlash(server.basePath || "/") || "/";
  if (normalizedBasePath === "/") {
    return normalizedRequestPath;
  }
  if (normalizedRequestPath === normalizedBasePath) {
    return "/";
  }
  if (!normalizedRequestPath.startsWith(`${normalizedBasePath}/`)) {
    return null;
  }
  return normalizedRequestPath.slice(normalizedBasePath.length) || "/";
}
function hostMatches(operationServer, requestHost) {
  if (!operationServer.host || !requestHost) {
    return true;
  }
  return operationServer.host === requestHost.toLowerCase();
}
function decodePathParam(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}
function scoreCandidate(operation, server, mode) {
  const hostScore = mode === "strict-host" ? server.host ? 20 : 5 : 0;
  return operation.pathScore * 10 + hostScore;
}
function extractPathParams(operation, pathMatch) {
  const params = {};
  for (let index = 0; index < operation.pathParams.length; index += 1) {
    const paramName = operation.pathParams[index];
    const paramValue = pathMatch[index + 1];
    if (paramName && paramValue !== void 0) {
      params[paramName] = decodePathParam(paramValue);
    }
  }
  return params;
}
function matchOperationByRelativePath(operationCandidates, relativePath) {
  const normalizedPath = getPathWithoutTrailingSlash(relativePath) || "/";
  for (const operation of operationCandidates) {
    const pathMatch = operation.pathRegex.exec(normalizedPath);
    if (pathMatch) {
      return { operation, pathParams: extractPathParams(operation, pathMatch) };
    }
  }
  return null;
}
function matchOperation(index, exchange, mode, relativePathOverride) {
  const method = exchange.request.method.toLowerCase();
  const operationCandidates = index.operationsByMethod.get(method);
  if (!operationCandidates || operationCandidates.length === 0) {
    return null;
  }
  if (relativePathOverride !== void 0) {
    return matchOperationByRelativePath(operationCandidates, relativePathOverride);
  }
  let bestCandidate = null;
  for (const operation of operationCandidates) {
    for (const server of operation.servers) {
      if (mode === "strict-host" && !hostMatches(server, exchange.request.host)) {
        continue;
      }
      const relativePath = toRelativePath(exchange.request.path, server);
      if (!relativePath) {
        continue;
      }
      const pathMatch = operation.pathRegex.exec(relativePath);
      if (!pathMatch) {
        continue;
      }
      const candidate = {
        score: scoreCandidate(operation, server, mode),
        matched: {
          operation,
          pathParams: extractPathParams(operation, pathMatch)
        }
      };
      if (!bestCandidate || candidate.score > bestCandidate.score) {
        bestCandidate = candidate;
      }
    }
  }
  return bestCandidate?.matched ?? null;
}

// src/commands/drift/rules/builtins/owasp.ts
var MAX_EXPOSED_PATHS = 6;
var MAX_SCAN_NODES = 2e3;
var MAX_SCAN_ARRAY_ITEMS = 50;
var MAX_SENSITIVE_QUERY_PARAMS = 5;
var LARGE_RESPONSE_THRESHOLD_BYTES = 1e6;
var SENSITIVE_QUERY_KEY_PATTERN = /(?:token|api[_-]?key|apikey|password|passwd|secret|authorization|jwt)/i;
var SENSITIVE_RESPONSE_KEY_PATTERN = /(?:password|passwd|secret|api[_-]?key|access[_-]?token|refresh[_-]?token|private[_-]?key|ssn|credit[_-]?card|card[_-]?number|cvv)/i;
var PAGINATION_QUERY_KEYS = /* @__PURE__ */ new Set([
  "page",
  "limit",
  "offset",
  "cursor",
  "per_page",
  "perpage",
  "size",
  "start",
  "after",
  "before"
]);
var MASK_REVEALED_PREFIX_LENGTH = 4;
var MASK_FULL_THRESHOLD = MASK_REVEALED_PREFIX_LENGTH * 2;
function maskValue(value) {
  if (value.length <= MASK_FULL_THRESHOLD) {
    return "***";
  }
  return `${value.slice(0, MASK_REVEALED_PREFIX_LENGTH)}\u2026`;
}
function normalizeJsonPointerSegment(segment) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function looksLikePrimitive(value) {
  return typeof value === "string" || typeof value === "number";
}
function isFlagLikeSensitiveField(key) {
  const lower = key.toLowerCase();
  if (!(lower.includes("secret") || lower.includes("token") || lower.includes("key"))) {
    return false;
  }
  return lower.startsWith("is") || lower.startsWith("has") || lower.startsWith("can") || lower.startsWith("should") || lower.startsWith("enable") || lower.startsWith("allow");
}
function isBooleanLikeValue(value) {
  if (typeof value === "number") {
    return value === 0 || value === 1;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "false" || normalized === "0" || normalized === "1";
}
function findSensitiveResponsePaths(payload) {
  if (!isPlainObject(payload) && !Array.isArray(payload)) {
    return [];
  }
  const exposedPaths = [];
  const queue = [{ value: payload, path: "" }];
  let visitedNodes = 0;
  while (queue.length > 0 && visitedNodes < MAX_SCAN_NODES && exposedPaths.length < MAX_EXPOSED_PATHS) {
    const current = queue.pop();
    if (!current) {
      break;
    }
    visitedNodes += 1;
    if (Array.isArray(current.value)) {
      const limit = Math.min(current.value.length, MAX_SCAN_ARRAY_ITEMS);
      for (let index = 0; index < limit; index += 1) {
        const item = current.value[index];
        if (isPlainObject(item) || Array.isArray(item)) {
          queue.push({ value: item, path: `${current.path}/${index}` });
        }
      }
      continue;
    }
    if (!isPlainObject(current.value)) {
      continue;
    }
    for (const [key, value] of Object.entries(current.value)) {
      const pointerPath = `${current.path}/${normalizeJsonPointerSegment(key)}`;
      if (SENSITIVE_RESPONSE_KEY_PATTERN.test(key) && looksLikePrimitive(value)) {
        const stringified = String(value);
        if (isFlagLikeSensitiveField(key) && isBooleanLikeValue(value)) {
          continue;
        }
        if (stringified.length > 0) {
          exposedPaths.push(pointerPath || "/");
          if (exposedPaths.length >= MAX_EXPOSED_PATHS) {
            break;
          }
        }
      }
      if (isPlainObject(value) || Array.isArray(value)) {
        queue.push({ value, path: pointerPath });
      }
    }
  }
  return exposedPaths;
}
function hasPaginationHint(query) {
  for (const key of query.keys()) {
    if (PAGINATION_QUERY_KEYS.has(key.toLowerCase())) {
      return true;
    }
  }
  return false;
}
function buildSecurityFinding(context, message, target, severity, details) {
  return {
    ruleId: "owasp-api-top10",
    severity,
    category: "security",
    message,
    exchangeIndex: context.exchange.index,
    operationId: context.matchedOperation?.operation.operationId,
    specSource: context.matchedOperation?.operation.specSource,
    target,
    details
  };
}
function detectSensitiveQueryParams(context) {
  const matches = [];
  for (const [key, value] of context.exchange.request.query.entries()) {
    if (!SENSITIVE_QUERY_KEY_PATTERN.test(key)) {
      continue;
    }
    matches.push({
      key,
      valuePreview: maskValue(value)
    });
    if (matches.length >= MAX_SENSITIVE_QUERY_PARAMS) {
      break;
    }
  }
  if (matches.length === 0) {
    return [];
  }
  return [
    buildSecurityFinding(
      context,
      "Sensitive credential-like query parameters detected",
      "request",
      "warning",
      {
        issueId: "API2:2023",
        issueTitle: "Broken Authentication",
        summary: "Authentication data should not be passed via query parameters because it can leak via logs, browser history, and referrers.",
        sensitiveQueryParams: matches
      }
    )
  ];
}
function detectInsecureCors(context) {
  const response = context.exchange.response;
  if (!response) {
    return [];
  }
  const allowOrigin = response.headers["access-control-allow-origin"]?.trim();
  const allowCredentials = response.headers["access-control-allow-credentials"]?.trim().toLowerCase();
  if (allowOrigin !== "*" || allowCredentials !== "true") {
    return [];
  }
  return [
    buildSecurityFinding(
      context,
      "Insecure CORS policy: wildcard origin with credentials enabled",
      "response",
      "error",
      {
        issueId: "API8:2023",
        issueTitle: "Security Misconfiguration",
        summary: 'Access-Control-Allow-Origin is "*" while Access-Control-Allow-Credentials is true. Browsers may expose authenticated API responses to untrusted origins.',
        headers: {
          accessControlAllowOrigin: allowOrigin,
          accessControlAllowCredentials: allowCredentials
        }
      }
    )
  ];
}
function detectWeakCookieAttributes(context) {
  const response = context.exchange.response;
  if (!response) {
    return [];
  }
  const setCookie = response.headers["set-cookie"];
  if (!setCookie) {
    return [];
  }
  const findings = [];
  for (const cookie of splitSetCookieHeader(setCookie)) {
    const attributeNames = new Set(
      cookie.split(";").slice(1).map((attribute) => attribute.split("=")[0].trim().toLowerCase())
    );
    if (context.exchange.request.protocol === "https:" && !attributeNames.has("secure")) {
      findings.push(
        buildSecurityFinding(
          context,
          'Set-Cookie header is missing "Secure" attribute',
          "response",
          "warning",
          {
            issueId: "API2:2023",
            issueTitle: "Broken Authentication",
            summary: 'Session cookies over HTTPS should include "Secure" to prevent transmission over plain HTTP.',
            setCookiePreview: cookie.slice(0, 200)
          }
        )
      );
    }
    if (!attributeNames.has("httponly")) {
      findings.push(
        buildSecurityFinding(
          context,
          'Set-Cookie header is missing "HttpOnly" attribute',
          "response",
          "warning",
          {
            issueId: "API2:2023",
            issueTitle: "Broken Authentication",
            summary: 'Session cookies should include "HttpOnly" to reduce risk of token theft via client-side script access.',
            setCookiePreview: cookie.slice(0, 200)
          }
        )
      );
    }
    if (!attributeNames.has("samesite")) {
      findings.push(
        buildSecurityFinding(
          context,
          'Set-Cookie header is missing "SameSite" attribute',
          "response",
          "info",
          {
            issueId: "API8:2023",
            issueTitle: "Security Misconfiguration",
            summary: 'Set "SameSite" on session cookies to reduce CSRF risk for state-changing requests.',
            setCookiePreview: cookie.slice(0, 200)
          }
        )
      );
    }
  }
  return findings;
}
function detectSensitiveResponseData(context) {
  const response = context.exchange.response;
  if (!response || response.bodyJson === void 0) {
    return [];
  }
  const exposedPaths = findSensitiveResponsePaths(response.bodyJson);
  if (exposedPaths.length === 0) {
    return [];
  }
  return [
    buildSecurityFinding(
      context,
      "Potential sensitive data exposure in response payload",
      "response",
      "warning",
      {
        issueId: "API3:2019",
        issueTitle: "Excessive Data Exposure",
        summary: `Sensitive-looking fields detected in response payload: ${exposedPaths.join(", ")}`,
        exposedPaths
      }
    )
  ];
}
function detectLargeUnpaginatedResponses(context) {
  const response = context.exchange.response;
  if (!response || response.status >= 400 || context.exchange.request.method !== "GET") {
    return [];
  }
  if (!response.bodyText || response.bodyText.length < LARGE_RESPONSE_THRESHOLD_BYTES) {
    return [];
  }
  if (hasPaginationHint(context.exchange.request.query)) {
    return [];
  }
  return [
    buildSecurityFinding(
      context,
      "Large response without pagination parameters (possible resource-consumption risk)",
      "response",
      "info",
      {
        issueId: "API4:2023",
        issueTitle: "Unrestricted Resource Consumption",
        summary: "A large response was returned without common pagination query parameters. Consider explicit page/limit controls for large collections.",
        responseBytes: response.bodyText.length
      }
    )
  ];
}
var OwaspApiTop10Rule = class {
  id = "owasp-api-top10";
  analyze(context) {
    if (!context.matchedOperation) {
      return [];
    }
    return [
      ...detectSensitiveQueryParams(context),
      ...detectInsecureCors(context),
      ...detectWeakCookieAttributes(context),
      ...detectSensitiveResponseData(context),
      ...detectLargeUnpaginatedResponses(context)
    ];
  }
};

// src/commands/drift/rules/builtins/schema.ts
var MAX_ACTUAL_VALUE_LENGTH = 200;
function hasBodyContent(bodyText) {
  return bodyText !== void 0 && bodyText !== "";
}
function parseCookies(headerValue) {
  if (!headerValue) {
    return {};
  }
  const cookies = {};
  for (const pair of headerValue.split(";")) {
    const [rawName, ...rawValueParts] = pair.trim().split("=");
    if (!rawName) {
      continue;
    }
    const value = rawValueParts.join("=").trim();
    cookies[rawName] = value;
  }
  return cookies;
}
function decodeJsonPointerSegment(segment) {
  return segment.replace(/~1/g, "/").replace(/~0/g, "~");
}
function encodeJsonPointerSegment(segment) {
  return segment.replace(/~/g, "~0").replace(/\//g, "~1");
}
function normalizeJsonPointer(pointer) {
  if (!pointer || pointer === "#") {
    return "";
  }
  if (pointer.startsWith("#")) {
    return pointer.slice(1);
  }
  return pointer;
}
function jsonPointerSegments(pointer) {
  const normalized = normalizeJsonPointer(pointer);
  if (!normalized || normalized === "/") {
    return [];
  }
  return normalized.split("/").slice(1).map((segment) => decodeJsonPointerSegment(segment));
}
function joinJsonPointer(basePath, segment) {
  const baseSegments = jsonPointerSegments(basePath);
  return `/${[...baseSegments, encodeJsonPointerSegment(segment)].join("/")}`;
}
function getValueAtJsonPointer(root, pointer) {
  const segments = jsonPointerSegments(pointer);
  let current = root;
  for (const segment of segments) {
    if (Array.isArray(current)) {
      const index = Number.parseInt(segment, 10);
      if (!Number.isInteger(index) || index < 0 || index >= current.length) {
        return void 0;
      }
      current = current[index];
      continue;
    }
    if (!isPlainObject(current)) {
      return void 0;
    }
    current = current[segment];
  }
  return current;
}
function normalizeDataPathForError(error) {
  const basePath = error.instancePath ?? "";
  const params = error.params ?? {};
  if (error.keyword === "required" && typeof params.missingProperty === "string") {
    return joinJsonPointer(basePath, params.missingProperty);
  }
  if (error.keyword === "additionalProperties" && typeof params.additionalProperty === "string") {
    return joinJsonPointer(basePath, params.additionalProperty);
  }
  return basePath;
}
function renderReadablePath(pointer) {
  const segments = jsonPointerSegments(pointer);
  if (segments.length === 0) {
    return "root";
  }
  const pathParts = [];
  for (const segment of segments) {
    if (/^\d+$/.test(segment)) {
      pathParts.push(`[${segment}]`);
    } else if (pathParts.length === 0) {
      pathParts.push(segment);
    } else {
      pathParts.push(`.${segment}`);
    }
  }
  return pathParts.join("");
}
function compactActualValue(value) {
  if (value === void 0) {
    return "[missing]";
  }
  const serialized = JSON.stringify(value);
  if (!serialized) {
    return String(value);
  }
  return serialized.length > MAX_ACTUAL_VALUE_LENGTH ? `${serialized.slice(0, MAX_ACTUAL_VALUE_LENGTH)}\u2026` : serialized;
}
function createExpectedHint(error) {
  const params = error.params ?? {};
  if (error.keyword === "required" && typeof params.missingProperty === "string") {
    return `required field "${params.missingProperty}"`;
  }
  if (error.keyword === "type" && typeof params.type === "string") {
    return `type "${params.type}"`;
  }
  if (error.keyword === "additionalProperties") {
    return "no additional undocumented properties";
  }
  if (error.keyword === "format" && typeof params.format === "string") {
    return `format "${params.format}"`;
  }
  return void 0;
}
function createFallbackSchemaErrorSummary(target, error, highlightedDataPath) {
  const targetLabel = target === "request" ? "Request" : "Response";
  const params = error.params ?? {};
  const location = renderReadablePath(highlightedDataPath);
  if (error.keyword === "required" && typeof params.missingProperty === "string") {
    return `${targetLabel} is missing required field "${location}".`;
  }
  if (error.keyword === "additionalProperties" && typeof params.additionalProperty === "string") {
    return `${targetLabel} has undocumented field "${location}".`;
  }
  if (error.keyword === "type" && typeof params.type === "string") {
    return `${targetLabel} field "${location}" must be ${params.type}.`;
  }
  if (error.keyword === "enum") {
    return `${targetLabel} field "${location}" has a value outside allowed enum values.`;
  }
  if (error.keyword === "format" && typeof params.format === "string") {
    return `${targetLabel} field "${location}" does not match format "${params.format}".`;
  }
  return `${targetLabel} schema mismatch at "${location}": ${error.message ?? "validation error"}`;
}
function createSchemaErrorDetails(value, error, target) {
  const highlightedDataPath = normalizeDataPathForError(error);
  const actualValue = getValueAtJsonPointer(value, highlightedDataPath);
  const summary = createFallbackSchemaErrorSummary(target, error, highlightedDataPath);
  return {
    summary,
    keyword: error.keyword ?? null,
    path: highlightedDataPath || "/",
    expected: createExpectedHint(error) ?? null,
    actual: compactActualValue(actualValue),
    suggestion: null,
    params: error.params ?? {},
    ajvMessage: error.message ?? "validation error"
  };
}
function validateParameter(parameter, actualValue, context, findings) {
  if (actualValue === void 0 || actualValue === null || !parameter.schema) {
    return;
  }
  const result = context.validateSchema(parameter.schema, actualValue, { coerce: true });
  if (result.valid) {
    return;
  }
  for (const error of result.errors) {
    const details = createSchemaErrorDetails(actualValue, error, "request");
    findings.push({
      ruleId: "schema-consistency",
      severity: "error",
      category: "schema",
      message: `Invalid ${parameter.in} parameter "${parameter.name}": ${typeof details.summary === "string" ? details.summary : error.message ?? "schema mismatch"}`,
      exchangeIndex: context.exchange.index,
      operationId: context.matchedOperation?.operation.operationId,
      specSource: context.matchedOperation?.operation.specSource,
      target: "request",
      schemaPath: error.schemaPath,
      dataPath: normalizeDataPathForError(error),
      details: {
        ...details,
        parameter: {
          name: parameter.name,
          in: parameter.in
        }
      }
    });
  }
}
function getActualParameterValue(parameter, context, cookies) {
  switch (parameter.in) {
    case "path":
      return context.matchedOperation?.pathParams[parameter.name];
    case "query": {
      const values = context.exchange.request.query.getAll(parameter.name);
      if (values.length === 0) {
        return void 0;
      }
      const schemaType = isPlainObject(parameter.schema) ? parameter.schema.type : void 0;
      if (schemaType === "array" || values.length > 1) {
        return values;
      }
      return values[0];
    }
    case "header":
      return context.exchange.request.headers[parameter.name.toLowerCase()];
    case "cookie":
      return cookies[parameter.name];
    default:
      return void 0;
  }
}
function createUndocumentedParameterFindings(context, matchedOperation) {
  const findings = [];
  const paramsByLocation = {
    query: /* @__PURE__ */ new Set(),
    header: /* @__PURE__ */ new Set(),
    cookie: /* @__PURE__ */ new Set()
  };
  for (const parameter of matchedOperation.operation.requestParameters) {
    if (parameter.in === "header") {
      paramsByLocation.header.add(parameter.name.toLowerCase());
    } else if (parameter.in === "query" || parameter.in === "cookie") {
      paramsByLocation[parameter.in].add(parameter.name);
    }
  }
  for (const name of new Set(context.exchange.request.query.keys())) {
    if (!paramsByLocation.query.has(name)) {
      findings.push({
        ruleId: "schema-consistency",
        severity: "warning",
        category: "documentation",
        message: `Undocumented query parameter in traffic: "${name}"`,
        exchangeIndex: context.exchange.index,
        operationId: matchedOperation.operation.operationId,
        specSource: matchedOperation.operation.specSource,
        target: "request"
      });
    }
  }
  for (const headerName of Object.keys(context.exchange.request.headers)) {
    if (shouldIgnoreHeaderAsUndocumented(headerName)) {
      continue;
    }
    if (!paramsByLocation.header.has(headerName.toLowerCase())) {
      findings.push({
        ruleId: "schema-consistency",
        severity: "info",
        category: "documentation",
        message: `Undocumented header in traffic: "${headerName}"`,
        exchangeIndex: context.exchange.index,
        operationId: matchedOperation.operation.operationId,
        specSource: matchedOperation.operation.specSource,
        target: "request"
      });
    }
  }
  return findings;
}
function pickResponseSchema(context, matchedOperation) {
  const response = context.exchange.response;
  if (!response) {
    return void 0;
  }
  const statusCode = String(response.status);
  const statusClass = `${Math.floor(response.status / 100)}XX`;
  const responseContentMap = matchedOperation.operation.responseBodyContent[statusCode] ?? matchedOperation.operation.responseBodyContent[statusClass] ?? matchedOperation.operation.responseBodyContent[statusClass.toLowerCase()] ?? matchedOperation.operation.responseBodyContent.default;
  if (!responseContentMap) {
    return void 0;
  }
  return pickSchemaByMime(responseContentMap, response.contentType);
}
function validateSchemaResult(schema, value, context, target) {
  const result = context.validateSchema(schema, value, { target });
  if (result.valid) {
    return [];
  }
  return result.errors.map((error) => {
    const details = createSchemaErrorDetails(value, error, target);
    return {
      ruleId: "schema-consistency",
      severity: "error",
      category: "schema",
      message: typeof details.summary === "string" ? details.summary : `Schema mismatch (${target}): ${error.message ?? "validation error"}`,
      exchangeIndex: context.exchange.index,
      operationId: context.matchedOperation?.operation.operationId,
      specSource: context.matchedOperation?.operation.specSource,
      target,
      schemaPath: error.schemaPath,
      dataPath: normalizeDataPathForError(error),
      details
    };
  });
}
var SchemaConsistencyRule = class {
  id = "schema-consistency";
  analyze(context) {
    const matchedOperation = context.matchedOperation;
    if (!matchedOperation) {
      return [];
    }
    const findings = [];
    const cookies = parseCookies(context.exchange.request.headers.cookie);
    findings.push(...createUndocumentedParameterFindings(context, matchedOperation));
    for (const parameter of matchedOperation.operation.requestParameters) {
      if (context.ignoreCookies && parameter.in === "cookie") {
        continue;
      }
      const actualValue = getActualParameterValue(parameter, context, cookies);
      if (parameter.required && (actualValue === void 0 || actualValue === null)) {
        findings.push({
          ruleId: this.id,
          severity: "error",
          category: "documentation",
          message: `Missing required ${parameter.in} parameter: "${parameter.name}"`,
          exchangeIndex: context.exchange.index,
          operationId: matchedOperation.operation.operationId,
          specSource: matchedOperation.operation.specSource,
          target: "request"
        });
        continue;
      }
      validateParameter(parameter, actualValue, context, findings);
    }
    const requestContentType = context.exchange.request.contentType;
    const requestSchema = pickSchemaByMime(
      matchedOperation.operation.requestBodyContent,
      requestContentType
    );
    const hasRequestBody = hasBodyContent(context.exchange.request.bodyText);
    if (matchedOperation.operation.requestBodyRequired && !hasRequestBody) {
      findings.push({
        ruleId: this.id,
        severity: "error",
        category: "documentation",
        message: "Missing required request body",
        exchangeIndex: context.exchange.index,
        operationId: matchedOperation.operation.operationId,
        specSource: matchedOperation.operation.specSource,
        target: "request"
      });
    }
    if (requestSchema && hasRequestBody && isJsonMime(requestContentType)) {
      if (context.exchange.request.bodyJson === void 0) {
        findings.push({
          ruleId: this.id,
          severity: "error",
          category: "schema",
          message: "Request body is not valid JSON for JSON content-type",
          exchangeIndex: context.exchange.index,
          operationId: matchedOperation.operation.operationId,
          specSource: matchedOperation.operation.specSource,
          target: "request"
        });
      } else {
        findings.push(
          ...validateSchemaResult(
            requestSchema,
            context.exchange.request.bodyJson,
            context,
            "request"
          )
        );
      }
    }
    const responseSchema = pickResponseSchema(context, matchedOperation);
    if (responseSchema && context.exchange.response && hasBodyContent(context.exchange.response.bodyText)) {
      const responseContentType = context.exchange.response.contentType;
      if (isJsonMime(responseContentType)) {
        if (context.exchange.response.bodyJson === void 0) {
          findings.push({
            ruleId: this.id,
            severity: "error",
            category: "schema",
            message: "Response body is not valid JSON for JSON content-type",
            exchangeIndex: context.exchange.index,
            operationId: matchedOperation.operation.operationId,
            specSource: matchedOperation.operation.specSource,
            target: "response"
          });
        } else {
          findings.push(
            ...validateSchemaResult(
              responseSchema,
              context.exchange.response.bodyJson,
              context,
              "response"
            )
          );
        }
      }
    }
    return findings;
  }
};

// src/commands/drift/rules/builtins/security.ts
function extractAuthorizationScheme(authorizationHeader) {
  if (!authorizationHeader) {
    return null;
  }
  const [scheme] = authorizationHeader.trim().split(/\s+/, 1);
  return scheme ? scheme.toLowerCase() : null;
}
function hasAuthorizationHeader(context) {
  return Boolean(context.exchange.request.headers.authorization);
}
function hasCookieValue(cookieHeader, cookieName) {
  if (!cookieHeader) {
    return false;
  }
  return cookieHeader.split(";").map((part) => part.trim()).some((part) => part.startsWith(`${cookieName}=`));
}
function evaluateScheme(context, schemeName) {
  const operation = context.matchedOperation?.operation;
  if (!operation) {
    return {
      schemeName,
      schemeType: "unknown",
      satisfied: true,
      reason: "No matched OpenAPI operation."
    };
  }
  const scheme = operation.securitySchemes[schemeName];
  if (!scheme) {
    return {
      schemeName,
      schemeType: "missing",
      satisfied: false,
      reason: "Security scheme is referenced but not defined in components.securitySchemes."
    };
  }
  const schemeType = String(scheme.type ?? "unknown");
  if (scheme.type === "apiKey") {
    const parameterName = String(scheme.name ?? "");
    const parameterLocation = String(scheme.in ?? "header");
    if (!parameterName) {
      return {
        schemeName,
        schemeType,
        satisfied: false,
        reason: 'apiKey scheme is missing the "name" field in the OpenAPI spec.'
      };
    }
    if (parameterLocation === "header") {
      const present = Boolean(context.exchange.request.headers[parameterName.toLowerCase()]);
      return {
        schemeName,
        schemeType,
        satisfied: present,
        reason: present ? `Found required apiKey header "${parameterName}".` : `Missing required apiKey header "${parameterName}".`
      };
    }
    if (parameterLocation === "query") {
      const present = context.exchange.request.query.has(parameterName);
      return {
        schemeName,
        schemeType,
        satisfied: present,
        reason: present ? `Found required apiKey query parameter "${parameterName}".` : `Missing required apiKey query parameter "${parameterName}".`
      };
    }
    if (parameterLocation === "cookie") {
      if (context.ignoreCookies) {
        return {
          schemeName,
          schemeType,
          satisfied: true,
          skipped: true,
          reason: `Skipped apiKey cookie "${parameterName}" validation because --ignore-cookies is enabled.`
        };
      }
      const present = hasCookieValue(context.exchange.request.headers.cookie, parameterName);
      return {
        schemeName,
        schemeType,
        satisfied: present,
        reason: present ? `Found required apiKey cookie "${parameterName}".` : `Missing required apiKey cookie "${parameterName}".`
      };
    }
    return {
      schemeName,
      schemeType,
      satisfied: false,
      reason: `Unsupported apiKey location "${parameterLocation}" in OpenAPI security scheme.`
    };
  }
  if (scheme.type === "http") {
    const auth = context.exchange.request.headers.authorization;
    if (!auth) {
      return {
        schemeName,
        schemeType,
        satisfied: false,
        reason: "Missing Authorization header."
      };
    }
    const httpScheme = String(scheme.scheme ?? "").toLowerCase();
    const actualAuthScheme = extractAuthorizationScheme(auth);
    if (!httpScheme) {
      return {
        schemeName,
        schemeType,
        satisfied: true,
        reason: "Authorization header is present and no specific HTTP auth scheme is documented."
      };
    }
    if (!actualAuthScheme) {
      return {
        schemeName,
        schemeType,
        satisfied: false,
        reason: "Authorization header is malformed and does not include an auth scheme."
      };
    }
    const satisfied = actualAuthScheme === httpScheme;
    return {
      schemeName,
      schemeType,
      satisfied,
      reason: satisfied ? `Authorization uses expected "${httpScheme}" scheme.` : `Authorization uses "${actualAuthScheme}" but "${httpScheme}" is required.`
    };
  }
  if (scheme.type === "oauth2" || scheme.type === "openIdConnect") {
    const auth = context.exchange.request.headers.authorization;
    if (!auth) {
      return {
        schemeName,
        schemeType,
        satisfied: false,
        reason: "Missing Authorization header for OAuth2/OpenID Connect scheme."
      };
    }
    const actualAuthScheme = extractAuthorizationScheme(auth);
    const satisfied = actualAuthScheme === "bearer";
    return {
      schemeName,
      schemeType,
      satisfied,
      reason: satisfied ? "Authorization uses bearer token as expected for OAuth2/OpenID Connect." : `Authorization scheme "${actualAuthScheme ?? "unknown"}" does not satisfy OAuth2/OpenID Connect (expected bearer).`
    };
  }
  if (scheme.type === "mutualTLS") {
    return {
      schemeName,
      schemeType,
      satisfied: true,
      reason: "mutualTLS cannot be validated from HTTP traffic logs alone."
    };
  }
  return {
    schemeName,
    schemeType,
    satisfied: false,
    reason: `Unsupported security scheme type "${schemeType}".`
  };
}
function evaluateSecurityRequirements(context) {
  const security = context.matchedOperation?.operation.security;
  if (!security) {
    return {
      satisfied: true,
      requirements: []
    };
  }
  if (security.length === 0) {
    return {
      satisfied: true,
      requirements: []
    };
  }
  const requirements = security.map((requirement, requirementIndex) => {
    const schemeNames = Object.keys(requirement);
    if (schemeNames.length === 0) {
      return {
        requirementIndex,
        satisfied: true,
        schemeResults: []
      };
    }
    const schemeResults = schemeNames.map((schemeName) => evaluateScheme(context, schemeName));
    return {
      requirementIndex,
      satisfied: schemeResults.every((result) => result.satisfied),
      schemeResults
    };
  });
  return {
    satisfied: requirements.some((requirement) => requirement.satisfied),
    requirements
  };
}
function collectSecurityIssues(evaluation) {
  const issues = [];
  for (const requirement of evaluation.requirements) {
    for (const schemeResult of requirement.schemeResults) {
      if (!schemeResult.satisfied) {
        issues.push({
          requirement: requirement.requirementIndex + 1,
          schemeName: schemeResult.schemeName,
          reason: schemeResult.reason
        });
      }
    }
  }
  return issues;
}
function collectSkippedSecurityChecks(evaluation) {
  const skippedChecks = [];
  for (const requirement of evaluation.requirements) {
    for (const schemeResult of requirement.schemeResults) {
      if (schemeResult.skipped) {
        skippedChecks.push({
          requirement: requirement.requirementIndex + 1,
          schemeName: schemeResult.schemeName,
          reason: schemeResult.reason
        });
      }
    }
  }
  return skippedChecks;
}
function createSecuritySummary(issues) {
  if (issues.length === 0) {
    return "All documented security requirements are satisfied.";
  }
  const groupedByRequirement = /* @__PURE__ */ new Map();
  for (const issue of issues) {
    const grouped = groupedByRequirement.get(issue.requirement);
    if (grouped) {
      grouped.push(issue);
    } else {
      groupedByRequirement.set(issue.requirement, [issue]);
    }
  }
  const optionSummaries = Array.from(groupedByRequirement.entries()).sort((a, b) => a[0] - b[0]).map(([requirement, optionIssues]) => {
    const schemeNames = optionIssues.map((issue) => issue.schemeName).join(" + ");
    const reasons = optionIssues.map((issue) => issue.reason).join(" ");
    return `Option ${requirement} (${schemeNames}): ${reasons}`;
  });
  if (optionSummaries.length === 1) {
    return `Authentication check failed. ${optionSummaries[0]}`;
  }
  return `None of the documented authentication options matched. Any one of these options would satisfy the OpenAPI security requirements: ${optionSummaries.join(" | ")}`;
}
function getSensitiveQueryKeys(context) {
  return Array.from(context.exchange.request.query.keys()).filter((key) => {
    const normalizedKey = key.toLowerCase();
    return normalizedKey.includes("token") || normalizedKey.includes("apikey") || normalizedKey.includes("api_key") || normalizedKey.includes("access_key");
  });
}
function shouldFlagInsecureTransport(context) {
  if (context.exchange.request.protocol !== "http:" || !context.exchange.request.protocolKnown) {
    return {
      flag: false,
      hasAuthHeader: false,
      sensitiveQueryKeys: []
    };
  }
  const hasAuthHeader = hasAuthorizationHeader(context);
  const sensitiveQueryKeys = getSensitiveQueryKeys(context);
  return {
    flag: hasAuthHeader || sensitiveQueryKeys.length > 0,
    hasAuthHeader,
    sensitiveQueryKeys
  };
}
var SecurityRule = class {
  id = "security-baseline";
  analyze(context) {
    if (!context.matchedOperation) {
      return [];
    }
    const findings = [];
    const securityEvaluation = evaluateSecurityRequirements(context);
    if (!securityEvaluation.satisfied) {
      const issues = collectSecurityIssues(securityEvaluation);
      findings.push({
        ruleId: this.id,
        severity: "error",
        category: "security",
        message: "Request does not satisfy documented OpenAPI security requirements",
        exchangeIndex: context.exchange.index,
        operationId: context.matchedOperation.operation.operationId,
        specSource: context.matchedOperation.operation.specSource,
        target: "request",
        details: {
          summary: createSecuritySummary(issues),
          failedChecks: issues,
          skippedChecks: collectSkippedSecurityChecks(securityEvaluation),
          authorizationScheme: extractAuthorizationScheme(
            context.exchange.request.headers.authorization
          ),
          hasAuthorizationHeader: hasAuthorizationHeader(context)
        }
      });
    } else {
      const skippedChecks = collectSkippedSecurityChecks(securityEvaluation);
      if (skippedChecks.length > 0) {
        findings.push({
          ruleId: this.id,
          severity: "info",
          category: "security",
          message: "Some documented cookie-based security checks were skipped",
          exchangeIndex: context.exchange.index,
          operationId: context.matchedOperation.operation.operationId,
          specSource: context.matchedOperation.operation.specSource,
          target: "request",
          details: {
            summary: skippedChecks.map(
              (check) => `Skipped option ${check.requirement} (${check.schemeName}): ${check.reason}`
            ).join(" "),
            skippedChecks
          }
        });
      }
    }
    const insecureTransport = shouldFlagInsecureTransport(context);
    if (insecureTransport.flag) {
      findings.push({
        ruleId: this.id,
        severity: "warning",
        category: "security",
        message: "Potential credential exposure over insecure HTTP transport",
        exchangeIndex: context.exchange.index,
        operationId: context.matchedOperation.operation.operationId,
        specSource: context.matchedOperation.operation.specSource,
        target: "request",
        details: {
          protocol: context.exchange.request.protocol,
          hasAuthorizationHeader: insecureTransport.hasAuthHeader,
          sensitiveQueryKeys: insecureTransport.sensitiveQueryKeys
        }
      });
    }
    return findings;
  }
};

// src/commands/drift/rules/builtins/undocumented-endpoint.ts
var UndocumentedEndpointRule = class {
  id = "undocumented-endpoint";
  analyze(context) {
    if (context.matchedOperation) {
      return [];
    }
    const { method, path: path3, host } = context.exchange.request;
    const isHostMismatch = context.matchMode === "strict-host" && !context.hostCompatibleWithSpecServers;
    const message = isHostMismatch ? `Undocumented server: ${method} ${path3} was sent to "${host}", which does not match any server in the description` : `Undocumented endpoint: ${method} ${path3}`;
    return [
      {
        ruleId: this.id,
        severity: "error",
        category: "documentation",
        message,
        exchangeIndex: context.exchange.index,
        target: "request"
      }
    ];
  }
};

// src/commands/drift/rules/registry.ts
var BUILTIN_RULE_FACTORIES = {
  "undocumented-endpoint": () => new UndocumentedEndpointRule(),
  "schema-consistency": () => new SchemaConsistencyRule(),
  "security-baseline": () => new SecurityRule(),
  "owasp-api-top10": () => new OwaspApiTop10Rule()
};
var BUILTIN_RULE_IDS = Object.keys(BUILTIN_RULE_FACTORIES);
var DEFAULT_BUILTIN_RULE_IDS = [
  "undocumented-endpoint",
  "schema-consistency",
  "security-baseline"
];
function loadRules(activeRuleIds) {
  if (!activeRuleIds || activeRuleIds.length === 0) {
    return DEFAULT_BUILTIN_RULE_IDS.map((ruleId) => BUILTIN_RULE_FACTORIES[ruleId]());
  }
  return [...new Set(activeRuleIds)].map((ruleId) => {
    const factory = BUILTIN_RULE_FACTORIES[ruleId];
    if (!factory) {
      throw new Error(
        `Unknown rule id: "${ruleId}". Available rules: ${BUILTIN_RULE_IDS.join(", ")}`
      );
    }
    return factory();
  });
}

// src/commands/drift/utils/server.ts
function normalizeServerPrefix(server) {
  const trimmed = server?.replace(/\/+$/, "");
  return trimmed || void 0;
}
function stripPrefixFromPath(pathname, prefixPath) {
  if (!prefixPath || prefixPath === "/") {
    return pathname || "/";
  }
  if (pathname === prefixPath) {
    return "/";
  }
  if (!pathname.startsWith(`${prefixPath}/`)) {
    return void 0;
  }
  return pathname.slice(prefixPath.length) || "/";
}
function resolvePathForServer(request, server) {
  if (server.startsWith("/")) {
    return stripPrefixFromPath(request.path, server);
  }
  const serverUrl = parseUrl(server.includes("://") ? server : `http://${server}`);
  if (isSyntheticHost(serverUrl.host) || request.host !== void 0 && request.host.toLowerCase() !== serverUrl.host) {
    return void 0;
  }
  return stripPrefixFromPath(request.path, getPathWithoutTrailingSlash(serverUrl.pathname));
}

// src/commands/drift/engine/schema-validator.ts
var import__ = __toESM(require__(), 1);
var import_ajv_formats = __toESM(require_dist(), 1);
var AjvConstructor = import__.default;
var applyFormats = import_ajv_formats.default;
function isPropertyExcludedFromTarget(propertySchema, target) {
  if (!isPlainObject(propertySchema)) {
    return false;
  }
  return target === "request" ? propertySchema.readOnly === true : propertySchema.writeOnly === true;
}
function isRequiredNameExcludedFromTarget(schema, name, target, seen = /* @__PURE__ */ new WeakSet()) {
  if (!isPlainObject(schema) || seen.has(schema)) {
    return false;
  }
  seen.add(schema);
  const properties = schema.properties;
  if (isPlainObject(properties) && isPropertyExcludedFromTarget(properties[name], target)) {
    return true;
  }
  return [schema.allOf, schema.oneOf, schema.anyOf].some(
    (branches) => Array.isArray(branches) && branches.some((branch) => isRequiredNameExcludedFromTarget(branch, name, target, seen))
  );
}
var SINGLE_SCHEMA_KEYWORDS = /* @__PURE__ */ new Set([
  "items",
  "additionalItems",
  "additionalProperties",
  "unevaluatedItems",
  "unevaluatedProperties",
  "contains",
  "propertyNames",
  "not",
  "if",
  "then",
  "else"
]);
var SCHEMA_LIST_KEYWORDS = /* @__PURE__ */ new Set(["allOf", "anyOf", "oneOf", "prefixItems"]);
var SCHEMA_MAP_KEYWORDS = /* @__PURE__ */ new Set([
  "properties",
  "patternProperties",
  "dependentSchemas",
  "$defs",
  "definitions"
]);
function relaxRequiredForTarget(schema, target, ancestors = /* @__PURE__ */ new WeakSet()) {
  if (!isPlainObject(schema)) {
    return schema;
  }
  if (ancestors.has(schema)) {
    return true;
  }
  ancestors.add(schema);
  const relaxValue = (value) => relaxRequiredForTarget(value, target, ancestors);
  const output = {};
  for (const [key, value] of Object.entries(schema)) {
    if (SINGLE_SCHEMA_KEYWORDS.has(key)) {
      output[key] = Array.isArray(value) ? value.map(relaxValue) : relaxValue(value);
    } else if (SCHEMA_LIST_KEYWORDS.has(key) && Array.isArray(value)) {
      output[key] = value.map(relaxValue);
    } else if (SCHEMA_MAP_KEYWORDS.has(key) && isPlainObject(value)) {
      output[key] = Object.fromEntries(
        Object.entries(value).map(([mapKey, mapValue]) => [mapKey, relaxValue(mapValue)])
      );
    } else {
      output[key] = value;
    }
  }
  if (Array.isArray(schema.required)) {
    output.required = schema.required.filter(
      (name) => typeof name !== "string" || !isRequiredNameExcludedFromTarget(schema, name, target)
    );
  }
  ancestors.delete(schema);
  return output;
}
var SchemaValidator = class {
  ajv;
  objectSchemaCaches = {
    none: /* @__PURE__ */ new WeakMap(),
    request: /* @__PURE__ */ new WeakMap(),
    response: /* @__PURE__ */ new WeakMap()
  };
  scalarSchemaCache = /* @__PURE__ */ new Map();
  constructor(options) {
    this.ajv = new AjvConstructor({
      strict: false,
      allErrors: true,
      allowUnionTypes: true,
      coerceTypes: options?.coerceTypes ? "array" : false,
      validateFormats: true,
      verbose: true,
      formats: {
        // Some specs misuse `format: "enum"` instead of the `enum` keyword.
        // Treat it as a no-op format to avoid noisy unknown-format warnings.
        enum: true
      }
    });
    applyFormats(this.ajv);
  }
  validate(schema, value, target) {
    if (schema === void 0) {
      return { valid: true, errors: [] };
    }
    let validate;
    try {
      validate = this.getOrCompileValidator(schema, target);
    } catch (error) {
      return {
        valid: false,
        errors: [
          {
            message: `Schema compilation failed: ${error.message}`
          }
        ]
      };
    }
    const valid = Boolean(validate(value));
    const errors = validate.errors ?? [];
    return { valid, errors };
  }
  getOrCompileValidator(schema, target) {
    if (isPlainObject(schema)) {
      const cache = this.objectSchemaCaches[target ?? "none"];
      const cached2 = cache.get(schema);
      if (cached2) {
        return cached2;
      }
      const effectiveSchema = target ? relaxRequiredForTarget(schema, target) : schema;
      const compiled2 = this.ajv.compile(effectiveSchema);
      cache.set(schema, compiled2);
      return compiled2;
    }
    const cacheKey = `${target ?? "none"}:${JSON.stringify(schema)}`;
    const cached = this.scalarSchemaCache.get(cacheKey);
    if (cached) {
      return cached;
    }
    const compiled = this.ajv.compile(schema);
    this.scalarSchemaCache.set(cacheKey, compiled);
    return compiled;
  }
};

// src/commands/drift/engine/validation-session.ts
var DEFAULT_FINDINGS_PREVIEW_LIMIT = 10;
var SEVERITY_RANK = {
  info: 0,
  warning: 1,
  error: 2
};
function createInitialCounters() {
  return {
    totalExchanges: 0,
    documentedExchanges: 0,
    undocumentedExchanges: 0,
    skippedExchanges: 0,
    hostCompatibleExchanges: 0,
    findingsBySeverity: {
      info: 0,
      warning: 0,
      error: 0
    },
    findingsByRule: {}
  };
}
function accumulateFinding(counters, finding) {
  counters.findingsBySeverity[finding.severity] += 1;
  counters.findingsByRule[finding.ruleId] = (counters.findingsByRule[finding.ruleId] ?? 0) + 1;
}
function toFindingRecord(finding, exchange) {
  return {
    ...finding,
    id: randomUUID(),
    method: exchange.request.method,
    url: exchange.request.url,
    path: exchange.request.path,
    status: exchange.response?.status
  };
}
function mapFindingToPreview(finding, exchange) {
  return {
    exchangeIndex: finding.exchangeIndex,
    ruleId: finding.ruleId,
    severity: finding.severity,
    category: finding.category,
    message: finding.message,
    occurrences: 1,
    operationId: finding.operationId,
    specSource: finding.specSource,
    target: finding.target,
    schemaPath: finding.schemaPath,
    dataPath: finding.dataPath,
    details: finding.details,
    method: exchange.request.method,
    url: exchange.request.url,
    path: exchange.request.path,
    status: exchange.response?.status
  };
}
function ensureOperationContextInFinding(finding, matchedOperation) {
  if (!matchedOperation) {
    return;
  }
  if (!finding.operationId) {
    finding.operationId = matchedOperation.operation.operationId;
  }
  if (!finding.specSource) {
    finding.specSource = matchedOperation.operation.specSource;
  }
  const existingDetails = finding.details ?? {};
  if (!isPlainObject(existingDetails)) {
    finding.details = {
      operationPathTemplate: matchedOperation.operation.pathTemplate
    };
    return;
  }
  if (typeof existingDetails.operationPathTemplate !== "string") {
    existingDetails.operationPathTemplate = matchedOperation.operation.pathTemplate;
  }
  finding.details = existingDetails;
}
function collectSpecServerHosts(openApiIndex) {
  const specServerHosts = /* @__PURE__ */ new Set();
  let hasHostlessSpecServer = false;
  for (const operations of openApiIndex.operationsByMethod.values()) {
    for (const operation of operations) {
      for (const server of operation.servers) {
        if (server.host) {
          specServerHosts.add(server.host);
        } else {
          hasHostlessSpecServer = true;
        }
      }
    }
  }
  return { specServerHosts, hasHostlessSpecServer };
}
async function executeRules(rules, context) {
  const findings = [];
  for (const rule of rules) {
    try {
      const ruleFindings = await rule.analyze(context);
      if (ruleFindings.length > 0) {
        findings.push(...ruleFindings);
      }
    } catch (error) {
      logger.warn(`Rule "${rule.id}" failed to execute: ${error.message}
`);
    }
  }
  return findings;
}
var ValidationSession = class _ValidationSession {
  startedAt = Date.now();
  runId = randomUUID();
  previewLimit;
  rules;
  schemaValidator = new SchemaValidator();
  coercingSchemaValidator = new SchemaValidator({ coerceTypes: true });
  options;
  counters = createInitialCounters();
  findings = [];
  previewFindings = [];
  problemGroupsByRule = {};
  problemKeyStats = /* @__PURE__ */ new Map();
  totalProblemGroups = 0;
  server;
  minSeverityRank;
  specServerHosts;
  hasHostlessSpecServer;
  constructor(options, rules) {
    this.options = options;
    this.rules = rules;
    this.server = normalizeServerPrefix(options.server);
    const { specServerHosts, hasHostlessSpecServer } = collectSpecServerHosts(options.openApiIndex);
    this.specServerHosts = specServerHosts;
    this.hasHostlessSpecServer = hasHostlessSpecServer;
    this.minSeverityRank = SEVERITY_RANK[options.minSeverity ?? "info"];
    this.previewLimit = options.previewFindingsLimit && options.previewFindingsLimit > 0 ? options.previewFindingsLimit : DEFAULT_FINDINGS_PREVIEW_LIMIT;
  }
  static create(options) {
    if (options.openApiIndex.loadedOperations === 0) {
      throw new Error("No OpenAPI operations available to validate traffic against.");
    }
    return new _ValidationSession(options, loadRules(options.activeRules));
  }
  /**
   * Validate a single exchange and return the finding records produced for it,
   * so callers (e.g. the proxy) can surface findings live as they arrive.
   */
  async process(exchange) {
    this.counters.totalExchanges += 1;
    let relativePathOverride;
    if (this.server !== void 0) {
      relativePathOverride = resolvePathForServer(exchange.request, this.server);
      if (relativePathOverride === void 0) {
        this.counters.skippedExchanges += 1;
        return [];
      }
    }
    const hostCompatible = this.isHostCompatible(exchange.request.host);
    if (hostCompatible) {
      this.counters.hostCompatibleExchanges += 1;
    }
    const matchedOperation = matchOperation(
      this.options.openApiIndex,
      exchange,
      this.options.matchMode,
      relativePathOverride
    );
    if (matchedOperation) {
      this.counters.documentedExchanges += 1;
    } else {
      this.counters.undocumentedExchanges += 1;
    }
    const exchangeFindings = await executeRules(this.rules, {
      exchange,
      matchedOperation,
      matchMode: this.options.matchMode,
      hostCompatibleWithSpecServers: relativePathOverride !== void 0 || hostCompatible,
      ignoreCookies: this.options.ignoreCookies ?? false,
      validateSchema: (schema, value, options) => options?.coerce ? this.coercingSchemaValidator.validate(schema, value, options?.target) : this.schemaValidator.validate(schema, value, options?.target)
    });
    const records = [];
    for (const finding of exchangeFindings) {
      if (SEVERITY_RANK[finding.severity] < this.minSeverityRank) {
        continue;
      }
      ensureOperationContextInFinding(finding, matchedOperation);
      const record = toFindingRecord(finding, exchange);
      this.findings.push(record);
      records.push(record);
      accumulateFinding(this.counters, finding);
      const problemKey = createProblemKey({
        ruleId: finding.ruleId,
        severity: finding.severity,
        message: finding.message,
        operationId: finding.operationId,
        path: exchange.request.path,
        target: finding.target,
        schemaPath: finding.schemaPath
      });
      const existingProblem = this.problemKeyStats.get(problemKey);
      if (existingProblem) {
        existingProblem.occurrences += 1;
        if (existingProblem.previewIndex !== null) {
          this.previewFindings[existingProblem.previewIndex].occurrences = existingProblem.occurrences;
        }
        continue;
      }
      this.totalProblemGroups += 1;
      this.problemGroupsByRule[finding.ruleId] = (this.problemGroupsByRule[finding.ruleId] ?? 0) + 1;
      if (this.previewFindings.length < this.previewLimit) {
        const previewIndex = this.previewFindings.length;
        this.previewFindings.push(mapFindingToPreview(finding, exchange));
        this.problemKeyStats.set(problemKey, { occurrences: 1, previewIndex });
        continue;
      }
      this.problemKeyStats.set(problemKey, { occurrences: 1, previewIndex: null });
    }
    return records;
  }
  isHostCompatible(requestHost) {
    return !requestHost || this.hasHostlessSpecServer || this.specServerHosts.has(requestHost.toLowerCase());
  }
  finalize() {
    const summary = {
      runId: this.runId,
      totalExchanges: this.counters.totalExchanges,
      documentedExchanges: this.counters.documentedExchanges,
      undocumentedExchanges: this.counters.undocumentedExchanges,
      skippedExchanges: this.counters.skippedExchanges,
      hostCompatibleExchanges: this.counters.hostCompatibleExchanges,
      findingsBySeverity: this.counters.findingsBySeverity,
      findingsByRule: this.counters.findingsByRule,
      problemGroupsByRule: this.problemGroupsByRule,
      totalProblemGroups: this.totalProblemGroups,
      durationMs: Date.now() - this.startedAt,
      previewFindings: this.previewFindings,
      previewLimit: this.previewLimit,
      previewTruncated: this.totalProblemGroups > this.previewFindings.length
    };
    return { runId: this.runId, summary, findings: this.findings };
  }
};

// src/commands/drift/openapi/loader.ts
import { stat as stat2 } from "node:fs/promises";

// src/commands/drift/utils/openapi.ts
function resolveServerUrl(rawUrl, variables) {
  const resolvedUrl = rawUrl.replace(/\{([^}]+)\}/g, (_, variableName) => {
    const variable = variables?.[variableName];
    if (variable?.default !== void 0) {
      return String(variable.default);
    }
    if (Array.isArray(variable?.enum) && variable.enum.length > 0) {
      return String(variable.enum[0]);
    }
    return "";
  });
  const parsedUrl = parseUrl(resolvedUrl);
  const hasExplicitHost = Boolean(parsedUrl.host && !isSyntheticHost(parsedUrl.host));
  return {
    rawUrl,
    protocol: hasExplicitHost ? parsedUrl.protocol : void 0,
    host: hasExplicitHost ? parsedUrl.host.toLowerCase() : void 0,
    basePath: getPathWithoutTrailingSlash(parsedUrl.pathname || "/")
  };
}
function ensureLeadingSlash(value) {
  if (!value) {
    return "/";
  }
  return value.startsWith("/") ? value : `/${value}`;
}

// src/commands/drift/openapi/loader.ts
var HTTP_METHODS = ["get", "put", "post", "delete", "patch", "head", "options", "trace"];
var PARAMETER_LOCATIONS = /* @__PURE__ */ new Set(["query", "header", "path", "cookie"]);
function isHttpMethod(value) {
  return HTTP_METHODS.includes(value);
}
function isParameterLocation(value) {
  return PARAMETER_LOCATIONS.has(value);
}
function normalizeParameters(parameters) {
  if (!Array.isArray(parameters)) {
    return [];
  }
  const normalized = [];
  for (const entry of parameters) {
    if (!isPlainObject(entry)) {
      continue;
    }
    const location = entry.in;
    if (typeof location !== "string" || !isParameterLocation(location)) {
      continue;
    }
    normalized.push({
      name: String(entry.name ?? ""),
      in: location,
      required: Boolean(entry.required) || location === "path",
      schema: entry.schema
    });
  }
  return normalized;
}
function parameterKey(parameter) {
  const caseInsensitive = parameter.in === "header";
  return `${parameter.in}:${caseInsensitive ? parameter.name.toLowerCase() : parameter.name}`;
}
function mergeParameters(baseParameters, operationParameters) {
  const map = /* @__PURE__ */ new Map();
  for (const parameter of baseParameters) {
    map.set(parameterKey(parameter), parameter);
  }
  for (const parameter of operationParameters) {
    map.set(parameterKey(parameter), parameter);
  }
  return Array.from(map.values());
}
function extractMediaSchemas(content) {
  const output = {};
  if (!isPlainObject(content)) {
    return output;
  }
  for (const [mime, mediaTypeObject] of Object.entries(content)) {
    if (isPlainObject(mediaTypeObject) && "schema" in mediaTypeObject) {
      output[mime.toLowerCase()] = mediaTypeObject.schema;
    }
  }
  return output;
}
function extractRequestBodyContent(requestBody) {
  if (!isPlainObject(requestBody)) {
    return {};
  }
  return extractMediaSchemas(requestBody.content);
}
function extractResponseBodyContent(responses) {
  if (!isPlainObject(responses)) {
    return {};
  }
  const output = {};
  for (const [statusCode, responseObject] of Object.entries(responses)) {
    if (!isPlainObject(responseObject) || !("content" in responseObject)) {
      continue;
    }
    output[statusCode] = extractMediaSchemas(responseObject.content);
  }
  return output;
}
function resolveOperationServers(operationServers, pathServers, rootServers) {
  const sourceServers = operationServers ?? pathServers ?? rootServers;
  if (!Array.isArray(sourceServers) || sourceServers.length === 0) {
    return [resolveServerUrl("/")];
  }
  return sourceServers.map((server) => {
    if (!isPlainObject(server)) {
      return resolveServerUrl("/");
    }
    const url = typeof server.url === "string" ? server.url : "/";
    const variables = isPlainObject(server.variables) ? server.variables : void 0;
    return resolveServerUrl(url, variables);
  });
}
function toOperationId(method, pathTemplate, declaredOperationId) {
  if (declaredOperationId) {
    return declaredOperationId;
  }
  return `${method.toUpperCase()} ${pathTemplate}`;
}
function detectOpenApi3Spec(document) {
  try {
    const specVersion = detectSpec(document.parsed);
    return getMajorSpecVersion(specVersion) === "oas3" ? specVersion : null;
  } catch {
    return null;
  }
}
function normalizeSecurity(value) {
  return Array.isArray(value) ? value : void 0;
}
function createIndexVisitor(specSource, operationsByMethod) {
  let rootServers;
  let rootSecurity;
  let securitySchemes = {};
  let currentPathTemplate = "/";
  let currentPathParameters = [];
  let currentPathServers;
  return {
    Root: {
      enter(root) {
        rootServers = root.servers;
        rootSecurity = root.security;
        const componentsSecuritySchemes = isPlainObject(root.components) ? root.components.securitySchemes : void 0;
        securitySchemes = isPlainObject(componentsSecuritySchemes) ? componentsSecuritySchemes : {};
      }
    },
    Paths: {
      PathItem: {
        enter(pathItem, ctx) {
          currentPathTemplate = ensureLeadingSlash(String(ctx.key));
          currentPathParameters = normalizeParameters(pathItem.parameters);
          currentPathServers = pathItem.servers;
        },
        Operation: {
          enter(operation, ctx) {
            const method = String(ctx.key);
            if (!isHttpMethod(method)) {
              return;
            }
            const mergedParameters = mergeParameters(
              currentPathParameters,
              normalizeParameters(operation.parameters)
            );
            const compiledPath = compileOpenApiPath(currentPathTemplate);
            const servers = resolveOperationServers(
              operation.servers,
              currentPathServers,
              rootServers
            );
            const requestBody = operation.requestBody;
            const item = {
              operationId: toOperationId(
                method,
                currentPathTemplate,
                typeof operation.operationId === "string" ? operation.operationId : void 0
              ),
              method,
              pathTemplate: currentPathTemplate,
              pathRegex: compiledPath.regex,
              pathParams: compiledPath.params,
              pathScore: compiledPath.score,
              servers,
              requestParameters: mergedParameters,
              requestBodyContent: extractRequestBodyContent(requestBody),
              requestBodyRequired: isPlainObject(requestBody) && Boolean(requestBody.required),
              responseBodyContent: extractResponseBodyContent(operation.responses),
              security: normalizeSecurity(operation.security) ?? normalizeSecurity(rootSecurity),
              securitySchemes,
              specSource
            };
            const methodOperations = operationsByMethod.get(method) ?? [];
            methodOperations.push(item);
            operationsByMethod.set(method, methodOperations);
          }
        }
      }
    }
  };
}
function indexDocument(document, specVersion, config, specSource, operationsByMethod) {
  const types = normalizeTypes(config.extendTypes(getTypes(specVersion), specVersion), config);
  const resolvedRefMap = /* @__PURE__ */ new Map();
  const ctx = { problems: [], specVersion, config, visitorsData: {} };
  const normalizedVisitors = normalizeVisitors(
    [
      {
        severity: "warn",
        ruleId: "drift-index",
        visitor: createIndexVisitor(specSource, operationsByMethod)
      }
    ],
    types
  );
  walkDocument({
    document,
    rootType: types.Root,
    normalizedVisitors,
    resolvedRefMap,
    ctx
  });
}
function serverIdentity(server) {
  return `${server.host ?? ""}|${server.basePath}`;
}
function warnAboutCollidingOperations(operationsByMethod) {
  for (const operations of operationsByMethod.values()) {
    const byPathPattern = /* @__PURE__ */ new Map();
    for (const operation of operations) {
      const group = byPathPattern.get(operation.pathRegex.source) ?? [];
      group.push(operation);
      byPathPattern.set(operation.pathRegex.source, group);
    }
    for (const group of byPathPattern.values()) {
      const sourcesByServer = /* @__PURE__ */ new Map();
      for (const operation of group) {
        for (const server of operation.servers) {
          const key = serverIdentity(server);
          const sources = sourcesByServer.get(key) ?? /* @__PURE__ */ new Set();
          sources.add(operation.specSource);
          sourcesByServer.set(key, sources);
        }
      }
      for (const sources of sourcesByServer.values()) {
        if (sources.size > 1) {
          const [first] = group;
          logger.warn(
            `"${first.method.toUpperCase()} ${first.pathTemplate}" is documented for the same server in multiple descriptions (${Array.from(
              sources
            ).join(", ")}). Matching traffic is validated against only one of them.
`
          );
          break;
        }
      }
    }
  }
}
function finalizeIndex(operationsByMethod, loadedSpecs) {
  for (const operations of operationsByMethod.values()) {
    operations.sort((left, right) => right.pathScore - left.pathScore);
  }
  const loadedOperations = Array.from(operationsByMethod.values()).reduce(
    (acc, current) => acc + current.length,
    0
  );
  return { operationsByMethod, loadedSpecs, loadedOperations };
}
async function resolveSpecFiles(specPath) {
  const stats = await stat2(specPath);
  if (stats.isDirectory()) {
    return { specFiles: await listOpenApiFiles(specPath), fromDirectory: true };
  }
  return { specFiles: [specPath], fromDirectory: false };
}
async function loadOpenApiIndex(specPath, config) {
  const { specFiles, fromDirectory } = await resolveSpecFiles(specPath);
  const operationsByMethod = /* @__PURE__ */ new Map();
  const externalRefResolver = new BaseResolver(config.resolve);
  let loadedSpecs = 0;
  for (const specFile of specFiles) {
    const resolvedDocument = await externalRefResolver.resolveDocument(null, specFile, true);
    if (resolvedDocument instanceof Error) {
      logger.warn(`Failed to load OpenAPI description ${specFile}: ${resolvedDocument.message}
`);
      continue;
    }
    const specVersion = detectOpenApi3Spec(resolvedDocument);
    if (!specVersion) {
      if (!fromDirectory) {
        logger.warn(`Skipping ${specFile}: not an OpenAPI 3.x description.
`);
      }
      continue;
    }
    let document;
    try {
      const { bundle: bundled } = await bundle({
        config,
        doc: resolvedDocument,
        externalRefResolver,
        dereference: true
      });
      document = bundled;
    } catch (error) {
      logger.warn(
        `Failed to bundle OpenAPI description ${specFile}: ${error.message}
`
      );
      continue;
    }
    loadedSpecs += 1;
    indexDocument(document, specVersion, config, specFile, operationsByMethod);
  }
  if (loadedSpecs > 1) {
    warnAboutCollidingOperations(operationsByMethod);
  }
  return finalizeIndex(operationsByMethod, loadedSpecs);
}

// src/commands/drift/utils/args.ts
function parseCsv(input) {
  return input.split(",").map((value) => value.trim()).filter(Boolean);
}

// src/commands/drift/log-formats/helpers.ts
import { createReadStream } from "node:fs";
import { readFile } from "node:fs/promises";
import { createInterface } from "node:readline";
function coerceString(value) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (typeof value === "string") {
    return value;
  }
  if (Buffer.isBuffer(value)) {
    return value.toString("utf8");
  }
  if (isPlainObject(value) || Array.isArray(value)) {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
}
function coerceNumber(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return void 0;
}
function decodeBody(value, encoding) {
  if (value === void 0 || value === null) {
    return void 0;
  }
  if (encoding === "base64" && typeof value === "string") {
    try {
      return Buffer.from(value, "base64").toString("utf8");
    } catch {
      return value;
    }
  }
  return coerceString(value);
}
function createNormalizedExchange(seed, index, source) {
  const method = seed.method?.toUpperCase();
  const url = seed.url;
  if (!method || !url) {
    return null;
  }
  const requestHeaders = normalizeHeaders(seed.requestHeaders);
  let parsedUrl = parseUrl(url);
  if (isSyntheticHost(parsedUrl.host) && requestHeaders.host) {
    try {
      parsedUrl = new URL(
        `${parsedUrl.protocol}//${requestHeaders.host}${parsedUrl.pathname}${parsedUrl.search}`
      );
    } catch {
      parsedUrl = parseUrl(url);
    }
  }
  const requestContentType = seed.requestContentType ?? requestHeaders["content-type"];
  const requestBodyText = decodeBody(seed.requestBody);
  const request = {
    method,
    url: parsedUrl.toString(),
    path: parsedUrl.pathname,
    query: parsedUrl.searchParams,
    protocol: parsedUrl.protocol,
    protocolKnown: seed.schemeKnown ?? /^https?:\/\//i.test(url),
    host: isSyntheticHost(parsedUrl.host) ? void 0 : parsedUrl.host || void 0,
    headers: requestHeaders,
    contentType: requestContentType,
    bodyText: requestBodyText,
    bodyJson: parseJsonBodyIfPresent(requestContentType, requestBodyText)
  };
  let response;
  const responseStatus = seed.responseStatus;
  if (responseStatus !== void 0) {
    const responseHeaders = normalizeHeaders(seed.responseHeaders);
    const responseContentType = seed.responseContentType ?? responseHeaders["content-type"];
    const responseBodyText = decodeBody(seed.responseBody);
    response = {
      status: responseStatus,
      statusText: seed.responseStatusText,
      headers: responseHeaders,
      contentType: responseContentType,
      bodyText: responseBodyText,
      bodyJson: parseJsonBodyIfPresent(responseContentType, responseBodyText)
    };
  }
  return {
    index,
    source,
    startedAt: seed.startedAt,
    request,
    response,
    raw: seed.raw
  };
}
async function* streamNdjsonObjects(filePath) {
  const readStream = createReadStream(filePath, { encoding: "utf8" });
  const reader = createInterface({ input: readStream, crlfDelay: Infinity });
  for await (const line of reader) {
    const trimmed = line.trim();
    if (!trimmed) {
      continue;
    }
    try {
      const parsed = JSON.parse(trimmed);
      if (isPlainObject(parsed)) {
        yield parsed;
      }
    } catch {
    }
  }
}
async function* iterateJsonArray(filePath, arrayPath) {
  const content = await readFile(filePath, "utf8");
  let value = JSON.parse(content);
  if (arrayPath) {
    for (const key of arrayPath.split(".")) {
      value = isPlainObject(value) ? value[key] : void 0;
    }
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      if (isPlainObject(item)) {
        yield item;
      }
    }
  }
}
function pickHeaderContentType(headers) {
  const normalized = normalizeHeaders(headers);
  return normalized["content-type"];
}

export {
  renderReport,
  readProbe,
  normalizeFsPath,
  listFilesRecursively,
  normalizeContentType,
  isJsonMime,
  coerceString,
  coerceNumber,
  decodeBody,
  createNormalizedExchange,
  streamNdjsonObjects,
  iterateJsonArray,
  pickHeaderContentType,
  ValidationSession,
  loadOpenApiIndex,
  parseCsv
};
