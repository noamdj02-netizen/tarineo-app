import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { etatQuotaDevisIA, CONDITIONS_PAIEMENT_PAR_DEFAUT, DUREE_VALIDITE_PAR_DEFAUT } from "@/lib/devisClients";
import { PageHeader } from "@/components/tarineo/PageHeader";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { Button } from "@/components/ui/button";
import { FormulaireDevis } from "../FormulaireDevis";
import { creerDevis, genererDepuisPrompt, suggererPrix } from "./actions";

export default async function NouveauDevisPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const [quotaIA, profil] = await Promise.all([
    etatQuotaDevisIA(session.user.id),
    prisma.companyProfile.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    }),
  ]);

  return (
    <div className="app-page-wide">
      <MobilePageHeader
        backHref="/devis-clients"
        title="Nouveau devis"
        subtitle="Manuel ou assisté par IA"
      />
      <div className="hidden lg:block">
        <PageHeader
          backHref="/devis-clients"
          backLabel="Devis clients"
          title="Nouveau devis client"
          subtitle="Saisie manuelle ou description en langage naturel — l'IA propose des lignes, vous validez avant envoi."
        />
      </div>

      {!profil && (
        <div className="mb-5 rounded-[16px] bg-[#FFF8F5] px-4 py-4 ring-1 ring-primary/20">
          <p className="text-[15px] font-semibold text-[#0f1c28]">Entreprise requise</p>
          <p className="mt-1 text-[13px] leading-snug text-[#53616a]">
            Renseignez SIRET, adresse et logo avant de générer un devis PDF.
          </p>
          <Button
            className="mt-3 h-10 rounded-full px-5"
            render={<Link href="/parametres" />}
            nativeButton={false}
          >
            Compléter mon entreprise
          </Button>
        </div>
      )}

      <FormulaireDevis
        conditionsPaiementParDefaut={CONDITIONS_PAIEMENT_PAR_DEFAUT}
        dureeValiditeParDefaut={DUREE_VALIDITE_PAR_DEFAUT}
        quotaIA={quotaIA}
        actionGenererIA={genererDepuisPrompt}
        actionSoumettre={creerDevis}
        actionSuggererPrix={suggererPrix}
        entrepriseComplete={Boolean(profil)}
      />
    </div>
  );
}
