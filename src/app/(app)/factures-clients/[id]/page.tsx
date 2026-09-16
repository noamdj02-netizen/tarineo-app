import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { deduireStatutFacture, formaterDateFacture, formaterMontantFacture } from "@/lib/facturesClients";
import { BoutonRegenererPdfFacture } from "./BoutonRegenererPdfFacture";

export default async function FactureClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const facture = await prisma.clientInvoice.findFirst({
    where: { id, userId: session.user.id },
    include: { lines: { orderBy: { ordre: "asc" } }, clientQuote: { select: { id: true, numero: true } } },
  });
  if (!facture) notFound();

  const statut = deduireStatutFacture(facture);
  const totalHt = Number(facture.totalHt);
  const totalTva = Number(facture.totalTva);
  const totalTtc = Number(facture.totalTtc);

  return (
    <div>
      <PageHeader
        backHref="/factures-clients"
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            Facture n° {facture.numero}
            <StatusBadge statut={statut} />
          </span>
        }
        actions={<BoutonRegenererPdfFacture clientInvoiceId={facture.id} />}
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        <PageCard>
          <p className="mb-3 text-sm font-semibold">Client</p>
          <div className="flex gap-3">
            <BrandMark nom={facture.clientNom} size={44} />
            <div className="text-sm">
              <p className="font-medium">{facture.clientNom}</p>
              {facture.clientAdresse && (
                <p className="whitespace-pre-line text-muted-foreground">{facture.clientAdresse}</p>
              )}
            </div>
          </div>
        </PageCard>
        <PageCard>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Date d&apos;émission</dt>
            <dd>{formaterDateFacture(facture.dateEmission)}</dd>
            <dt className="text-muted-foreground">Échéance</dt>
            <dd>{formaterDateFacture(facture.dateEcheance)}</dd>
            {facture.clientQuote && (
              <>
                <dt className="text-muted-foreground">Devis source</dt>
                <dd>
                  <Link href={`/devis-clients/${facture.clientQuote.id}`} className="text-primary hover:underline">
                    {facture.clientQuote.numero}
                  </Link>
                </dd>
              </>
            )}
            <dt className="text-muted-foreground">Total TTC</dt>
            <dd className="text-xl font-semibold">{formaterMontantFacture(totalTtc)}</dd>
          </dl>
        </PageCard>
      </div>

      <PageCard>
        <DataTable columns={["Désignation", "Quantité", "Prix unitaire HT", "TVA", "Total HT"]}>
          {facture.lines.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.designation}</TableCell>
              <TableCell>{Number(l.quantite)}</TableCell>
              <TableCell>{formaterMontantFacture(Number(l.prixUnitaireHt))}</TableCell>
              <TableCell>{Number(l.tauxTva)}%</TableCell>
              <TableCell>{formaterMontantFacture(Number(l.totalHt))}</TableCell>
            </TableRow>
          ))}
        </DataTable>
        <div className="mt-6 ml-auto w-full max-w-xs space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total HT</span>
            <span>{formaterMontantFacture(totalHt)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">TVA</span>
            <span>{formaterMontantFacture(totalTva)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total TTC</span>
            <span>{formaterMontantFacture(totalTtc)}</span>
          </div>
        </div>
      </PageCard>
    </div>
  );
}
