import { prisma } from "@/lib/prisma";
import { accesExportComptable } from "@/lib/planGating";
import { genererXlsx, recupererLignesExportComptable, TYPES_EXPORT_COMPTABLE } from "@/lib/exportComptable";
import { envoyerEmailDocument } from "@/lib/email";

function moisPrecedent(reference = new Date()): { cle: string; debut: Date; fin: Date; label: string } {
  const debut = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth() - 1, 1));
  const fin = new Date(Date.UTC(reference.getUTCFullYear(), reference.getUTCMonth(), 1));
  const cle = `${debut.getUTCFullYear()}-${String(debut.getUTCMonth() + 1).padStart(2, "0")}`;
  const label = debut.toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });
  return { cle, debut, fin, label };
}

export async function envoyerExportsComptablesMensuels(): Promise<{ traites: number; envoyes: number }> {
  const { cle, debut, fin, label } = moisPrecedent();
  const profils = await prisma.companyProfile.findMany({
    where: {
      exportComptableAuto: true,
      emailComptable: { not: null },
      NOT: { exportComptableDernierMois: cle },
    },
    select: {
      id: true,
      userId: true,
      emailComptable: true,
      raisonSociale: true,
      user: { select: { plan: true, subscriptionStatus: true, name: true } },
    },
    take: 200,
  });

  let envoyes = 0;
  for (const profil of profils) {
    const email = profil.emailComptable?.trim();
    if (!email) continue;
    if (!accesExportComptable(profil.user.plan, profil.user.subscriptionStatus)) continue;

    const lignes = await recupererLignesExportComptable({
      userId: profil.userId,
      debut,
      fin,
      types: [...TYPES_EXPORT_COMPTABLE],
    });
    if (lignes.length === 0) {
      await prisma.companyProfile.update({
        where: { id: profil.id },
        data: { exportComptableDernierMois: cle },
      });
      continue;
    }

    const buffer = await genererXlsx(lignes);
    const entreprise = profil.raisonSociale || profil.user.name || "Artisan";

    try {
      await envoyerEmailDocument({
        to: email,
        subject: `Export comptable Tarineo — ${label} — ${entreprise}`,
        body: `Bonjour,\n\nVeuillez trouver ci-joint l'export comptable ${label} pour ${entreprise} (généré automatiquement par Tarineo).\n\n${lignes.length} ligne(s) d'achat.`,
        attachment: {
          filename: `tarineo-export-${cle}.xlsx`,
          content: buffer,
        },
      });
      await prisma.companyProfile.update({
        where: { id: profil.id },
        data: { exportComptableDernierMois: cle },
      });
      envoyes += 1;
    } catch (erreur) {
      console.error(`Export comptable mensuel échoué pour ${profil.userId} :`, erreur);
    }
  }

  return { traites: profils.length, envoyes };
}
