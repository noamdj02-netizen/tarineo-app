import { PageHeader, PageCard, SearchField } from "@/components/tarineo/PageHeader";
import { PillTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableRow, TableCell, RowActions } from "@/components/tarineo/DataTable";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { IconPlus } from "@/components/tarineo/NavIcons";
import { DEMO_BE } from "@/lib/uiDemo";

export default async function BonsEnlevementPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut = "tous" } = await searchParams;
  const rows = statut === "tous" ? DEMO_BE : DEMO_BE.filter((d) => d.statut === statut);

  return (
    <div>
      <PageHeader
        title="Bons d'enlèvement"
        subtitle="Suivez vos enlèvements en magasin."
        actions={
          <BtnPrimary href="/documents">
            <IconPlus /> Nouveau bon d&apos;enlèvement
          </BtnPrimary>
        }
      />
      <PageCard>
        <SearchField placeholder="Rechercher un bon d'enlèvement..." className="mb-5" />
        <PillTabs
          actif={statut}
          items={[
            { id: "tous", label: `Tous (${DEMO_BE.length})`, href: "/bons-enlevement" },
            { id: "a_enlever", label: "À enlever", href: "/bons-enlevement?statut=a_enlever" },
            { id: "enleve", label: "Enlevés", href: "/bons-enlevement?statut=enleve" },
            { id: "annule", label: "Annulés", href: "/bons-enlevement?statut=annule" },
          ]}
        />
        <DataTable columns={["N° de BE", "Fournisseur", "Chantier", "Date d'enlèvement", "Statut", "Actions"]}>
          {rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-medium">{r.numero}</TableCell>
              <TableCell>{r.fournisseur}</TableCell>
              <TableCell>{r.chantier}</TableCell>
              <TableCell>{r.dateEnlevement}</TableCell>
              <TableCell>
                <StatusBadge statut={r.statut} />
              </TableCell>
              <TableCell>
                <RowActions />
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      </PageCard>
    </div>
  );
}
