import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import{a as x,b as f,c as m,d}from"./NYFYWKQQ.js";import{b as y,d as h,e as l}from"./NB54XRRU.js";import{m as P}from"./HJYFWIVE.js";import{join as E}from"node:path";function q(e,t){let n=x(e,"tanstack-query");if(n.length===0)return"";let r=t.pagination??new Map;return[j(n,t,r),...n.filter(f).map(i=>K(i,t.queryKeyPrefix)),Q(e,n,r,t.queryKeyPrefix,t.argsStyle),...R(n,r)].join(`
`)}function b(e,t){if(!f(e))return!1;let n=t.get(e.name);return n!==void 0&&n.spec.style!=="link"}function j(e,t,n){let r=[...e.some(a=>b(a,n))?["infiniteQueryOptions"]:[],...e.some(f)?["queryOptions"]:[]],s=[...e.filter(m).map(d),"RequestOptions"].sort().map(a=>`type ${a}`),i=[];return r.length>0&&i.push(`import { ${r.join(", ")} } from "@tanstack/${t.framework}-query";`),i.push(`import { client, ${s.join(", ")} } from "${t.sdkModule}";`),i.join(`
`)}function K(e,t){let n=M(e,t);return m(e)?`export const ${e.name}QueryKey = (vars?: ${d(e)}) =>
    vars === undefined ? ([${n}] as const) : ([${n}, vars] as const);`:`export const ${e.name}QueryKey = () => [${n}] as const;`}function M(e,t){return t===void 0?`"${e.name}"`:`${h(t)}, "${e.name}"`}function Q(e,t,n,r,s){return`/**
 * Build the factories over a specific client instance \u2014 its config, middleware, and
 * retry apply to every call (\`createQueryFactories(createClient(OPERATIONS, config))\`).
 * The module-level exports below are these factories bound to the generated module's default \`client\`.
 */
export const createQueryFactories = (instance: typeof client = client) => ({
`+t.flatMap(a=>{if(!f(a))return[S(a,r)];let o=n.get(a.name);return o!==void 0&&o.spec.style!=="link"?[k(a),F(e,a,o.spec,s)]:[k(a)]}).join(`,
`)+`
});`}function k(e){let{params:t,keyArg:n,callArgs:r}=O(e);return`    ${e.name}Options: (${t}) => queryOptions({
        queryKey: ${e.name}QueryKey(${n}),
        queryFn: ({ signal }) => instance.${e.name}(${r}, { ...init, signal, envelope: undefined }),
    })`}function S(e,t){let n=m(e)?`(vars: ${d(e)}) => instance.${e.name}(vars, { ...init, envelope: undefined })`:`() => instance.${e.name}({}, { ...init, envelope: undefined })`;return`    ${e.name}Mutation: (${v}) => ({
        mutationKey: [${M(e,t)}] as const,
        mutationFn: ${n},
    })`}function F(e,t,n,r){let{params:s,keyArg:i}=O(t),a=l(n.param),o=r==="flat"?`{ ...vars, ${a}: pageParam }`:`{ ...vars, query: { ...vars.query, ${a}: pageParam } }`;return`    ${t.name}InfiniteOptions: (${s}) => infiniteQueryOptions({
        queryKey: [...${t.name}QueryKey(${i}), "infinite"] as const,
        queryFn: ({ pageParam, signal }) => instance.${t.name}(${o}, { ...init, signal, envelope: undefined }),
`+I(e,t,n,r)+"    })"}function I(e,t,n,r){let s=w(n.param),i=r==="flat"?T("vars",n.param):`vars.query?.${s}`;if(n.style==="cursor"){let c=n.hasMore===void 0?"":`            if (lastPage${g(n.hasMore)} === false) return undefined;
`,$=C(e,t,n.nextCursor),p=$.length===0?`            return lastPage${g(n.nextCursor)};
`:`            const next = lastPage${g(n.nextCursor)};
            return ${$.join(" || ")} ? undefined : next;
`;return`        initialPageParam: ${i},
        getNextPageParam: (lastPage) => {
`+c+p+`        },
`}let a=n.style==="offset"?"lastPageParam + count":"lastPageParam + 1",o=n.style==="offset"?"0":"1";return`        initialPageParam: ${i} ?? ${o},
        getNextPageParam: (lastPage, _allPages, lastPageParam) => {
            const count = ${N(n.items)};
            return count === 0 ? undefined : ${a};
        },
`}function C(e,t,n){let r=t.successResponses.find(u=>u.contentType.toLowerCase().includes("json")),s=P(r.schema,"",e),i=P(r.schema,n,e),a=n.slice(1).split("/"),o=a.length>1;if(!o&&s?.kind==="object"){let u=s.properties.find(A=>A.name===a[0]);o=u===void 0||!u.required}let c=i?.kind==="union"?i.members:i?[i]:[],$=c.some(u=>u.kind==="null"),p=c.some(u=>u.kind==="scalar"&&u.scalar==="string");return[...o?["next === undefined"]:[],...$?["next === null"]:[],...p?['next === ""']:[]]}var v='init?: Omit<RequestOptions, "envelope">';function O(e){return m(e)?{params:`vars: ${d(e)}, ${v}`,keyArg:"vars",callArgs:"vars"}:{params:v,keyArg:"",callArgs:"{}"}}function w(e){return y(e)?e:`[${l(e)}]`}function T(e,t){return y(t)?`${e}.${t}`:`${e}[${l(t)}]`}function g(e){return e.slice(1).split("/").map(n=>n.replaceAll("~1","/").replaceAll("~0","~")).map((n,r)=>{let s=y(n);return r===0?s?`.${n}`:`[${l(n)}]`:s?`?.${n}`:`?.[${l(n)}]`}).join("")}function N(e){return e===""?"lastPage?.length ?? 0":`lastPage${g(e)}?.length ?? 0`}function R(e,t){return["const defaultFactories = createQueryFactories();",...e.flatMap(r=>f(r)?b(r,t)?[`${r.name}Options`,`${r.name}InfiniteOptions`]:[`${r.name}Options`]:[`${r.name}Mutation`]).map(r=>`export const ${r} = defaultFactories.${r};`)]}function z(e){return({model:t,output:n,banner:r,emit:s,pagination:i})=>{let a=q(t,{argsStyle:s.argsStyle??"grouped",sdkModule:`./${n.stem}.${s.importExt??"js"}`,framework:e,pagination:i,queryKeyPrefix:s.queryKeyPrefix});if(a==="")return[];let o=r.map(c=>`// ${c}`).join(`
`);return[{path:E(n.dir,`${n.stem}.tanstack.ts`),content:`${o}

${a}`}]}}export{z as a};
