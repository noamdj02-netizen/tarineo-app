import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { PageTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { BtnGhost, BtnPrimary } from "@/components/tarineo/Actions";
import { deduireStatutDevis, formaterDateDevis, formaterMontantDevis } from "@/lib/devisClients";
import { BoutonTransformerEnFacture } from "./BoutonTransformerEnFacture";
import { BoutonRegenererPdf } from "./BoutonRegenererPdf";

export default async function DevisClientDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ onglet?: string }>;
}) {
  const { id } = await params;
  const { onglet = "prestations" } = await searchParams;

  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const quote = await prisma.clientQuote.findFirst({
    where: { id, userId: session.user.id },
    include: { lines: { orderBy: { ordre: "asc" } }, invoice: { select: { id: true, numero: true } } },
  });
  if (!quote) notFound();

  const statut = deduireStatutDevis(quote);
  const totalHt = Number(quote.totalHt);
  const totalTva = Number(quote.totalTva);
  const totalTtc = Number(quote.totalTtc);

  return (
    <div>
      <PageHeader
        backHref="/devis-clients"
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            Devis n° {quote.numero}
            <StatusBadge statut={statut} />
          </span>
        }
        actions={
          quote.invoice ? (
            <BtnPrimary href={`/factures-clients/${quote.invoice.id}`}>Voir la facture</BtnPrimary>
          ) : (
            <>
              <BtnGhost href={`/devis-clients/${quote.id}/modifier`}>Modifier</BtnGhost>
              <BoutonTransformerEnFacture clientQuoteId={quote.id} />
            </>
          )
        }
      />

      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <PageCard>
          <p className="mb-3 text-sm font-semibold">Client</p>
          <div className="flex gap-3">
            <BrandMark nom={quote.clientNom} size={44} />
            <div className="min-w-0 text-sm">
              <p className="font-medium">{quote.clientNom}</p>
              {quote.clientAdresse && (
                <p className="whitespace-pre-line text-muted-foreground">{quote.clientAdresse}</p>
              )}
            </div>
          </div>
        </PageCard>
        <PageCard>
          <p className="mb-3 text-sm font-semibold">Informations</p>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Date d&apos;émission</dt>
            <dd>{formaterDateDevis(quote.dateEmission)}</dd>
            <dt className="text-muted-foreground">Validité</dt>
            <dd>{quote.dureeValiditeJours} jours</dd>
            <dt className="text-muted-foreground">Paiement</dt>
            <dd className="col-span-2 text-xs leading-relaxed text-foreground">{quote.conditionsPaiement}</dd>
          </dl>
        </PageCard>
        <PageCard>
          <p className="mb-3 text-sm font-semibold">Total HT</p>
          <p className="text-[32px] font-semibold tracking-tight text-[#172935]">{formaterMontantDevis(totalHt)}</p>
        </PageCard>
      </div>

      <PageCard>
        <PageTabs
          actif={onglet}
          items={[
            { id: "prestations", label: "Prestations", href: `/devis-clients/${id}?onglet=prestations` },
            { id: "commentaires", label: "Commentaires", href: `/devis-clients/${id}?onglet=commentaires` },
            { id: "historique", label: "Historique", href: `/devis-clients/${id}?onglet=historique` },
          ]}
        />
        {onglet !== "prestations" ? (
          <p className="mt-6 text-sm text-muted-foreground">Aucun élément pour cet onglet.</p>
        ) : (
          <>
            <div className="mt-2">
              <DataTable columns={["Désignation", "Quantité", "Prix unitaire HT", "TVA", "Total HT"]}>
                {quote.lines.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell>{l.designation}</TableCell>
                    <TableCell>{Number(l.quantite)}</TableCell>
                    <TableCell>{formaterMontantDevis(Number(l.prixUnitaireHt))}</TableCell>
                    <TableCell>{Number(l.tauxTva)}%</TableCell>
                    <TableCell>{formaterMontantDevis(Number(l.totalHt))}</TableCell>
                  </TableRow>
                ))}
              </DataTable>
            </div>
            <div className="mt-6 ml-auto w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total HT</span>
                <span>{formaterMontantDevis(totalHt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA</span>
                <span>{formaterMontantDevis(totalTva)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total TTC</span>
                <span>{formaterMontantDevis(totalTtc)}</span>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <BoutonRegenererPdf clientQuoteId={quote.id} />
            </div>
          </>
        )}
      </PageCard>
    </div>
  );
}
