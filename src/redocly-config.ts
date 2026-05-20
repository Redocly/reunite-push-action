/* istanbul ignore file */
/* eslint-disable import/no-unresolved */

export async function loadRedoclyConfig(): Promise<unknown> {
  const { loadConfig } = await import('@redocly/openapi-core');

  return loadConfig();
}
