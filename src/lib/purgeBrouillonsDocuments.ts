import { prisma } from "@/lib/prisma";
import { DOCUMENTS_BUCKET, getSupabaseAdmin } from "@/lib/supabase";

/** Supprime les brouillons doublon expirés pour un utilisateur (fichier + base). */
export async function purgerBrouillonsExpiresPourUtilisateur(userId: string): Promise<number> {
  const maintenant = new Date();
  const expires = await prisma.document.findMany({
    where: {
      userId,
      brouillonExpireAt: { not: null, lt: maintenant },
    },
    select: { id: true, fileKey: true },
  });

  if (expires.length === 0) return 0;

  for (const doc of expires) {
    await prisma.$transaction([
      prisma.lineItem.deleteMany({ where: { documentId: doc.id } }),
      prisma.priceHistory.deleteMany({ where: { documentId: doc.id } }),
      prisma.document.delete({ where: { id: doc.id } }),
    ]);
    try {
      await getSupabaseAdmin().storage.from(DOCUMENTS_BUCKET).remove([doc.fileKey]);
    } catch (erreur) {
      console.error(`Purge brouillon ${doc.id} — fichier :`, erreur);
    }
  }

  return expires.length;
}
