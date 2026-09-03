import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{a as $,b as i,c,d as a,e as m,f as p}from"./NYFYWKQQ.js";import"./VZCENZBY.js";import"./TVJE32GA.js";import"./LWB43R4X.js";import"./PFYPTG4G.js";import"./OZMIIHFH.js";import"./NEWT5A6S.js";import{k as u}from"./NB54XRRU.js";import"./HJYFWIVE.js";import"./RFWIIJFG.js";import{join as M}from"node:path";function d(t,e){let r=$(t,"swr");if(r.length===0)return"";let s=r.some(i),o=r.some(n=>!i(n));return[...s?['import useSWR from "swr";']:[],...o?['import useSWRMutation from "swr/mutation";']:[],p(r,e.sdkModule,s),...r.flatMap(n=>i(n)?y(n):[k(n)])].join(`

`)}function f(t,e,r){return`export function use${u(t.name)}(${e}) {
    return ${r};
}`}function y(t){let e=c(t),r=e?`vars: ${a(t)}`:"",s=e?`[${JSON.stringify(t.name)}, vars]`:`[${JSON.stringify(t.name)}]`,o=`export const ${t.name}Key = (${r}) => ${s} as const;`,n=`useSWR(${`${t.name}Key(${e?"vars":""})`}, () => ${m(t,"vars",!0)})`,g=e?`vars: ${a(t)}, init?: Omit<RequestOptions, "envelope">`:'init?: Omit<RequestOptions, "envelope">';return[o,f(t,g,n)]}function k(t){let e=c(t)?`(_key: string, { arg }: {
        arg: ${a(t)};
    }) => ${m(t,"arg",!1)}`:`() => ${m(t,"arg",!1)}`,r=`useSWRMutation(${JSON.stringify(t.name)}, ${e})`;return f(t,"",r)}var h=({model:t,output:e,banner:r,emit:s})=>{let o=d(t,{sdkModule:`./${e.stem}.${s.importExt??"js"}`});if(o==="")return[];let l=r.map(n=>`// ${n}`).join(`
`);return[{path:M(e.dir,`${e.stem}.swr.ts`),content:`${l}

${o}`}]};export{h as swrGenerator};
