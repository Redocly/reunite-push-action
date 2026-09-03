import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import"./UKSQ7B5H.js";import"./NYFYWKQQ.js";import{g as m}from"./VZCENZBY.js";import{k as l,l as c}from"./TVJE32GA.js";import{c as b,d as $}from"./LWB43R4X.js";import"./PFYPTG4G.js";import{V as h}from"./OZMIIHFH.js";import"./NEWT5A6S.js";import"./NB54XRRU.js";import{a as C,b as S}from"./HJYFWIVE.js";import"./RFWIIJFG.js";import{join as y}from"node:path";function g(t){return(t??"").replace(/\s+/g," ").trim().replace(/\\/g,"\\\\").replace(/\|/g,"\\|")}function k(t){return[t.group===void 0?void 0:l(t.group),t.name].filter(Boolean).join(" ")}function R(t,e){return[t,k(e),...e.positionals.map(i=>`<${i.name}>`),...e.flags.filter(i=>i.required).map(i=>`--${i.name} <${i.type}>`),...e.body?[e.body.required?"--json '<json>'":"[--json '<json>']"]:[]].filter(i=>i!=="").join(" ")}function P(t,e){t.line("| Flag | Type | Required | Description |"),t.line("| ---- | ---- | -------- | ----------- |");for(let n of e){let i=[g(n.description),n.enum===void 0?"":`One of ${n.enum.map(r=>`\`${r}\``).join(", ")}.`,n.type==="array"?"Repeat the flag for multiple values.":""].filter(r=>r!=="").join(" ");t.line(`| \`--${n.name}\` | ${n.type} | ${n.required?"yes":"no"} | ${i} |`)}t.blank()}function A(t,e,n){if(t.line(`### \`${k(e)}\``),t.blank(),e.summary!==void 0&&(t.line(g(e.summary)),t.blank()),t.line(`\`${e.method} ${e.path}\``),t.blank(),t.line("```sh"),t.line(R(n.name,e)),t.line("```"),t.blank(),e.positionals.length>0){t.line("| Argument | Description |"),t.line("| -------- | ----------- |");for(let r of e.positionals)t.line(`| \`<${r.name}>\` | ${g(r.description)} |`);t.blank()}e.flags.length>0&&P(t,e.flags);let i=[e.body===void 0?"":`Takes a JSON body${e.body.required?" (required)":""}: \`--json '<json>'\`, \`--json @file.json\`, or \`--json @-\` for stdin.`,e.unsupportedBody===void 0?"":`Takes a \`${e.unsupportedBody}\` body, which the CLI cannot build \u2014 call this operation through the generated client instead.`,e.paginated===!0?"Paginated: `--page-all` follows every page, printing one JSON page per line.":"",e.sse===!0?"Streams server-sent events as one JSON object per line.":"",e.blob===!0?"Returns binary content, so `--output <path>` is required.":""].filter(r=>r!=="");for(let r of i)t.line(r);i.length>0&&t.blank()}function v(t,e){let n=new C;e.frontmatter&&(n.line("---"),n.line(`title: ${e.title}`),n.line("---"),n.blank()),n.line(`# ${e.title}`),n.blank(),n.line(`Generated command-line reference for \`${e.name}\`, produced from the API description by \`redocly generate-client\`.`),n.line("Re-run generation to update it \u2014 this file is not hand-edited."),n.blank(),n.line("## Usage"),n.blank(),n.line("```sh"),n.line(`${e.name} <command> [flags]`),n.line(`${e.name} --help`),n.line(`${e.name} schema <command>   # request/response schemas`),n.line("```"),n.blank(),n.line("Install the file under any `bin` name: the command takes that name, and the credential variables below do not change."),n.blank(),n.line("## Global flags"),n.blank(),n.line("| Flag | Description |"),n.line("| ---- | ----------- |");let i=e.schemes.some(o=>o.kind==="bearer");for(let[o,s]of[["--server-url <url>","Override the server URL included in the client."],["--format <json\\|ndjson>","Output format."],["--dry-run","Print the prepared request, credentials redacted, without sending it."],["--page-all","Follow pagination, printing one JSON page per line."],["--output <path>","Write the response body to a file. Required for binary responses."],...i?[["--token <token>","Bearer token, overriding the environment."]]:[],["--json <json\\|@file\\|@->","Request body, inline or from a file or stdin."]])n.line(`| \`${o}\` | ${s} |`);n.blank();let r=c(e.name);if(n.line("## Credentials"),n.blank(),e.schemes.length===0)n.line("The description declares no security schemes, so no credentials are read.");else{n.line("Credentials come from the environment:"),n.blank(),n.line("| Scheme | Variable |"),n.line("| ------ | -------- |");for(let o of e.schemes){let s=o.kind==="bearer"?`\`${r}_TOKEN\` (or \`--token\`)`:o.kind==="basic"?`\`${r}_USERNAME\` and \`${r}_PASSWORD\``:`\`${r}_API_KEY_${c(o.key)}\``;n.line(`| ${o.kind} (\`${o.key}\`) | ${s} |`)}}n.blank(),n.line("## Exit codes"),n.blank(),n.line("| Code | Meaning |"),n.line("| ---- | ------- |");for(let[o,s]of[[0,"success"],[1,"API error (status other than 401 or 403)"],[2,"auth error (401 or 403)"],[3,"validation error"],[4,"usage error (unknown command or flag, bad `--json`)"]])n.line(`| ${o} | ${s} |`);n.blank(),n.line("Errors print one JSON object to stderr, so stdout stays clean for piping."),n.blank();let a=[...new Set(t.map(o=>o.group))];for(let o of a){let s=t.filter(d=>d.group===o);o===void 0?(n.line("## Commands"),n.blank()):(n.line(`## ${o}`),n.blank(),n.line(`Addressed as \`${e.name} ${l(o)} <command>\`.`),n.blank());for(let d of s)A(n,d,e)}return n.toString().replace(/\n{3,}/g,`

`).trimEnd()+`
`}function w(){return $["cli.ts"]}function x(){return b["cli.ts"]}var E="// Generated by @redocly/client-generator \u2014 do not edit by hand.\n// Source: OpenAPI description. Re-run `redocly generate-client` to update.";function q(t){return S.snake(t).replace(/_/g,"-")}function j(t){let e=t.schema,n=e.kind==="array"?"array":e.kind==="scalar"&&(e.scalar==="integer"||e.scalar==="number")?"number":e.kind==="scalar"&&e.scalar==="boolean"?"boolean":"string";return{name:q(t.name),param:t.name,type:n,required:t.required,...e.kind==="enum"?{enum:e.values.map(String)}:{},...t.description!==void 0?{description:t.description}:{}}}function F(t){let e=t.successResponses;return e.some(n=>n.contentType.toLowerCase().includes("json"))?!1:e.some(n=>n.contentType.startsWith("image/")||n.contentType==="application/octet-stream")}function N(t){return t.successResponses.find(e=>e.contentType.toLowerCase().includes("json"))?.schema}function T(t,e,n){if(n!=="flat")return{};let i=m(t,e.schemas);return"mergeBody"in i&&i.mergeBody?{merged:!0}:{}}function D(t,e,n){return n!=="flat"?{}:"collisions"in m(t,e.schemas)?{argsStyle:"grouped"}:{}}function p(t,e){let n=[];for(let i of t.services)for(let r of i.operations){let a=r.requestBody?.contentType.toLowerCase().includes("json")?r.requestBody:void 0,o=N(r);n.push({...r.tags.length>0?{group:r.tags[0]}:{},name:r.name,...r.summary!==void 0?{summary:r.summary}:{},method:r.method.toUpperCase(),path:r.path,positionals:r.pathParams.map(s=>({name:s.name,type:j(s).type,...s.description!==void 0?{description:s.description}:{}})),flags:r.queryParams.map(j),...a?{body:{required:a.required,...T(r,t,e.argsStyle)}}:{},...a===void 0&&r.requestBody!==void 0?{unsupportedBody:r.requestBody.contentType}:{},...e.pagination?.has(r.name)===!0?{paginated:!0}:{},...D(r,t,e.argsStyle),...r.sse!==void 0?{sse:!0}:{},...F(r)?{blob:!0}:{},...a!==void 0||o!==void 0?{schemas:{...a?{request:a.schema}:{},...o!==void 0?{response:o}:{}}}:{}})}return n}var U=`function isProcessEntry(): boolean {
  if (process.argv[1] === undefined) return false;
  try {
    return realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]);
  } catch {
    return false;
  }
}
if (isProcessEntry()) {
  process.exit(await run());
}`;function u(t,e){return JSON.stringify(t,null,e).replace(/\u2028/g,"\\u2028").replace(/\u2029/g,"\\u2029")}function f(t){return t.securitySchemes.map(e=>({key:e.key,kind:e.kind==="bearer"||e.kind==="basic"?e.kind:"apiKey"}))}function _(t){return t.group===void 0?`${t.name} (keeps the bare word, so the "${t.name}" group has no help page)`:`${t.name} (run it as "${l(t.group)} ${t.name}")`}function B(t){let e=new Set(t.filter(i=>i.group).map(i=>l(i.group))),n=t.filter(i=>e.has(i.name));n.length!==0&&h.warn(`generate-client: cli reads a leading group name as the group, so ${n.length} operation(s) named after a tag resolve unusually \u2014 rename the operation or the tag: ${n.map(_).join(", ")}.
`)}function M(t,e){let n=p(t,{pagination:e.pagination,argsStyle:e.argsStyle});B(n);let i=f(t),r=`./${e.stem}.${e.importExt}`,a=["client","configure",...e.zodSelected?["use"]:[]];return["#!/usr/bin/env node",E,`import { readFileSync, realpathSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";`,[`import { ${a.join(", ")} } from "${r}";`,...e.zodSelected?[`import { zodValidation } from "./${e.stem}.zod.${e.importExt}";`]:[]].join(`
`),e.runtime==="module"?`import { invokedName, runCli, type CliCommand, type CliWiring } from "./runtime/cli.${e.importExt}";`:`// \u2500\u2500\u2500 Embedded cli engine (@redocly/client-generator) \u2500\u2500\u2500
`+w(),`export const COMMANDS: CliCommand[] = ${u(n,2)};`,...e.zodSelected?['use(zodValidation(process.argv.includes("--dry-run") ? { response: false } : {}));']:[],`export const wiring: CliWiring = {
  name: invokedName(process.argv[1], ${u(e.stem)}),
  envPrefix: ${u(c(e.stem))},
  client,
${e.argsStyle==="flat"?`  argsStyle: "flat",
`:""}  configure,
  schemes: ${u(i)},
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
${U}`].join(`

`)+`
`}var ne=({model:t,output:e,banner:n,emit:i,selected:r,pagination:a})=>{let o=M(t,{stem:e.stem,importExt:i.importExt??"js",zodSelected:r?.includes("zod")??!1,pagination:a,argsStyle:i.argsStyle??"grouped",runtime:i.runtime??"inline"}),s={path:y(e.dir,`${e.stem}.cli.ts`),content:o};if(i.runtime!=="module")return[s];let d=n.map(O=>`// ${O}`).join(`
`);return[s,{path:y(e.dir,"runtime","cli.ts"),content:`${d}

${x().trim()}
`}]},te=({model:t,output:e,emit:n,pagination:i})=>{let r=v(p(t,{pagination:i}),{title:`${t.title} command-line reference`,frontmatter:n.docsFrontmatter===!0,name:e.stem,schemes:f(t)});return[{path:y(e.dir,`${e.stem}.cli.md`),content:r}]};function re(t,e){let n=p(e.model,{pagination:e.pagination}).find(r=>r.name===t.name);return n===void 0?void 0:{lang:"shell",label:"CLI",source:`npx tsx client.cli.ts ${["client",...n.group?[l(n.group)]:[],n.name,...n.positionals.map(r=>`<${r.name}>`),...n.flags.filter(r=>r.required).map(r=>`--${r.name} <${r.type}>`),...n.body?["--json '<json>'"]:[]].slice(1).join(" ")}
`}}export{te as cliDocs,ne as cliGenerator,re as cliSample};
