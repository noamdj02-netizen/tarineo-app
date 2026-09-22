import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

/** Collecte toutes les clés de fichiers connues en base pour un utilisateur. */
export async function collecterClesFichiersUtilisateur(userId: string): Promise<string[]> {
  const [documents, profil, logos, devis, factures, utilisateur] = await Promise.all([
    prisma.document.findMany({ where: { userId }, select: { fileKey: true } }),
    prisma.companyProfile.findUnique({ where: { userId }, select: { logoKey: true } }),
    prisma.distributorLogo.findMany({ where: { userId }, select: { logoKey: true } }),
    prisma.clientQuote.findMany({ where: { userId }, select: { pdfKey: true } }),
    prisma.clientInvoice.findMany({ where: { userId }, select: { pdfKey: true } }),
    prisma.user.findUnique({ where: { id: userId }, select: { image: true } }),
  ]);

  const avatar =
    utilisateur?.image && utilisateur.image.startsWith("avatars/") ? utilisateur.image : null;

  const cles = [
    ...documents.map((d) => d.fileKey),
    avatar,
    profil?.logoKey,
    ...logos.map((l) => l.logoKey),
    ...devis.map((d) => d.pdfKey).filter((k): k is string => Boolean(k)),
    ...factures.map((f) => f.pdfKey).filter((k): k is string => Boolean(k)),
  ].filter((k): k is string => Boolean(k));

  return [...new Set(cles)];
}

/** Supprime les fichiers Supabase d'un utilisateur (best-effort). */
export async function supprimerFichiersUtilisateur(userId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;

  const cles = await collecterClesFichiersUtilisateur(userId);
  if (cles.length === 0) return;

  const { error } = await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).remove(cles);
  if (error) {
    console.error("Suppression fichiers Supabase partielle :", error.message);
  }
}
