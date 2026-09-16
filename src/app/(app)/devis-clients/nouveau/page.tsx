import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { etatQuotaDevisIA, CONDITIONS_PAIEMENT_PAR_DEFAUT } from "@/lib/devisClients";
import { FormulaireDevis } from "../FormulaireDevis";
import { creerDevis, genererDepuisPrompt, suggererPrix } from "./actions";

export default async function NouveauDevisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const userId = session.user.id;

  const [quotaIA, profil] = await Promise.all([
    etatQuotaDevisIA(userId),
    prisma.companyProfile.findUnique({ where: { userId }, select: { id: true } }),
  ]);

  return (
    <div className="app-page-wide flex flex-col gap-5">
      <Link href="/devis-clients" className="text-sm text-muted hover:text-accent">
        ← Devis clients
      </Link>
      <div>
        <h1 className="app-display text-2xl font-semibold text-[var(--foreground)]">Créer un devis</h1>
        <p className="mt-2 text-sm text-muted">
          Saisissez les lignes manuellement ou décrivez la prestation pour que l&apos;IA prépare un aperçu.
        </p>
      </div>

      {!profil && (
        <div className="app-banner text-sm">
          <p className="font-medium text-foreground">Profil entreprise requis</p>
          <p className="mt-1 text-muted">
            Complétez{" "}
            <Link href="/entreprise" className="font-medium text-primary underline-offset-2 hover:underline">
              Mon entreprise
            </Link>{" "}
            (SIRET, logo, mentions légales) avant de créer un devis client.
          </p>
        </div>
      )}

      {/* Les actions sont passées telles quelles : une fermeture inline définie ici
          n'est pas sérialisable vers un composant client et fait planter le rendu de la
          page. genererDepuisPrompt ignore le second argument (les lignes actuelles),
          qui ne sert qu'en modification. */}
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
