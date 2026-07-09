import { createRequire as __createRequire } from 'node:module';
const require = __createRequire(import.meta.url);
import {
  initRules,
  require_graphql
} from "./Z2I5YXYN.js";
import {
  __toESM
} from "./5ILQMFXK.js";

// ../core/lib/graphql/lint-graphql.js
var import_graphql2 = __toESM(require_graphql(), 1);

// ../core/lib/graphql/visitor.js
var import_graphql = __toESM(require_graphql(), 1);
function toAstVisitor(visitor, opts) {
  const astVisitor = {};
  for (const kind of Object.keys(visitor)) {
    const handler = visitor[kind];
    if (!handler)
      continue;
    const enter = typeof handler === "function" ? handler : handler.enter;
    const leave = typeof handler === "function" ? void 0 : handler.leave;
    astVisitor[kind] = {
      ...enter ? { enter: wrap(enter, opts) } : {},
      ...leave ? { leave: wrap(leave, opts) } : {}
    };
  }
  return astVisitor;
}
function wrap(fn, opts) {
  return (node, _key, _parent, _path, ancestors) => {
    fn(node, makeContext(node, opts, ancestors));
  };
}
function makeContext(currentNode, opts, rawAncestors = []) {
  const { ruleId, severity, message, source, config, problems } = opts;
  const ancestors = rawAncestors.filter((ancestor) => !Array.isArray(ancestor));
  return {
    source,
    config,
    ancestors,
    report(problem) {
      const node = problem.node ?? currentNode;
      const loc = problem.loc ?? nodeToLoc(node);
      const location = {
        source,
        pointer: void 0,
        start: loc?.start ?? { line: 1, col: 1 },
        end: loc?.end
      };
      problems.push({
        ruleId: problem.ruleId ?? ruleId,
        severity: problem.severity ?? severity,
        message: message ? message.replace("{{message}}", problem.message) : problem.message,
        suggest: problem.suggest ?? [],
        location: [location]
      });
    }
  };
}
function nodeToLoc(node) {
  if (!node?.loc)
    return void 0;
  const start = (0, import_graphql.getLocation)(node.loc.source, node.loc.start);
  const end = (0, import_graphql.getLocation)(node.loc.source, node.loc.end);
  return {
    start: { line: start.line, col: start.column },
    end: { line: end.line, col: end.column }
  };
}

// ../core/lib/graphql/lint-graphql.js
function lintGraphqlDocument(opts) {
  const { document, config } = opts;
  const source = document.source;
  if (source.body.trim() === "") {
    return [
      {
        ruleId: "struct",
        severity: "error",
        message: "The GraphQL document is empty. Expected at least one type definition.",
        suggest: [],
        location: [{ source, pointer: void 0, start: { line: 1, col: 1 } }]
      }
    ];
  }
  let ast;
  try {
    ast = (0, import_graphql2.parse)(new import_graphql2.Source(source.body, source.absoluteRef));
  } catch (e) {
    if (e instanceof import_graphql2.GraphQLError) {
      return [syntaxErrorToProblem(e, source)];
    }
    throw e;
  }
  const ruleSets = config.getRulesForSpecVersion("graphql") ?? [];
  const rules = initRules(ruleSets, config, "rules", "graphql");
  const problems = runGraphqlRules({ ast, source, config, rules });
  return problems.map((problem) => config.addProblemToIgnore(problem));
}
function syntaxErrorToProblem(error, source) {
  const loc = error.locations?.[0];
  return {
    ruleId: "struct",
    severity: "error",
    message: error.message,
    suggest: [],
    location: [
      {
        source,
        pointer: void 0,
        start: loc ? { line: loc.line, col: loc.column } : { line: 1, col: 1 }
      }
    ]
  };
}
function runGraphqlRules(opts) {
  const { ast, source, config, rules } = opts;
  const problems = [];
  const astVisitors = rules.map(({ ruleId, severity, message, visitor }) => toAstVisitor(visitor, { ruleId, severity, message, source, config, problems }));
  if (astVisitors.length > 0) {
    (0, import_graphql2.visit)(ast, (0, import_graphql2.visitInParallel)(astVisitors));
  }
  return problems;
}
export {
  lintGraphqlDocument
};
