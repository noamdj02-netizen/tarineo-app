import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { Separator } from "@/components/ui/separator";
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
  const aPdf = Boolean(facture.pdfKey);

  return (
    <div>
      <MobilePageHeader
        backHref="/factures-clients"
        title={`Facture n° ${facture.numero}`}
        subtitle={facture.clientNom}
      />
      <div className="hidden lg:block">
        <PageHeader
          backHref="/factures-clients"
          title={`Facture n° ${facture.numero}`}
          actions={
            <div className="flex flex-wrap gap-2">
              {aPdf && (
                <a
                  href={`/api/factures-clients/${facture.id}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-secondary"
                >
                  Voir le PDF
                </a>
              )}
              <BoutonRegenererPdfFacture clientInvoiceId={facture.id} />
            </div>
          }
        />
      </div>

      <div className="mb-4 flex flex-col gap-2 lg:hidden">
        {aPdf && (
          <a
            href={`/api/factures-clients/${facture.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center rounded-full bg-primary px-5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(236,88,33,0.28)]"
          >
            Voir le PDF
          </a>
        )}
        <BoutonRegenererPdfFacture clientInvoiceId={facture.id} />
      </div>

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

      <div className="mb-4 overflow-hidden rounded-[20px] bg-white shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8 lg:hidden">
        {facture.lines.map((l, i) => (
          <div key={l.id}>
            {i > 0 && <Separator className="bg-[#EEF0F2]" />}
            <div className="px-4 py-3.5">
              <p className="text-[15px] font-medium text-[#0f1c28]">{l.designation}</p>
              <p className="mt-1 text-[13px] text-[#8a96a3]">
                {Number(l.quantite)} × {formaterEuros(Number(l.prixUnitaireHt))} · TVA {Number(l.tauxTva)}%
              </p>
              <p className="mt-1 text-right text-[15px] font-semibold text-[#0f1c28]">
                {formaterEuros(Number(l.totalHt))}
              </p>
            </div>
          </div>
        ))}
        <div className="border-t border-[#EEF0F2] px-4 py-4">
          <p className="text-[17px] font-bold text-[#0f1c28]">
            TTC {formaterEuros(Number(facture.totalTtc))}
          </p>
        </div>
      </div>

      <PageCard className="hidden lg:block">
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
