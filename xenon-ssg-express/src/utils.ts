import { createHash } from "node:crypto";

export function getCacheBustingHash(input: string | NodeJS.ArrayBufferView) {
  return createHash("sha256").update(input).digest("hex").slice(0, 8);
}
