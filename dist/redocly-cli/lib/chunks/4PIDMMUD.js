import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{g}from"./VZCENZBY.js";import{k as u,l as m}from"./TVJE32GA.js";import{c as C,d as j}from"./LWB43R4X.js";import{V as b}from"./OZMIIHFH.js";import{a as S,b as k}from"./HJYFWIVE.js";import{join as $}from"node:path";function h(r){return(r??"").replace(/\s+/g," ").trim().replace(/\\/g,"\\\\").replace(/\|/g,"\\|")}function v(r){return[r.group===void 0?void 0:u(r.group),r.name].filter(Boolean).join(" ")}function N(r,e){return[r,v(e),...e.positionals.map(o=>`<${o.name}>`),...e.flags.filter(o=>o.required).map(o=>`--${o.name} <${o.type}>`),...e.body?[e.body.required?"--json '<json>'":"[--json '<json>']"]:[]].filter(o=>o!=="").join(" ")}function T(r,e){r.line("| Flag | Type | Required | Description |"),r.line("| ---- | ---- | -------- | ----------- |");for(let n of e){let o=[h(n.description),n.enum===void 0?"":`One of ${n.enum.map(t=>`\`${t}\``).join(", ")}.`,n.type==="array"?"Repeat the flag for multiple values.":""].filter(t=>t!=="").join(" ");r.line(`| \`--${n.name}\` | ${n.type} | ${n.required?"yes":"no"} | ${o} |`)}r.blank()}function D(r,e,n){if(r.line(`### \`${v(e)}\``),r.blank(),e.summary!==void 0&&(r.line(h(e.summary)),r.blank()),r.line(`\`${e.method} ${e.path}\``),r.blank(),r.line("```sh"),r.line(N(n.name,e)),r.line("```"),r.blank(),e.positionals.length>0){r.line("| Argument | Description |"),r.line("| -------- | ----------- |");for(let t of e.positionals)r.line(`| \`<${t.name}>\` | ${h(t.description)} |`);r.blank()}e.flags.length>0&&T(r,e.flags);let o=[e.body===void 0?"":`Takes a JSON body${e.body.required?" (required)":""}: \`--json '<json>'\`, \`--json @file.json\`, or \`--json @-\` for stdin.`,e.unsupportedBody===void 0?"":`Takes a \`${e.unsupportedBody}\` body, which the CLI cannot build \u2014 call this operation through the generated client instead.`,e.paginated===!0?"Paginated: `--page-all` follows every page, printing one JSON page per line.":"",e.sse===!0?"Streams server-sent events as one JSON object per line.":"",e.blob===!0?"Returns binary content, so `--output <path>` is required.":""].filter(t=>t!=="");for(let t of o)r.line(t);o.length>0&&r.blank()}function w(r,e){let n=new S;e.frontmatter&&(n.line("---"),n.line(`title: ${e.title}`),n.line("---"),n.blank()),n.line(`# ${e.title}`),n.blank(),n.line(`Generated command-line reference for \`${e.name}\`, produced from the API description by \`redocly generate-client\`.`),n.line("Re-run generation to update it \u2014 this file is not hand-edited."),n.blank(),n.line("## Usage"),n.blank(),n.line("```sh"),n.line(`${e.name} <command> [flags]`),n.line(`${e.name} --help`),n.line(`${e.name} schema <command>   # request/response schemas`),n.line("```"),n.blank(),n.line("Install the file under any `bin` name: the command takes that name, and the credential variables below do not change."),n.blank(),n.line("## Global flags"),n.blank(),n.line("| Flag | Description |"),n.line("| ---- | ----------- |");let o=e.schemes.some(i=>i.kind==="bearer");for(let[i,s]of[["--server-url <url>","Override the server URL included in the client."],["--format <json\\|ndjson>","Output format."],["--dry-run","Print the prepared request, credentials redacted, without sending it."],["--page-all","Follow pagination, printing one JSON page per line."],["--output <path>","Write the response body to a file. Required for binary responses."],...o?[["--token <token>","Bearer token, overriding the environment."]]:[],["--json <json\\|@file\\|@->","Request body, inline or from a file or stdin."]])n.line(`| \`${i}\` | ${s} |`);n.blank();let t=m(e.name);if(n.line("## Credentials"),n.blank(),e.schemes.length===0)n.line("The description declares no security schemes, so no credentials are read.");else{n.line("Credentials come from the environment:"),n.blank(),n.line("| Scheme | Variable |"),n.line("| ------ | -------- |");for(let i of e.schemes){let s=i.kind==="bearer"?`\`${t}_TOKEN\` (or \`--token\`)`:i.kind==="basic"?`\`${t}_USERNAME\` and \`${t}_PASSWORD\``:`\`${t}_API_KEY_${m(i.key)}\``;n.line(`| ${i.kind} (\`${i.key}\`) | ${s} |`)}}n.blank(),n.line("## Exit codes"),n.blank(),n.line("| Code | Meaning |"),n.line("| ---- | ------- |");for(let[i,s]of[[0,"success"],[1,"API error (status other than 401 or 403)"],[2,"auth error (401 or 403)"],[3,"validation error"],[4,"usage error (unknown command or flag, bad `--json`)"]])n.line(`| ${i} | ${s} |`);n.blank(),n.line("Errors print one JSON object to stderr, so stdout stays clean for piping."),n.blank();let a=[...new Set(r.map(i=>i.group))];for(let i of a){let s=r.filter(l=>l.group===i);i===void 0?(n.line("## Commands"),n.blank()):(n.line(`## ${i}`),n.blank(),n.line(`Addressed as \`${e.name} ${u(i)} <command>\`.`),n.blank());for(let l of s)D(n,l,e)}return n.toString().replace(/\n{3,}/g,`

`).trimEnd()+`
`}function R(){return j["cli.ts"]}function x(){return C["cli.ts"]}var O="// Generated by @redocly/client-generator \u2014 do not edit by hand.\n// Source: OpenAPI description. Re-run `redocly generate-client` to update.";function q(r){return k.snake(r).replace(/_/g,"-")}function E(r){let e=r.schema,n=e.kind==="array"?"array":e.kind==="scalar"&&(e.scalar==="integer"||e.scalar==="number")?"number":e.kind==="scalar"&&e.scalar==="boolean"?"boolean":"string";return{name:q(r.name),param:r.name,type:n,required:r.required,...e.kind==="enum"?{enum:e.values.map(String)}:{},...r.description!==void 0?{description:r.description}:{}}}function F(r){let e=r.successResponses;return e.some(n=>n.contentType.toLowerCase().includes("json"))?!1:e.some(n=>n.contentType.startsWith("image/")||n.contentType==="application/octet-stream")}function M(r){return r.successResponses.find(e=>e.contentType.toLowerCase().includes("json"))?.schema}function U(r,e,n){if(n!=="flat")return{};let o=g(r,e.schemas);return"mergeBody"in o&&o.mergeBody?{merged:!0}:{}}function _(r,e,n){return n!=="flat"?{}:"collisions"in g(r,e.schemas)?{argsStyle:"grouped"}:{}}function f(r,e){let n=[];for(let o of r.services)for(let t of o.operations){let a=t.requestBody?.contentType.toLowerCase().includes("json")?t.requestBody:void 0,i=M(t);n.push({...t.tags.length>0?{group:t.tags[0]}:{},name:t.name,...t.summary!==void 0?{summary:t.summary}:{},method:t.method.toUpperCase(),path:t.path,positionals:t.pathParams.map(s=>({name:s.name,type:E(s).type,...s.description!==void 0?{description:s.description}:{}})),flags:t.queryParams.map(E),...a?{body:{required:a.required,...U(t,r,e.argsStyle)}}:{},...a===void 0&&t.requestBody!==void 0?{unsupportedBody:t.requestBody.contentType}:{},...e.pagination?.has(t.name)===!0?{paginated:!0}:{},..._(t,r,e.argsStyle),...t.sse!==void 0?{sse:!0}:{},...F(t)?{blob:!0}:{},...a!==void 0||i!==void 0?{schemas:{...a?{request:a.schema}:{},...i!==void 0?{response:i}:{}}}:{}})}return n}var P=`function isProcessEntry(): boolean {
  if (process.argv[1] === undefined) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}
if (isProcessEntry()) {
  process.exit(await run());
}`;function p(r,e){return JSON.stringify(r,null,e).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")}function y(r){return r.securitySchemes.map(e=>({key:e.key,kind:e.kind==="bearer"||e.kind==="basic"?e.kind:"apiKey"}))}function B(r){return r.group===void 0?`${r.name} (keeps the bare word, so the "${r.name}" group has no help page)`:`${r.name} (run it as "${u(r.group)} ${r.name}")`}function I(r){let e=new Set(r.filter(o=>o.group).map(o=>u(o.group))),n=r.filter(o=>e.has(o.name));n.length!==0&&b.warn(`generate-client: cli reads a leading group name as the group, so ${n.length} operation(s) named after a tag resolve unusually \u2014 rename the operation or the tag: ${n.map(B).join(", ")}.
`)}function A(r,e){let n=f(r,{pagination:e.pagination,argsStyle:e.argsStyle});I(n);let o=y(r),t=`./${e.stem}.${e.importExt}`,a=["client","configure",...e.zodSelected?["use"]:[]];return["#!/usr/bin/env node",O,`import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";`,[`import { ${a.join(", ")} } from "${t}";`,...e.zodSelected?[`import { zodValidation } from "./${e.stem}.zod.${e.importExt}";`]:[]].join(`
`),e.runtime==="module"?`import { invokedName, runCli, type CliCommand, type CliWiring } from "./runtime/cli.${e.importExt}";`:`// \u2500\u2500\u2500 Embedded cli engine (@redocly/client-generator) \u2500\u2500\u2500
`+R(),`export const COMMANDS: CliCommand[] = ${p(n,2)};`,...e.zodSelected?['use(zodValidation(process.argv.includes("--dry-run") ? { response: false } : {}));']:[],`export const wiring: CliWiring = {
  name: invokedName(process.argv[1], ${p(e.stem)}),
  envPrefix: ${p(m(e.stem))},
  client,
${e.argsStyle==="flat"?`  argsStyle: "flat",
`:""}  configure,
  schemes: ${p(o)},
  env: process.env,
  stdin: () => readFileSync(0, "utf-8"),
  readFile: (path: string) => readFileSync(path, "utf-8"),
  writeFile: (path: string, data: Uint8Array) => writeFileSync(path, data),
  stdout: (line: string) => console.log(line),
  stderr: (line: string) => console.error(line),
};

/** Run this CLI programmatically; defaults to the process argv. */
export const run = (argv: string[] = process.argv.slice(2)): Promise<number> =>
  runCli(COMMANDS, wiring, argv);

// Re-exported so a composed entry can run these commands without its own runtime copy.
export { runCli };

// Self-execute only as the process entry, so importing this module is side-effect-safe:
// composed binaries and login-style wrappers import COMMANDS/wiring/run instead of
// editing this generated file.
${P}`].join(`

`)+`
`}function H(r,e){let n=m(e),o=new Map;r.forEach(({alias:s},l)=>{let c=s.replace(/[^A-Za-z0-9]/g,"_"),d=/^[A-Za-z_]/.test(c)?c:`_${c}`;o.set(s,[...o.values()].includes(d)?`${d}_${l}`:d)});let t=s=>o.get(s),a=r.map(({alias:s,modulePath:l},c)=>{let d=t(s);return`import { COMMANDS as ${d}Commands, wiring as ${d}Wiring${c===0?", runCli":""} } from ${JSON.stringify(l)};`}),i=r.map(({alias:s})=>{let l=t(s),c=q(s),d=`${n}_${m(s)}`;return`  {
    namespace: ${JSON.stringify(c)},
    commands: ${l}Commands,
    wiring: { ...${l}Wiring, envPrefix: ${JSON.stringify(d)} },
  },`});return["#!/usr/bin/env node",O,['import { realpathSync } from "node:fs";','import { fileURLToPath } from "node:url";',...a].join(`
`),`/** The composed sources \u2014 import SOURCES to layer custom commands around this binary. */
export const SOURCES = [
${i.join(`
`)}
];

/** Run the composed CLI programmatically; defaults to the process argv. */
export const run = (argv: string[] = process.argv.slice(2)): Promise<number> =>
  runCli(SOURCES, argv);

// Re-exported so a wrapper (a custom \`login\` command) can run these sources itself.
export { runCli };

${P}`].join(`

`)+`
`}var oe=({model:r,output:e,banner:n,emit:o,selected:t,pagination:a})=>{let i=A(r,{stem:e.stem,importExt:o.importExt??"js",zodSelected:t?.includes("zod")??!1,pagination:a,argsStyle:o.argsStyle??"grouped",runtime:o.runtime??"inline"}),s={path:$(e.dir,`${e.stem}.cli.ts`),content:i};if(o.runtime!=="module")return[s];let l=n.map(c=>`// ${c}`).join(`
`);return[s,{path:$(e.dir,"runtime","cli.ts"),content:`${l}

${x().trim()}
`}]},ie=({model:r,output:e,emit:n,pagination:o})=>{let t=w(f(r,{pagination:o}),{title:`${r.title} command-line reference`,frontmatter:n.docsFrontmatter===!0,name:e.stem,schemes:y(r)});return[{path:$(e.dir,`${e.stem}.cli.md`),content:t}]};function se(r,e){let n=f(e.model,{pagination:e.pagination}).find(t=>t.name===r.name);return n===void 0?void 0:{lang:"shell",label:"CLI",source:`npx tsx client.cli.ts ${["client",...n.group?[u(n.group)]:[],n.name,...n.positionals.map(t=>`<${t.name}>`),...n.flags.filter(t=>t.required).map(t=>`--${t.name} <${t.type}>`),...n.body?["--json '<json>'"]:[]].slice(1).join(" ")}
`}}export{H as a,oe as b,ie as c,se as d};
