import Link from "next/link";
import { PageHeader, PageCard, SearchField } from "@/components/tarineo/PageHeader";
import { DataTable, TableRow, TableCell, RowActions } from "@/components/tarineo/DataTable";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { BtnGhost, BtnPrimary } from "@/components/tarineo/Actions";
import { IconFilter, IconPlus } from "@/components/tarineo/NavIcons";
import { DEMO_CLIENTS, formaterEurosDemo } from "@/lib/uiDemo";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ vide?: string }> }) {
  const { vide } = await searchParams;
  if (vide === "1") {
    return (
      <EmptyState
        title="Clients"
        subtitle="Gérez vos clients et suivez votre activité."
        heading="Aucun client pour le moment"
        description="Ajoutez votre premier client pour commencer à créer des devis et à suivre vos projets."
        primary={{ href: "/clients", label: "+ Ajouter votre premier client" }}
        secondary={{ href: "/documents", label: "Scanner un devis pour créer un client" }}
        variant="user"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Gérez vos clients et suivez votre activité."
        actions={
          <>
            <BtnGhost>
              <IconFilter /> Filtrer
            </BtnGhost>
            <BtnPrimary>
              <IconPlus /> Nouveau client
            </BtnPrimary>
          </>
        }
      />
      <PageCard>
        <SearchField placeholder="Rechercher un client..." className="mb-4" />
        <DataTable columns={["Nom", "Contact", "Ville", "Devis", "CA généré", "Dernière activité", "Actions"]}>
          {DEMO_CLIENTS.map((c) => (
            <TableRow key={c.id}>
              <TableCell>
                <Link href={`/clients/${c.id}`} className="inline-flex items-center gap-2.5 font-medium hover:text-primary">
                  <BrandMark nom={c.nom} logo={c.logo} size={28} />
                  {c.nom}
                </Link>
              </TableCell>
              <TableCell>{c.contact}</TableCell>
              <TableCell>{c.ville}</TableCell>
              <TableCell>{c.devis}</TableCell>
              <TableCell>{formaterEurosDemo(c.ca)}</TableCell>
              <TableCell>{c.activite}</TableCell>
              <TableCell>
                <RowActions href={`/clients/${c.id}`} />
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      </PageCard>
    </div>
  );
}
