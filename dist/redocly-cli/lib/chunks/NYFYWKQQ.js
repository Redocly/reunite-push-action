import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{a as i}from"./VZCENZBY.js";import{V as p}from"./OZMIIHFH.js";function h(t,o){let n=t.services.flatMap(e=>e.operations),r=n.filter(e=>e.sse!==void 0);r.length>0&&p.warn(`generate-client: ${o} skipped ${r.length} server-sent-events operation(s) \u2014 iterate the sdk's exported async generators directly: ${r.map(e=>e.name).join(", ")}.
`);let s=new Set(t.schemas.map(e=>e.name)),a=n.filter(e=>e.sse===void 0&&l(e,s));return a.length>0&&p.warn(`generate-client: ${o} skipped ${a.length} operation(s) whose variables type name collides with a schema \u2014 rename the schema or the operation: ${a.map(e=>e.name).join(", ")}.
`),n.filter(e=>e.sse===void 0&&!l(e,s))}function l(t,o){let n=i(t);return n.hasInputs&&o.has(n.variablesTypeName)}function g(t){return t.method==="get"||t.method==="head"}function m(t){return i(t).hasInputs}function u(t){return i(t).variablesTypeName}function O(t,o,n){let r=[];return i(t).hasInputs?r.push(o):n&&r.push("{}"),n&&r.push("{ ...init, envelope: undefined }"),`${t.name}(${r.join(", ")})`}function x(t,o,n){let r=t.map(e=>e.name).sort(),s=t.filter(m).map(u).sort();return n&&s.push("RequestOptions"),`import { ${[...r,...s.map(e=>`type ${e}`)].join(", ")} } from ${JSON.stringify(o)};`}export{h as a,g as b,m as c,u as d,O as e,x as f};
