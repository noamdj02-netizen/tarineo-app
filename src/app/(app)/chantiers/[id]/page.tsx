import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculerMargeChantier } from "@/lib/marge";
import { LABELS_TYPE, LABELS_STATUT, TYPES_ACHAT_REEL } from "@/lib/documentLabels";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { lierDevisAuChantier, lierDocumentAuChantier, delierDevisDuChantier, delierDocumentDuChantier } from "../actions";

const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(v);

export default async function ChantierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const userId = session.user.id;

  const chantier = await prisma.project.findFirst({
    where: { id, userId },
    include: {
      quotes: {
        orderBy: { createdAt: "desc" },
        include: { invoice: { select: { id: true, numero: true, totalHt: true } } },
      },
      documents: {
        orderBy: [{ documentDate: "desc" }, { createdAt: "desc" }],
      },
    },
  });
  if (!chantier) notFound();

  const [marge, devisLibres, docsLibres] = await Promise.all([
    calculerMargeChantier(userId, id),
    prisma.clientQuote.findMany({
      where: { userId, projectId: null },
      orderBy: { createdAt: "desc" },
      take: 30,
      select: { id: true, numero: true, clientNom: true, totalHt: true },
    }),
    prisma.document.findMany({
      where: {
        userId,
        projectId: null,
        status: "VALIDATED",
        type: { in: [...TYPES_ACHAT_REEL] },
      },
      orderBy: { createdAt: "desc" },
      take: 40,
      select: { id: true, distributor: true, type: true, totalHt: true, documentDate: true },
    }),
  ]);

  async function actionLierDevis(formData: FormData) {
    "use server";
    const quoteId = String(formData.get("quoteId") ?? "");
    if (quoteId) await lierDevisAuChantier(id, quoteId);
  }

  async function actionLierDoc(formData: FormData) {
    "use server";
    const documentId = String(formData.get("documentId") ?? "");
    if (documentId) await lierDocumentAuChantier(id, documentId);
  }

  return (
    <div>
      <PageHeader
        backHref="/chantiers"
        title={chantier.nom}
        subtitle={chantier.clientNom ? `Client : ${chantier.clientNom}` : "Sans client renseigné"}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <PageCard>
          <p className="text-xs text-muted-foreground">Vente documentée</p>
          <p className="mt-1 text-2xl font-semibold">{formaterEuros(marge.venteHt)}</p>
        </PageCard>
        <PageCard>
          <p className="text-xs text-muted-foreground">Achats matériaux</p>
          <p className="mt-1 text-2xl font-semibold">{formaterEuros(marge.achatsHt)}</p>
        </PageCard>
        <PageCard className={marge.confirmee ? "bg-[#E9F8EE]" : "bg-[#FFF0E8]"}>
          <p className="text-xs text-muted-foreground">{marge.confirmee ? "Marge brute documentée" : "Marge"}</p>
          {marge.confirmee ? (
            <>
              <p className="mt-1 text-2xl font-semibold text-[#1F9D55]">{formaterEuros(marge.margeHt)}</p>
              {marge.margePct != null && (
                <p className="mt-1 text-sm text-muted-foreground">{marge.margePct} % de la vente</p>
              )}
            </>
          ) : (
            <>
              <p className="mt-1 text-lg font-semibold text-foreground">Non confirmée</p>
              <p className="mt-1 text-sm text-muted-foreground">{marge.motifNonConfirmee}</p>
            </>
          )}
        </PageCard>
      </div>

      {chantier.notes && (
        <PageCard className="mb-6">
          <p className="text-sm text-muted-foreground whitespace-pre-line">{chantier.notes}</p>
        </PageCard>
      )}

      <PageCard className="mb-6">
        <h2 className="mb-4 text-base font-semibold">Devis / factures clients</h2>
        {chantier.quotes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun devis lié. Liez un devis existant ci-dessous.</p>
        ) : (
          <DataTable columns={["N°", "Client", "Vente HT", "Facture", ""]}>
            {chantier.quotes.map((q) => (
              <TableRow key={q.id}>
                <TableCell>
                  <Link href={`/devis-clients/${q.id}`} className="font-medium text-primary hover:underline">
                    {q.numero}
                  </Link>
                </TableCell>
                <TableCell>{q.clientNom}</TableCell>
                <TableCell>{formaterEuros(Number(q.invoice?.totalHt ?? q.totalHt))}</TableCell>
                <TableCell>{q.invoice ? q.invoice.numero : "—"}</TableCell>
                <TableCell>
                  <form
                    action={async () => {
                      "use server";
                      await delierDevisDuChantier(q.id);
                    }}
                  >
                    <button type="submit" className="text-xs text-muted-foreground hover:text-primary">
                      Délier
                    </button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
        {devisLibres.length > 0 && (
          <form action={actionLierDevis} className="mt-4 flex flex-wrap items-end gap-3 border-t pt-4">
            <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Lier un devis</span>
              <select name="quoteId" required className="h-11 rounded-xl border border-border bg-white px-3">
                <option value="">Choisir…</option>
                {devisLibres.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.numero} — {d.clientNom} ({formaterEuros(Number(d.totalHt))})
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="h-11 rounded-full bg-primary px-5 text-sm font-medium text-white">
              Lier
            </button>
          </form>
        )}
      </PageCard>

      <PageCard>
        <h2 className="mb-4 text-base font-semibold">Achats fournisseurs</h2>
        {chantier.documents.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun achat lié. Liez des factures / bons validés pour documenter la marge.
          </p>
        ) : (
          <DataTable columns={["Date", "Fournisseur", "Type", "Montant HT", ""]}>
            {chantier.documents.map((d) => (
              <TableRow key={d.id}>
                <TableCell>
                  {d.documentDate
                    ? d.documentDate.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
                    : "—"}
                </TableCell>
                <TableCell>
                  <Link href={`/documents/${d.id}`} className="font-medium text-primary hover:underline">
                    {d.distributor ?? "Fournisseur"}
                  </Link>
                </TableCell>
                <TableCell>{LABELS_TYPE[d.type] ?? d.type}</TableCell>
                <TableCell>{d.totalHt != null ? formaterEuros(Number(d.totalHt)) : "—"}</TableCell>
                <TableCell>
                  <form
                    action={async () => {
                      "use server";
                      await delierDocumentDuChantier(d.id);
                    }}
                  >
                    <button type="submit" className="text-xs text-muted-foreground hover:text-primary">
                      Délier
                    </button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
        {docsLibres.length > 0 && (
          <form action={actionLierDoc} className="mt-4 flex flex-wrap items-end gap-3 border-t pt-4">
            <label className="flex min-w-[200px] flex-1 flex-col gap-1 text-sm">
              <span className="text-muted-foreground">Lier un achat</span>
              <select name="documentId" required className="h-11 rounded-xl border border-border bg-white px-3">
                <option value="">Choisir…</option>
                {docsLibres.map((d) => (
                  <option key={d.id} value={d.id}>
                    {(d.distributor ?? "Fournisseur") +
                      ` · ${LABELS_TYPE[d.type] ?? d.type}` +
                      (d.totalHt != null ? ` · ${formaterEuros(Number(d.totalHt))}` : "")}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit" className="h-11 rounded-full bg-primary px-5 text-sm font-medium text-white">
              Lier
            </button>
          </form>
        )}
        {docsLibres.length === 0 && chantier.documents.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">
            Statuts affichés pour référence : {Object.values(LABELS_STATUT).join(", ")}. Importez d&apos;abord des
            factures fournisseurs validées.
          </p>
        )}
      </PageCard>
    </div>
  );
}
