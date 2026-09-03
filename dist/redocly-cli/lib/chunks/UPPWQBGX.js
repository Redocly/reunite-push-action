import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{a as d}from"./AE6JGTY4.js";import{b as s,c as u}from"./KLY5RV3W.js";import{a as i,c as n,f as c}from"./RFWIIJFG.js";var h=n(t=>{Object.defineProperty(t,"__esModule",{value:!0});t.getMachineId=void 0;var a=i("fs"),o=d(),r=(u(),c(s));async function g(){try{return(await a.promises.readFile("/etc/hostid",{encoding:"utf8"})).trim()}catch(e){r.diag.debug(`error reading machine id: ${e}`)}try{return(await(0,o.execAsync)("kenv -q smbios.system.uuid")).stdout.trim()}catch(e){r.diag.debug(`error reading machine id: ${e}`)}}t.getMachineId=g});export default h();
