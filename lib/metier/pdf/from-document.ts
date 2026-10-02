import "server-only";
import { getDb } from "@/lib/db";
import { entrepriseFromCompany, pieceDonneesFromDocument } from "@/lib/metier/pdf/piece-model";
import { genererPdfPiece } from "@/lib/metier/pdf/piece-pdf";
import type { CompanyProfile } from "@/lib/metier/company";
import type { DocumentCard } from "@/lib/metier/types";

const MAX_LOGO_BYTES = 1_500_000;

function mimeFromLogoPath(path: string): string | null {
  const lower = path.toLowerCase();
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  // GIF / SVG / autres → non supportés de façon fiable par @react-pdf
  return null;
}

/** Logo pour le PDF : ignore toute image douteuse pour ne jamais faire échouer la génération. */
async function logoDataUrlFromPath(path: string | null | undefined) {
  if (!path) return null;
  const mime = mimeFromLogoPath(path);
  if (!mime) return null;
  try {
    const db = await getDb();
    if (!db) return null;
    const { data, error } = await db.supabase.storage.from("documents").download(path);
    if (error || !data) return null;
    const buf = Buffer.from(await data.arrayBuffer());
    if (buf.byteLength < 32 || buf.byteLength > MAX_LOGO_BYTES) return null;
    return `data:${mime};base64,${buf.toString("base64")}`;
  } catch (err) {
    console.error("[pdf] logo skip", path, err);
    return null;
  }
}

export function pdfFilename(title: string) {
  const slug =
    title
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w -]+/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .slice(0, 80) || "document";
  return `${slug}.pdf`;
}

export function pdfContentDisposition(filename: string, download: boolean) {
  const ascii = filename.replace(/[^\x20-\x7E]/g, "_").replace(/"/g, "");
  const encoded = encodeURIComponent(filename);
  const kind = download ? "attachment" : "inline";
  return `${kind}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}

export async function pdfFromDocument(
  doc: DocumentCard,
  email?: string | null,
  companyOverride?: CompanyProfile | null,
) {
  const { getEntrepriseConfig } = await import("@/lib/settings/entreprise-config");
  const config = await getEntrepriseConfig();
  const p = companyOverride !== undefined ? companyOverride : config.profile;
  let logo: string | null = null;
  try {
    logo = await logoDataUrlFromPath(p?.logo_path);
  } catch {
    logo = null;
  }
  const entreprise = entrepriseFromCompany(p, email, logo);
  const piece = pieceDonneesFromDocument(doc, entreprise, {
    conditionsPaiement: config.settings.commercial.conditionsPaiement || undefined,
    validiteDevisJours: config.settings.commercial.validiteDevisJours,
    acomptePct: config.settings.commercial.acomptePct,
    mentionPiedPage: config.settings.documents.mentionPiedPage || undefined,
  });

  let buffer: Buffer;
  try {
    buffer = await genererPdfPiece(entreprise, piece);
  } catch (err) {
    // Second essai sans logo si Image a fait planter react-pdf
    if (logo) {
      console.error("[pdf] retry sans logo", doc.id, err);
      buffer = await genererPdfPiece({ ...entreprise, logoDataUrl: null }, piece);
    } else {
      throw err;
    }
  }

  return { buffer, filename: pdfFilename(doc.title) };
}
