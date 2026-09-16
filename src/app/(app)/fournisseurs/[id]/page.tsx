import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculerDepensesParDistributeur } from "@/lib/depenses";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { logoFournisseur } from "@/lib/logosFournisseurs";
import { LABELS_STATUT, LABELS_TYPE } from "@/lib/documentLabels";
import { enseigneParId, enseigneParNorm } from "@/lib/bibliothequeFournisseurs";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { BtnGhost, BtnPrimary } from "@/components/tarineo/Actions";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

const formaterDate = (date: Date | null) =>
  date
    ? date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
    : "—";

export default async function FournisseurDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: idBrut } = await params;
  const id = decodeURIComponent(idBrut);
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");
  const userId = session.user.id;

  const enseigneLib = enseigneParId(id);
  const tousDocs = await prisma.document.findMany({
    where: { userId, distributorNorm: { not: null } },
    orderBy: [{ documentDate: "desc" }, { createdAt: "desc" }],
    take: 200,
    select: {
      id: true,
      type: true,
      status: true,
      distributor: true,
      distributorNorm: true,
      documentDate: true,
      totalHt: true,
      createdAt: true,
    },
  });

  const idCle = id
    .toUpperCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^A-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const hintCle = enseigneLib?.normHint ?? "";

  const documents = tousDocs
    .filter((d) => {
      const n = (d.distributorNorm ?? "").toUpperCase();
      return n === id.toUpperCase() || n === idCle || (hintCle && (n === hintCle || n.includes(hintCle) || hintCle.includes(n)));
    })
    .slice(0, 40);

  const depenses = await calculerDepensesParDistributeur(userId);
  const depense =
    depenses.find((d) => d.distributorNorm === id) ??
    (enseigneLib
      ? depenses.find((d) => d.distributorNorm.toLowerCase().includes(enseigneLib.normHint))
      : undefined);

  const nom =
    documents[0]?.distributor ??
    depense?.distributor ??
    enseigneLib?.nom ??
    id;

  const norm = documents[0]?.distributorNorm ?? depense?.distributorNorm ?? enseigneLib?.normHint ?? id;
  const meta = enseigneParNorm(norm) ?? enseigneLib;

  if (!documents.length && !depense && !enseigneLib) {
    notFound();
  }

  const alertes = await prisma.alert.findMany({
    where: { userId, type: "PRICE_INCREASE" },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const hausses = parserPayloadsAlertesHausse(alertes).filter((p) => {
    const d = p.distributor.toLowerCase();
    return d.includes(nom.toLowerCase().slice(0, 5)) || (enseigneLib && d.includes(enseigneLib.normHint));
  });

  const logo = logoFournisseur(norm || nom);
  const totalHt = documents.reduce((s, d) => s + Number(d.totalHt ?? 0), 0);
  const hausseMoy =
    hausses.length > 0
      ? hausses.reduce((s, p) => s + (p.ecartPourcent ?? 0), 0) / hausses.length
      : null;

  return (
    <div>
      <PageHeader
        backHref="/fournisseurs"
        title={
          <span className="flex items-center gap-3">
            {logo ? (
              <Image src={logo} alt="" width={48} height={48} className="rounded-xl object-cover" />
            ) : (
              <span className="flex size-12 items-center justify-center rounded-xl bg-secondary text-lg font-bold text-primary">
                {nom.charAt(0)}
              </span>
            )}
            <span className="flex flex-col gap-1">
              <span>{nom}</span>
              {meta && <span className="text-sm font-normal text-muted-foreground">{meta.metiers}</span>}
            </span>
          </span>
        }
        actions={
          <>
            <BtnGhost href={`/documents?distributeur=${encodeURIComponent(norm)}`}>Voir l&apos;historique</BtnGhost>
            <BtnPrimary href="/documents">Importer un devis</BtnPrimary>
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <PageCard>
          <p className="text-xs text-muted-foreground">Documents importés</p>
          <p className="mt-1 text-2xl font-semibold">{documents.length}</p>
        </PageCard>
        <PageCard>
          <p className="text-xs text-muted-foreground">Volume HT (docs listés)</p>
          <p className="mt-1 text-2xl font-semibold">{formaterEuros(totalHt)}</p>
        </PageCard>
        <PageCard>
          <p className="text-xs text-muted-foreground">Dépenses période (achats)</p>
          <p className="mt-1 text-2xl font-semibold">{formaterEuros(depense?.depenses ?? 0)}</p>
          {hausseMoy !== null && (
            <p className="mt-1 text-sm text-primary">
              Hausse moy. détectée : {hausseMoy > 0 ? "+" : ""}
              {hausseMoy.toFixed(1)} %
            </p>
          )}
        </PageCard>
      </div>

      {meta && (
        <PageCard className="mb-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{meta.description}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Les prix affichés viennent uniquement de <strong className="font-medium text-foreground">votre</strong>{" "}
            historique — jamais d&apos;un référentiel public.
          </p>
        </PageCard>
      )}

      <PageCard className="mb-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Documents reçus</h2>
          <Link href="/documents" className="text-sm text-primary hover:underline">
            Importer →
          </Link>
        </div>
        {documents.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>Aucun document pour {nom}</EmptyTitle>
              <EmptyDescription>Importez un devis ou une facture de cette enseigne pour démarrer le suivi.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <DataTable columns={["Date", "Type", "Statut", "Montant HT", ""]}>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{formaterDate(doc.documentDate ?? doc.createdAt)}</TableCell>
                <TableCell>{LABELS_TYPE[doc.type] ?? doc.type}</TableCell>
                <TableCell>{LABELS_STATUT[doc.status] ?? doc.status}</TableCell>
                <TableCell>{doc.totalHt != null ? formaterEuros(Number(doc.totalHt)) : "—"}</TableCell>
                <TableCell>
                  <Link href={`/documents/${doc.id}`} className="text-sm text-primary hover:underline">
                    Ouvrir
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </PageCard>

      <PageCard>
        <h2 className="mb-4 text-base font-semibold">Dernières hausses détectées</h2>
        {hausses.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucune hausse &gt; 3 % pour cette enseigne dans votre historique. Continuez à importer pour affiner la
            comparaison.
          </p>
        ) : (
          <DataTable columns={["Référence", "Désignation", "Écart", "Prix actuel"]}>
            {hausses.slice(0, 10).map((h) => (
              <TableRow key={`${h.documentId}-${h.reference}`}>
                <TableCell className="font-medium">{h.reference}</TableCell>
                <TableCell className="max-w-[240px] truncate">{h.designation}</TableCell>
                <TableCell className="text-primary">
                  {h.ecartPourcent != null ? `${h.ecartPourcent > 0 ? "+" : ""}${h.ecartPourcent.toFixed(0)} %` : "—"}
                </TableCell>
                <TableCell>{formaterEuros(h.prixActuel)}</TableCell>
              </TableRow>
            ))}
          </DataTable>
        )}
      </PageCard>
    </div>
  );
}
