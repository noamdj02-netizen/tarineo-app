import { redirect } from "next/navigation";
import Link from "next/link";
import { FileTextIcon } from "lucide-react";
import { getSession, idDonneesUtilisateur } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { BadgeConfiance, BadgeDoublon, BadgeStatutDocument } from "@/components/tarineo/BadgeStatutDocument";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { ImportDocument } from "./ImportDocument";
import { ActionsDocument } from "./ActionsDocument";
import { PopupOnboardingDevis } from "./PopupOnboardingDevis";
import { EcranPaiementRequis } from "./EcranPaiementRequis";
import { planStripeValide } from "@/lib/plansStripe";
import {
  AIDE_PAGE_DOCUMENTS,
  LABELS_TYPE,
  LABELS_TYPE_PLURIEL,
  ROUTES_DOCUMENTS_PAR_TYPE,
  SOUS_TITRES_PAGE_DOCUMENTS,
  TITRES_PAGE_DOCUMENTS,
  TYPES_FILTRABLES,
} from "@/lib/documentLabels";
import { chargerStatsDocuments } from "@/lib/statsDocuments";
import { QuotaStrip } from "@/components/tarineo/QuotaStrip";
import { EnBrefDocuments } from "@/components/tarineo/EnBrefDocuments";
import { AidePageTooltip } from "@/components/tarineo/AidePageTooltip";
import { NavTypeMobile } from "./NavTypeMobile";
import { MobilePageHeader } from "@/components/tarineo/mobile/MobilePageHeader";
import { filtreRechercheDocument } from "@/lib/rechercheDocuments";
import { filtreDocumentsDistributeur } from "@/lib/filtreDocumentsDistributeur";
import { filtreDocumentHorsBrouillon } from "@/lib/filtreBrouillonDocument";
import { historiqueEstSuffisant } from "@/lib/historique";
import { calculerEtatQuota, debutMoisUTC, documentsRestantsEnvoi, MAX_FICHIERS_PAR_LOT } from "@/lib/quota";
import { parserPayloadsAlertesHausse, type PayloadAlerteHausse } from "@/lib/comparaisonPrix";
import type { DocumentType, Prisma } from "@prisma/client";

interface Recherche {
  mois?: string;
  distributeur?: string;
  reference?: string;
  q?: string;
  upgrade?: string;
  plan?: string;
  hausse?: string;
  verifier?: string;
  type?: string;
  enseigne?: string;
  onboarding?: string;
  scanner?: string;
}

function estTypeValide(valeur: string | undefined): valeur is DocumentType {
  return !!valeur && (TYPES_FILTRABLES as readonly string[]).includes(valeur);
}

// Formulations pour les messages d'état vide ci-dessous — évite les accords de genre
// hasardeux ("de facture", "de bon de commande"... toujours "de" + nom, sans adjectif
// à accorder).
const LABELS_TYPE_MINUSCULE: Record<DocumentType, string> = {
  DEVIS: "devis",
  FACTURE: "facture",
  BON_COMMANDE: "bon de commande",
  BON_ENLEVEMENT: "bon d'enlèvement",
};
const LABELS_TYPE_MINUSCULE_PLURIEL: Record<DocumentType, string> = {
  DEVIS: "devis",
  FACTURE: "factures",
  BON_COMMANDE: "bons de commande",
  BON_ENLEVEMENT: "bons d'enlèvement",
};

export async function DocumentsPage({
  searchParams,
  typeFixe,
}: {
  searchParams: Promise<Recherche>;
  typeFixe?: DocumentType;
}) {
  const session = await getSession();
  if (!session?.user?.id) {
    redirect("/connexion");
  }
  const userId = await idDonneesUtilisateur(session.user.id);
  const maintenant = new Date();

  const { mois, distributeur, reference, q, upgrade, plan, hausse, verifier, type, enseigne, onboarding, scanner } =
    await searchParams;
  const termeRecherche = (q ?? reference)?.trim() || undefined;

  if (!typeFixe && estTypeValide(type)) {
    redirect(ROUTES_DOCUMENTS_PAR_TYPE[type]);
  }

  const filtreHausse = hausse === "1";
  const filtreVerifier = verifier === "1";
  const typeValide = typeFixe ?? (estTypeValide(type) ? type : undefined);
  const clePage = typeValide ?? "tous";
  const debutMois = debutMoisUTC(maintenant);

  const [distributeursExistants, utilisateur, historiquePrix, documentsAvantCeMois, documentsCeMois] =
    await Promise.all([
      prisma.document.findMany({
        where: { userId, distributorNorm: { not: null } },
        select: { distributor: true, distributorNorm: true },
        orderBy: { documentDate: "desc" },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { createdAt: true, onboardingDevisPopupVu: true, plan: true, subscriptionStatus: true },
      }),
      prisma.priceHistory.findMany({
        where: { userId },
        select: { distributorNorm: true, documentId: true },
      }),
      prisma.document.count({ where: { userId, createdAt: { lt: debutMois } } }),
      prisma.document.count({ where: { userId, createdAt: { gte: debutMois } } }),
    ]);

  const distributeursOptions = new Map<string, string>();
  for (const d of distributeursExistants) {
    if (d.distributorNorm && !distributeursOptions.has(d.distributorNorm)) {
      distributeursOptions.set(d.distributorNorm, d.distributor ?? d.distributorNorm);
    }
  }
  const historiqueSuffisant = historiqueEstSuffisant(historiquePrix);
  const documentsTotal = documentsAvantCeMois + documentsCeMois;

  const where: Prisma.DocumentWhereInput = {
    userId,
    ...filtreDocumentsDistributeur,
    ...filtreDocumentHorsBrouillon,
  };
  if (distributeur) {
    where.distributorNorm = distributeur;
  }
  let bornesMois: { gte: Date; lt: Date } | null = null;
  if (mois && /^\d{4}-\d{2}$/.test(mois)) {
    const [annee, moisNumero] = mois.split("-").map(Number);
    bornesMois = {
      gte: new Date(Date.UTC(annee, moisNumero - 1, 1)),
      lt: new Date(Date.UTC(annee, moisNumero, 1)),
    };
    where.documentDate = bornesMois;
  }
  if (termeRecherche) {
    Object.assign(where, filtreRechercheDocument(termeRecherche));
  }

  // Compteurs affichés dans les options du filtre Type ("Devis (3)") : respectent le
  // Distributeur et le Mois déjà actifs (pour rester utiles une fois ces filtres posés),
  // mais volontairement pas Référence ni Hausse — la référence est un filtre fin, et la
  // hausse impliquerait de recalculer les alertes ici alors qu'elle n'a de sens qu'une
  // fois un type déjà choisi.
  const whereComptageParType: Prisma.DocumentWhereInput = {
    userId,
    ...filtreDocumentsDistributeur,
    ...filtreDocumentHorsBrouillon,
  };
  if (distributeur) whereComptageParType.distributorNorm = distributeur;
  if (bornesMois) whereComptageParType.documentDate = bornesMois;
  const comptesParTypeBruts = await prisma.document.groupBy({
    by: ["type"],
    where: whereComptageParType,
    _count: { _all: true },
  });
  const comptesParType = new Map(comptesParTypeBruts.map((c) => [c.type, c._count._all]));

  if (typeValide) {
    where.type = typeValide;
  }
  if (filtreVerifier) {
    where.status = "NEEDS_REVIEW";
  }

  // Filtre "hausse détectée" : s'appuie sur les alertes PRICE_INCREASE déjà générées
  // plutôt que de recalculer une comparaison de prix ici. Période des alertes prises en
  // compte : le mois choisi si un filtre `mois` est actif (même borne que le filtre
  // documentDate ci-dessus, pour rester cohérent), sinon les 12 derniers mois — la même
  // fenêtre que "Hausses détectées par distributeur" sur la page d'accueil.
  let alertesParDocument: Map<string, PayloadAlerteHausse[]> | null = null;
  if (filtreHausse) {
    const periode: { gte: Date; lt?: Date } =
      bornesMois ?? { gte: new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth() - 11, 1)) };
    const alertesHausse = await prisma.alert.findMany({
      where: {
        userId,
        type: "PRICE_INCREASE",
        createdAt: periode.lt ? { gte: periode.gte, lt: periode.lt } : { gte: periode.gte },
      },
    });
    alertesParDocument = new Map();
    for (const p of parserPayloadsAlertesHausse(alertesHausse)) {
      const liste = alertesParDocument.get(p.documentId) ?? [];
      liste.push(p);
      alertesParDocument.set(p.documentId, liste);
    }
    where.id = { in: [...alertesParDocument.keys()] };
  }

  const desFiltresActifs = Boolean(
    distributeur || mois || termeRecherche || filtreHausse || filtreVerifier || typeValide,
  );

  const documents = await prisma.document.findMany({
    where,
    orderBy: [{ documentDate: { sort: "desc", nulls: "last" } }, { createdAt: "desc" }],
  });

  // Trois messages distincts pour une liste vide avec un type sélectionné (voir le
  // rendu plus bas) : jamais importé, historique insuffisant pour la hausse, ou
  // simplement aucun document ne correspond à la combinaison de filtres actuelle.
  // Seul le premier cas nécessite une requête en plus (comptage tous filtres ignorés) —
  // les deux autres se déduisent de ce qu'on a déjà.
  let documentsCeTypeJamais: number | null = null;
  if (typeValide && documents.length === 0) {
    documentsCeTypeJamais = await prisma.document.count({ where: { userId, type: typeValide } });
  }

  // Cas A : jamais importé (ignore tous les filtres) — avec bouton d'import.
  // Cas B : ce type existe, mais la case "hausse" est cochée et l'historique global
  // n'est pas encore suffisant pour comparer un prix (voir historiqueEstSuffisant —
  // par distributeur+référence, pas par type de document : la comparaison de prix
  // elle-même ne distingue pas les types, donc pas de calcul "par type" ici).
  // Cas C (par défaut) : le message générique déjà utilisé pour toute autre combinaison
  // de filtres vide.
  const etatVide: { cas: "jamais_importe" | "historique_insuffisant" | "generique" } | null =
    documents.length === 0
      ? typeValide && documentsCeTypeJamais === 0
        ? { cas: "jamais_importe" }
        : typeValide && filtreHausse && !historiqueSuffisant
          ? { cas: "historique_insuffisant" }
          : { cas: "generique" }
      : null;

  const statsDocuments = await chargerStatsDocuments(userId, {
    type: typeValide,
    distributeursOptions,
    maintenant,
  });

  const etatQuota = utilisateur
    ? calculerEtatQuota({
        createdAtUtilisateur: utilisateur.createdAt,
        plan: utilisateur.plan,
        subscriptionStatus: utilisateur.subscriptionStatus,
        documentsAvantCeMois,
        documentsCeMois,
        maintenant,
      })
    : null;
  const afficherPopupOnboarding = historiqueSuffisant && utilisateur !== null && !utilisateur.onboardingDevisPopupVu;
  const bloquePaiementRequis = etatQuota?.phase === "bloque_paiement_requis";
  const maxFichiersImport =
    etatQuota && !bloquePaiementRequis
      ? Math.min(MAX_FICHIERS_PAR_LOT, Math.max(0, documentsRestantsEnvoi(etatQuota)))
      : MAX_FICHIERS_PAR_LOT;

  const afficherVideSimplifie = documentsTotal === 0 && !desFiltresActifs && !typeFixe;
  const enseigneCible = enseigne?.trim();

  return (
    <div className="app-page flex flex-col gap-6">
      <MobilePageHeader
        title={TITRES_PAGE_DOCUMENTS[clePage]}
        subtitle={SOUS_TITRES_PAGE_DOCUMENTS[clePage]}
      />
      <section className="hidden rounded-[20px] bg-white p-4 sm:p-5 lg:block">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-semibold leading-tight tracking-tight text-[#172935] sm:text-[26px]">
                {TITRES_PAGE_DOCUMENTS[clePage]}
              </h1>
              {typeValide && <AidePageTooltip texte={AIDE_PAGE_DOCUMENTS[typeValide]} />}
            </div>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{SOUS_TITRES_PAGE_DOCUMENTS[clePage]}</p>
            {(enseigneCible || (!historiqueSuffisant && documentsTotal > 0)) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {enseigneCible && (
                  <span className="rounded-full bg-[#FFF0E8] px-3 py-1 text-xs font-medium text-primary">
                    Enseigne · {enseigneCible}
                  </span>
                )}
                {!historiqueSuffisant && documentsTotal > 0 && (
                  <span
                    className="rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground"
                    title="Au moins 2 achats chez la même enseigne sont nécessaires pour comparer les prix."
                  >
                    Alertes · historique en cours
                  </span>
                )}
              </div>
            )}
          </div>
          {!bloquePaiementRequis && (
            <div className="flex flex-col items-stretch gap-2 sm:items-end">
              {etatQuota && <QuotaStrip etat={etatQuota} className="w-full sm:w-auto" />}
              <ImportDocument
                quotaAtteint={etatQuota?.phase === "mensuel" && etatQuota.quotaAtteint}
                maxFichiers={maxFichiersImport}
                autoOpen={onboarding === "1" || scanner === "1"}
                preferCamera={scanner === "1"}
              />
            </div>
          )}
        </div>
      </section>

      <section id="documents-envoyes" className="scroll-mt-6 rounded-[20px] bg-white p-4 sm:p-5 lg:shadow-none lg:ring-0">
        {afficherVideSimplifie ? (
          <Empty className="py-12">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FileTextIcon />
              </EmptyMedia>
              <EmptyTitle>Photographiez votre premier document</EmptyTitle>
              <EmptyDescription>
                Devis, facture ou bon de commande — Tarinéo lit le document et construit votre historique de prix
                automatiquement.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <ImportDocument
                quotaAtteint={etatQuota?.phase === "mensuel" && etatQuota.quotaAtteint}
                maxFichiers={maxFichiersImport}
                label="Photographier mon document"
                className="h-auto rounded-full px-8 py-4 text-base"
              />
            </EmptyContent>
          </Empty>
        ) : (
        <>
        <EnBrefDocuments
          stats={statsDocuments}
          type={typeValide}
          titreSuffixe={typeValide ? LABELS_TYPE_PLURIEL[typeValide] : undefined}
          cheminBase={typeValide ? ROUTES_DOCUMENTS_PAR_TYPE[typeValide] : "/documents"}
        />

        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-sm font-medium text-[var(--foreground)]">Documents envoyés</h2>
            {termeRecherche && (
              <p className="mt-1 truncate text-sm text-muted-foreground">
                Résultats pour « <span className="font-medium text-foreground">{termeRecherche}</span> »
                {documents.length > 0 &&
                  ` · ${documents.length} document${documents.length > 1 ? "s" : ""}`}
              </p>
            )}
          </div>
          {desFiltresActifs && (
            <Link href="/documents" className="shrink-0 text-xs text-muted-foreground hover:text-accent">
              Réinitialiser
            </Link>
          )}
        </div>

        {!typeFixe && (
          <div className="mt-3">
            <NavTypeMobile typeActif={typeValide} comptes={Object.fromEntries(comptesParType)} />
          </div>
        )}

        {/* key forcé sur la combinaison de filtres : sans lui, une navigation côté client
            qui reste sur /documents (ex. les nouveaux liens de type dans la sidebar ou les
            onglets mobile, qui ne changent que le paramètre `type`) réutilise le <select>/
            <input> déjà monté et n'applique jamais le nouveau defaultValue — React ne
            réapplique defaultValue qu'au montage initial d'un champ non contrôlé. Remonter
            tout le formulaire à chaque changement de filtre corrige ça pour tous les champs
            (Type, mais aussi Mois/Distributeur/Référence/Hausse si un lien rapide équivalent
            est ajouté un jour). */}
        <form
          method="get"
          key={`${mois ?? ""}|${distributeur ?? ""}|${typeValide ?? ""}|${termeRecherche ?? ""}|${filtreHausse ? "1" : "0"}|${filtreVerifier ? "1" : "0"}`}
          className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr_auto]"
        >
          <div>
            <label htmlFor="mois" className="block text-xs text-muted-foreground mb-1">
              Mois
            </label>
            <input
              id="mois"
              name="mois"
              type="month"
              defaultValue={mois ?? ""}
              className="w-full app-input"
            />
          </div>
          <div>
            <label htmlFor="distributeur" className="block text-xs text-muted-foreground mb-1">
              Distributeur
            </label>
            <select
              id="distributeur"
              name="distributeur"
              defaultValue={distributeur ?? ""}
              className="w-full app-input"
            >
              <option value="">Tous</option>
              {[...distributeursOptions.entries()].map(([norm, label]) => (
                <option key={norm} value={norm}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {!typeFixe && (
            <div>
              <label htmlFor="type" className="block text-xs text-muted-foreground mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                defaultValue={typeValide ?? ""}
                className="w-full app-input"
              >
                <option value="">Tous</option>
                {TYPES_FILTRABLES.map((t) => (
                  <option key={t} value={t}>
                    {LABELS_TYPE[t]} ({comptesParType.get(t) ?? 0})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div>
            <label htmlFor="reference" className="block text-xs text-muted-foreground mb-1">
              Recherche
            </label>
            <input
              id="reference"
              name="q"
              type="search"
              placeholder="Réf., fournisseur, désignation…"
              defaultValue={termeRecherche ?? ""}
              className="w-full app-input"
            />
          </div>
          <button
            type="submit"
            className="self-end app-btn-secondary w-full sm:col-span-2 lg:col-span-1 lg:w-auto"
          >
            Filtrer
          </button>
          <label className="col-span-full flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              name="hausse"
              value="1"
              defaultChecked={filtreHausse}
              className="h-4 w-4 rounded border-border accent-orange-500"
            />
            Uniquement les documents avec une hausse de prix détectée
          </label>
        </form>

        {etatVide ? (
          etatVide.cas === "jamais_importe" && typeValide ? (
            <Empty className="mt-6">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <FileTextIcon />
                </EmptyMedia>
                <EmptyTitle>Vous n&apos;avez pas encore envoyé de {LABELS_TYPE_MINUSCULE[typeValide]}.</EmptyTitle>
              </EmptyHeader>
              <EmptyContent>
                <ImportDocument
                  quotaAtteint={etatQuota?.phase === "mensuel" && etatQuota.quotaAtteint}
                  maxFichiers={maxFichiersImport}
                  label={`Importer un ${LABELS_TYPE_MINUSCULE[typeValide]}`}
                />
              </EmptyContent>
            </Empty>
          ) : etatVide.cas === "historique_insuffisant" && typeValide ? (
            <Empty className="mt-6">
              <EmptyHeader>
                <EmptyTitle>Historique encore trop court</EmptyTitle>
                <EmptyDescription>
                  Pas encore assez d&apos;historique sur vos {LABELS_TYPE_MINUSCULE_PLURIEL[typeValide]} pour détecter
                  des hausses de prix.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <Empty className="mt-6">
              <EmptyHeader>
                <EmptyTitle>{desFiltresActifs ? "Aucun résultat" : "Aucun document"}</EmptyTitle>
                <EmptyDescription>
                  {termeRecherche
                    ? `Aucun document trouvé pour « ${termeRecherche} ». Essayez une référence, un fournisseur ou un mot de la désignation.`
                    : desFiltresActifs
                      ? "Aucun document ne correspond à ces filtres."
                      : "Aucun document envoyé pour le moment."}
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )
        ) : (
          <ul className="mt-4 flex flex-col gap-2">
            {documents.map((document) => {
              const extraction = document.rawExtraction as { confiance?: number } | null;
              const confiance = extraction?.confiance;
              // Repérable d'un coup d'œil sans encombrer la liste pour le cas courant :
              // seuil volontairement plus haut que celui d'auto-validation (0.7), pour
              // aussi signaler les documents "juste assez confiants" pour être passés
              // automatiquement mais pas franchement certains.
              const confianceFaible = confiance !== undefined && confiance < 0.9;
              const alertesDocument = alertesParDocument?.get(document.id);

              const libelleDocument = `${LABELS_TYPE[document.type] ?? document.type}${document.distributor ? ` · ${document.distributor}` : ""}`;

              return (
                <li
                  key={document.id}
                  className="app-list-link rounded-[18px] border border-transparent text-sm shadow-[0_4px_12px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.04)] lg:rounded-xl lg:shadow-none"
                >
                  <div className="flex flex-col gap-2 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                    <Link href={`/documents/${document.id}`} className="min-w-0 flex-1">
                      <span className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:justify-between">
                        <span>
                          {LABELS_TYPE[document.type] ?? document.type}
                          {document.distributor ? ` · ${document.distributor}` : ""} ·{" "}
                          {(document.documentDate ?? document.createdAt).toLocaleDateString("fr-FR")}
                          {document.totalTtc !== null && (
                            <>
                              {" · "}
                              {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                                Number(document.totalTtc)
                              )}
                            </>
                          )}
                        </span>
                        <span className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
                          {document.possibleDoublon && <BadgeDoublon />}
                          {confianceFaible && confiance !== undefined && (
                            <BadgeConfiance pct={Math.round(confiance * 100)} />
                          )}
                          <BadgeStatutDocument statut={document.status} />
                        </span>
                      </span>
                      {alertesDocument && alertesDocument.length > 0 && (
                        <span className="mt-1 block text-xs text-red-400">
                          {alertesDocument
                            .map(
                              (p) =>
                                `${p.designation || p.reference} : +${p.ecartPourcent?.toFixed(0) ?? "?"} %${
                                  p.ecartEuros !== null ? ` (${p.ecartEuros >= 0 ? "+" : ""}${p.ecartEuros.toFixed(2)} €/u)` : ""
                                }`
                            )
                            .join(" · ")}
                        </span>
                      )}
                    </Link>
                    <ActionsDocument
                      documentId={document.id}
                      statut={document.status}
                      libelle={libelleDocument}
                      compact
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
        </>
        )}
      </section>

      {bloquePaiementRequis && (
        <div className="mt-8">
          <EcranPaiementRequis />
        </div>
      )}
      {upgrade === "1" && !bloquePaiementRequis && (
        <div className="mt-8">
          <EcranPaiementRequis
            bloque={false}
            planInitial={planStripeValide(plan) ?? "pro"}
            autoDemarrer
            masquerGrillePlans
          />
        </div>
      )}

      {afficherPopupOnboarding && <PopupOnboardingDevis />}
    </div>
  );
}

export default function Page(props: { searchParams: Promise<Recherche> }) {
  return DocumentsPage(props);
}
