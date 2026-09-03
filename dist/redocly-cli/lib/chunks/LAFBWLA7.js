import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{a as k,b as d,c as g,d as f}from"./NYFYWKQQ.js";import"./VZCENZBY.js";import"./TVJE32GA.js";import"./LWB43R4X.js";import"./PFYPTG4G.js";import"./OZMIIHFH.js";import"./NEWT5A6S.js";import{b as p,d as O,e as u}from"./NB54XRRU.js";import{m as P}from"./HJYFWIVE.js";import"./RFWIIJFG.js";import{join as R}from"node:path";function x(e,t){let n=k(e,"tanstack-query");if(n.length===0)return"";let r=t.pagination??new Map;return[b(n,t,r),...n.filter(d).map(s=>K(s,t.queryKeyPrefix)),j(e,n,r,t.queryKeyPrefix,t.argsStyle),...N(n,r)].join(`
`)}function h(e,t){if(!d(e))return!1;let n=t.get(e.name);return n!==void 0&&n.spec.style!=="link"}function b(e,t,n){let r=[...e.some(a=>h(a,n))?["infiniteQueryOptions"]:[],...e.some(d)?["queryOptions"]:[]],i=[...e.filter(g).map(f),"RequestOptions"].sort().map(a=>`type ${a}`),s=[];return r.length>0&&s.push(`import { ${r.join(", ")} } from "@tanstack/${t.framework}-query";`),s.push(`import { client, ${i.join(", ")} } from "${t.sdkModule}";`),s.join(`
`)}function K(e,t){let n=A(e,t);return g(e)?`export const ${e.name}QueryKey = (vars?: ${f(e)}) =>
    vars === undefined ? ([${n}] as const) : ([${n}, vars] as const);`:`export const ${e.name}QueryKey = () => [${n}] as const;`}function A(e,t){return t===void 0?`"${e.name}"`:`${O(t)}, "${e.name}"`}function j(e,t,n,r,i){return`/**
 * Build the factories over a specific client instance \u2014 its config, middleware, and
 * retry apply to every call (\`createQueryFactories(createClient(OPERATIONS, config))\`).
 * The module-level exports below are these factories bound to the generated module's default \`client\`.
 */
export const createQueryFactories = (instance: typeof client = client) => ({
`+t.flatMap(a=>{if(!d(a))return[T(a,r)];let o=n.get(a.name);return o!==void 0&&o.spec.style!=="link"?[v(a),Q(e,a,o.spec,i)]:[v(a)]}).join(`,
`)+`
});`}function v(e){let{params:t,keyArg:n,callArgs:r}=q(e);return`    ${e.name}Options: (${t}) => queryOptions({
        queryKey: ${e.name}QueryKey(${n}),
        queryFn: ({ signal }) => instance.${e.name}(${r}, { ...init, signal, envelope: undefined }),
    })`}function T(e,t){let n=g(e)?`(vars: ${f(e)}) => instance.${e.name}(vars, { ...init, envelope: undefined })`:`() => instance.${e.name}({}, { ...init, envelope: undefined })`;return`    ${e.name}Mutation: (${M}) => ({
        mutationKey: [${A(e,t)}] as const,
        mutationFn: ${n},
    })`}function Q(e,t,n,r){let{params:i,keyArg:s}=q(t),a=u(n.param),o=r==="flat"?`{ ...vars, ${a}: pageParam }`:`{ ...vars, query: { ...vars.query, ${a}: pageParam } }`;return`    ${t.name}InfiniteOptions: (${i}) => infiniteQueryOptions({
        queryKey: [...${t.name}QueryKey(${s}), "infinite"] as const,
        queryFn: ({ pageParam, signal }) => instance.${t.name}(${o}, { ...init, signal, envelope: undefined }),
`+F(e,t,n,r)+"    })"}function F(e,t,n,r){let i=w(n.param),s=r==="flat"?C("vars",n.param):`vars.query?.${i}`;if(n.style==="cursor"){let l=n.hasMore===void 0?"":`            if (lastPage${y(n.hasMore)} === false) return undefined;
`,m=I(e,t,n.nextCursor),$=m.length===0?`            return lastPage${y(n.nextCursor)};
`:`            const next = lastPage${y(n.nextCursor)};
            return ${m.join(" || ")} ? undefined : next;
`;return`        initialPageParam: ${s},
        getNextPageParam: (lastPage) => {
`+l+$+`        },
`}let a=n.style==="offset"?"lastPageParam + count":"lastPageParam + 1",o=n.style==="offset"?"0":"1";return`        initialPageParam: ${s} ?? ${o},
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            const count = ${E(n.items)};
            return count === 0 ? undefined : ${a};
        },
`}function I(e,t,n){let r=t.successResponses.find(c=>c.contentType.toLowerCase().includes("json")),i=P(r.schema,"",e),s=P(r.schema,n,e),a=n.slice(1).split("/"),o=a.length>1;if(!o&&i?.kind==="object"){let c=i.properties.find(S=>S.name===a[0]);o=c===void 0||!c.required}let l=s?.kind==="union"?s.members:s?[s]:[],m=l.some(c=>c.kind==="null"),$=l.some(c=>c.kind==="scalar"&&c.scalar==="string");return[...o?["next === undefined"]:[],...m?["next === null"]:[],...$?['next === ""']:[]]}var M='init?: Omit<RequestOptions, "envelope">';function q(e){return g(e)?{params:`vars: ${f(e)}, ${M}`,keyArg:"vars",callArgs:"vars"}:{params:M,keyArg:"",callArgs:"{}"}}function w(e){return p(e)?e:`[${u(e)}]`}function C(e,t){return p(t)?`${e}.${t}`:`${e}[${u(t)}]`}function y(e){return e.slice(1).split("/").map(n=>n.replaceAll("~1","/").replaceAll("~0","~")).map((n,r)=>{let i=p(n);return r===0?i?`.${n}`:`[${u(n)}]`:i?`?.${n}`:`?.[${u(n)}]`}).join("")}function E(e){return e===""?"lastPage?.length ?? 0":`lastPage${y(e)}?.length ?? 0`}function N(e,t){return["const defaultFactories = createQueryFactories();",...e.flatMap(r=>d(r)?h(r,t)?[`${r.name}Options`,`${r.name}InfiniteOptions`]:[`${r.name}Options`]:[`${r.name}Mutation`]).map(r=>`export const ${r} = defaultFactories.${r};`)]}function z(e){return({model:t,output:n,banner:r,emit:i,pagination:s})=>{let a=x(t,{argsStyle:i.argsStyle??"grouped",sdkModule:`./${n.stem}.${i.importExt??"js"}`,framework:e,pagination:s,queryKeyPrefix:i.queryKeyPrefix});if(a==="")return[];let o=r.map(l=>`// ${l}`).join(`
`);return[{path:R(n.dir,`${n.stem}.tanstack.ts`),content:`${o}

${a}`}]}}export{z as tanstackQueryGenerator};
