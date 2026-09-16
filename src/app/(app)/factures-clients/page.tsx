import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { DataTable, TableRow, TableCell } from "@/components/tarineo/DataTable";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { BtnPrimary } from "@/components/tarineo/Actions";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(valeur);

const formaterDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default async function FacturesClientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const factures = await prisma.clientInvoice.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  if (factures.length === 0) {
    return (
      <EmptyState
        title="Factures clients"
        subtitle="Factures émises à partir de vos devis."
        heading="Aucune facture pour le moment"
        description="Transformez un devis client accepté en facture depuis la fiche du devis."
        primary={{ href: "/devis-clients", label: "Voir mes devis clients" }}
        secondary={{ href: "/devis-clients/nouveau", label: "Créer un devis" }}
        variant="document"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Factures clients"
        subtitle="Émises par transformation d'un devis — pas de création manuelle pour l'instant."
        actions={<BtnPrimary href="/devis-clients">Voir les devis</BtnPrimary>}
      />
      <PageCard>
        <DataTable columns={["N° de facture", "Client", "Montant HT", "Échéance", ""]}>
          {factures.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                <Link href={`/factures-clients/${f.id}`} className="font-medium hover:text-primary">
                  {f.numero}
                </Link>
              </TableCell>
              <TableCell>{f.clientNom}</TableCell>
              <TableCell>{formaterEuros(Number(f.totalHt))}</TableCell>
              <TableCell>{formaterDate(f.dateEcheance)}</TableCell>
              <TableCell>
                <Link href={`/factures-clients/${f.id}`} className="text-sm text-primary hover:underline">
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
