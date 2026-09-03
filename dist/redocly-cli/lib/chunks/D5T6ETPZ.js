import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{a}from"./AE6JGTY4.js";import{b as s,c as u}from"./KLY5RV3W.js";import{c,f as d}from"./RFWIIJFG.js";var g=c(e=>{Object.defineProperty(e,"__esModule",{value:!0});e.getMachineId=void 0;var o=a(),l=(u(),d(s));async function f(){try{let i=(await(0,o.execAsync)('ioreg -rd1 -c "IOPlatformExpertDevice"')).stdout.split(`
`).find(r=>r.includes("IOPlatformUUID"));if(!i)return;let n=i.split('" = "');if(n.length===2)return n[1].slice(0,-1)}catch(t){l.diag.debug(`error reading machine id: ${t}`)}}e.getMachineId=f});export default g();
