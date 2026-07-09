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
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
});

// Vendor the Redocly CLI next to the action bundle so the action can spawn it
// at runtime. The published package is a self-contained, dependency-free
// bundle (since v2.34.0), so copying it verbatim is enough.
const cliVendorDir = 'dist/redocly-cli';

await rm(cliVendorDir, { recursive: true, force: true });

for (const entry of ['bin', 'lib', 'package.json', 'LICENSE']) {
  await cp(`node_modules/@redocly/cli/${entry}`, `${cliVendorDir}/${entry}`, {
    recursive: true,
  });
}
