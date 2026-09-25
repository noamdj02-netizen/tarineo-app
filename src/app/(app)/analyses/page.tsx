import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession, idDonneesUtilisateur } from "@/lib/session";
import { chargerDonneesAnalyses, type PeriodeAnalyses } from "@/lib/analysesPage";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { AppStagger, AppStaggerItem } from "@/components/tarineo/motion/AppStagger";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FiltrePeriodeAnalyses } from "./FiltrePeriodeAnalyses";
import { GraphiqueEvolutionPrix } from "./GraphiqueEvolutionPrix";
import { GraphiqueDonutDepenses } from "./GraphiqueDonutDepenses";
import { BandeauApresImport } from "./BandeauApresImport";
import { KpisAnalyses } from "./KpisAnalyses";

const SOUS_TITRE =
  "Où votre marge se joue sur vos achats fournisseurs — distinct des devis et factures clients.";

const euros = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(n);

function parsePeriode(valeur: string | undefined): PeriodeAnalyses {
  const n = Number(valeur);
  if (n === 3 || n === 6 || n === 12) return n;
  return 6;
}

export default async function AnalysesPage({
  searchParams,
}: {
  searchParams: Promise<{ mois?: string; import?: string }>;
}) {
  const session = await getSession();
  if (!session?.user?.id) redirect("/connexion");

  const { mois } = await searchParams;
  const periode = parsePeriode(mois);
  const userId = await idDonneesUtilisateur(session.user.id);
  const donnees = await chargerDonneesAnalyses(userId, periode);

  if (!donnees.aDesDonnees) {
    return (
      <EmptyState
        title="Analyses"
        subtitle={SOUS_TITRE}
        heading="Pas encore de données à analyser"
        description="Importez des factures ou bons de commande fournisseurs — revenez ici pour voir dépenses, hausses et tendances. Les documents clients sont dans Ventes clients."
        primary={{ href: "/documents?scanner=1", label: "Importer un document" }}
        secondary={{ href: "/devis-clients", label: "Ventes clients" }}
        variant="document"
      />
    );
  }

  return (
    <div>
      <MobilePageHeader title="Analyses" subtitle="Hausses & dépenses fournisseurs" />
      <div className="mb-4 flex items-center justify-between gap-3 lg:hidden">
        <p className="text-sm text-muted-foreground">{SOUS_TITRE}</p>
        <Suspense fallback={null}>
          <FiltrePeriodeAnalyses periode={periode} />
        </Suspense>
      </div>
      <div className="hidden lg:block">
        <PageHeader
          title="Analyses"
          subtitle={SOUS_TITRE}
          actions={
            <Suspense fallback={null}>
              <FiltrePeriodeAnalyses periode={periode} />
            </Suspense>
          }
        />
      </div>

      <Suspense fallback={null}>
        <BandeauApresImport />
      </Suspense>

      <p className="mb-4 text-sm text-muted-foreground lg:hidden">
        <Link href="/devis-clients" className="font-medium text-primary hover:underline">
          Devis et factures clients →
        </Link>
      </p>

      <AppStagger className="flex flex-col gap-6">
        <AppStaggerItem>
          <KpisAnalyses
            totalDepenses={donnees.totalDepenses}
            impactHaussesEuros={donnees.impactHaussesEuros}
            nbHaussesPeriode={donnees.nbHaussesPeriode}
            nbHaussesActives={donnees.nbHaussesActives}
            nbAVerifier={donnees.nbAVerifier}
            periodeMois={donnees.periodeMois}
          />
        </AppStaggerItem>

        <AppStaggerItem>
          <PageCard>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">Top 5 des plus fortes hausses détectées</h2>
              <Link href="/documents?hausse=1" className="text-sm font-medium text-primary hover:underline">
                Voir tout →
              </Link>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Comparé à votre historique personnel — un prix plus bas chez un autre distributeur est indiqué sur chaque
              fiche document.
            </p>
            {donnees.hausses.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">Aucune hausse sur la période sélectionnée.</p>
            ) : (
              <DataTable columns={["Produit", "Fournisseur", "Hausse", "Catégorie", "Date", "Prix avant", "Prix actuel"]}>
                {donnees.hausses.map((h) => (
                  <TableRow key={`${h.documentId}-${h.produit}`}>
                    <TableCell>
                      <Link href={`/documents/${h.documentId}`} className="font-medium hover:text-primary">
                        {h.produit}
                      </Link>
                    </TableCell>
                    <TableCell>{h.fournisseur}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">+{h.haussePct} %</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{h.categorie}</TableCell>
                    <TableCell className="text-muted-foreground">{h.date}</TableCell>
                    <TableCell>{h.prixAvant !== null ? euros(h.prixAvant) : "—"}</TableCell>
                    <TableCell className="font-medium">{euros(h.prixActuel)}</TableCell>
                  </TableRow>
                ))}
              </DataTable>
            )}
          </PageCard>
        </AppStaggerItem>

        <AppStaggerItem>
          <div className="grid min-w-0 gap-6 lg:grid-cols-2">
            <Card className="rounded-[24px] ring-0">
              <CardHeader>
                <CardTitle className="text-base font-medium">Évolution des prix par fournisseur</CardTitle>
              </CardHeader>
              <CardContent>
                <GraphiqueEvolutionPrix series={donnees.evolutionPrix} />
              </CardContent>
            </Card>

            <Card className="rounded-[24px] ring-0">
              <CardHeader>
                <CardTitle className="text-base font-medium">Répartition des dépenses</CardTitle>
              </CardHeader>
              <CardContent>
                <GraphiqueDonutDepenses tranches={donnees.tranches} total={donnees.totalDepenses} />
              </CardContent>
            </Card>
          </div>
        </AppStaggerItem>

        <AppStaggerItem>
          <PageCard>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-foreground">Produits récemment commandés</h2>
              <Link href="/documents" className="text-sm font-medium text-primary hover:underline">
                Tous les documents →
              </Link>
            </div>
            {donnees.produitsRecents.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucun achat validé sur la période — importez une facture ou un bon de commande.
              </p>
            ) : (
              <DataTable columns={["Produit", "Réf.", "Fournisseur", "Qté", "Prix unit.", "Total HT", "Date", "Évolution"]}>
                {donnees.produitsRecents.map((p) => (
                  <TableRow key={`${p.documentId}-${p.reference}`}>
                    <TableCell>
                      <Link href={`/documents/${p.documentId}`} className="font-medium hover:text-primary">
                        {p.designation}
                      </Link>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{p.reference}</TableCell>
                    <TableCell>{p.fournisseur}</TableCell>
                    <TableCell>{p.quantite}</TableCell>
                    <TableCell>{euros(p.prixUnitaire)}</TableCell>
                    <TableCell className="font-medium">{euros(p.totalHt)}</TableCell>
                    <TableCell className="text-muted-foreground">{p.date}</TableCell>
                    <TableCell>
                      {p.variationPct === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : p.variationPct > 0 ? (
                        <Badge variant="destructive">+{p.variationPct} %</Badge>
                      ) : p.variationPct < 0 ? (
                        <Badge className="bg-[#E9F8EE] text-[#1F9D55]">{p.variationPct} %</Badge>
                      ) : (
                        <Badge variant="secondary">Stable</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </DataTable>
            )}
          </PageCard>
        </AppStaggerItem>
      </AppStagger>
    </div>
  );
}
