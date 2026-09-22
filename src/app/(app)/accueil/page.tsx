import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { chargerEtatOnboarding } from "@/lib/onboarding";
import { envoyerRelancesUtilisateur } from "@/lib/emailsRelance";
import { AccueilContenu } from "./AccueilContenu";

export default async function AccueilPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const donneesUserId = session.user.donneesUserId ?? session.user.id;
  const membreEquipe = donneesUserId !== session.user.id;
  let etatOnboarding: Awaited<ReturnType<typeof chargerEtatOnboarding>>;
  try {
    etatOnboarding = membreEquipe
      ? { aDesDocuments: true, importDiffer: false, parcoursTermine: true, doitVoirChoixImport: false, doitVoirBanniereReprise: false }
      : await chargerEtatOnboarding(session.user.id);
  } catch (e) {
    console.error("Échec du chargement onboarding accueil :", e);
    etatOnboarding = {
      aDesDocuments: false,
      importDiffer: false,
      parcoursTermine: true,
      doitVoirChoixImport: false,
      doitVoirBanniereReprise: false,
    };
  }
  if (etatOnboarding.doitVoirChoixImport) {
    redirect("/onboarding");
  }

  if (!membreEquipe) {
    await envoyerRelancesUtilisateur(session.user.id).catch((erreur) => {
      console.error("Relances email accueil :", erreur);
    });
  }

  return (
    <div className="w-full min-w-0 py-0">
      <AccueilContenu userId={donneesUserId} etatOnboarding={etatOnboarding} />
    </div>
  );
}
