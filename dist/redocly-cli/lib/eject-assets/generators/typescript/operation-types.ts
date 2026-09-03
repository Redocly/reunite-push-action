// Ejected from @redocly/client-generator@0.4.5 — the built-in "typescript" generator.
// This file is yours: edit freely; the generated client stays machine-owned and is
// rebuilt by `redocly generate-client`. Newer generator versions merge in with
// `redocly eject-generator typescript --update`.
// Shared operation-shape predicates.

import type { RequestBodyModel } from '@redocly/client-generator';

/**
 * A multipart body whose schema is a concrete object — the case worth typing. Such a body
 * is emitted as its object shape (binary fields → `Blob`); the runtime serializes it to
 * `FormData` (`runtime/multipart.ts`) after the onRequest chain. Multipart bodies with a
 * non-object schema can't be typed field-by-field, so they keep the raw `FormData` escape hatch.
 */
export function isTypedMultipart(rb: RequestBodyModel): boolean {
  return rb.contentType === 'multipart/form-data' && rb.schema.kind === 'object';
}
