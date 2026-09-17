import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { etatQuotaDevisIA, CONDITIONS_PAIEMENT_PAR_DEFAUT } from "@/lib/devisClients";
import { FormulaireDevis } from "../FormulaireDevis";
import { creerDevis, genererDepuisPrompt, suggererPrix } from "./actions";

export default async function NouveauDevisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const quotaIA = await etatQuotaDevisIA(session.user.id);

  return (
    <div className="app-page-wide flex flex-col gap-5">
      <Link href="/devis-clients" className="text-sm text-muted-foreground hover:text-accent">
        ← Devis clients
      </Link>
      <h1 className="app-display mt-3 text-2xl font-semibold text-[var(--foreground)]">Nouveau devis client</h1>
      <p className="mt-2 text-muted-foreground">
        Saisie manuelle ou description en langage naturel / dictée : l&apos;IA propose des lignes, vous validez avant
        envoi.
      </p>

      <FormulaireDevis
        conditionsPaiementParDefaut={CONDITIONS_PAIEMENT_PAR_DEFAUT}
        quotaIA={quotaIA}
        actionGenererIA={genererDepuisPrompt}
        actionSoumettre={creerDevis}
        actionSuggererPrix={suggererPrix}
      />
    </div>
  );
}
