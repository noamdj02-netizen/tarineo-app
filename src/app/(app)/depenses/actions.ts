"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { normaliserDistributeur } from "@/lib/normalisation";

const schema = z.object({
  distributor: z.string().trim().min(1),
  targetHt: z.number().positive(),
  periodStartDate: z.string().trim().min(1).optional().nullable(),
});

export type ResultatObjectif = { succes: true } | { succes: false; erreur: string };

export async function definirObjectif(donnees: unknown): Promise<ResultatObjectif> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  const parsed = schema.safeParse(donnees);
  if (!parsed.success) {
    return { succes: false, erreur: "Données invalides. Vérifiez les champs." };
  }

  const { distributor, targetHt, periodStartDate } = parsed.data;
  const distributorNorm = normaliserDistributeur(distributor);

  // Par défaut 1er janvier (année civile) si l'artisan ne précise pas de date.
  let periodStartMonth = 1;
  let periodStartDay = 1;
  if (periodStartDate) {
    const date = new Date(periodStartDate);
    if (!Number.isNaN(date.getTime())) {
      periodStartMonth = date.getUTCMonth() + 1;
      periodStartDay = date.getUTCDate();
    }
  }

  const userId = session.user.id;

  await prisma.distributorGoal.upsert({
    where: { userId_distributorNorm: { userId, distributorNorm } },
    create: { userId, distributor, distributorNorm, targetHt, periodStartMonth, periodStartDay },
    update: { distributor, targetHt, periodStartMonth, periodStartDay },
  });

  const { synchroniserAlertesBfa } = await import("@/lib/alertesBfa");
  await synchroniserAlertesBfa(userId).catch((erreur) => {
    console.error("Synchronisation alertes BFA :", erreur);
  });

  revalidatePath("/accueil");

  return { succes: true };
}

export async function supprimerObjectif(distributorNorm: string): Promise<ResultatObjectif> {
  const session = await auth();
  if (!session?.user?.id) {
    return { succes: false, erreur: "Non authentifié." };
  }

  await prisma.distributorGoal.deleteMany({
    where: { userId: session.user.id, distributorNorm },
  });

  revalidatePath("/accueil");

  return { succes: true };
}
