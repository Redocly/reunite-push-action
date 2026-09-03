import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{a as g,c as f,d as i,e as c,l as o}from"./HJYFWIVE.js";var s=f.php,h=class extends g{constructor(){super("    ")}typeName(r){return i(r,{style:"pascal",reserved:s})}memberName(r){return i(r,{style:"camel",reserved:s})}identifier(r){return i(r,{style:"camel",reserved:s})}identifiers(r,t){return c(r,{style:"camel",reserved:s,taken:t})}string(r){return`'${r.replace(/\\/g,"\\\\").replace(/'/g,"\\'")}'`}literal(r){return r==null?"null":typeof r=="boolean"||typeof r=="number"?String(r):typeof r=="string"?this.string(r):Array.isArray(r)?`[${r.map(e=>this.literal(e)).join(", ")}]`:`[${Object.entries(r).map(([e,n])=>`${this.string(e)} => ${this.literal(n)}`).join(", ")}]`}comment(r){for(let t of o(r))this.line(t===""?"//":`// ${t}`);return this}doc(r,t,e=[]){let n=o(t);if(n.length===0&&e.length===0)return this;let l=n.length===0?r:`${r} \u2014 ${n.join(" ")}`;if(e.length===0)return this.line(`/** ${l} */`);this.line("/**"),this.line(` * ${l}`),this.line(" *");for(let m of e)this.line(` * ${m}`);return this.line(" */")}};export{h as a};
