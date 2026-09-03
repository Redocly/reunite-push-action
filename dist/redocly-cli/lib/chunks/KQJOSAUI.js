import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{a as $,b as a,c,d as i,e as m,f}from"./NYFYWKQQ.js";import{k as l}from"./NB54XRRU.js";import{join as p}from"node:path";function k(t,n){let e=$(t,"swr");if(e.length===0)return"";let s=e.some(a),o=e.some(r=>!a(r));return[...s?['import useSWR from "swr";']:[],...o?['import useSWRMutation from "swr/mutation";']:[],f(e,n.sdkModule,s),...e.flatMap(r=>a(r)?g(r):[S(r)])].join(`

`)}function y(t,n,e){return`export function use${l(t.name)}(${n}) {
    return ${e};
}`}function g(t){let n=c(t),e=n?`vars: ${i(t)}`:"",s=n?`[${JSON.stringify(t.name)}, vars]`:`[${JSON.stringify(t.name)}]`,o=`export const ${t.name}Key = (${e}) => ${s} as const;`,r=`useSWR(${`${t.name}Key(${n?"vars":""})`}, () => ${m(t,"vars",!0)})`,d=n?`vars: ${i(t)}, init?: Omit<RequestOptions, "envelope">`:'init?: Omit<RequestOptions, "envelope">';return[o,y(t,d,r)]}function S(t){let n=c(t)?`(_key: string, { arg }: {
        arg: ${i(t)};
    }) => ${m(t,"arg",!1)}`:`() => ${m(t,"arg",!1)}`,e=`useSWRMutation(${JSON.stringify(t.name)}, ${n})`;return y(t,"",e)}var x=({model:t,output:n,banner:e,emit:s})=>{let o=k(t,{sdkModule:`./${n.stem}.${s.importExt??"js"}`});if(o==="")return[];let u=e.map(r=>`// ${r}`).join(`
`);return[{path:p(n.dir,`${n.stem}.swr.ts`),content:`${u}

${o}`}]};export{x as a};
