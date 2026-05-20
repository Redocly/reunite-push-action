import { resolve } from 'node:path';

import { build } from 'esbuild';

const cliPackageShim = resolve('src/redocly-cli-package.ts');

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  target: 'node20',
  outfile: 'dist/index.js',
  sourcemap: true,
  banner: {
    js: "import { createRequire as __createRequire } from 'node:module'; const require = __createRequire(import.meta.url);",
  },
  plugins: [
    {
      name: 'redocly-cli-package-shim',
      setup(build) {
        build.onResolve({ filter: /(?:^|\/)utils\/package\.js$/ }, args => {
          if (!args.importer.includes('@redocly/cli')) {
            return null;
          }

          return { path: cliPackageShim };
        });

        build.onResolve({ filter: /^\.\/package\.js$/ }, args => {
          if (!args.importer.includes('@redocly/cli/lib/utils/')) {
            return null;
          }

          return { path: cliPackageShim };
        });
      },
    },
  ],
});
