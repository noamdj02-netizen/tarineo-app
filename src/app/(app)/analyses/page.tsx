import Link from "next/link";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { LineChart, DonutChart } from "@/components/tarineo/Charts";
import { DataTable, TableRow, TableCell } from "@/components/tarineo/DataTable";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { PeriodSelect } from "@/components/tarineo/Actions";
import { DEMO_DEPENSES, DEMO_HAUSSES, DEMO_SERIES_PRIX, formaterEurosDec } from "@/lib/uiDemo";

export default function AnalysesPage() {
  return (
    <div>
      <PageHeader title="Analyses" subtitle="Visualisez l'évolution des prix et vos économies." actions={<PeriodSelect />} />
      <div className="mb-5 grid gap-5 xl:grid-cols-[1.45fr_1fr]">
        <PageCard>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold">Évolution des prix par fournisseur</h2>
            <PeriodSelect className="h-9 px-3 text-xs text-muted-foreground" />
          </div>
          <div className="mb-4 flex flex-wrap gap-4 text-xs text-[#172935]">
            {DEMO_SERIES_PRIX.map((s) => (
              <span key={s.nom} className="inline-flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: s.couleur }} />
                {s.nom}
              </span>
            ))}
          </div>
          <LineChart series={DEMO_SERIES_PRIX} />
        </PageCard>
        <PageCard>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Répartition des dépenses</h2>
            <PeriodSelect className="h-9 px-3 text-xs text-muted-foreground" />
          </div>
          <DonutChart total="24 580 €" slices={DEMO_DEPENSES} />
        </PageCard>
      </div>
      <PageCard>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold">Top 5 des plus fortes hausses détectées</h2>
          <Link href="/documents?hausse=1" className="text-sm text-muted-foreground hover:text-primary">
            Voir tout →
          </Link>
        </div>
        <DataTable columns={["Produit", "Fournisseur", "Hausse", "Catégorie", "Date", "Prix avant", "Prix actuel"]}>
          {DEMO_HAUSSES.map((h) => (
            <TableRow key={h.produit}>
              <TableCell className="font-medium">{h.produit}</TableCell>
              <TableCell>{h.fournisseur}</TableCell>
              <TableCell>
                <StatusBadge statut="hausse" label={`+${h.hausse}%`} />
              </TableCell>
              <TableCell>{h.categorie}</TableCell>
              <TableCell>{h.date}</TableCell>
              <TableCell>{formaterEurosDec(h.avant)}</TableCell>
              <TableCell>{formaterEurosDec(h.actuel)}</TableCell>
            </TableRow>
          ))}
        </DataTable>
      </PageCard>
    </div>
  );
}
