import { createRequire as __createRequire } from 'node:module';
import { fileURLToPath as __fileURLToPath } from 'node:url';
import { dirname as __pathDirname } from 'node:path';
const require = __createRequire(import.meta.url);
var __filename = __fileURLToPath(import.meta.url);
var __dirname = __pathDirname(__filename);
import"./TVJE32GA.js";import{a as h}from"./LWB43R4X.js";import"./PFYPTG4G.js";import"./OZMIIHFH.js";import"./NEWT5A6S.js";import{e as g,h as p,k as y}from"./NB54XRRU.js";import"./HJYFWIVE.js";import"./RFWIIJFG.js";import{join as M}from"node:path";var a="    ";function f(e){return`${y(e)}Schema`}var x=new Map;function u(e,r=x,t=""){return k(w(e,r,t),e)}function w(e,r,t){switch(e.kind){case"scalar":return S(e.scalar,e.metadata);case"object":return b(e.properties,r,t);case"array":return`z.array(${u(e.items,r,t)})`;case"record":return`z.record(z.string(), ${u(e.value,r,t)})`;case"ref":return`z.lazy(() => ${f(e.name)})`;case"literal":return`z.literal(${p(e.value)})`;case"enum":return z(e.values);case"union":return E(e.members,r,t);case"intersection":return e.members.map(n=>u(n,r,t)).reduce((n,o)=>`${n}.and(${o})`);case"null":return"z.null()";case"unknown":return"z.unknown()";case"omit":return q(e.base,e.keys,r,t)}}function S(e,r){switch(e){case"string":return r?.format==="binary"?"z.instanceof(Blob)":"z.string()";case"integer":return"z.number().int()";case"number":return"z.number()";case"boolean":return"z.boolean()"}}function c(e){return g(e)===e?e:JSON.stringify(e)}function b(e,r,t){if(e.length===0)return"z.object({})";let n=t+a;return`z.object({
${e.map((s,i)=>{let d=u(s.schema,r,n),l=s.required?d:`${d}.optional()`,v=i===e.length-1?"":",";return`${n}${c(s.name)}: ${l}${v}`}).join(`
`)}
${t}})`}function z(e){return e.every(r=>typeof r=="string")?`z.enum([${e.map(r=>JSON.stringify(r)).join(", ")}])`:`z.union([${e.map(r=>`z.literal(${p(r)})`).join(", ")}])`}function E(e,r,t){let n=e.map(o=>u(o,r,t));return n.length===1?n[0]:`z.union([${n.join(", ")}])`}function q(e,r,t,n){let o=t.get(e);if(o&&o.kind!=="object")return u(m(o,r,t,new Set([e])),t,n);let s=r.map(i=>`${c(i)}: true`).join(", ");return`${f(e)}.omit({ ${s} })`}function m(e,r,t,n){switch(e.kind){case"object":return{...e,properties:e.properties.filter(o=>!r.includes(o.name))};case"union":case"intersection":return{...e,members:e.members.map(o=>m(o,r,t,n))};case"ref":{if(n.has(e.name))return e;let o=t.get(e.name);if(!o)return e;if(o.kind==="object"){let s=r.filter(i=>o.properties.some(d=>d.name===i));return s.length>0?{kind:"omit",base:e.name,keys:s}:e}return m(o,r,t,new Set([...n,e.name]))}default:return e}}function k(e,r){let t=r.metadata;if(!t)return e;let n=e;return r.kind==="scalar"&&r.scalar==="string"&&(t.minLength!==void 0&&(n=`${n}.min(${t.minLength})`),t.maxLength!==void 0&&(n=`${n}.max(${t.maxLength})`),t.pattern!==void 0&&(n=`${n}.regex(new RegExp(${JSON.stringify(t.pattern)}))`)),r.kind==="scalar"&&(r.scalar==="number"||r.scalar==="integer")&&(t.minimum!==void 0&&(n=`${n}.min(${t.minimum})`),t.maximum!==void 0&&(n=`${n}.max(${t.maximum})`),t.exclusiveMinimum!==void 0&&(n=`${n}.gt(${t.exclusiveMinimum})`),t.exclusiveMaximum!==void 0&&(n=`${n}.lt(${t.exclusiveMaximum})`)),r.kind==="array"&&(t.minItems!==void 0&&(n=`${n}.min(${t.minItems})`),t.maxItems!==void 0&&(n=`${n}.max(${t.maxItems})`)),n}function j(e,r){let t=[];for(let n of h(e.services)){if(n.sse!==void 0)continue;let o=n.requestBody,s=o&&o.contentType.toLowerCase().includes("json")?u(o.schema,r,a):void 0,i=n.successResponses.find(l=>l.contentType.toLowerCase().includes("json")),d=i?u(i.schema,r,a):void 0;!s&&!d||t.push({name:n.specName??n.name,request:s,response:d})}return t}function Z(e){let r=e.flatMap(n=>[`${a}${c(n.name)}: {`,...n.request?[`${a}${a}request: z.ZodType;`]:[],...n.response?[`${a}${a}response: z.ZodType;`]:[],`${a}};`]),t=e.map((n,o)=>{let s=[...n.request?[`request: ${n.request}`]:[],...n.response?[`response: ${n.response}`]:[]].join(", "),i=o===e.length-1?"":",";return`${a}${c(n.name)}: { ${s} }${i}`});return["/**"," * Request/response validators by operationId \u2014 powers `zodValidation`, or import one directly."," */","export const operationSchemas: {",...r,"} = {",...t,"};"].join(`
`)}var I=`/** \`request\`/\`response\` validators for one operation (an absent side is not validated). */
export type OperationSchemaSet = { request?: z.ZodType; response?: z.ZodType };

const schemaIndex: Partial<Record<string, OperationSchemaSet>> = operationSchemas;

/** One flattened validation problem: the full nested path and a short preview of the value. */
export type ZodViolation = { path: string; message: string; received: string };

/** A request or response payload failed validation. Requests throw it; response handling is configurable. */
export class ZodValidationError extends Error {
    // Declared and assigned in the body, NOT as constructor parameter properties: those
    // need a transform, so they break \`node --experimental-strip-types\` for anything
    // importing this module (the generated CLI runs that way).
    readonly operationId: string;
    readonly direction: "request" | "response";
    readonly issues: z.ZodError["issues"];
    readonly violations: ZodViolation[];

    constructor(
        operationId: string,
        direction: "request" | "response",
        issues: z.ZodError["issues"],
        violations: ZodViolation[]
    ) {
        const detail = violations
            .slice(0, 5)
            .map((violation) => \`\${violation.path || "(root)"}: \${violation.message} (received \${violation.received})\`)
            .join("; ");
        const more = violations.length > 5 ? \`; \u2026and \${violations.length - 5} more\` : "";
        super(\`\${direction === "request" ? "Request" : "Response"} validation failed for operation "\${operationId}": \${detail}\${more}\`);
        this.operationId = operationId;
        this.direction = direction;
        this.issues = issues;
        this.violations = violations;
        this.name = "ZodValidationError";
    }
}

// Flatten zod issues into leaf violations. Union branches (zod 3 \`unionErrors\`, zod 4
// nested \`errors\`) are recursed into, so the message names the actual failing fields
// instead of just the union root ("Invalid input").
function flattenIssues(
    issues: z.ZodError["issues"],
    value: unknown,
    base: PropertyKey[] = []
): ZodViolation[] {
    const violations: ZodViolation[] = [];
    for (const issue of issues) {
        const path = [...base, ...issue.path];
        const nested = nestedIssueLists(issue);
        if (nested.length > 0) {
            for (const sub of nested) violations.push(...flattenIssues(sub, value, path));
        } else {
            violations.push({
                path: path.map(String).join("."),
                message: issue.message,
                received: preview(valueAt(value, path)),
            });
        }
    }
    return violations;
}

/** The nested issue lists of a union-ish issue, across zod 3 (\`unionErrors\`) and zod 4 (\`errors\`). */
function nestedIssueLists(issue: unknown): Array<z.ZodError["issues"]> {
    const candidate = issue as {
        unionErrors?: Array<{ issues: z.ZodError["issues"] }>;
        errors?: Array<z.ZodError["issues"]>;
    };
    if (Array.isArray(candidate.unionErrors)) return candidate.unionErrors.map((error) => error.issues);
    if (Array.isArray(candidate.errors)) return candidate.errors;
    return [];
}

function valueAt(value: unknown, path: PropertyKey[]): unknown {
    let current = value;
    for (const key of path) {
        if (current === null || typeof current !== "object") return undefined;
        current = (current as Record<PropertyKey, unknown>)[key];
    }
    return current;
}

/** A short single-line preview of the offending value. NOTE: validation output can surface
 *  payload data \u2014 route \`onViolation\` to a scrubbed logger when responses may carry secrets. */
function preview(value: unknown): string {
    let text: string;
    try {
        text = JSON.stringify(value) ?? String(value);
    } catch {
        text = String(value);
    }
    return text.length > 80 ? \`\${text.slice(0, 77)}\u2026\` : text;
}

export type ZodValidationOptions = {
    /** Validate request bodies before any network call; a failure THROWS (it is the caller's own bug). Default: true. */
    request?: boolean;
    /** Replace the outgoing body with the parsed result, dropping keys the schema does not declare
     *  (for strict-DTO servers that 400 on excess properties). Runs request validation. Default: false. */
    stripRequestBodies?: boolean;
    /** Response drift handling: \`"warn"\` (default) reports via \`onViolation\` and lets the call
     *  succeed \u2014 a server drifting from its description should not crash the consumer;
     *  \`"throw"\` fails the call (even on result-mode clients); \`false\` skips response validation. */
    response?: "warn" | "throw" | false;
    /** Sink for \`"warn"\` mode. Default: \`console.warn\` with the error message. */
    onViolation?: (error: ZodValidationError) => void;
};

/**
 * Schema-validation middleware for the generated client: \`use(zodValidation())\`.
 * Request bodies are validated before any network call and throw on failure; successful
 * JSON responses are validated against the operation's response schema and WARN by
 * default (see \`ZodValidationOptions.response\`). Operations without a schema pass
 * through untouched. Payloads are never mutated unless \`stripRequestBodies\` is set.
 */
export function zodValidation(options: ZodValidationOptions = {}) {
    const { request = true, stripRequestBodies = false, response = "warn", onViolation } = options;
    const report = onViolation ?? ((error: ZodValidationError) => console.warn(error.message));
    return {
        onRequest(context: { body?: unknown; operation: { id: string } }): void {
            if ((!request && !stripRequestBodies) || context.body === undefined) return;
            const schema = schemaIndex[context.operation.id]?.request;
            if (!schema) return;
            const result = schema.safeParse(context.body);
            if (!result.success) {
                throw new ZodValidationError(
                    context.operation.id,
                    "request",
                    result.error.issues,
                    flattenIssues(result.error.issues, context.body)
                );
            }
            // zod object schemas drop undeclared keys during parsing, so the parsed value
            // IS the declared shape (intersections keep their own zod semantics).
            if (stripRequestBodies) context.body = result.data;
        },
        async onResponse(incoming: Response, context: { operation: { id: string } }): Promise<void> {
            if (response === false || !incoming.ok) return;
            const schema = schemaIndex[context.operation.id]?.response;
            if (!schema) return;
            const contentType = (incoming.headers.get("content-type") ?? "").toLowerCase();
            if (!contentType.includes("json")) return;
            const payload: unknown = await incoming.clone().json();
            const result = schema.safeParse(payload);
            if (!result.success) {
                const error = new ZodValidationError(
                    context.operation.id,
                    "response",
                    result.error.issues,
                    flattenIssues(result.error.issues, payload)
                );
                if (response === "throw") throw error;
                report(error);
            }
        },
    };
}`;function $(e){let r=new Map(e.schemas.map(o=>[o.name,o.schema])),t=j(e,r);if(e.schemas.length===0&&t.length===0)return"";let n=['import { z } from "zod";',...e.schemas.map(o=>`export const ${f(o.name)} = ${u(o.schema,r)};`)];return t.length===0?n.join(`

`):(n.push(Z(t)),`${n.join(`

`)}
${I}
`)}var T=({model:e,output:r,banner:t})=>{let n=$(e);if(n==="")return[];let o=t.map(s=>`// ${s}`).join(`
`);return[{path:M(r.dir,`${r.stem}.zod.ts`),content:`${o}

${n}`}]};export{T as zodGenerator};
