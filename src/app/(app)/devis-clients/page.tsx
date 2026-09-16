import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader, PageCard, SearchField } from "@/components/tarineo/PageHeader";
import { PillTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableRow, TableCell, RowActions, TablePagination } from "@/components/tarineo/DataTable";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { BtnGhost, BtnPrimary } from "@/components/tarineo/Actions";
import { IconFilter, IconPlus } from "@/components/tarineo/NavIcons";
import {
  formaterDateDevis,
  formaterMontantDevis,
  listerDevisUtilisateur,
  type StatutDevisClient,
} from "@/lib/devisClients";

const STATUTS_FILTRE: StatutDevisClient[] = ["brouillon", "envoye", "accepte", "refuse", "expire"];
const PAGE_SIZE = 10;

export default async function DevisClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { statut = "tous" } = await searchParams;
  const devis = await listerDevisUtilisateur(session.user.id);

  if (devis.length === 0) {
    return (
      <EmptyState
        title="Devis"
        subtitle="Créez et gérez vos devis clients."
        heading="Aucun devis pour le moment"
        description="Créez votre premier devis pour commencer à gérer vos projets et suivre vos opportunités."
        primary={{ href: "/devis-clients/nouveau", label: "+ Créer votre premier devis" }}
        secondary={{ href: "/documents", label: "Importer vos achats fournisseurs" }}
        variant="document"
      />
    );
  }

  const counts = {
    tous: devis.length,
    brouillon: devis.filter((d) => d.statut === "brouillon").length,
    envoye: devis.filter((d) => d.statut === "envoye").length,
    accepte: devis.filter((d) => d.statut === "accepte").length,
    refuse: devis.filter((d) => d.statut === "refuse").length,
    expire: devis.filter((d) => d.statut === "expire").length,
  };

  const statutValide = STATUTS_FILTRE.includes(statut as StatutDevisClient) ? (statut as StatutDevisClient) : null;
  const filtered = statutValide ? devis.filter((d) => d.statut === statutValide) : devis;
  const rows = statut === "tous" ? filtered.slice(0, PAGE_SIZE) : filtered;

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
          {rows.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Aucun devis dans cette catégorie pour le moment.
            </p>
          ) : (
            <DataTable columns={["N° de devis", "Client", "Montant HT", "Statut", "Date", "Actions"]}>
              {rows.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link href={`/devis-clients/${d.id}`} className="font-medium hover:text-primary">
                      {d.numero}
                    </Link>
                  </TableCell>
                  <TableCell>{d.clientNom}</TableCell>
                  <TableCell>{formaterMontantDevis(d.montantHt)}</TableCell>
                  <TableCell>
                    <StatusBadge statut={d.statut} />
                  </TableCell>
                  <TableCell>{formaterDateDevis(d.dateEmission)}</TableCell>
                  <TableCell>
                    <RowActions href={`/devis-clients/${d.id}`} />
                  </TableCell>
                </TableRow>
              ))}
            </DataTable>
          )}
          <TablePagination
            label={`Affichage de ${rows.length} sur ${statut === "tous" ? devis.length : filtered.length} résultat${filtered.length > 1 ? "s" : ""}`}
          />
        </div>
      </PageCard>
    </div>
  );
}
