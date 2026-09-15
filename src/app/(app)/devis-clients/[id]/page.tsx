import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PageCard, PageHeader } from "@/components/tarineo/PageHeader";
import { StatusBadge } from "@/components/tarineo/StatusBadge";
import { PageTabs } from "@/components/tarineo/PageTabs";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { DEMO_DEVIS, DEMO_DEVIS_LIGNES, DEMO_CLIENT_CEDEO, formaterEurosDemo } from "@/lib/uiDemo";
import { BrandMark } from "@/components/tarineo/BrandMark";
import { BtnGhost, BtnPrimary } from "@/components/tarineo/Actions";
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
  const demo = DEMO_DEVIS.find((d) => d.id === id);
  if (demo) {
    return <DevisDemo id={id} onglet={onglet} />;
  }

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
          <span className="inline-flex items-center gap-3">
            Devis n° {quote.numero}
            <StatusBadge statut="envoye" />
          </span>
        }
        actions={
          quote.invoice ? (
            <Link href={`/factures-clients/${quote.invoice.id}`} className="rounded-full bg-primary px-4 py-2.5 text-sm text-white">
              Voir la facture
            </Link>
          ) : (
            <BoutonTransformerEnFacture clientQuoteId={quote.id} />
          )
        }
      />
      <PageCard>
        <DataTable columns={["Désignation", "Quantité", "Prix unitaire HT", "TVA", "Total HT"]}>
          {quote.lines.map((l) => (
            <TableRow key={l.id}>
              <TableCell>{l.designation}</TableCell>
              <TableCell>{Number(l.quantite)}</TableCell>
              <TableCell>{formaterEurosDemo(Number(l.prixUnitaireHt))}</TableCell>
              <TableCell>{Number(l.tauxTva)}%</TableCell>
              <TableCell>{formaterEurosDemo(Number(l.totalHt))}</TableCell>
            </TableRow>
          ))}
        </DataTable>
        <div className="mt-4 flex justify-end">
          <BoutonRegenererPdf clientQuoteId={quote.id} />
        </div>
      </PageCard>
    </div>
  );
}

function DevisDemo({ id, onglet }: { id: string; onglet: string }) {
  const devis = DEMO_DEVIS.find((d) => d.id === id) ?? DEMO_DEVIS[DEMO_DEVIS.length - 1];
  const totalHt = 1240;
  const tva = 248;
  return (
    <div>
      <PageHeader
        backHref="/devis-clients"
        title={
          <span className="inline-flex flex-wrap items-center gap-3">
            Devis n° {devis.numero}
            <StatusBadge statut={devis.statut} />
          </span>
        }
        actions={
          <>
            <BtnGhost>Modifier</BtnGhost>
            <BtnGhost>Dupliquer</BtnGhost>
            <BtnPrimary href="/factures-clients/nouveau">Transformer en facture</BtnPrimary>
          </>
        }
      />
      <div className="mb-5 grid gap-4 lg:grid-cols-3">
        <PageCard>
          <p className="mb-3 text-sm font-semibold">Client</p>
          <div className="flex gap-3">
            <BrandMark nom={DEMO_CLIENT_CEDEO.nom} logo="/dashboard/cedeo.png" size={44} />
            <div className="text-sm">
              <p className="font-medium">{DEMO_CLIENT_CEDEO.nom}</p>
              <p className="whitespace-pre-line text-muted-foreground">{DEMO_CLIENT_CEDEO.adresse}</p>
            </div>
          </div>
        </PageCard>
        <PageCard>
          <p className="mb-3 text-sm font-semibold">Informations</p>
          <dl className="grid grid-cols-2 gap-y-2 text-sm">
            <dt className="text-muted-foreground">Date d&apos;émission</dt>
            <dd>11 sept. 2026</dd>
            <dt className="text-muted-foreground">Validité</dt>
            <dd>30 jours</dd>
            <dt className="text-muted-foreground">Chantier</dt>
            <dd>Rénovation salle de bain</dd>
          </dl>
        </PageCard>
        <PageCard>
          <p className="mb-3 text-sm font-semibold">Total HT</p>
          <p className="text-[32px] font-semibold tracking-tight text-[#172935]">1 240,00 €</p>
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
                {DEMO_DEVIS_LIGNES.map((l) => (
                  <TableRow key={l.designation}>
                    <TableCell>{l.designation}</TableCell>
                    <TableCell>{l.quantite} m²</TableCell>
                    <TableCell>{l.pu.toFixed(2).replace(".", ",")} €</TableCell>
                    <TableCell>{l.tva}%</TableCell>
                    <TableCell>{formaterEurosDemo(l.total)}</TableCell>
                  </TableRow>
                ))}
              </DataTable>
            </div>
            <div className="mt-6 ml-auto w-full max-w-xs space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total HT</span>
                <span>{formaterEurosDemo(totalHt)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">TVA</span>
                <span>{formaterEurosDemo(tva)}</span>
              </div>
              <div className="flex justify-between text-base font-semibold">
                <span>Total TTC</span>
                <span>{formaterEurosDemo(totalHt + tva)}</span>
              </div>
            </div>
          </>
        )}
      </PageCard>
    </div>
  );
}
