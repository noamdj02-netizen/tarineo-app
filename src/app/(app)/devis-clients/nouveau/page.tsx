import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { etatQuotaDevisIA, CONDITIONS_PAIEMENT_PAR_DEFAUT, DUREE_VALIDITE_PAR_DEFAUT } from "@/lib/devisClients";
import { PageHeader } from "@/components/tarineo/PageHeader";
import { FormulaireDevis } from "../FormulaireDevis";
import { creerDevis, genererDepuisPrompt, suggererPrix } from "./actions";

export default async function NouveauDevisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const quotaIA = await etatQuotaDevisIA(session.user.id);

  return (
    <div className="app-page-wide">
      <PageHeader
        backHref="/devis-clients"
        backLabel="Devis clients"
        title="Nouveau devis client"
        subtitle="Saisie manuelle ou description en langage naturel — l'IA propose des lignes, vous validez avant envoi."
      />

      <FormulaireDevis
        conditionsPaiementParDefaut={CONDITIONS_PAIEMENT_PAR_DEFAUT}
        dureeValiditeParDefaut={DUREE_VALIDITE_PAR_DEFAUT}
        quotaIA={quotaIA}
        actionGenererIA={genererDepuisPrompt}
        actionSoumettre={creerDevis}
        actionSuggererPrix={suggererPrix}
      />
    </div>
  );
}
