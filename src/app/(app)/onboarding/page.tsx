import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { chargerEtatOnboarding } from "@/lib/onboarding";
import { calculerEtatQuota, debutMoisUTC, documentsRestantsEnvoi, MAX_FICHIERS_PAR_LOT } from "@/lib/quota";
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
    select: { entrepriseNom: true, telephone: true, createdAt: true, plan: true, subscriptionStatus: true },
  });

  const prenom = (session.user.name?.split(" ")[0] ?? "Artisan").replace(/^./, (c) => c.toUpperCase());

  const maintenant = new Date();
  const debutMois = debutMoisUTC(maintenant);
  const [documentsAvantCeMois, documentsCeMois] = await Promise.all([
    prisma.document.count({ where: { userId, createdAt: { lt: debutMois } } }),
    prisma.document.count({ where: { userId, createdAt: { gte: debutMois } } }),
  ]);
  const etatQuota = calculerEtatQuota({
    createdAtUtilisateur: user?.createdAt ?? maintenant,
    plan: user?.plan ?? null,
    subscriptionStatus: user?.subscriptionStatus ?? null,
    documentsAvantCeMois,
    documentsCeMois,
    maintenant,
  });
  const maxFichiersImport = Math.min(
    MAX_FICHIERS_PAR_LOT,
    Math.max(0, documentsRestantsEnvoi(etatQuota))
  );

  return (
    <OnboardingWizard
      prenom={prenom}
      email={session.user.email ?? ""}
      telephone={user?.telephone ?? undefined}
      entrepriseNom={user?.entrepriseNom ?? undefined}
      maxFichiersImport={maxFichiersImport}
    />
  );
}
