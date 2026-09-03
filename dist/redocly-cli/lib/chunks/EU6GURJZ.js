import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{b as d,c as s}from"./KLY5RV3W.js";import{a as n,c,f as a}from"./RFWIIJFG.js";var f=c(e=>{Object.defineProperty(e,"__esModule",{value:!0});e.getMachineId=void 0;var u=n("fs"),o=(s(),a(d));async function h(){let i=["/etc/machine-id","/var/lib/dbus/machine-id"];for(let r of i)try{return(await u.promises.readFile(r,{encoding:"utf8"})).trim()}catch(t){o.diag.debug(`error reading machine id: ${t}`)}}e.getMachineId=h});export default f();
