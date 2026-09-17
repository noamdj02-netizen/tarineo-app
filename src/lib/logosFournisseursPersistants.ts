import { logoFournisseur } from "@/lib/logosFournisseurs";
import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabase";

const DUREE_URL_SIGNEE_SEC = 3600;

/** Charge les URLs signées des logos extraits des documents de l'utilisateur. */
export async function chargerLogosFournisseursUtilisateur(
  userId: string,
  distributorNorms: string[],
): Promise<Map<string, string>> {
  const resultat = new Map<string, string>();
  const norms = [...new Set(distributorNorms.filter(Boolean))];
  if (norms.length === 0 || !isSupabaseConfigured()) return resultat;

  const delegate = (prisma as unknown as { distributorLogo?: { findMany: (args: object) => Promise<{ distributorNorm: string; logoKey: string }[]> } })
    .distributorLogo;
  if (!delegate) return resultat;

  const entrees = await delegate.findMany({
    where: { userId, distributorNorm: { in: norms } },
    select: { distributorNorm: true, logoKey: true },
  });

  if (entrees.length === 0) return resultat;

  const storage = getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET);
  await Promise.all(
    entrees.map(async (entree) => {
      const { data, error } = await storage.createSignedUrl(entree.logoKey, DUREE_URL_SIGNEE_SEC);
      if (!error && data?.signedUrl) {
        resultat.set(entree.distributorNorm, data.signedUrl);
      }
    }),
  );

  return resultat;
}

/**
 * Résout l'URL à afficher : logo extrait du document en priorité, puis catalogue logo.dev.
 */
export function resoudreLogoFournisseur(
  nom: string,
  norm: string | null | undefined,
  logosImportes: Map<string, string>,
): string | null {
  if (norm && logosImportes.has(norm)) {
    return logosImportes.get(norm) ?? null;
  }
  return logoFournisseur(norm ?? nom) ?? logoFournisseur(nom);
}
