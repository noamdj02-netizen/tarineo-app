import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { chargerEtatOnboarding } from "@/lib/onboarding";
import { AccueilContenu } from "./AccueilContenu";

export default async function AccueilPage() {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const userId = session.user.id;
  let etatOnboarding: Awaited<ReturnType<typeof chargerEtatOnboarding>>;
  try {
    etatOnboarding = await chargerEtatOnboarding(userId);
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

  return (
    <div className="w-full min-w-0 py-0">
      <AccueilContenu userId={userId} etatOnboarding={etatOnboarding} />
    </div>
  );
}
