import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { calculerDepensesParDistributeur } from "@/lib/depenses";
import { normaliserDistributeur } from "@/lib/normalisation";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(v);

/**
 * Analyses = décisions, pas une démo.
 * Prix / fournisseurs / dépenses / produits à surveiller — données personnelles uniquement.
 */
export default async function AnalysesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const userId = session.user.id;

  const [alertes, depenses, priceHistory] = await Promise.all([
    prisma.alert.findMany({
      where: { userId, type: "PRICE_INCREASE" },
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
    calculerDepensesParDistributeur(userId),
    prisma.priceHistory.findMany({
      where: { userId },
      orderBy: { documentDate: "desc" },
      take: 500,
      select: {
        referenceNorm: true,
        manufacturerRefNorm: true,
        distributor: true,
        distributorNorm: true,
        unitPriceHt: true,
        documentDate: true,
      },
    }),
  ]);

  const payloads = parserPayloadsAlertesHausse(alertes);
  const topHausses = [...payloads]
    .filter((p) => (p.ecartPourcent ?? 0) > 3)
    .sort((a, b) => (b.ecartPourcent ?? 0) - (a.ecartPourcent ?? 0))
    .slice(0, 8);

  const haussesParFournisseur = new Map<string, { nom: string; count: number; impact: number }>();
  for (const p of payloads) {
    const norm = normaliserDistributeur(p.distributor);
    const existant = haussesParFournisseur.get(norm);
    const impact = Math.max(0, p.ecartEuros ?? 0);
    if (existant) {
      existant.count += 1;
      existant.impact += impact;
    } else {
      haussesParFournisseur.set(norm, { nom: p.distributor, count: 1, impact });
    }
  }
  const topFournisseursVariations = [...haussesParFournisseur.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Produits à surveiller : refs avec ≥2 prix distincts dans l'historique
  const parRef = new Map<string, { prix: number[]; distributor: string }>();
  for (const h of priceHistory) {
    const cle = h.manufacturerRefNorm || h.referenceNorm;
    if (!cle) continue;
    const existant = parRef.get(cle);
    if (existant) existant.prix.push(Number(h.unitPriceHt));
    else parRef.set(cle, { prix: [Number(h.unitPriceHt)], distributor: h.distributor });
  }
  const produitsSurveillance = [...parRef.entries()]
    .map(([ref, v]) => {
      if (v.prix.length < 2) return null;
      const premier = v.prix[v.prix.length - 1];
      const dernier = v.prix[0];
      if (premier <= 0) return null;
      const variation = ((dernier - premier) / premier) * 100;
      return { ref, distributor: v.distributor, variation, dernier, premier, n: v.prix.length };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null && Math.abs(x.variation) > 3)
    .sort((a, b) => Math.abs(b.variation) - Math.abs(a.variation))
    .slice(0, 8);

  const totalDepenses = depenses.reduce((s, d) => s + d.depenses, 0);
  const vide = payloads.length === 0 && depenses.length === 0 && produitsSurveillance.length === 0;

  return (
    <div>
      <PageHeader
        title="Analyses"
        subtitle="Décisions à partir de votre historique personnel — jamais de chiffres inventés."
        actions={<BtnPrimary href="/documents">Importer un document</BtnPrimary>}
      />

      {vide ? (
        <PageCard>
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyTitle>Pas encore assez de données</EmptyTitle>
              <EmptyDescription>
                Importez des factures fournisseurs : les hausses, dépenses et produits à surveiller apparaîtront ici.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </PageCard>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <PageCard>
              <p className="text-xs text-muted-foreground">Hausses détectées</p>
              <p className="mt-1 text-3xl font-semibold">{topHausses.length}</p>
              <Link href="/documents?hausse=1" className="mt-2 inline-block text-sm text-primary hover:underline">
                Voir les hausses →
              </Link>
            </PageCard>
            <PageCard>
              <p className="text-xs text-muted-foreground">Dépenses documentées (période)</p>
              <p className="mt-1 text-3xl font-semibold">{formaterEuros(totalDepenses)}</p>
              <Link href="/accueil#objectifs" className="mt-2 inline-block text-sm text-primary hover:underline">
                Voir le dashboard →
              </Link>
            </PageCard>
            <PageCard>
              <p className="text-xs text-muted-foreground">Produits à surveiller</p>
              <p className="mt-1 text-3xl font-semibold">{produitsSurveillance.length}</p>
            </PageCard>
          </div>

          <PageCard>
            <h2 className="mb-3 text-base font-semibold">Quels produits ont augmenté ?</h2>
            {topHausses.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune hausse &gt; 3 % pour l&apos;instant.</p>
            ) : (
              <DataTable columns={["Produit", "Fournisseur", "Variation", "Prix actuel", ""]}>
                {topHausses.map((h) => (
                  <TableRow key={`${h.documentId}-${h.reference}`}>
                    <TableCell className="max-w-[220px] truncate font-medium">{h.designation || h.reference}</TableCell>
                    <TableCell>{h.distributor}</TableCell>
                    <TableCell className="text-primary">
                      {h.ecartPourcent != null ? `+${h.ecartPourcent.toFixed(1)} %` : "—"}
                    </TableCell>
                    <TableCell>{formaterEuros(h.prixActuel)}</TableCell>
                    <TableCell>
                      <Link href={`/documents/${h.documentId}`} className="text-sm text-primary hover:underline">
                        Comparer
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </DataTable>
            )}
          </PageCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <PageCard>
              <h2 className="mb-3 text-base font-semibold">Quel fournisseur varie le plus ?</h2>
              {topFournisseursVariations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Pas encore de variations détectées.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {topFournisseursVariations.map((f) => (
                    <li key={f.nom} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
                      <span className="font-medium">{f.nom}</span>
                      <span className="text-muted-foreground">
                        {f.count} hausse{f.count > 1 ? "s" : ""}
                        {f.impact > 0 ? ` · ${formaterEuros(f.impact)}` : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </PageCard>

            <PageCard>
              <h2 className="mb-3 text-base font-semibold">Où part l&apos;argent ?</h2>
              {depenses.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun achat validé sur la période.</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {[...depenses]
                    .sort((a, b) => b.depenses - a.depenses)
                    .slice(0, 6)
                    .map((d) => (
                      <li key={d.distributorNorm} className="flex items-center justify-between rounded-xl bg-secondary px-4 py-3 text-sm">
                        <Link
                          href={`/fournisseurs/${encodeURIComponent(d.distributorNorm)}`}
                          className="font-medium hover:text-primary"
                        >
                          {d.distributor}
                        </Link>
                        <span>{formaterEuros(d.depenses)}</span>
                      </li>
                    ))}
                </ul>
              )}
            </PageCard>
          </div>

          <PageCard>
            <h2 className="mb-3 text-base font-semibold">Quels produits surveiller ?</h2>
            {produitsSurveillance.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Il faut au moins deux achats d&apos;une même référence pour tracer une évolution.
              </p>
            ) : (
              <DataTable columns={["Référence", "Fournisseur récent", "Évolution", "Dernier prix"]}>
                {produitsSurveillance.map((p) => (
                  <TableRow key={p.ref}>
                    <TableCell className="font-medium">{p.ref}</TableCell>
                    <TableCell>{p.distributor}</TableCell>
                    <TableCell className={p.variation > 0 ? "text-primary" : "text-[#1F9D55]"}>
                      {p.variation > 0 ? "+" : ""}
                      {p.variation.toFixed(1)} %
                    </TableCell>
                    <TableCell>{formaterEuros(p.dernier)}</TableCell>
                  </TableRow>
                ))}
              </DataTable>
            )}
          </PageCard>
        </div>
      )}
    </div>
  );
}
