import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { etatQuotaDevisIA, CONDITIONS_PAIEMENT_PAR_DEFAUT } from "@/lib/devisClients";
import { FormulaireDevis } from "../../FormulaireDevis";
import { mettreAJourDevis, modifierLignesAvecIA, suggererPrix } from "./actions";

export default async function ModifierDevisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }
  const userId = session.user.id;

  const quote = await prisma.clientQuote.findFirst({
    where: { id, userId },
    include: { lines: { orderBy: { ordre: "asc" } }, invoice: { select: { id: true } } },
  });
  if (!quote) {
    notFound();
  }
  // Un devis déjà transformé en facture est verrouillé — cohérent avec le fait qu'une
  // facture émise ne se corrige pas légalement. Garde côté serveur indispensable ici
  // (pas seulement masquer le lien "Modifier" sur la page de détail) : sinon une
  // navigation directe vers cette URL contournerait la règle.
  if (quote.invoice) {
    redirect(`/devis-clients/${quote.id}`);
  }

  const quotaIA = await etatQuotaDevisIA(userId);

  return (
    <div className="app-page-wide flex flex-col gap-5">
      <Link href={`/devis-clients/${quote.id}`} className="text-sm text-muted-foreground hover:text-accent">
        ← Devis {quote.numero}
      </Link>
      <h1 className="app-display mt-3 text-2xl font-semibold text-[var(--foreground)]">Modifier le devis {quote.numero}</h1>
      <p className="mt-2 text-muted-foreground">
        Corrigez une ligne manuellement, ou décrivez la modification en texte libre pour que l&apos;IA reconstruise
        les lignes concernées.
      </p>

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
