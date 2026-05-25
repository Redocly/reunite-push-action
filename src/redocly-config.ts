// Defer loading @redocly/openapi-core until call time. The package is pure
// ESM; statically importing it from CJS jest would crash with ERR_REQUIRE_ESM.
import type { loadConfig } from '@redocly/openapi-core';

export async function loadRedoclyConfig(): ReturnType<typeof loadConfig> {
  const { loadConfig: load } = await import('@redocly/openapi-core');

  return load();
}
