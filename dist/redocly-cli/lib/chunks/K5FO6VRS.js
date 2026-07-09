import { createRequire as __createRequire } from 'node:module';
const require = __createRequire(import.meta.url);
import {
  DEFAULT_FETCH_TIMEOUT
} from "./Y6DTFCLS.js";
import {
  require_dist
} from "./4FB5ZIPP.js";
import {
  version
} from "./PIMMKQJ7.js";
import {
  require_undici
} from "./XB6C62FW.js";
import {
  blue,
  green,
  logger
} from "./MIPR6NCD.js";
import {
  __toESM
} from "./5ILQMFXK.js";

// src/auth/oauth-client.ts
import { Buffer as Buffer2 } from "node:buffer";
import crypto from "node:crypto";
import { mkdirSync, existsSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { homedir } from "node:os";
import path from "node:path";

// src/reunite/api/domains.ts
var REUNITE_URLS = {
  us: "https://app.cloud.redocly.com",
  eu: "https://app.cloud.eu.redocly.com"
};
function getDomain() {
  return process.env.REDOCLY_DOMAIN || REUNITE_URLS.us;
}
var getReuniteUrl = withHttpsValidation(
  (config, residencyOption) => {
    try {
      const residency = residencyOption || config?.resolvedConfig.residency;
      if (isLegacyResidency(residency)) {
        return REUNITE_URLS[residency];
      }
      if (residency) {
        return new URL(residency).origin;
      }
      if (config?.resolvedConfig.scorecard?.fromProjectUrl) {
        return new URL(config.resolvedConfig.scorecard.fromProjectUrl).origin;
      }
      return REUNITE_URLS.us;
    } catch {
      throw new InvalidReuniteUrlError();
    }
  }
);
function isValidReuniteUrl(reuniteUrl) {
  try {
    getReuniteUrl(void 0, reuniteUrl);
  } catch {
    return false;
  }
  return true;
}
function withHttpsValidation(fn) {
  return (...args) => {
    const url = fn(...args);
    if (!url.startsWith("https://")) {
      throw new InvalidReuniteUrlError();
    }
    return url;
  };
}
var InvalidReuniteUrlError = class extends Error {
  constructor() {
    super("Invalid Reunite URL");
  }
};
function isLegacyResidency(value) {
  return typeof value === "string" && value in REUNITE_URLS;
}

// src/auth/device-flow.ts
import * as childProcess from "node:child_process";

// src/utils/fetch-with-timeout.ts
var import_undici = __toESM(require_undici(), 1);

// src/utils/proxy-agent.ts
var import_https_proxy_agent = __toESM(require_dist(), 1);
function getProxyUrl() {
  return process.env.HTTPS_PROXY || process.env.HTTP_PROXY || process.env.http_proxy || process.env.https_proxy;
}
function shouldBypassProxy(url) {
  const noProxy = process.env.NO_PROXY || process.env.no_proxy;
  if (!noProxy) return false;
  const entries = noProxy.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean);
  if (entries.length === 0) return false;
  let hostname;
  try {
    hostname = new URL(url).hostname.toLowerCase();
  } catch {
    return false;
  }
  return entries.some((entry) => {
    if (entry === "*") return true;
    if (hostname === entry) return true;
    if (entry.startsWith(".") && hostname.endsWith(entry)) return true;
    if (!entry.startsWith(".") && hostname.endsWith("." + entry)) return true;
    return false;
  });
}

// src/utils/fetch-with-timeout.ts
var fetch_with_timeout_default = async (url, { timeout, ...options } = {}) => {
  const proxyUrl = getProxyUrl();
  const useProxy = proxyUrl && !shouldBypassProxy(url);
  let dispatcher;
  const connectOptions = timeout ? { connect: { timeout } } : {};
  if (useProxy) {
    dispatcher = new import_undici.ProxyAgent({
      uri: proxyUrl,
      ...connectOptions
    });
  } else if (timeout) {
    dispatcher = new import_undici.Agent(connectOptions);
  }
  const res = await fetch(url, {
    signal: timeout ? AbortSignal.timeout(timeout) : void 0,
    ...options,
    dispatcher
  });
  return res;
};

// src/reunite/api/api-client.ts
var ReuniteApiError = class extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
  status;
};
var ReuniteApiClient = class {
  constructor(command) {
    this.command = command;
  }
  command;
  sunsetWarnings = [];
  async request(url, options) {
    const headers = {
      ...options.headers,
      "user-agent": `redocly-cli/${version} ${this.command}`
    };
    try {
      const response = await fetch_with_timeout_default(url, {
        ...options,
        headers
      });
      this.collectSunsetWarning(response);
      return response;
    } catch (err) {
      let errorMessage = "Failed to fetch.";
      if (err.cause) {
        errorMessage += ` Caused by ${err.cause.message || err.cause.name}.`;
      }
      if (err.code || err.cause?.code) {
        errorMessage += ` Code: ${err.code || err.cause?.code}`;
      }
      throw new Error(errorMessage);
    }
  }
  collectSunsetWarning(response) {
    const sunsetTime = this.getSunsetDate(response);
    if (!sunsetTime) return;
    const sunsetDate = new Date(sunsetTime);
    if (sunsetTime > Date.now()) {
      this.sunsetWarnings.push({
        sunsetDate,
        isSunsetExpired: false
      });
    } else {
      this.sunsetWarnings.push({
        sunsetDate,
        isSunsetExpired: true
      });
    }
  }
  getSunsetDate(response) {
    const { headers } = response;
    if (!headers) {
      return;
    }
    const sunsetDate = headers.get("sunset") || headers.get("Sunset");
    if (!sunsetDate) {
      return;
    }
    return Date.parse(sunsetDate);
  }
};
var RemotesApi = class {
  constructor(client, domain, apiKey) {
    this.client = client;
    this.domain = domain;
    this.apiKey = apiKey;
  }
  client;
  domain;
  apiKey;
  async getParsedResponse(response) {
    const responseBody = await response.json();
    if (response.ok) {
      return responseBody;
    }
    throw new ReuniteApiError(
      `${responseBody.title || response.statusText || "Unknown error"}.`,
      response.status
    );
  }
  async getDefaultBranch(organizationId, projectId) {
    try {
      const response = await this.client.request(
        `${this.domain}/api/orgs/${organizationId}/projects/${projectId}/source`,
        {
          timeout: DEFAULT_FETCH_TIMEOUT,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );
      const source = await this.getParsedResponse(response);
      return source.branchName;
    } catch (err) {
      const message = `Failed to fetch default branch. ${err.message}`;
      if (err instanceof ReuniteApiError) {
        throw new ReuniteApiError(message, err.status);
      }
      throw new Error(message);
    }
  }
  async upsert(organizationId, projectId, remote) {
    try {
      const response = await this.client.request(
        `${this.domain}/api/orgs/${organizationId}/projects/${projectId}/remotes`,
        {
          timeout: DEFAULT_FETCH_TIMEOUT,
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            mountPath: remote.mountPath,
            mountBranchName: remote.mountBranchName,
            type: "CICD",
            autoMerge: true
          })
        }
      );
      return await this.getParsedResponse(response);
    } catch (err) {
      const message = `Failed to upsert remote. ${err.message}`;
      if (err instanceof ReuniteApiError) {
        throw new ReuniteApiError(message, err.status);
      }
      throw new Error(message);
    }
  }
  async push(organizationId, projectId, payload, files) {
    const formData = new globalThis.FormData();
    formData.append("remoteId", payload.remoteId);
    formData.append("commit[message]", payload.commit.message);
    formData.append("commit[author][name]", payload.commit.author.name);
    formData.append("commit[author][email]", payload.commit.author.email);
    formData.append("commit[branchName]", payload.commit.branchName);
    if (payload.commit.url) {
      formData.append("commit[url]", payload.commit.url);
    }
    if (payload.commit.namespace) {
      formData.append("commit[namespaceId]", payload.commit.namespace);
    }
    if (payload.commit.sha) {
      formData.append("commit[sha]", payload.commit.sha);
    }
    if (payload.commit.repository) {
      formData.append("commit[repositoryId]", payload.commit.repository);
    }
    if (payload.commit.createdAt) {
      formData.append("commit[createdAt]", payload.commit.createdAt);
    }
    for (const file of files) {
      const blob = Buffer.isBuffer(file.stream) ? new Blob([file.stream]) : new Blob([await streamToBuffer(file.stream)]);
      formData.append(`files[${file.path}]`, blob, file.path);
    }
    if (payload.isMainBranch) {
      formData.append("isMainBranch", "true");
    }
    try {
      const response = await this.client.request(
        `${this.domain}/api/orgs/${organizationId}/projects/${projectId}/pushes`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${this.apiKey}`
          },
          body: formData
        }
      );
      return await this.getParsedResponse(response);
    } catch (err) {
      const message = `Failed to push. ${err.message}`;
      if (err instanceof ReuniteApiError) {
        throw new ReuniteApiError(message, err.status);
      }
      throw new Error(message);
    }
  }
  async getRemotesList({
    organizationId,
    projectId,
    mountPath
  }) {
    try {
      const response = await this.client.request(
        `${this.domain}/api/orgs/${organizationId}/projects/${projectId}/remotes?filter=mountPath:/${mountPath}/`,
        {
          timeout: DEFAULT_FETCH_TIMEOUT,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );
      return await this.getParsedResponse(response);
    } catch (err) {
      const message = `Failed to get remote list. ${err.message}`;
      if (err instanceof ReuniteApiError) {
        throw new ReuniteApiError(message, err.status);
      }
      throw new Error(message);
    }
  }
  async getPush({
    organizationId,
    projectId,
    pushId
  }) {
    try {
      const response = await this.client.request(
        `${this.domain}/api/orgs/${organizationId}/projects/${projectId}/pushes/${pushId}`,
        {
          timeout: DEFAULT_FETCH_TIMEOUT,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${this.apiKey}`
          }
        }
      );
      return await this.getParsedResponse(response);
    } catch (err) {
      const message = `Failed to get push status. ${err.message}`;
      if (err instanceof ReuniteApiError) {
        throw new ReuniteApiError(message, err.status);
      }
      throw new Error(message);
    }
  }
};
var ReuniteApi = class {
  apiClient;
  command;
  remotes;
  constructor({
    domain,
    apiKey,
    command
  }) {
    this.command = command;
    this.apiClient = new ReuniteApiClient(this.command);
    this.remotes = new RemotesApi(this.apiClient, domain, apiKey);
  }
  reportSunsetWarnings() {
    const sunsetWarnings = this.apiClient.sunsetWarnings;
    if (sunsetWarnings.length) {
      const [{ isSunsetExpired, sunsetDate }] = sunsetWarnings.sort(
        (a, b) => {
          if (a.isSunsetExpired !== b.isSunsetExpired) {
            return a.isSunsetExpired ? -1 : 1;
          }
          return a.sunsetDate > b.sunsetDate ? 1 : -1;
        }
      );
      const updateVersionMessage = `Update to the latest version by running "npm install @redocly/cli@latest".`;
      if (isSunsetExpired) {
        logger.error(
          `The "${this.command}" command is not compatible with your version of Redocly CLI. ${updateVersionMessage}

`
        );
      } else {
        logger.warn(
          `The "${this.command}" command will be incompatible with your version of Redocly CLI after ${sunsetDate.toLocaleString()}. ${updateVersionMessage}

`
        );
      }
    }
  }
};
async function streamToBuffer(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

// src/auth/device-flow.ts
var RedoclyOAuthDeviceFlow = class {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.apiClient = new ReuniteApiClient("login");
  }
  baseUrl;
  apiClient;
  clientName = "redocly-cli";
  async run() {
    const code = await this.getDeviceCode();
    logger.output(
      "Attempting to automatically open the SSO authorization page in your default browser.\n"
    );
    logger.output(
      "If the browser does not open or you wish to use a different device to authorize this request, open the following URL:\n\n"
    );
    logger.output(blue(code.verificationUri));
    logger.output(`

`);
    logger.output(`Then enter the code:

`);
    logger.output(blue(code.userCode));
    logger.output(`

`);
    this.openBrowser(code.verificationUriComplete);
    const accessToken = await this.pollingAccessToken(
      code.deviceCode,
      code.interval,
      code.expiresIn
    );
    logger.output(green("\u2705 Logged in\n\n"));
    return this.withResidency(accessToken);
  }
  openBrowser(url) {
    try {
      const cmd = process.platform === "win32" ? `start ${url}` : process.platform === "darwin" ? `open ${url}` : `xdg-open ${url}`;
      childProcess.execSync(cmd);
    } catch {
    }
  }
  async verifyToken(accessToken) {
    try {
      const response = await this.sendRequest("/session", "GET", void 0, {
        Cookie: `accessToken=${accessToken};`
      });
      return !!response.user;
    } catch {
      return false;
    }
  }
  async verifyApiKey(apiKey) {
    try {
      const response = await this.sendRequest("/api-keys-verify", "POST", {
        apiKey
      });
      return !!response.success;
    } catch {
      return false;
    }
  }
  async refreshToken(refreshToken) {
    const response = await this.sendRequest(`/device-rotate-token`, "POST", {
      grant_type: "refresh_token",
      client_name: this.clientName,
      refresh_token: refreshToken
    });
    if (!response.access_token) {
      throw new Error("Failed to refresh token");
    }
    return this.withResidency({
      access_token: response.access_token,
      refresh_token: response.refresh_token,
      expires_in: response.expires_in
    });
  }
  async pollingAccessToken(deviceCode, interval, expiresIn) {
    return new Promise((resolve, reject) => {
      const intervalId = setInterval(async () => {
        const response = await this.getAccessToken(deviceCode);
        if (response.access_token) {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          resolve(response);
        }
        if (response.error && response.error !== "authorization_pending") {
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          reject(response.error_description);
        }
      }, interval * 1e3);
      const timeoutId = setTimeout(async () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
        reject("Authorization has expired. Please try again.");
      }, expiresIn * 1e3);
    });
  }
  async getAccessToken(deviceCode) {
    return await this.sendRequest("/device-token", "POST", {
      client_name: this.clientName,
      device_code: deviceCode,
      grant_type: "urn:ietf:params:oauth:grant-type:device_code"
    });
  }
  async getDeviceCode() {
    const {
      device_code: deviceCode,
      user_code: userCode,
      verification_uri: verificationUri,
      verification_uri_complete: verificationUriComplete,
      interval = 10,
      expires_in: expiresIn = 300
    } = await this.sendRequest("/device-authorize", "POST", {
      client_name: this.clientName
    });
    return {
      deviceCode,
      userCode,
      verificationUri,
      verificationUriComplete,
      interval,
      expiresIn
    };
  }
  async sendRequest(path2, method = "GET", body = void 0, headers = {}) {
    const url = `${this.baseUrl}/api${path2}`;
    const response = await this.apiClient.request(url, {
      body: body ? JSON.stringify(body) : body,
      method,
      headers: { "Content-Type": "application/json", ...headers },
      timeout: DEFAULT_FETCH_TIMEOUT
    });
    if (response.status === 204) {
      return { success: true };
    }
    return await response.json();
  }
  withResidency(credentials) {
    return {
      ...credentials,
      residency: this.baseUrl
    };
  }
};

// src/auth/oauth-client.ts
var CREDENTIALS_SALT = "4618dbc9-8aed-4e27-aaf0-225f4603e5a4";
var CRYPTO_ALGORITHM = "aes-256-cbc";
var RedoclyOAuthClient = class {
  credentialsFolderPath;
  credentialsFilePath;
  credentialsFileName;
  key;
  iv;
  constructor() {
    const homeDirPath = homedir();
    this.credentialsFolderPath = path.join(homeDirPath, ".redocly");
    this.credentialsFileName = "credentials";
    this.credentialsFilePath = path.join(this.credentialsFolderPath, this.credentialsFileName);
    this.key = crypto.createHash("sha256").update(`${this.credentialsFolderPath}${CREDENTIALS_SALT}`).digest();
    this.iv = crypto.createHash("md5").update(this.credentialsFolderPath).digest();
    mkdirSync(this.credentialsFolderPath, { recursive: true });
  }
  async login(baseUrl) {
    const deviceFlow = new RedoclyOAuthDeviceFlow(baseUrl);
    const credentials = await deviceFlow.run();
    if (!credentials) {
      throw new Error("Failed to login. No credentials received.");
    }
    this.saveCredentials(credentials);
  }
  async logout() {
    try {
      this.removeCredentials();
    } catch (err) {
    }
  }
  async isAuthorized(reuniteUrl, apiKey) {
    if (apiKey) {
      const deviceFlow = new RedoclyOAuthDeviceFlow(reuniteUrl);
      return deviceFlow.verifyApiKey(apiKey);
    }
    const accessToken = await this.getAccessToken(reuniteUrl);
    return Boolean(accessToken);
  }
  getAccessToken = async (reuniteUrl) => {
    const deviceFlow = new RedoclyOAuthDeviceFlow(reuniteUrl);
    const credentials = await this.readCredentials();
    if (!credentials || !isValidReuniteUrl(reuniteUrl) || credentials.residency && credentials.residency !== reuniteUrl) {
      return null;
    }
    const isValid = await deviceFlow.verifyToken(credentials.access_token);
    if (isValid) {
      return credentials.access_token;
    }
    try {
      const newCredentials = await deviceFlow.refreshToken(credentials.refresh_token);
      await this.saveCredentials(newCredentials);
      return newCredentials.access_token;
    } catch {
      return null;
    }
  };
  async saveCredentials(credentials) {
    try {
      const encryptedCredentials = this.encryptCredentials(credentials);
      writeFileSync(this.credentialsFilePath, encryptedCredentials, "utf8");
    } catch (error) {
      logger.error(`Failed to save credentials: ${error.message}`);
    }
  }
  async readCredentials() {
    if (!existsSync(this.credentialsFilePath)) {
      return null;
    }
    try {
      const encryptedCredentials = readFileSync(this.credentialsFilePath, "utf8");
      return this.decryptCredentials(encryptedCredentials);
    } catch {
      return null;
    }
  }
  async removeCredentials() {
    if (existsSync(this.credentialsFilePath)) {
      rmSync(this.credentialsFilePath);
    }
  }
  encryptCredentials(credentials) {
    const cipher = crypto.createCipheriv(CRYPTO_ALGORITHM, this.key, this.iv);
    const encrypted = Buffer2.concat([
      cipher.update(JSON.stringify(credentials), "utf8"),
      cipher.final()
    ]);
    return encrypted.toString("hex");
  }
  decryptCredentials(encryptedCredentials) {
    const decipher = crypto.createDecipheriv(CRYPTO_ALGORITHM, this.key, this.iv);
    const decrypted = Buffer2.concat([
      decipher.update(Buffer2.from(encryptedCredentials, "hex")),
      decipher.final()
    ]);
    return JSON.parse(decrypted.toString("utf8"));
  }
};

export {
  getDomain,
  getReuniteUrl,
  getProxyUrl,
  shouldBypassProxy,
  fetch_with_timeout_default,
  ReuniteApiError,
  ReuniteApi,
  RedoclyOAuthClient
};
