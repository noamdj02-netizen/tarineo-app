import "server-only";
import { getDb } from "@/lib/db";
import { getCompanyProfile } from "@/lib/metier/queries";

export const COMPANY_LOGO_CID = "company-logo";

export type CompanyLogoAsset = {
  buffer: Buffer;
  mime: string;
  filename: string;
  cid: typeof COMPANY_LOGO_CID;
};

function mimeFromPath(path: string): string {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".gif")) return "image/gif";
  if (lower.endsWith(".svg")) return "image/svg+xml";
  return "image/jpeg";
}

function mimeFromMagic(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47) return "image/png";
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46) return "image/gif";
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    return "image/webp";
  }
  if (buf.toString("utf8", 0, 5).includes("<?xml") || buf.toString("utf8", 0, 4) === "<svg") {
    return "image/svg+xml";
  }
  return null;
}

function extFromMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  if (mime === "image/svg+xml") return "svg";
  return "jpg";
}

/** Logo entreprise pour e-mails CID (PNG/JPEG/GIF/WebP). */
export async function loadCompanyLogo(): Promise<CompanyLogoAsset | null> {
  const p = await getCompanyProfile();
  if (!p?.logo_path) return null;
  const db = await getDb();
  if (!db) return null;
  const { data, error } = await db.supabase.storage.from("documents").download(p.logo_path);
  if (error || !data) {
    console.error("[mail] logo download", p.logo_path, error?.message);
    return null;
  }
  const buffer = Buffer.from(await data.arrayBuffer());
  if (buffer.byteLength < 32 || buffer.byteLength > 1_500_000) {
    console.error("[mail] logo size skip", buffer.byteLength);
    return null;
  }
  const mime = mimeFromMagic(buffer) || mimeFromPath(p.logo_path);
  // SVG peu fiable dans les clients mail → ignorer
  if (mime === "image/svg+xml") {
    console.error("[mail] logo svg skip");
    return null;
  }
  const ext = extFromMime(mime);
  return {
    buffer,
    mime,
    filename: `logo.${ext}`,
    cid: COMPANY_LOGO_CID,
  };
}

export async function loadCompanyLogoUrl() {
  const p = await getCompanyProfile();
  if (!p?.logo_path) return null;
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.supabase.storage.from("documents").createSignedUrl(p.logo_path, 3600);
  return data?.signedUrl ?? null;
}

/** Construit l’asset logo depuis un buffer déjà téléchargé. */
export function companyLogoFromBuffer(buffer: Buffer, pathHint = "logo.png"): CompanyLogoAsset | null {
  if (buffer.byteLength < 32 || buffer.byteLength > 1_500_000) return null;
  const mime = mimeFromMagic(buffer) || mimeFromPath(pathHint);
  if (mime === "image/svg+xml") return null;
  const ext = extFromMime(mime);
  return { buffer, mime, filename: `logo.${ext}`, cid: COMPANY_LOGO_CID };
}
