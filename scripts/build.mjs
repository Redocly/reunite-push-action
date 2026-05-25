import { readFile } from 'node:fs/promises';

import { build } from 'esbuild';

const cliPackageJson = JSON.parse(
  await readFile('node_modules/@redocly/cli/package.json', 'utf8'),
);
const cliPackageModule = `
  export const name = ${JSON.stringify(cliPackageJson.name)};
  export const version = ${JSON.stringify(cliPackageJson.version)};
  export const engines = ${JSON.stringify(cliPackageJson.engines)};
`;

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
      setup(pluginBuild) {
        pluginBuild.onResolve(
          { filter: /(?:^|\/)utils\/package\.js$/ },
          args => {
            if (!args.importer.includes('@redocly/cli')) {
              return null;
            }

            return {
              path: 'redocly-cli-package',
              namespace: 'redocly-cli-package-shim',
            };
          },
        );

        pluginBuild.onResolve({ filter: /^\.\/package\.js$/ }, args => {
          if (!args.importer.includes('@redocly/cli/lib/utils/')) {
            return null;
          }

          return {
            path: 'redocly-cli-package',
            namespace: 'redocly-cli-package-shim',
          };
        });

        pluginBuild.onLoad(
          {
            filter: /^redocly-cli-package$/,
            namespace: 'redocly-cli-package-shim',
          },
          () => ({
            contents: cliPackageModule,
            loader: 'js',
          }),
        );
      },
    },
  ],
});
