import Link from "next/link";
import { PageHeader, PageCard, SearchField } from "@/components/tarineo/PageHeader";
import { PillTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableRow, TableCell, RowActions, TablePagination } from "@/components/tarineo/DataTable";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { BtnGhost, BtnPrimary } from "@/components/tarineo/Actions";
import { IconFilter, IconPlus } from "@/components/tarineo/NavIcons";
import { DEMO_FACTURES, formaterEurosDemo } from "@/lib/uiDemo";

export default async function FacturesClientsPage({ searchParams }: { searchParams: Promise<{ statut?: string }> }) {
  const { statut = "tous" } = await searchParams;
  const rows = statut === "tous" ? DEMO_FACTURES : DEMO_FACTURES.filter((d) => d.statut === statut);

  return (
    <div>
      <PageHeader
        title="Factures"
        subtitle="Suivez vos factures et vos paiements."
        actions={
          <>
            <BtnGhost>
              <IconFilter /> Filtrer
            </BtnGhost>
            <BtnPrimary href="/factures-clients/nouveau">
              <IconPlus /> Nouvelle facture
            </BtnPrimary>
          </>
        }
      />
      <PageCard>
        <SearchField placeholder="Rechercher une facture, un client..." className="mb-5" />
        <PillTabs
          actif={statut}
          items={[
            { id: "tous", label: `Toutes (${DEMO_FACTURES.length})`, href: "/factures-clients" },
            { id: "brouillon", label: "Brouillons (1)", href: "/factures-clients?statut=brouillon" },
            { id: "envoyee", label: "Envoyées (2)", href: "/factures-clients?statut=envoyee" },
            { id: "payee", label: "Payées (2)", href: "/factures-clients?statut=payee" },
            { id: "en_retard", label: "En retard (1)", href: "/factures-clients?statut=en_retard" },
          ]}
        />
        <DataTable columns={["N° de facture", "Client", "Montant HT", "Statut", "Échéance", "Actions"]}>
          {rows.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                <Link href={`/factures-clients/${f.id}`} className="font-medium hover:text-primary">
                  {f.numero}
                </Link>
              </TableCell>
              <TableCell>{f.client}</TableCell>
              <TableCell>{formaterEurosDemo(f.montantHt)}</TableCell>
              <TableCell>
                <StatusBadge statut={f.statut} />
              </TableCell>
              <TableCell>{f.echeance}</TableCell>
              <TableCell>
                <RowActions />
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
        <TablePagination label="Affichage de 6 résultats" />
      </PageCard>
    </div>
  );
}
