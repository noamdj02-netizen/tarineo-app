import Link from "next/link";
import { PageHeader, PageCard, SearchField } from "@/components/tarineo/PageHeader";
import { PillTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableRow, TableCell, RowActions, TablePagination } from "@/components/tarineo/DataTable";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { BtnGhost, BtnPrimary } from "@/components/tarineo/Actions";
import { IconFilter, IconPlus } from "@/components/tarineo/NavIcons";
import { DEMO_DEVIS, formaterEurosDemo } from "@/lib/uiDemo";

export default async function DevisClientsPage({ searchParams }: { searchParams: Promise<{ statut?: string; vide?: string }> }) {
  const { statut = "tous", vide } = await searchParams;
  if (vide === "1") {
    return (
      <EmptyState
        title="Devis"
        subtitle="Créez et gérez vos devis clients."
        heading="Aucun devis pour le moment"
        description="Créez votre premier devis pour commencer à gérer vos projets et suivre vos opportunités."
        primary={{ href: "/devis-clients/nouveau", label: "+ Créer votre premier devis" }}
        secondary={{ href: "/documents", label: "Découvrir comment ça marche" }}
        variant="document"
      />
    );
  }

  const counts = {
    tous: DEMO_DEVIS.length,
    brouillon: DEMO_DEVIS.filter((d) => d.statut === "brouillon").length,
    envoye: DEMO_DEVIS.filter((d) => d.statut === "envoye").length,
    accepte: DEMO_DEVIS.filter((d) => d.statut === "accepte").length,
    refuse: DEMO_DEVIS.filter((d) => d.statut === "refuse").length,
    expire: DEMO_DEVIS.filter((d) => d.statut === "expire").length,
  };
  const filtered = statut === "tous" ? DEMO_DEVIS : DEMO_DEVIS.filter((d) => d.statut === statut);
  const rows = statut === "tous" ? filtered.slice(0, 10) : filtered;

  return (
    <div>
      <PageHeader
        title="Devis"
        subtitle="Gérez tous vos devis en un seul endroit."
        actions={
          <>
            <BtnGhost>
              <IconFilter /> Filtrer
            </BtnGhost>
            <BtnPrimary href="/devis-clients/nouveau">
              <IconPlus /> Nouveau devis
            </BtnPrimary>
          </>
        }
      />
      <PageCard>
        <SearchField placeholder="Rechercher un devis, un client..." className="mb-5" />
        <PillTabs
          actif={statut}
          items={[
            { id: "tous", label: `Tous (${counts.tous})`, href: "/devis-clients" },
            { id: "brouillon", label: `Brouillons (${counts.brouillon})`, href: "/devis-clients?statut=brouillon" },
            { id: "envoye", label: `Envoyés (${counts.envoye})`, href: "/devis-clients?statut=envoye" },
            { id: "accepte", label: `Acceptés (${counts.accepte})`, href: "/devis-clients?statut=accepte" },
            { id: "refuse", label: `Refusés (${counts.refuse})`, href: "/devis-clients?statut=refuse" },
            { id: "expire", label: `Expirés (${counts.expire})`, href: "/devis-clients?statut=expire" },
          ]}
        />
        <div className="mt-1">
          <DataTable columns={["N° de devis", "Client", "Montant HT", "Statut", "Date", "Actions"]}>
            {rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  <Link href={`/devis-clients/${d.id}`} className="font-medium hover:text-primary">
                    {d.numero}
                  </Link>
                </TableCell>
                <TableCell>{d.client}</TableCell>
                <TableCell>{formaterEurosDemo(d.montantHt)}</TableCell>
                <TableCell>
                  <StatusBadge statut={d.statut} />
                </TableCell>
                <TableCell>{d.date}</TableCell>
                <TableCell>
                  <RowActions />
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
          <TablePagination label={`Affichage de ${Math.min(10, rows.length)} sur ${DEMO_DEVIS.length} résultats`} />
        </div>
      </PageCard>
    </div>
  );
}
