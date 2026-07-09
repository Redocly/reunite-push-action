import { createRequire as __createRequire } from 'node:module';
const require = __createRequire(import.meta.url);
import {
  HandledError
} from "./MIPR6NCD.js";

// src/utils/error.ts
var AbortFlowError = class extends Error {
};
function exitWithError(message) {
  throw new HandledError(message);
}

export {
  AbortFlowError,
  exitWithError
};
