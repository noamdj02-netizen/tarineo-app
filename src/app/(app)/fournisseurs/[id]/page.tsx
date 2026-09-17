import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculerDepensesParDistributeur } from "@/lib/depenses";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { analyserFournisseurPourArtisan, type TonVerdictFournisseur } from "@/lib/analyseFournisseur";
import { logoFournisseur } from "@/lib/logosFournisseurs";
import { LABELS_TYPE } from "@/lib/documentLabels";
import { BadgeStatutDocument } from "@/components/tarineo/BadgeStatutDocument";
import { enseigneParId, enseigneParNorm } from "@/lib/bibliothequeFournisseurs";
import { ficheParBibliothequeId } from "@/lib/fichesFournisseurs";
import { promosPersonnaliseesPourArtisan, resolveBibliothequeId } from "@/lib/promosFournisseur";
import { OpportunitesFournisseur } from "../OpportunitesFournisseur";
import { PromosFournisseurSection } from "../PromosFournisseurSection";
import { construireOpportunitesFournisseur } from "@/lib/opportunitesFournisseur";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { BtnGhost } from "@/components/tarineo/Actions";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { ObjectifDistributeur } from "../../depenses/ObjectifDistributeur";
import { ImportDocument } from "../../documents/ImportDocument";
import { cn } from "@/lib/utils";

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

const formaterDate = (date: Date | null) =>
  date ? date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "—";

const MOIS_FR = [
  "janvier", "février", "mars", "avril", "mai", "juin",
  "juillet", "août", "septembre", "octobre", "novembre", "décembre",
];

function periodeLabel(mois: number, jour: number): string {
  if (mois === 1 && jour === 1) return "Année civile";
  return `Période à partir du ${jour} ${MOIS_FR[mois - 1]}`;
}

const STYLES_VERDICT: Record<TonVerdictFournisseur, string> = {
  favorable: "border-[var(--app-badge-success-bg)] bg-[color-mix(in_srgb,var(--app-badge-success-bg)_12%,white)] text-[#172935]",
  attention: "border-[var(--app-badge-warning-bg)] bg-[color-mix(in_srgb,var(--app-badge-warning-bg)_12%,white)] text-[#172935]",
  neutre: "border-[#E6E9EB] bg-secondary text-[#172935]",
  decouvrir: "border-primary/30 bg-[#FFF0E8] text-[#172935]",
};

const LABELS_VERDICT: Record<TonVerdictFournisseur, string> = {
  favorable: "Ça vaut le coup",
  attention: "À surveiller",
  neutre: "Historique correct",
  decouvrir: "À découvrir",
};

function correspondEnseigne(
  distributorNorm: string | null | undefined,
  id: string,
  idCle: string,
  hintCle: string
): boolean {
  const n = (distributorNorm ?? "").toUpperCase();
  return n === id.toUpperCase() || n === idCle || Boolean(hintCle && (n === hintCle || n.includes(hintCle) || hintCle.includes(n)));
}

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
    .filter((d) => correspondEnseigne(d.distributorNorm, id, idCle, hintCle))
    .slice(0, 40);

  const depensesToutes = await calculerDepensesParDistributeur(userId);
  const depense =
    depensesToutes.find((d) => correspondEnseigne(d.distributorNorm, id, idCle, hintCle)) ??
    (enseigneLib
      ? depensesToutes.find((d) => d.distributorNorm.toLowerCase().includes(enseigneLib.normHint.toLowerCase()))
      : undefined);

  const nom = documents[0]?.distributor ?? depense?.distributor ?? enseigneLib?.nom ?? id;
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
    const ref = nom.toLowerCase().slice(0, 5);
    return d.includes(ref) || (enseigneLib && d.includes(enseigneLib.normHint.toLowerCase()));
  });

  const fiche = ficheParBibliothequeId(enseigneLib?.id ?? id, nom);
  const logo = logoFournisseur(norm || nom);
  const totalHt = documents.reduce((s, d) => s + Number(d.totalHt ?? 0), 0);
  const totalDepensesTous = depensesToutes.reduce((s, d) => s + d.depenses, 0);
  const rangDepenses =
    depense && depensesToutes.length > 0
      ? depensesToutes.findIndex((d) => d.distributorNorm === depense.distributorNorm) + 1
      : null;

  const verdict = analyserFournisseurPourArtisan({
    nbDocuments: documents.length,
    depense: depense ?? null,
    hausses,
    rangDepenses: rangDepenses && rangDepenses > 0 ? rangDepenses : null,
    totalDepensesTous,
  });

  const urlImport = `/documents?enseigne=${encodeURIComponent(nom)}`;
  const bibliothequeId = resolveBibliothequeId(id, norm);
  let promosData = {
    promos: [] as Awaited<ReturnType<typeof promosPersonnaliseesPourArtisan>>["promos"],
    derniereMiseAJour: null as Date | null,
    fluxActif: false,
  };
  if (bibliothequeId) {
    try {
      promosData = await promosPersonnaliseesPourArtisan(userId, bibliothequeId, norm);
    } catch {
      promosData = { promos: [], derniereMiseAJour: null, fluxActif: true };
    }
  }

  const opportunites = construireOpportunitesFournisseur({
    nomEnseigne: nom,
    fiche,
    depense: depense ?? null,
    hausses,
    nbDocuments: documents.length,
  });

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
            <BtnGhost href={`/documents?distributeur=${encodeURIComponent(norm)}`}>Historique complet</BtnGhost>
            <ImportDocument label={`Importer chez ${nom}`} />
          </>
        }
      />

      <div className={cn("mb-5 rounded-[24px] border p-5 sm:p-6", STYLES_VERDICT[verdict.ton])}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">{LABELS_VERDICT[verdict.ton]}</p>
            <h2 className="mt-1 text-lg font-semibold">{verdict.titre}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{verdict.resume}</p>
          </div>
          <Link
            href={urlImport}
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-white hover:bg-[#d44d1a]"
          >
            Importer un devis
          </Link>
        </div>
        {verdict.conseils.length > 0 && (
          <ul className="mt-4 space-y-2 border-t border-black/5 pt-4 text-sm text-foreground">
            {verdict.conseils.map((conseil) => (
              <li key={conseil} className="flex gap-2">
                <span className="text-primary" aria-hidden>•</span>
                <span>{conseil}</span>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          Analyse basée uniquement sur <strong className="font-medium text-foreground">votre</strong> historique Tarinéo — pas
          un comparateur public.
        </p>
      </div>

      {bibliothequeId && (
        <PageCard className="mb-5">
          <h2 className="text-base font-semibold">Promos &amp; opportunités</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Calculées sur <strong className="font-medium text-foreground">votre</strong> historique et les conditions
            habituelles de l&apos;enseigne — pas un catalogue public de prix.
          </p>
          <div className="mt-4 space-y-4">
            <OpportunitesFournisseur items={opportunites} />
            <PromosFournisseurSection
              bibliothequeId={bibliothequeId}
              nomEnseigne={nom}
              promosInitiales={promosData.promos}
              derniereMiseAJour={promosData.derniereMiseAJour?.toISOString() ?? null}
              fluxActif={promosData.fluxActif}
            />
          </div>
        </PageCard>
      )}

      <div className="mb-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <PageCard>
          <h2 className="text-base font-semibold">Objectif BFA / volume annuel</h2>
          <p className="mt-1 text-sm text-muted-foreground">{fiche.bfa}</p>
          <div className="mt-4">
            <ObjectifDistributeur
              distributor={nom}
              distributorNorm={norm}
              depenses={depense?.depenses ?? 0}
              objectif={depense?.objectif ?? null}
              periodStartMonth={depense?.periodStartMonth ?? 1}
              periodStartDay={depense?.periodStartDay ?? 1}
              pourcentageAtteinte={depense?.pourcentageAtteinte ?? null}
              encoursRestant={depense?.encoursRestant ?? null}
              periodeLabel={periodeLabel(depense?.periodStartMonth ?? 1, depense?.periodStartDay ?? 1)}
            />
          </div>
        </PageCard>

        <PageCard>
          <h2 className="text-base font-semibold">Avantages & livraison</h2>
          <p className="mt-1 text-xs text-muted-foreground">Informations générales — vérifiez les offres en cours avec votre agence.</p>
          <ul className="mt-4 space-y-2 text-sm text-foreground">
            {fiche.avantages.map((a) => (
              <li key={a} className="flex gap-2">
                <span className="text-primary" aria-hidden>✓</span>
                <span>{a}</span>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Livraison :</span> {fiche.livraison}
          </p>
          {fiche.siteWeb.startsWith("http") && (
            <a
              href={fiche.siteWeb}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-primary hover:underline"
            >
              Site de l&apos;enseigne →
            </a>
          )}
        </PageCard>
      </div>

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
          <p className="text-xs text-muted-foreground">Achats période BFA</p>
          <p className="mt-1 text-2xl font-semibold">{formaterEuros(depense?.depenses ?? 0)}</p>
          {hausses.length > 0 && (
            <p className="mt-1 text-sm text-primary">
              {hausses.length} hausse{hausses.length > 1 ? "s" : ""} détectée{hausses.length > 1 ? "s" : ""}
            </p>
          )}
        </PageCard>
      </div>

      {meta?.description && (
        <PageCard className="mb-5">
          <p className="text-sm leading-relaxed text-muted-foreground">{meta.description}</p>
        </PageCard>
      )}

      <PageCard className="mb-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Documents reçus</h2>
          <Link href={urlImport} className="text-sm text-primary hover:underline">
            Importer →
          </Link>
        </div>
        {documents.length === 0 ? (
          <Empty className="py-8">
            <EmptyHeader>
              <EmptyTitle>Aucun document pour {nom}</EmptyTitle>
              <EmptyDescription>
                Importez un devis ou une facture de cette enseigne pour démarrer le suivi personnalisé.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <DataTable columns={["Date", "Type", "Statut", "Montant HT", ""]}>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{formaterDate(doc.documentDate ?? doc.createdAt)}</TableCell>
                <TableCell>{LABELS_TYPE[doc.type] ?? doc.type}</TableCell>
                <TableCell>
                  <BadgeStatutDocument statut={doc.status} />
                </TableCell>
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
