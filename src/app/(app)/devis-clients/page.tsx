import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { DataTable, TableRow, TableCell } from "@/components/tarineo/DataTable";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { IconPlus } from "@/components/tarineo/NavIcons";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(valeur);

const formaterDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default async function DevisClientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const devis = await prisma.clientQuote.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: { invoice: { select: { id: true } } },
  });

  if (devis.length === 0) {
    return (
      <EmptyState
        title="Devis clients"
        subtitle="Créez et gérez vos devis pour vos clients."
        heading="Aucun devis pour le moment"
        description="Créez votre premier devis (manuel ou assisté par IA) pour envoyer une proposition à votre client."
        primary={{ href: "/devis-clients/nouveau", label: "+ Créer votre premier devis" }}
        secondary={{ href: "/documents", label: "D'abord importer un devis fournisseur" }}
        variant="document"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Devis clients"
        subtitle="Propositions envoyées à vos clients (distinctes des devis fournisseurs)."
        actions={
          <BtnPrimary href="/devis-clients/nouveau">
            <IconPlus /> Nouveau devis
          </BtnPrimary>
        }
      />
      <PageCard>
        <DataTable columns={["N° de devis", "Client", "Montant HT", "Statut", "Date", ""]}>
          {devis.map((d) => (
            <TableRow key={d.id}>
              <TableCell>
                <Link href={`/devis-clients/${d.id}`} className="font-medium hover:text-primary">
                  {d.numero}
                </Link>
              </TableCell>
              <TableCell>{d.clientNom}</TableCell>
              <TableCell>{formaterEuros(Number(d.totalHt))}</TableCell>
              <TableCell>{d.invoice ? "Facturé" : "Ouvert"}</TableCell>
              <TableCell>{formaterDate(d.dateEmission)}</TableCell>
              <TableCell>
                <Link href={`/devis-clients/${d.id}`} className="text-sm text-primary hover:underline">
                  Ouvrir
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      </PageCard>
    </div>
  );
}
