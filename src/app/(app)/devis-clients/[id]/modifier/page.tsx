import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { etatQuotaDevisIA, CONDITIONS_PAIEMENT_PAR_DEFAUT } from "@/lib/devisClients";
import { PageHeader } from "@/components/tarineo/PageHeader";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { FormulaireDevis } from "../../FormulaireDevis";
import { mettreAJourDevis, modifierLignesAvecIA, suggererPrix } from "./actions";

export default async function ModifierDevisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const userId = session.user.id;

  const quote = await prisma.clientQuote.findFirst({
    where: { id, userId },
    include: { lines: { orderBy: { ordre: "asc" } }, invoice: { select: { id: true } } },
  });
  if (!quote) notFound();
  if (quote.invoice) redirect(`/devis-clients/${quote.id}`);

  const quotaIA = await etatQuotaDevisIA(userId);

  return (
    <div className="app-page-wide">
      <MobilePageHeader
        backHref={`/devis-clients/${quote.id}`}
        title={`Modifier ${quote.numero}`}
        subtitle={quote.clientNom}
      />
      <div className="hidden lg:block">
        <PageHeader
          backHref={`/devis-clients/${quote.id}`}
          backLabel={`Devis ${quote.numero}`}
          title={`Modifier le devis ${quote.numero}`}
          subtitle="Corrigez une ligne manuellement, ou décrivez la modification pour que l'IA reconstruise les lignes concernées."
        />
      </div>

      <FormulaireDevis
        conditionsPaiementParDefaut={CONDITIONS_PAIEMENT_PAR_DEFAUT}
        quotaIA={quotaIA}
        devisExistant={{
          id: quote.id,
          clientNom: quote.clientNom,
          clientAdresse: quote.clientAdresse,
          clientSiret: quote.clientSiret,
          clientEmail: quote.clientEmail,
          dureeValiditeJours: quote.dureeValiditeJours,
          conditionsPaiement: quote.conditionsPaiement,
          lignes: quote.lines.map((l) => ({
            designation: l.designation,
            quantite: Number(l.quantite),
            prixUnitaireHt: Number(l.prixUnitaireHt),
            tauxTva: Number(l.tauxTva),
          })),
        }}
        actionGenererIA={modifierLignesAvecIA.bind(null, quote.id)}
        actionSoumettre={mettreAJourDevis.bind(null, quote.id)}
        actionSuggererPrix={suggererPrix}
      />
    </div>
  );
}
