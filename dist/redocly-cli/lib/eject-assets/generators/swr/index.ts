// Ejected from @redocly/client-generator@0.4.5 — the built-in "swr" generator.
// This file is yours: edit freely; the generated client stays machine-owned and is
// rebuilt by `redocly generate-client`. Newer generator versions merge in with
// `redocly eject-generator swr --update`.
import type { Generator } from '@redocly/client-generator';
import { join } from 'node:path';

import { renderSwrModule } from './render.ts';

/**
 * The swr generator: a standalone `<stem>.swr.ts` module of SWR hooks wrapping the
 * sdk operation functions — `<op>Key` + `use<Op>` (`useSWR`) per query (GET/HEAD),
 * `use<Op>` (`useSWRMutation`) per mutation. It imports the operation functions +
 * their `<Op>Variables` types from the sdk entry (`./<stem>.js`), so it requires the
 * `typescript` generator and targets its throw-mode operation functions. `swr`/`swr/mutation`
 * are the consumer's peer; the sdk client stays dependency-free.
 *
 * Output-mode-agnostic: `./<stem>.js` resolves to the single-file client or the
 * multi-file barrel at the output anchor either way. Emits nothing when there are
 * no operations.
 */
export const swrGenerator: Generator = ({ model, output, banner, emit }) => {
  const content = renderSwrModule(model, {
    sdkModule: `./${output.stem}.${emit.importExt ?? 'js'}`,
  });
  if (content === '') return [];
  const header = banner.map((line) => `// ${line}`).join('\n');
  return [{ path: join(output.dir, `${output.stem}.swr.ts`), content: `${header}\n\n${content}` }];
};

export default {
  name: 'swr',
  run: swrGenerator,
  requires: ["typescript"],
  errorModes: ["throw"],
  requiresGenerator: '^0.4.5',
};
