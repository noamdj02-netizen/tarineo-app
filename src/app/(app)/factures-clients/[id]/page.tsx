import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { PageTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { DEMO_FACTURES, DEMO_DEVIS_LIGNES, DEMO_CLIENT_CEDEO, formaterEurosDemo } from "@/lib/uiDemo";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { BoutonRegenererPdfFacture } from "./BoutonRegenererPdfFacture";

export default async function FactureClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { id } = await params;
  const { onglet = "detail" } = await searchParams;
  if (DEMO_FACTURES.some((f) => f.id === id)) {
    const facture = DEMO_FACTURES.find((f) => f.id === id)!;
    return (
      <div>
        <PageHeader
          backHref="/factures-clients"
          title={
            <span className="inline-flex flex-wrap items-center gap-3">
              Facture n° {facture.numero}
              <StatusBadge statut={facture.statut} />
            </span>
          }
        />
        <div className="mb-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <PageCard>
            <div className="flex gap-3">
              <BrandMark nom={DEMO_CLIENT_CEDEO.nom} logo="/dashboard/cedeo.png" size={44} />
              <div className="text-sm">
                <p className="font-medium">{DEMO_CLIENT_CEDEO.nom}</p>
                <p className="whitespace-pre-line text-muted-foreground">{DEMO_CLIENT_CEDEO.adresse}</p>
              </div>
            </div>
          </PageCard>
          <PageCard>
            <dl className="grid grid-cols-2 gap-y-2 text-sm">
              <dt className="text-muted-foreground">Date d&apos;émission</dt>
              <dd>11 sept. 2026</dd>
              <dt className="text-muted-foreground">Échéance</dt>
              <dd>11 oct. 2026</dd>
              <dt className="text-muted-foreground">Mode de paiement</dt>
              <dd>Virement</dd>
              <dt className="text-muted-foreground">Total TTC</dt>
              <dd className="text-xl font-semibold">1 488,00 €</dd>
            </dl>
          </PageCard>
        </div>
        <PageCard>
          <PageTabs
            actif={onglet}
            items={[
              { id: "detail", label: "Détail", href: `/factures-clients/${id}?onglet=detail` },
              { id: "paiement", label: "Paiement", href: `/factures-clients/${id}?onglet=paiement` },
              { id: "einvoice", label: "Facturation électronique", href: `/factures-clients/${id}?onglet=einvoice` },
              { id: "historique", label: "Historique", href: `/factures-clients/${id}?onglet=historique` },
            ]}
          />
          {onglet === "detail" && (
            <>
              <DataTable columns={["Désignation", "Quantité", "Prix unitaire HT", "TVA", "Total HT"]}>
                {DEMO_DEVIS_LIGNES.map((l) => (
                  <TableRow key={l.designation}>
                    <TableCell>{l.designation}</TableCell>
                    <TableCell>{l.quantite}</TableCell>
                    <TableCell>{l.pu.toFixed(2).replace(".", ",")} €</TableCell>
                    <TableCell>{l.tva}%</TableCell>
                    <TableCell>{formaterEurosDemo(l.total)}</TableCell>
                  </TableRow>
                ))}
              </DataTable>
              <div className="mt-6 ml-auto flex w-full max-w-xs flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total HT</span>
                  <span>1 240 €</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA</span>
                  <span>248 €</span>
                </div>
                <div className="flex justify-between text-base font-semibold">
                  <span>Total TTC</span>
                  <span>1 488 €</span>
                </div>
              </div>
            </>
          )}
        </PageCard>
      </div>
    );
  }

  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const facture = await prisma.clientInvoice.findFirst({
    where: { id, userId: session.user.id },
    include: { lines: { orderBy: { ordre: "asc" } }, clientQuote: { select: { id: true, numero: true } } },
  });
  if (!facture) notFound();

  return (
    <div>
      <PageHeader backHref="/factures-clients" title={`Facture ${facture.numero}`} actions={<BoutonRegenererPdfFacture clientInvoiceId={facture.id} />} />
      <PageCard>
        <p className="text-sm text-muted-foreground">
          {facture.clientNom}
          {facture.clientQuote && (
            <>
              {" "}
              · devis{" "}
              <Link href={`/devis-clients/${facture.clientQuote.id}`} className="text-primary">
                {facture.clientQuote.numero}
              </Link>
            </>
          )}
        </p>
      </PageCard>
    </div>
  );
}
