"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { inviterMembreEquipe, retirerMembreEquipe } from "@/lib/equipe";
import { deconnecterPennylane, exporterMoisVersPennylane } from "@/lib/pennylane";
import { prisma } from "@/lib/prisma";

export async function inviterCollaborateur(email: string) {
  const session = await auth();
  if (!session?.user?.id) return { succes: false, erreur: "Non authentifié." };
  const resultat = await inviterMembreEquipe(session.user.id, email, {
    prenomOwner: session.user.name?.split(" ")[0],
  });
  if (resultat.succes) revalidatePath("/parametres");
  return resultat;
}

export async function retirerCollaborateur(memberUserId: string) {
  const session = await auth();
  if (!session?.user?.id) return { succes: false, erreur: "Non authentifié." };
  await retirerMembreEquipe(session.user.id, memberUserId);
  revalidatePath("/parametres");
  return { succes: true };
}

export async function deconnecterIntegrationPennylane() {
  const session = await auth();
  if (!session?.user?.id) return { succes: false };
  await deconnecterPennylane(session.user.id);
  revalidatePath("/parametres");
  return { succes: true };
}

export async function exporterVersPennylaneMoisPrecedent():
  Promise<{ succes: true; exportes: number; erreurs: number } | { succes: false; erreur: string }> {
  const session = await auth();
  if (!session?.user?.id) return { succes: false, erreur: "Non authentifié." };

  const connexion = await prisma.pennylaneConnection.findUnique({ where: { userId: session.user.id } });
  if (!connexion) return { succes: false, erreur: "Pennylane non connecté." };

  const fin = new Date();
  fin.setUTCDate(1);
  fin.setUTCHours(0, 0, 0, 0);
  const debut = new Date(fin);
  debut.setUTCMonth(debut.getUTCMonth() - 1);

  const resultat = await exporterMoisVersPennylane(session.user.id, debut, fin);
  return { succes: true, exportes: resultat.exportes, erreurs: resultat.erreurs };
}
