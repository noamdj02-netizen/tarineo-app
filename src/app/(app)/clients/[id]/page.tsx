import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { agregerClientsUtilisateur } from "@/lib/clients";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { BtnPrimary } from "@/components/tarineo/Actions";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { deduireStatutDevis } from "@/lib/devisClients";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(valeur);

const formaterDate = (date: Date) =>
  date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const { id } = await params;
  const cle = decodeURIComponent(id).toLowerCase();
  const clients = await agregerClientsUtilisateur(session.user.id);
  const client = clients.find((c) => c.cle === cle);
  if (!client) notFound();

  const filtreNom = { equals: client.nom, mode: "insensitive" as const };

  const [devis, factures] = await Promise.all([
    prisma.clientQuote.findMany({
      where: { userId: session.user.id, clientNom: filtreNom },
      orderBy: { createdAt: "desc" },
      include: { invoice: { select: { id: true } } },
    }),
    prisma.clientInvoice.findMany({
      where: { userId: session.user.id, clientNom: filtreNom },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const initiale = client.nom.replace(/[^A-Za-zÀ-ÿ0-9]/g, "").charAt(0).toUpperCase() || "?";

  return (
    <div>
      <PageHeader
        title={client.nom}
        subtitle="Fiche client construite à partir de vos devis et factures."
        backHref="/clients"
        backLabel="Tous les clients"
        actions={<BtnPrimary href="/devis-clients/nouveau">Nouveau devis</BtnPrimary>}
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,280px)]">
        <PageCard>
          <div className="flex items-start gap-4">
            <div className="flex size-14 shrink-0 items-center justify-center rounded-full bg-[#FFF0E8] text-xl font-bold text-primary">
              {initiale}
            </div>
            <div className="min-w-0 space-y-2 text-sm">
              {client.siret && (
                <p>
                  <span className="text-muted-foreground">SIRET </span>
                  <span className="font-medium text-foreground">{client.siret}</span>
                </p>
              )}
              {client.email && (
                <p>
                  <span className="text-muted-foreground">E-mail </span>
                  <a href={`mailto:${client.email}`} className="font-medium text-primary hover:underline">
                    {client.email}
                  </a>
                </p>
              )}
              {client.adresse && (
                <p>
                  <span className="text-muted-foreground">Adresse </span>
                  <span className="font-medium text-foreground">{client.adresse}</span>
                </p>
              )}
              {!client.siret && !client.email && !client.adresse && (
                <p className="text-muted-foreground">
                  Complétez les coordonnées lors de votre prochain devis pour enrichir cette fiche.
                </p>
              )}
            </div>
          </div>
        </PageCard>

        <PageCard className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Devis</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{client.devis}</p>
            <p className="text-sm text-muted-foreground">{formaterEuros(client.totalDevisHt)} HT</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Factures</p>
            <p className="mt-1 text-xl font-semibold text-foreground">{client.factures}</p>
            <p className="text-sm text-muted-foreground">{formaterEuros(client.totalFactureHt)} HT</p>
          </div>
        </PageCard>
      </div>

      <div className="flex flex-col gap-6">
        <PageCard>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">Devis</h2>
            <Link href="/devis-clients" className="text-sm font-medium text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          {devis.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun devis pour ce client.</p>
          ) : (
            <DataTable columns={["N° de devis", "Montant HT", "Statut", "Date"]}>
              {devis.map((d) => (
                <TableRow key={d.id}>
                  <TableCell>
                    <Link href={`/devis-clients/${d.id}`} className="font-medium hover:text-primary">
                      {d.numero}
                    </Link>
                  </TableCell>
                  <TableCell>{formaterEuros(Number(d.totalHt))}</TableCell>
                  <TableCell>
                    <StatusBadge statut={deduireStatutDevis(d)} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">{formaterDate(d.dateEmission)}</TableCell>
                </TableRow>
              ))}
            </DataTable>
          )}
        </PageCard>

        <PageCard>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-foreground">Factures</h2>
            <Link href="/factures-clients" className="text-sm font-medium text-primary hover:underline">
              Voir tout
            </Link>
          </div>
          {factures.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune facture pour ce client.</p>
          ) : (
            <DataTable columns={["N° de facture", "Montant HT", "Échéance"]}>
              {factures.map((f) => (
                <TableRow key={f.id}>
                  <TableCell>
                    <Link href={`/factures-clients/${f.id}`} className="font-medium hover:text-primary">
                      {f.numero}
                    </Link>
                  </TableCell>
                  <TableCell>{formaterEuros(Number(f.totalHt))}</TableCell>
                  <TableCell className="text-muted-foreground">{formaterDate(f.dateEcheance)}</TableCell>
                </TableRow>
              ))}
            </DataTable>
          )}
        </PageCard>
      </div>
    </div>
  );
}
