"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function choisirImportMaintenant() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  await prisma.user.update({
    where: { id: session.user.id },
    data: { onboardingImportDeferred: false },
  });

  redirect("/documents?onboarding=1");
}

export async function choisirImportPlusTard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingImportDeferred: true,
      // Pas encore "terminé" : on garde la bannière de reprise jusqu'au 1er import
    },
  });

  redirect("/onboarding/plus-tard");
}

export async function marquerOnboardingTermine() {
  const session = await auth();
  if (!session?.user?.id) return;

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      onboardingFlowCompletedAt: new Date(),
      onboardingImportDeferred: false,
    },
  });
  revalidatePath("/accueil");
}

export async function accederEspaceApresPlusTard() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  redirect("/accueil");
}
