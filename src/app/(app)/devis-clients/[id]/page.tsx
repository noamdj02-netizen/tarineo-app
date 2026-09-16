import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { BoutonTransformerEnFacture } from "./BoutonTransformerEnFacture";
import { BoutonRegenererPdf } from "./BoutonRegenererPdf";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(valeur);

export default async function DevisClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const quote = await prisma.clientQuote.findFirst({
    where: { id, userId: session.user.id },
    include: { lines: { orderBy: { ordre: "asc" } }, invoice: { select: { id: true, numero: true } } },
  });
  if (!quote) notFound();

  return (
    <div>
      <PageHeader
        backHref="/devis-clients"
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            Devis n° {quote.numero}
            <StatusBadge statut={quote.invoice ? "accepte" : "envoye"} />
          </span>
        }
        actions={
          <div className="flex flex-wrap gap-2">
            {!quote.invoice && (
              <Link
                href={`/devis-clients/${quote.id}/modifier`}
                className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Modifier
              </Link>
            )}
            {quote.invoice ? (
              <Link href={`/factures-clients/${quote.invoice.id}`} className="rounded-full bg-primary px-4 py-2.5 text-sm text-white">
                Voir la facture {quote.invoice.numero}
              </Link>
            ) : (
              <BoutonTransformerEnFacture clientQuoteId={quote.id} />
            )}
          </div>
        }
      />
      <PageCard className="mb-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Client</dt>
            <dd className="font-medium">{quote.clientNom}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Date d&apos;émission</dt>
            <dd>
              {quote.dateEmission.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </dd>
          </div>
          {quote.clientAdresse && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Adresse</dt>
              <dd className="whitespace-pre-line">{quote.clientAdresse}</dd>
            </div>
          )}
        </dl>
      </PageCard>
      <PageCard>
        <DataTable columns={["Désignation", "Quantité", "Prix unitaire HT", "TVA", "Total HT"]}>
          {quote.lines.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.designation}</TableCell>
              <TableCell>{Number(l.quantite)}</TableCell>
              <TableCell>{formaterEuros(Number(l.prixUnitaireHt))}</TableCell>
              <TableCell>{Number(l.tauxTva)}%</TableCell>
              <TableCell>{formaterEuros(Number(l.totalHt))}</TableCell>
            </TableRow>
          ))}
        </DataTable>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Total HT {formaterEuros(Number(quote.totalHt))} · TVA {formaterEuros(Number(quote.totalTva))} ·{" "}
            <span className="font-semibold text-foreground">TTC {formaterEuros(Number(quote.totalTtc))}</span>
          </p>
          <BoutonRegenererPdf clientQuoteId={quote.id} />
        </div>
      </PageCard>
    </div>
  );
}
