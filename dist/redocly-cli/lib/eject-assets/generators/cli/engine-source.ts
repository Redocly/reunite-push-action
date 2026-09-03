// Ejected from @redocly/client-generator@0.4.5 — the built-in "cli" generator.
// This file is yours: edit freely; the generated client stays machine-owned and is
// rebuilt by `redocly generate-client`. Newer generator versions merge in with
// `redocly eject-generator cli --update`.
// The cli engine's embeddable source, snapshotted at prepare time (see
// scripts/generate-runtime-sources.mjs).

import {
  RUNTIME_SOURCES,
  RUNTIME_SOURCES_STRIPPED,
} from '@redocly/client-generator/runtime-sources';

/** The cli engine (`runCli` + types) stripped for embedding into `<stem>.cli.ts`. */
export function embedCliRuntime(): string {
  return RUNTIME_SOURCES_STRIPPED['cli.ts'];
}

/** The cli engine RAW, for `runtime: 'module'` (written as `runtime/cli.ts`). */
export function cliRuntimeSource(): string {
  return RUNTIME_SOURCES['cli.ts'];
}
