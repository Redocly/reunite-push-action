import { cp, rm } from 'node:fs/promises';

import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node24',
  outfile: 'dist/index.js',
  sourcemap: true,
  banner: {
    js: [
      "import { createRequire as __createRequire } from 'node:module';",
      "import { fileURLToPath as __fileURLToPath } from 'node:url';",
      "import { dirname as __pathDirname } from 'node:path';",
      'const require = __createRequire(import.meta.url);',
      'const __dirname = __pathDirname(__fileURLToPath(import.meta.url));',
    ].join('\n'),
  },
});

// The published @redocly/cli is a dependency-free bundle, so a verbatim copy
// next to the action bundle is enough for the action to spawn it at runtime.
const cliVendorDir = 'dist/redocly-cli';

await rm(cliVendorDir, { recursive: true, force: true });

for (const entry of [
  'bin',
  'lib',
  'package.json',
  'LICENSE',
  'THIRD_PARTY_NOTICES',
]) {
  await cp(`node_modules/@redocly/cli/${entry}`, `${cliVendorDir}/${entry}`, {
    recursive: true,
  });
}
