/** Validation fichier démo landing (sans confiance extension seule). */

export const LANDING_DEMO_MAX_BYTES = 15 * 1024 * 1024;
export const LANDING_DEMO_MAX_SIZE_LABEL = "15 Mo";

const PDF_MAGIC = Buffer.from("%PDF");
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);
const WEBP_RIFF = Buffer.from("RIFF");
const WEBP_MARKER = Buffer.from("WEBP");

export type LandingDemoMime =
  | "application/pdf"
  | "image/jpeg"
  | "image/png"
  | "image/webp"
  | "image/gif";

export function detectLandingDemoMime(buf: Buffer): LandingDemoMime | null {
  if (buf.length < 12) return null;
  if (buf.subarray(0, 4).equals(PDF_MAGIC)) return "application/pdf";
  if (buf.subarray(0, 3).equals(JPEG_MAGIC)) return "image/jpeg";
  if (buf.subarray(0, 4).equals(PNG_MAGIC)) return "image/png";
  if (buf.subarray(0, 4).equals(WEBP_RIFF) && buf.subarray(8, 12).equals(WEBP_MARKER)) {
    return "image/webp";
  }
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  return null;
}

export function validateLandingDemoFile(
  fileName: string,
  declaredType: string,
  buf: Buffer,
): { ok: true; mime: LandingDemoMime } | { ok: false; message: string } {
  if (!buf.length) {
    return { ok: false, message: "Le fichier est vide." };
  }
  if (buf.length > LANDING_DEMO_MAX_BYTES) {
    return { ok: false, message: `Fichier trop volumineux (max. ${LANDING_DEMO_MAX_SIZE_LABEL}).` };
  }
  const mime = detectLandingDemoMime(buf);
  if (!mime) {
    return {
      ok: false,
      message: "Format non pris en charge. Utilisez un PDF ou une image nette (JPEG, PNG, WebP).",
    };
  }
  if (declaredType && declaredType !== "application/octet-stream" && !declaredType.startsWith(mime.split("/")[0])) {
    // MIME déclaré incohérent mais contenu valide — on fait confiance au magic bytes.
  }
  const ext = fileName.toLowerCase();
  if (mime === "application/pdf" && ext.endsWith(".pdf") === false && !declaredType.includes("pdf")) {
    // PDF détecté par magic — OK même si extension absente.
  }
  return { ok: true, mime };
}
