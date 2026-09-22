"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  emailComptable: z.string().email("Email invalide.").or(z.literal("")),
  exportComptableAuto: z.boolean(),
});

export async function enregistrerParametresComptable(donnees: unknown): Promise<{ succes: boolean; erreur?: string }> {
  const session = await auth();
  if (!session?.user?.id) return { succes: false, erreur: "Non authentifié." };

  const parsed = schema.safeParse(donnees);
  if (!parsed.success) return { succes: false, erreur: "Données invalides." };

  const profil = await prisma.companyProfile.findUnique({ where: { userId: session.user.id } });
  if (!profil) {
    return { succes: false, erreur: "Complétez d'abord votre profil entreprise." };
  }

  await prisma.companyProfile.update({
    where: { userId: session.user.id },
    data: {
      emailComptable: parsed.data.emailComptable.trim() || null,
      exportComptableAuto: parsed.data.exportComptableAuto && Boolean(parsed.data.emailComptable.trim()),
    },
  });

  revalidatePath("/parametres");
  return { succes: true };
}
