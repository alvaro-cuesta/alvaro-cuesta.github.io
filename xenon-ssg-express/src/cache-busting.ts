import { createHash } from "node:crypto";

export function getCacheBustingHash(input: string | NodeJS.ArrayBufferView) {
  return createHash("sha256").update(input).digest("hex").slice(0, 8);
}

export function getCacheBustedFilename(fileName: string, fragment: string) {
  const lastIndexOfDot = fileName.lastIndexOf(".");

  if (lastIndexOfDot >= 0) {
    const base = fileName.slice(0, lastIndexOfDot);
    const ext = fileName.slice(lastIndexOfDot + 1);
    return `${base}.${fragment}.${ext}`;
  } else {
    return `${fileName}.${fragment}`;
  }
}
