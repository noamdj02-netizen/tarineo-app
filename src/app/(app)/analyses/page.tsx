import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { DonutChart } from "@/components/tarineo/Charts";
import { DataTable, TableRow, TableCell } from "@/components/tarineo/DataTable";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { chargerDonneesAnalyses } from "@/lib/analysesPage";
import { formaterMontantDevis } from "@/lib/devisClients";

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

export default async function AnalysesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { tranches, totalDepenses, hausses, aDesDonnees } = await chargerDonneesAnalyses(session.user.id);

  return (
    <div className="animate-in fade-in duration-300">
      <PageHeader
        title="Analyses"
        subtitle="Répartition de vos achats fournisseurs et hausses de prix détectées sur votre historique."
      />

      {!aDesDonnees ? (
        <PageCard className="text-center">
          <p className="text-base font-medium text-foreground">Pas encore assez de données</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Importez vos factures et devis fournisseurs pour voir la répartition par enseigne et les alertes de hausse.
          </p>
          <div className="mt-6 flex justify-center">
            <BtnPrimary href="/documents">Importer des documents</BtnPrimary>
          </div>
        </PageCard>
      ) : (
        <>
          <div className="mb-5 grid gap-5 xl:grid-cols-[1fr_1fr]">
            <PageCard>
              <h2 className="mb-4 text-base font-semibold text-foreground">Répartition des dépenses par enseigne</h2>
              {tranches.length > 0 ? (
                <DonutChart total={formaterEuros(totalDepenses)} slices={tranches} />
              ) : (
                <p className="text-sm text-muted-foreground">Aucune dépense enregistrée sur la période.</p>
              )}
            </PageCard>
            <PageCard>
              <h2 className="mb-4 text-base font-semibold text-foreground">En bref</h2>
              <ul className="space-y-3 text-sm">
                <li className="flex justify-between border-b border-[#F3F3F3] pb-3">
                  <span className="text-muted-foreground">Dépenses suivies (période)</span>
                  <span className="font-medium text-foreground">{formaterEuros(totalDepenses)}</span>
                </li>
                <li className="flex justify-between border-b border-[#F3F3F3] pb-3">
                  <span className="text-muted-foreground">Enseignes actives</span>
                  <span className="font-medium text-foreground">{tranches.length}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-muted-foreground">Alertes hausse (12 mois)</span>
                  <span className="font-medium text-primary">{hausses.length > 0 ? hausses.length + "+" : "0"}</span>
                </li>
              </ul>
              <Link href="/fournisseurs" className="mt-4 inline-block text-sm text-primary hover:underline">
                Voir tous les fournisseurs →
              </Link>
            </PageCard>
          </div>

          <PageCard>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground">Plus fortes hausses détectées</h2>
              <Link href="/documents?hausse=1" className="text-sm text-muted-foreground transition-colors hover:text-primary">
                Voir tout →
              </Link>
            </div>
            {hausses.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">
                Aucune hausse significative pour le moment — continuez à importer vos achats.
              </p>
            ) : (
              <DataTable columns={["Produit", "Fournisseur", "Hausse", "Prix avant", "Prix actuel", ""]}>
                {hausses.map((h) => (
                  <TableRow key={`${h.documentId}-${h.produit}`}>
                    <TableCell className="max-w-[200px] truncate font-medium">{h.produit}</TableCell>
                    <TableCell>{h.fournisseur}</TableCell>
                    <TableCell>
                      <StatusBadge statut="hausse" label={`+${h.haussePct}%`} />
                    </TableCell>
                    <TableCell>
                      {h.prixAvant !== null ? formaterMontantDevis(h.prixAvant) : "—"}
                    </TableCell>
                    <TableCell>{formaterMontantDevis(h.prixActuel)}</TableCell>
                    <TableCell>
                      <Link href={`/documents/${h.documentId}`} className="text-sm text-primary hover:underline">
                        Voir
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </DataTable>
            )}
          </PageCard>
        </>
      )}
    </div>
  );
}
