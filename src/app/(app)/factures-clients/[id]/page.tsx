import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { BoutonRegenererPdfFacture } from "./BoutonRegenererPdfFacture";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(valeur);

export default async function FactureClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const facture = await prisma.clientInvoice.findFirst({
    where: { id, userId: session.user.id },
    include: { lines: { orderBy: { ordre: "asc" } }, clientQuote: { select: { id: true, numero: true } } },
  });
  if (!facture) notFound();

  return (
    <div>
      <PageHeader
        backHref="/factures-clients"
        title={`Facture n° ${facture.numero}`}
        actions={<BoutonRegenererPdfFacture clientInvoiceId={facture.id} />}
      />
      <PageCard className="mb-4">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Client</dt>
            <dd className="font-medium">{facture.clientNom}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Échéance</dt>
            <dd>
              {facture.dateEcheance.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
            </dd>
          </div>
          {facture.clientQuote && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Devis d&apos;origine</dt>
              <dd>
                <Link href={`/devis-clients/${facture.clientQuote.id}`} className="text-primary hover:underline">
                  {facture.clientQuote.numero}
                </Link>
              </dd>
            </div>
          )}
        </dl>
      </PageCard>
      <PageCard>
        <DataTable columns={["Désignation", "Quantité", "Prix unitaire HT", "TVA", "Total HT"]}>
          {facture.lines.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.designation}</TableCell>
              <TableCell>{Number(l.quantite)}</TableCell>
              <TableCell>{formaterEuros(Number(l.prixUnitaireHt))}</TableCell>
              <TableCell>{Number(l.tauxTva)}%</TableCell>
              <TableCell>{formaterEuros(Number(l.totalHt))}</TableCell>
            </TableRow>
          ))}
        </DataTable>
        <div className="mt-4 border-t pt-4 text-right text-sm">
          <p>
            Total HT {formaterEuros(Number(facture.totalHt))} · TVA {formaterEuros(Number(facture.totalTva))} ·{" "}
            <span className="font-semibold">TTC {formaterEuros(Number(facture.totalTtc))}</span>
          </p>
        </div>
      </PageCard>
    </div>
  );
}
