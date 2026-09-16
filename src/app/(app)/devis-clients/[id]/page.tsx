import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { estimerMargeDevis } from "@/lib/marge";
import { lierDevisAuChantier } from "@/app/(app)/chantiers/actions";
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
    include: {
      lines: { orderBy: { ordre: "asc" } },
      invoice: { select: { id: true, numero: true } },
      project: { select: { id: true, nom: true } },
    },
  });
  if (!quote) notFound();

  const [margeEstimee, chantiers] = await Promise.all([
    estimerMargeDevis(session.user.id, quote.id),
    prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { id: true, nom: true },
    }),
  ]);

  async function actionLierChantier(formData: FormData) {
    "use server";
    const projectId = String(formData.get("projectId") ?? "");
    if (projectId) await lierDevisAuChantier(projectId, id);
  }

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
              <Link
                href={`/factures-clients/${quote.invoice.id}`}
                className="rounded-full bg-primary px-4 py-2.5 text-sm text-white"
              >
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
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Chantier</dt>
            <dd>
              {quote.project ? (
                <Link href={`/chantiers/${quote.project.id}`} className="font-medium text-primary hover:underline">
                  {quote.project.nom}
                </Link>
              ) : chantiers.length > 0 ? (
                <form action={actionLierChantier} className="mt-1 flex flex-wrap gap-2">
                  <select name="projectId" required className="h-10 rounded-xl border border-border bg-white px-3 text-sm">
                    <option value="">Lier à un chantier…</option>
                    {chantiers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nom}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="h-10 rounded-full bg-secondary px-4 text-sm font-medium">
                    Lier
                  </button>
                </form>
              ) : (
                <Link href="/chantiers/nouveau" className="text-primary hover:underline">
                  Créer un chantier
                </Link>
              )}
            </dd>
          </div>
        </dl>
      </PageCard>

      {margeEstimee && (
        <PageCard className="mb-4 bg-[#F8FAFB]">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Marge matériaux</p>
          {margeEstimee.coutEstimeHt != null && margeEstimee.margeEstimeeHt != null ? (
            <>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Vente HT</p>
                  <p className="text-lg font-semibold">{formaterEuros(margeEstimee.venteHt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Coût estimé (historique)</p>
                  <p className="text-lg font-semibold">{formaterEuros(margeEstimee.coutEstimeHt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Marge estimée</p>
                  <p className="text-lg font-semibold text-[#1F9D55]">{formaterEuros(margeEstimee.margeEstimeeHt)}</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                Estimation basée sur {margeEstimee.lignesCouvertes}/{margeEstimee.lignesTotal} lignes rapprochées de
                votre historique d&apos;achats — pas une marge documentée de chantier.{" "}
                <Link href="/chantiers" className="text-primary hover:underline">
                  Lier à un chantier
                </Link>{" "}
                pour confirmer avec les vrais achats.
              </p>
            </>
          ) : (
            <p className="mt-2 text-sm text-muted-foreground">
              Marge non calculable pour le moment — importez des factures fournisseurs ou liez ce devis à un chantier
              avec des achats.
            </p>
          )}
        </PageCard>
      )}

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
