import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { calculerDepensesParDistributeur } from "@/lib/depenses";
import { parserPayloadsAlertesHausse } from "@/lib/comparaisonPrix";
import { analyserFournisseurPourArtisan, type TonVerdictFournisseur } from "@/lib/analyseFournisseur";
import { logoFournisseur } from "@/lib/logosFournisseurs";
import {
  chargerLogosFournisseursUtilisateur,
  resoudreLogoFournisseur,
} from "@/lib/logosFournisseursPersistants";
import { LABELS_TYPE } from "@/lib/documentLabels";
import { BadgeStatutDocument } from "@/components/tarineo/BadgeStatutDocument";
import { enseigneParId, enseigneParNorm } from "@/lib/bibliothequeFournisseurs";
import { logoDev } from "@/lib/fournisseursConnus";
import { enseignePersonnaliseeParSlug } from "@/lib/rechercherFournisseur";
import { ficheParBibliothequeId } from "@/lib/fichesFournisseurs";
import { FicheEnseigneDecouverte } from "../FicheEnseigneDecouverte";
import { PageHeader, PageCard } from "@/components/tarineo/PageHeader";
import { BtnGhost } from "@/components/tarineo/Actions";
import { DataTable, TableCell, TableRow } from "@/components/tarineo/DataTable";
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
  favorable: "Prix stables",
  attention: "À surveiller",
  neutre: "Suivi en cours",
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
  const enseignePerso = enseigneLib ? null : await enseignePersonnaliseeParSlug(userId, id);
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
  const hintCle = enseigneLib?.normHint ?? enseignePerso?.distributorNorm ?? "";

  const documents = tousDocs
    .filter((d) => correspondEnseigne(d.distributorNorm, id, idCle, hintCle))
    .slice(0, 40);

  const depensesToutes = await calculerDepensesParDistributeur(userId);
  const depense =
    depensesToutes.find((d) => correspondEnseigne(d.distributorNorm, id, idCle, hintCle)) ??
    (enseigneLib
      ? depensesToutes.find((d) => d.distributorNorm.toLowerCase().includes(enseigneLib.normHint.toLowerCase()))
      : undefined);

  const nom =
    documents[0]?.distributor ?? depense?.distributor ?? enseigneLib?.nom ?? enseignePerso?.nom ?? id;
  const norm =
    documents[0]?.distributorNorm ??
    depense?.distributorNorm ??
    enseigneLib?.normHint ??
    enseignePerso?.distributorNorm ??
    id;
  const meta = enseigneParNorm(norm) ?? enseigneLib;

  if (!documents.length && !depense && !enseigneLib && !enseignePerso) {
    notFound();
  }

  const fiche = ficheParBibliothequeId(enseigneLib?.id ?? id, nom);
  const logosImportes = await chargerLogosFournisseursUtilisateur(userId, [norm]);
  const logoPerso = enseignePerso?.domaineLogo ? logoDev(enseignePerso.domaineLogo) : null;
  const logo =
    resoudreLogoFournisseur(nom, norm, logosImportes) ?? logoPerso ?? logoFournisseur(norm || nom);
  const urlImport = `/documents?enseigne=${encodeURIComponent(nom)}`;
  const sansHistorique = documents.length === 0 && (depense?.depenses ?? 0) === 0;

  if (sansHistorique) {
    return (
      <FicheEnseigneDecouverte
        nom={nom}
        metiers={meta?.metiers ?? enseignePerso?.metiers ?? undefined}
        logo={logo}
        urlImport={urlImport}
        siteWeb={enseignePerso?.domaineLogo ? `https://${enseignePerso.domaineLogo}` : fiche.siteWeb}
      />
    );
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
  const conseilsAffichés = verdict.conseils.slice(0, 2);

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
              {(meta?.metiers ?? enseignePerso?.metiers) && (
                <span className="text-sm font-normal text-muted-foreground">
                  {meta?.metiers ?? enseignePerso?.metiers}
                </span>
              )}
            </span>
          </span>
        }
        actions={
          <>
            <BtnGhost href={`/documents?distributeur=${encodeURIComponent(norm)}`}>Tous les documents</BtnGhost>
            <ImportDocument label="Importer" />
          </>
        }
      />

      <div className={cn("mb-5 rounded-[24px] border p-5 sm:p-6", STYLES_VERDICT[verdict.ton])}>
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">{LABELS_VERDICT[verdict.ton]}</p>
        <h2 className="mt-1 text-lg font-semibold">{verdict.titre}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{verdict.resume}</p>
        <div className="mt-4 flex flex-wrap gap-4 border-t border-black/5 pt-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Documents</p>
            <p className="font-semibold">{documents.length}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Achats période</p>
            <p className="font-semibold">{formaterEuros(depense?.depenses ?? 0)}</p>
          </div>
          {hausses.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground">Hausses détectées</p>
              <p className="font-semibold text-primary">{hausses.length}</p>
            </div>
          )}
        </div>
        {conseilsAffichés.length > 0 && (
          <ul className="mt-4 space-y-1.5 text-sm text-foreground">
            {conseilsAffichés.map((conseil) => (
              <li key={conseil} className="flex gap-2">
                <span className="text-primary" aria-hidden>•</span>
                <span>{conseil}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {depense && (
        <PageCard className="mb-5">
          <h2 className="text-base font-semibold">Objectif BFA</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Suivez votre volume annuel pour ne pas rater une remise négociée avec votre commercial.
          </p>
          <div className="mt-4">
            <ObjectifDistributeur
              distributor={nom}
              distributorNorm={norm}
              depenses={depense.depenses}
              objectif={depense.objectif}
              periodStartMonth={depense.periodStartMonth}
              periodStartDay={depense.periodStartDay}
              pourcentageAtteinte={depense.pourcentageAtteinte}
              encoursRestant={depense.encoursRestant}
              periodeLabel={periodeLabel(depense.periodStartMonth, depense.periodStartDay)}
            />
          </div>
        </PageCard>
      )}

      <PageCard className="mb-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Vos documents {nom}</h2>
          <Link href={urlImport} className="text-sm text-primary hover:underline">
            Importer →
          </Link>
        </div>
        <DataTable columns={["Date", "Type", "Statut", "Montant HT", ""]}>
          {documents.slice(0, 15).map((doc) => (
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
        {documents.length > 15 && (
          <p className="mt-3 text-center text-sm text-muted-foreground">
            <Link href={`/documents?distributeur=${encodeURIComponent(norm)}`} className="text-primary hover:underline">
              Voir les {documents.length} documents →
            </Link>
          </p>
        )}
      </PageCard>

      {hausses.length > 0 && (
        <PageCard>
          <h2 className="mb-4 text-base font-semibold">Hausses récentes</h2>
          <DataTable columns={["Référence", "Écart", "Prix actuel"]}>
            {hausses.slice(0, 8).map((h) => (
              <TableRow key={`${h.documentId}-${h.reference}`}>
                <TableCell className="max-w-[200px]">
                  <p className="truncate font-medium">{h.reference}</p>
                  <p className="truncate text-xs text-muted-foreground">{h.designation}</p>
                </TableCell>
                <TableCell className="text-primary">
                  {h.ecartPourcent != null ? `+${h.ecartPourcent.toFixed(0)} %` : "—"}
                </TableCell>
                <TableCell>{formaterEuros(h.prixActuel)}</TableCell>
              </TableRow>
            ))}
          </DataTable>
        </PageCard>
      )}
    </div>
  );
}
