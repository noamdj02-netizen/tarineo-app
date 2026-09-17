import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { chargerEtatOnboarding } from "@/lib/onboarding";
import { OnboardingWizard } from "./OnboardingWizard";

export default async function OnboardingPage() {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");

  const userId = session.user.id;
  const etat = await chargerEtatOnboarding(userId);
  if (etat.aDesDocuments && etat.parcoursTermine) {
    redirect("/accueil");
  }
  if (etat.importDiffer) {
    redirect("/accueil");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { entrepriseNom: true, telephone: true },
  });

  const prenom = (session.user.name?.split(" ")[0] ?? "Artisan").replace(/^./, (c) => c.toUpperCase());

  return (
    <OnboardingWizard
      prenom={prenom}
      email={session.user.email ?? ""}
      telephone={user?.telephone ?? undefined}
      entrepriseNom={user?.entrepriseNom ?? undefined}
    />
  );
}
