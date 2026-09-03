import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{a as f,c as l,d as i,e as g,l as o}from"./HJYFWIVE.js";var s=l.python,d=class extends f{constructor(){super("    ")}typeName(r){return i(r,{style:"pascal",reserved:s})}memberName(r){let e=i(r,{style:"snake",reserved:s});return{identifier:e,renamed:e!==r}}identifier(r){return i(r,{style:"snake",reserved:s})}identifiers(r,e){return g(r,{style:"snake",reserved:s,taken:e})}constName(r){return i(r,{style:"screaming",reserved:s})}string(r){let e='"';for(let t of r){let n=t.codePointAt(0);t==="\\"?e+="\\\\":t==='"'?e+='\\"':t===`
`?e+="\\n":t==="\r"?e+="\\r":t==="	"?e+="\\t":n<32||n===127?e+=`\\x${n.toString(16).padStart(2,"0")}`:n>=55296&&n<=57343?e+=`\\u${n.toString(16).padStart(4,"0")}`:e+=t}return e+'"'}literal(r){return r==null?"None":r===!0?"True":r===!1?"False":typeof r=="number"?String(r):typeof r=="string"?this.string(r):Array.isArray(r)?`[${r.map(t=>this.literal(t)).join(", ")}]`:`{${Object.entries(r).map(([t,n])=>`${this.string(t)}: ${this.literal(n)}`).join(", ")}}`}comment(r){for(let e of o(r))this.line(e===""?"#":`# ${e}`);return this}doc(r){let e=o(r);if(e.length===0)return this;if(e.length===1)return this.line(`"""${e[0]}"""`);this.line(`"""${e[0]}`);for(let t of e.slice(1))this.line(t);return this.line('"""')}};export{d as a};
