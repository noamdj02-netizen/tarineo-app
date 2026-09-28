import "server-only";
import { getDb } from "@/lib/db";
import { getCompanyProfile } from "@/lib/metier/queries";
import { entrepriseFromCompany, pieceDonneesFromDocument } from "@/lib/metier/pdf/piece-model";
import { genererPdfPiece } from "@/lib/metier/pdf/piece-pdf";
import type { CompanyProfile } from "@/lib/metier/company";
import type { DocumentCard } from "@/lib/metier/types";

async function logoDataUrlFromPath(path: string | null | undefined) {
  if (!path) return null;
  const db = await getDb();
  if (!db) return null;
  const { data } = await db.supabase.storage.from("documents").download(path);
  if (!data) return null;
  const buf = Buffer.from(await data.arrayBuffer());
  const mime = path.endsWith(".png") ? "image/png" : path.endsWith(".webp") ? "image/webp" : "image/jpeg";
  return `data:${mime};base64,${buf.toString("base64")}`;
}

export async function pdfFromDocument(
  doc: DocumentCard,
  email?: string | null,
  companyOverride?: CompanyProfile | null,
) {
  const p = companyOverride !== undefined ? companyOverride : await getCompanyProfile();
  const entreprise = entrepriseFromCompany(p, email, await logoDataUrlFromPath(p?.logo_path));
  const piece = pieceDonneesFromDocument(doc, entreprise);
  const buffer = await genererPdfPiece(entreprise, piece);
  const slug = doc.title.replace(/[^\wÀ-ÿ -]+/g, "").trim() || "document";
  return { buffer, filename: `${slug}.pdf` };
}
