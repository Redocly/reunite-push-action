// Jest stands in for `@redocly/reunite-integration` with this module (see `moduleNameMapper` in
// jest.config.json): the package ships ESM only, which the CommonJS test runtime cannot load, and
// every test wants it mocked anyway.
export const collectFilesToPush = jest.fn();
export const getApiKeys = jest.fn();
export const pushFiles = jest.fn();
export const waitForDeployment = jest.fn();
export const getMostUrgentSunsetWarning = jest.fn();
