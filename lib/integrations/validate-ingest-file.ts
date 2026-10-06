import { detectLandingDemoMime } from "@/lib/site/landing-demo-file";

/** Même plafond que l’import métier dans l’app (12 Mo). */
export const INGEST_MAX_BYTES = 12 * 1024 * 1024;

export type IngestAllowedMime =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif";

export function validateIngestFile(
  fileName: string,
  declaredType: string,
  buf: Buffer,
): { ok: true; mime: IngestAllowedMime } | { ok: false; code: "invalid_file" | "file_too_large"; message: string } {
  if (!buf.length) {
    return { ok: false, code: "invalid_file", message: "Fichier vide." };
  }
  if (buf.length > INGEST_MAX_BYTES) {
    return { ok: false, code: "file_too_large", message: "Fichier trop volumineux (12 Mo max)." };
  }
  const mime = detectLandingDemoMime(buf);
  if (!mime) {
    return {
      ok: false,
      code: "invalid_file",
      message: "Format non pris en charge. Envoyez un PDF ou une image (JPEG, PNG, WebP).",
    };
  }
  return { ok: true, mime };
}
