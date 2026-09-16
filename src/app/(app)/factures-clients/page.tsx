import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader, PageCard, SearchField } from "@/components/tarineo/PageHeader";
import { PillTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableRow, TableCell, RowActions, TablePagination } from "@/components/tarineo/DataTable";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { BtnGhost } from "@/components/tarineo/Actions";
import { IconFilter } from "@/components/tarineo/NavIcons";
import {
  formaterDateFacture,
  formaterMontantFacture,
  listerFacturesUtilisateur,
  type StatutFactureClient,
} from "@/lib/facturesClients";

const STATUTS: StatutFactureClient[] = ["envoyee", "en_retard", "payee", "brouillon"];

export default async function FacturesClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ statut?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { statut = "tous" } = await searchParams;
  const factures = await listerFacturesUtilisateur(session.user.id);

  if (factures.length === 0) {
    return (
      <EmptyState
        title="Factures clients"
        subtitle="Factures émises à partir de vos devis acceptés."
        heading="Aucune facture pour le moment"
        description="Transformez un devis client en facture depuis la fiche devis — Tarineo génère le PDF avec vos mentions légales."
        primary={{ href: "/devis-clients", label: "Voir mes devis" }}
        secondary={{ href: "/devis-clients/nouveau", label: "Créer un devis" }}
        variant="document"
      />
    );
  }

  const counts = {
    tous: factures.length,
    envoyee: factures.filter((f) => f.statut === "envoyee").length,
    payee: factures.filter((f) => f.statut === "payee").length,
    en_retard: factures.filter((f) => f.statut === "en_retard").length,
    brouillon: factures.filter((f) => f.statut === "brouillon").length,
  };

  const statutValide = STATUTS.includes(statut as StatutFactureClient) ? (statut as StatutFactureClient) : null;
  const filtered = statutValide ? factures.filter((f) => f.statut === statutValide) : factures;

  return (
    <div>
      <PageHeader
        title="Factures clients"
        subtitle="Factures émises à vos clients — créées depuis vos devis."
        actions={
          <BtnGhost>
            <IconFilter /> Filtrer
          </BtnGhost>
        }
      />
      <PageCard>
        <SearchField placeholder="Rechercher une facture, un client..." className="mb-5" />
        <PillTabs
          actif={statut}
          items={[
            { id: "tous", label: `Toutes (${counts.tous})`, href: "/factures-clients" },
            { id: "envoyee", label: `Envoyées (${counts.envoyee})`, href: "/factures-clients?statut=envoyee" },
            { id: "en_retard", label: `En retard (${counts.en_retard})`, href: "/factures-clients?statut=en_retard" },
            { id: "payee", label: `Payées (${counts.payee})`, href: "/factures-clients?statut=payee" },
          ]}
        />
        <DataTable columns={["N° facture", "Client", "Montant HT", "Statut", "Échéance", "Devis source", "Actions"]}>
          {filtered.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                <Link href={`/factures-clients/${f.id}`} className="font-medium hover:text-primary">
                  {f.numero}
                </Link>
              </TableCell>
              <TableCell>{f.clientNom}</TableCell>
              <TableCell>{formaterMontantFacture(f.montantHt)}</TableCell>
              <TableCell>
                <StatusBadge statut={f.statut} />
              </TableCell>
              <TableCell>{formaterDateFacture(f.dateEcheance)}</TableCell>
              <TableCell>{f.devisNumero ?? "—"}</TableCell>
              <TableCell>
                <RowActions href={`/factures-clients/${f.id}`} />
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
        <TablePagination label={`${filtered.length} facture${filtered.length > 1 ? "s" : ""}`} />
      </PageCard>
    </div>
  );
}
