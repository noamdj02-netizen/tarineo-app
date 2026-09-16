import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";

/**
 * Clients détectés automatiquement depuis les devis/factures clients.
 * Pas encore de modèle Client CRM : on agrège les noms documentés (jamais inventés).
 */
export default async function ClientsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const [quotes, invoices] = await Promise.all([
    prisma.clientQuote.findMany({
      where: { userId: session.user.id },
      select: { clientNom: true, id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.clientInvoice.findMany({
      where: { userId: session.user.id },
      select: { clientNom: true, id: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const parNom = new Map<string, { nom: string; devis: number; factures: number }>();
  for (const q of quotes) {
    const cle = q.clientNom.trim().toLowerCase();
    if (!cle) continue;
    const existant = parNom.get(cle);
    if (existant) existant.devis += 1;
    else parNom.set(cle, { nom: q.clientNom.trim(), devis: 1, factures: 0 });
  }
  for (const inv of invoices) {
    const cle = inv.clientNom.trim().toLowerCase();
    if (!cle) continue;
    const existant = parNom.get(cle);
    if (existant) existant.factures += 1;
    else parNom.set(cle, { nom: inv.clientNom.trim(), devis: 0, factures: 1 });
  }

  const clients = [...parNom.values()].sort((a, b) => a.nom.localeCompare(b.nom, "fr"));

  if (clients.length === 0) {
    return (
      <EmptyState
        title="Clients"
        subtitle="Tarinéo crée vos fiches à partir de vos devis et factures."
        heading="Aucun client pour le moment"
        description="Créez un devis client : le nom apparaît ici automatiquement. Aucun client n'est inventé."
        primary={{ href: "/devis-clients/nouveau", label: "+ Créer un devis client" }}
        secondary={{ href: "/devis-clients", label: "Voir mes devis" }}
        variant="user"
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle="Détectés automatiquement depuis vos devis et factures — jamais inventés."
        actions={<BtnPrimary href="/devis-clients/nouveau">Nouveau devis</BtnPrimary>}
      />
      <PageCard>
        <DataTable columns={["Client", "Devis", "Factures", ""]}>
          {clients.map((c) => (
            <TableRow key={c.nom}>
              <TableCell className="font-medium">{c.nom}</TableCell>
              <TableCell>{c.devis}</TableCell>
              <TableCell>{c.factures}</TableCell>
              <TableCell>
                <Link href="/devis-clients" className="text-sm text-primary hover:underline">
                  Voir les devis
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </DataTable>
      </PageCard>
    </div>
  );
}
