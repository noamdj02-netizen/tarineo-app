import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculerMargeChantier } from "@/lib/marge";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { EmptyState } from "@/components/tarineo/EmptyState";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

export default async function ChantiersPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const chantiers = await prisma.project.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { quotes: true, documents: true } },
    },
  });

  if (chantiers.length === 0) {
    return (
      <EmptyState
        title="Chantiers"
        subtitle="Le fil rouge entre vos ventes clients et vos achats fournisseurs."
        heading="Aucun chantier pour le moment"
        description="Créez un chantier, liez-y un devis client et des factures fournisseurs : Tarinéo calcule une marge documentée uniquement quand les deux côtés sont présents."
        primary={{ href: "/chantiers/nouveau", label: "+ Créer un chantier" }}
        secondary={{ href: "/devis-clients", label: "Voir mes devis clients" }}
        variant="document"
      />
    );
  }

  const marges = await Promise.all(
    chantiers.map(async (c) => ({ id: c.id, marge: await calculerMargeChantier(session.user!.id!, c.id) }))
  );
  const margeParId = new Map(marges.map((m) => [m.id, m.marge]));

  return (
    <div>
      <PageHeader
        title="Chantiers"
        subtitle="Reliez client, devis, achats et facture pour une marge documentée."
        actions={<BtnPrimary href="/chantiers/nouveau">+ Nouveau chantier</BtnPrimary>}
      />
      <PageCard>
        <DataTable columns={["Chantier", "Client", "Devis", "Achats", "Marge", ""]}>
          {chantiers.map((c) => {
            const m = margeParId.get(c.id)!;
            return (
              <TableRow key={c.id}>
                <TableCell>
                  <Link href={`/chantiers/${c.id}`} className="font-medium hover:text-primary">
                    {c.nom}
                  </Link>
                </TableCell>
                <TableCell>{c.clientNom ?? "—"}</TableCell>
                <TableCell>{c._count.quotes}</TableCell>
                <TableCell>{c._count.documents}</TableCell>
                <TableCell>
                  {m.confirmee ? (
                    <span className="font-medium text-[#1F9D55]">{formaterEuros(m.margeHt)}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">Non confirmée</span>
                  )}
                </TableCell>
                <TableCell>
                  <Link href={`/chantiers/${c.id}`} className="text-sm text-primary hover:underline">
                    Ouvrir
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </DataTable>
      </PageCard>
    </div>
  );
}
