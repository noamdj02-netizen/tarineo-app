import { PageHeader, PageCard, SearchField } from "@/components/tarineo/PageHeader";
import { PillTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableRow, TableCell, RowActions, TablePagination } from "@/components/tarineo/DataTable";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { BtnGhost, BtnPrimary } from "@/components/tarineo/Actions";
import { IconFilter, IconPlus } from "@/components/tarineo/NavIcons";
import { DEMO_BC, formaterEurosDemo } from "@/lib/uiDemo";

export default async function BonsCommandePage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut = "tous" } = await searchParams;
  const filtered = statut === "tous" ? DEMO_BC : DEMO_BC.filter((d) => d.statut === statut);
  const rows = statut === "tous" ? filtered.slice(0, 10) : filtered;

  return (
    <div>
      <PageHeader
        title="Bons de commande"
        subtitle="Gérez tous vos bons de commande fournisseurs."
        actions={
          <>
            <BtnGhost>
              <IconFilter /> Filtrer
            </BtnGhost>
            <BtnPrimary href="/documents">
              <IconPlus /> Nouveau bon de commande
            </BtnPrimary>
          </>
        }
      />
      <PageCard>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <SearchField placeholder="Rechercher un bon de commande, un fournisseur..." />
          <BtnGhost className="shrink-0">
            <IconFilter /> Filtrer
          </BtnGhost>
        </div>
        <PillTabs
          actif={statut}
          items={[
            { id: "tous", label: "Tous (12)", href: "/bons-de-commande" },
            { id: "brouillon", label: "Brouillons (3)", href: "/bons-de-commande?statut=brouillon" },
            { id: "envoye", label: "Envoyés (4)", href: "/bons-de-commande?statut=envoye" },
            { id: "confirme", label: "Confirmés (4)", href: "/bons-de-commande?statut=confirme" },
            { id: "annule", label: "Annulés (1)", href: "/bons-de-commande?statut=annule" },
          ]}
        />
        <DataTable columns={["N° de BC", "Fournisseur", "Montant HT", "Statut", "Date", "Actions"]}>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.numero}</TableCell>
              <TableCell>{r.fournisseur}</TableCell>
              <TableCell>{formaterEurosDemo(r.montantHt)}</TableCell>
              <TableCell>
                <StatusBadge statut={r.statut} />
              </TableCell>
              <TableCell>{r.date}</TableCell>
              <TableCell>
                <RowActions />
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
        <TablePagination />
      </PageCard>
    </div>
  );
}
