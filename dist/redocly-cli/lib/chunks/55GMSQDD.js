import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{a as g}from"./AE6JGTY4.js";import{b as o,c as u}from"./KLY5RV3W.js";import{a as s,c as a,f as d}from"./RFWIIJFG.js";var _=a(e=>{Object.defineProperty(e,"__esModule",{value:!0});e.getMachineId=void 0;var n=s("process"),h=g(),y=(u(),d(o));async function E(){let c="QUERY HKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid",t="%windir%\\System32\\REG.exe";n.arch==="ia32"&&"PROCESSOR_ARCHITEW6432"in n.env&&(t="%windir%\\sysnative\\cmd.exe /c "+t);try{let r=(await(0,h.execAsync)(`${t} ${c}`)).stdout.split("REG_SZ");if(r.length===2)return r[1].trim()}catch(i){y.diag.debug(`error reading machine id: ${i}`)}}e.getMachineId=E});export default _();
