import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { Separator } from "@/components/ui/separator";
import { BoutonTransformerEnFacture } from "./BoutonTransformerEnFacture";
import { BoutonRegenererPdf } from "./BoutonRegenererPdf";
import { BoutonEnvoyerDevis } from "./BoutonEnvoyerDevis";
import { accesDevisClientPdf } from "@/lib/planGating";
import { BanniereLimitesPlan } from "@/components/tarineo/BanniereLimitesPlan";
import { dateFinValiditeDevis, deduireStatutDevis } from "@/lib/devisClients";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(valeur);

export default async function DevisClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const [quote, utilisateur] = await Promise.all([
    prisma.clientQuote.findFirst({
      where: { id, userId: session.user.id },
      include: { lines: { orderBy: { ordre: "asc" } }, invoice: { select: { id: true, numero: true } } },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, subscriptionStatus: true },
    }),
  ]);
  if (!quote) notFound();
  const accesPdf = accesDevisClientPdf(utilisateur?.plan ?? null, utilisateur?.subscriptionStatus ?? null);
  const statut = deduireStatutDevis(quote);
  const finValidite = dateFinValiditeDevis(quote.dateEmission, quote.dureeValiditeJours);
  const aPdf = Boolean(quote.pdfKey);

  return (
    <div>
      <MobilePageHeader
        backHref="/devis-clients"
        title={`Devis n° ${quote.numero}`}
        subtitle={quote.clientNom}
      />
      <BanniereLimitesPlan
        plan={utilisateur?.plan ?? null}
        subscriptionStatus={utilisateur?.subscriptionStatus ?? null}
        className="mb-4"
      />
      <div className="hidden lg:block">
        <PageHeader
          backHref="/devis-clients"
          title={
            <span className="inline-flex flex-wrap items-center gap-3">
              Devis n° {quote.numero}
              <StatusBadge statut={statut} />
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
      </div>

      {/* Actions mobiles */}
      <div className="mb-4 flex flex-col gap-2 lg:hidden">
        <div className="flex items-center gap-2">
          <StatusBadge statut={statut} />
        </div>
        {aPdf && accesPdf && (
          <a
            href={`/api/devis-clients/${quote.id}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-[48px] items-center justify-center rounded-full bg-primary px-5 text-[15px] font-semibold text-white shadow-[0_8px_20px_rgba(236,88,33,0.28)]"
          >
            Voir le PDF
          </a>
        )}
        {!aPdf && accesPdf && (
          <p className="rounded-[14px] bg-[#FFF8F5] px-3 py-2 text-[13px] text-[#53616a] ring-1 ring-primary/15">
            PDF pas encore généré — utilisez « Régénérer ».
          </p>
        )}
        {!accesPdf && (
          <p className="rounded-[14px] bg-[#FFF8F5] px-3 py-2 text-[13px] text-[#53616a] ring-1 ring-primary/15">
            PDF réservé au plan Pro — passez à Pro dans Paramètres.
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          {!quote.invoice && (
            <Link
              href={`/devis-clients/${quote.id}/modifier`}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full border border-border bg-white px-4 text-sm font-medium"
            >
              Modifier
            </Link>
          )}
          {quote.invoice ? (
            <Link
              href={`/factures-clients/${quote.invoice.id}`}
              className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white"
            >
              Facture {quote.invoice.numero}
            </Link>
          ) : (
            <div className="flex-1">
              <BoutonTransformerEnFacture clientQuoteId={quote.id} />
            </div>
          )}
        </div>
      </div>

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
          {!quote.invoice && (
            <div>
              <dt className="text-muted-foreground">Validité</dt>
              <dd>
                {quote.dureeValiditeJours} jours — jusqu&apos;au{" "}
                {finValidite.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
              </dd>
            </div>
          )}
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Conditions de paiement</dt>
            <dd>{quote.conditionsPaiement}</dd>
          </div>
          {quote.clientSiret && (
            <div>
              <dt className="text-muted-foreground">SIRET</dt>
              <dd>{quote.clientSiret}</dd>
            </div>
          )}
          {quote.clientEmail && (
            <div>
              <dt className="text-muted-foreground">Email</dt>
              <dd>{quote.clientEmail}</dd>
            </div>
          )}
          {quote.clientAdresse && (
            <div className="sm:col-span-2">
              <dt className="text-muted-foreground">Adresse</dt>
              <dd className="whitespace-pre-line">{quote.clientAdresse}</dd>
            </div>
          )}
        </dl>
      </PageCard>

      {/* Lignes — cartes mobile */}
      <div className="mb-4 overflow-hidden rounded-[20px] bg-white shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8 lg:hidden">
        {quote.lines.map((l, i) => (
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
          <p className="text-[13px] text-[#8a96a3]">
            HT {formaterEuros(Number(quote.totalHt))} · TVA {formaterEuros(Number(quote.totalTva))}
          </p>
          <p className="mt-1 text-[17px] font-bold text-[#0f1c28]">
            TTC {formaterEuros(Number(quote.totalTtc))}
          </p>
          <div className="mt-3 flex flex-col gap-2">
            {aPdf && accesPdf && (
              <a
                href={`/api/devis-clients/${quote.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="hidden lg:inline-flex"
              >
                Voir le PDF
              </a>
            )}
            {!quote.invoice && (
              <BoutonEnvoyerDevis
                clientQuoteId={quote.id}
                clientEmail={quote.clientEmail}
                accesPdf={accesPdf}
              />
            )}
            <BoutonRegenererPdf clientQuoteId={quote.id} accesPdf={accesPdf} />
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <PageCard className="hidden lg:block">
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
          <div className="flex flex-wrap items-center gap-2">
            {aPdf && accesPdf && (
              <a
                href={`/api/devis-clients/${quote.id}/pdf`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-border bg-white px-4 py-2.5 text-sm font-medium hover:bg-secondary"
              >
                Voir le PDF
              </a>
            )}
            {!quote.invoice && (
              <BoutonEnvoyerDevis
                clientQuoteId={quote.id}
                clientEmail={quote.clientEmail}
                accesPdf={accesPdf}
              />
            )}
            <BoutonRegenererPdf clientQuoteId={quote.id} accesPdf={accesPdf} />
          </div>
        </div>
      </PageCard>
    </div>
  );
}
