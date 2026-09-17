import { redirect } from "next/navigation";
import Link from "next/link";
import { FileTextIcon } from "lucide-react";
import { getSession } from "@/lib/session";
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
import { NavTypeMobile } from "./NavTypeMobile";
import { normaliserReference } from "@/lib/normalisation";
import { historiqueEstSuffisant } from "@/lib/historique";
import { calculerEtatQuota, debutMoisUTC, documentsRestantsEnvoi, MAX_FICHIERS_PAR_LOT } from "@/lib/quota";
import { parserPayloadsAlertesHausse, type PayloadAlerteHausse } from "@/lib/comparaisonPrix";
import type { DocumentType, Prisma } from "@prisma/client";

interface Recherche {
  mois?: string;
  distributeur?: string;
  reference?: string;
  upgrade?: string;
  plan?: string;
  hausse?: string;
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
  const userId = session.user.id;
  const maintenant = new Date();

  const { mois, distributeur, reference, upgrade, plan, hausse, type, enseigne, onboarding, scanner } =
    await searchParams;

  if (!typeFixe && estTypeValide(type)) {
    redirect(ROUTES_DOCUMENTS_PAR_TYPE[type]);
  }

  const filtreHausse = hausse === "1";
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

  const where: Prisma.DocumentWhereInput = { userId };
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
  if (reference?.trim()) {
    where.lineItems = { some: { referenceNorm: { contains: normaliserReference(reference) } } };
  }

  // Compteurs affichés dans les options du filtre Type ("Devis (3)") : respectent le
  // Distributeur et le Mois déjà actifs (pour rester utiles une fois ces filtres posés),
  // mais volontairement pas Référence ni Hausse — la référence est un filtre fin, et la
  // hausse impliquerait de recalculer les alertes ici alors qu'elle n'a de sens qu'une
  // fois un type déjà choisi.
  const whereComptageParType: Prisma.DocumentWhereInput = { userId };
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

  const desFiltresActifs = Boolean(distributeur || mois || reference?.trim() || filtreHausse || typeValide);

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

  // Mini-stats "En bref" : volontairement portées sur le type actif seul (ignore
  // Distributeur/Mois/Référence/Hausse, contrairement à `documents` ci-dessus) — une vue
  // d'ensemble du type qui reste utile même quand la liste au-dessus est filtrée à vide
  // (ex. Cas C avec un distributeur qui n'a rien pour ce type). Masquée uniquement quand
  // ce total est à 0 (Cas A), le seul cas où elle n'aurait rien à montrer.
  const whereStats: Prisma.DocumentWhereInput = typeValide ? { userId, type: typeValide } : { userId };
  const statsTotal = await prisma.document.count({ where: whereStats });
  let statsSommeHt = 0;
  let statsParDistributeurBruts: { distributorNorm: string | null; _count: { _all: number } }[] = [];
  let statsHausses = 0;
  if (statsTotal > 0) {
    const [montant, parDistributeur, statsDocumentsIds] = await Promise.all([
      prisma.document.aggregate({ where: whereStats, _sum: { totalHt: true } }),
      prisma.document.groupBy({
        by: ["distributorNorm"],
        where: { ...whereStats, distributorNorm: { not: null } },
        _count: { _all: true },
      }),
      prisma.document.findMany({ where: whereStats, select: { id: true } }),
    ]);
    statsSommeHt = Number(montant._sum.totalHt ?? 0);
    statsParDistributeurBruts = parDistributeur;
    const idsDocumentsType = new Set(statsDocumentsIds.map((d) => d.id));
    const alertesHausse12Mois = await prisma.alert.findMany({
      where: {
        userId,
        type: "PRICE_INCREASE",
        createdAt: { gte: new Date(Date.UTC(maintenant.getUTCFullYear(), maintenant.getUTCMonth() - 11, 1)) },
      },
      select: { payload: true },
    });
    statsHausses = parserPayloadsAlertesHausse(alertesHausse12Mois).filter((p) =>
      idsDocumentsType.has(p.documentId)
    ).length;
  }
  const statsParDistributeur = statsParDistributeurBruts
    .map((d) => ({
      norm: d.distributorNorm as string,
      label: distributeursOptions.get(d.distributorNorm as string) ?? (d.distributorNorm as string),
      count: d._count._all,
    }))
    .sort((a, b) => b.count - a.count);
  const maxStatsParDistributeur = Math.max(...statsParDistributeur.map((d) => d.count), 1);

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

  return (
    <div className="app-page flex flex-col gap-6">
      <section className="rounded-[24px] bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-[var(--foreground)]">{TITRES_PAGE_DOCUMENTS[clePage]}</h1>
          <p className="mt-2 max-w-xl text-sm text-foreground/80">{SOUS_TITRES_PAGE_DOCUMENTS[clePage]}</p>
          {typeValide && (
            <p className="mt-3 max-w-xl rounded-2xl bg-[#FFF0E8] px-4 py-3 text-sm text-[#172935]">
              {AIDE_PAGE_DOCUMENTS[typeValide]}
            </p>
          )}
        </div>
        {!bloquePaiementRequis && (
          <ImportDocument
            quotaAtteint={etatQuota?.phase === "mensuel" && etatQuota.quotaAtteint}
            maxFichiers={maxFichiersImport}
            autoOpen={onboarding === "1" || scanner === "1"}
            preferCamera={scanner === "1"}
          />
        )}
      </div>

      {documentsTotal === 0 && !bloquePaiementRequis && etatQuota?.phase === "historique" && (
        <div className="mt-6 app-banner text-sm">
          <p className="font-semibold text-[var(--foreground)]">
            Bienvenue sur Tarineo — importez votre historique pour activer les alertes de hausse de prix.
          </p>
          <p className="mt-1 text-muted-foreground">
            La plupart des distributeurs (Cedeo, Point P, Tereva...) permettent de retélécharger vos documents
            passés depuis votre espace client.
          </p>
          <p className="mt-3 font-medium text-foreground">
            Import initial : {etatQuota.documentsTotal}/{etatQuota.limiteHistorique} documents
          </p>
        </div>
      )}

      {enseigne?.trim() && (
        <div className="mt-6 app-banner text-sm">
          <p className="font-semibold text-[var(--foreground)]">
            Importez un devis ou une facture {enseigne.trim()}
          </p>
          <p className="mt-1 text-muted-foreground">
            Une fois validé, cette enseigne apparaîtra dans Fournisseurs et Tarineo comparera les prix à votre
            historique personnel.
          </p>
        </div>
      )}

      {onboarding === "1" && (
        <div className="mt-6 app-banner text-sm">
          <p className="font-semibold text-[var(--foreground)]">Importez vos premiers documents</p>
          <p className="mt-1 text-muted-foreground">
            PDF, photos ou plusieurs fichiers à la fois. Tarinéo lit, extrait et construit votre espace — sans
            inventer de données.
          </p>
        </div>
      )}

      {etatQuota?.phase === "historique" && documentsTotal > 0 && (
        <div className="mt-6 flex gap-3 app-banner text-sm">
          <span className="mt-0.5 shrink-0 text-accent" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              width={20}
              height={20}
              className="h-5 w-5"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5.5M12 8v.01" />
            </svg>
          </span>
          <div>
            <p className="font-medium text-foreground">
              Import initial : {etatQuota.documentsTotal}/{etatQuota.limiteHistorique} documents
            </p>
            <p className="mt-1 text-muted-foreground">
              Ce quota d&apos;import de votre historique est indépendant de votre quota mensuel — utilisez-le pour
              importer vos anciens devis et factures sans entamer votre forfait.
              {!historiqueSuffisant &&
                " Tarineo a besoin d'au moins deux documents d'un même distributeur pour détecter une hausse de prix : les alertes s'activeront automatiquement dès que suffisamment d'achats seront enregistrés pour une même enseigne."}
            </p>
          </div>
        </div>
      )}

      {etatQuota?.phase === "mensuel" && etatQuota.quotaAtteint && (
        <div className="mt-6 flex gap-3 app-banner text-sm">
          <span className="mt-0.5 shrink-0 text-accent" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              width={20}
              height={20}
              className="h-5 w-5"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5.5M12 8v.01" />
            </svg>
          </span>
          <div>
            <p className="font-medium text-foreground">
              Quota mensuel atteint ({etatQuota.quotaMensuel} documents/mois)
            </p>
            <p className="mt-1 text-muted-foreground">
              {etatQuota.surPlanReel
                ? "Vous pourrez de nouveau envoyer des documents le mois prochain."
                : "Ce plafond s'applique pendant l'essai gratuit, quel que soit le plan visé. Il passera au quota de votre formule (jusqu'à 1 000 documents/mois) dès votre premier moyen de paiement enregistré."}
            </p>
          </div>
        </div>
      )}

      {etatQuota?.phase === "mensuel" && !etatQuota.quotaAtteint && (
        <p className="mt-4 text-xs text-muted-foreground">
          {etatQuota.documentsCeMoisHorsHistorique}/{etatQuota.quotaMensuel} documents envoyés ce mois-ci
          {!etatQuota.surPlanReel ? " (palier d'essai)" : ""}.
        </p>
      )}

      {/* Pendant la phase "historique" (import initial), ce message est déjà intégré au
          bandeau "Import initial : X/100 documents" ci-dessus plutôt que dupliqué dans un
          second encart identique visuellement — voir etatQuota?.phase === "historique". */}
      {!historiqueSuffisant && documentsTotal > 0 && !bloquePaiementRequis && etatQuota?.phase !== "historique" && (
        <div className="mt-6 flex gap-3 app-banner text-sm">
          <span className="mt-0.5 shrink-0 text-accent" aria-hidden="true">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.75}
              strokeLinecap="round"
              strokeLinejoin="round"
              width={20}
              height={20}
              className="h-5 w-5"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 11v5.5M12 8v.01" />
            </svg>
          </span>
          <div>
            <p className="font-medium text-foreground">Historique encore insuffisant pour détecter une hausse</p>
            <p className="mt-1 text-muted-foreground">
              Tarineo a besoin d&apos;au moins deux documents d&apos;un même distributeur pour comparer un prix
              et repérer une hausse — sans historique, il n&apos;y a rien à comparer. Continuez à envoyer vos
              devis et factures au fil du temps : les alertes s&apos;activeront automatiquement dès que
              suffisamment d&apos;achats seront enregistrés pour une même enseigne.
            </p>
          </div>
        </div>
      )}
      </section>

      <section id="documents-envoyes" className="scroll-mt-6 rounded-[24px] bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-medium text-[var(--foreground)]">Documents envoyés</h2>
          {desFiltresActifs && (
            <Link href="/documents" className="text-xs text-muted-foreground hover:text-accent">
              Réinitialiser les filtres
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
          key={`${mois ?? ""}|${distributeur ?? ""}|${typeValide ?? ""}|${reference ?? ""}|${filtreHausse ? "1" : "0"}`}
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
              Référence
            </label>
            <input
              id="reference"
              name="reference"
              type="text"
              placeholder="Ex : 7381813"
              defaultValue={reference ?? ""}
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
                  {desFiltresActifs
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
                <li key={document.id} className="app-list-link rounded-xl text-sm">
                  <div className="flex flex-col gap-2 p-3 sm:flex-row sm:items-center sm:justify-between">
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
      </section>

      {statsTotal > 0 && (
        <section className="mt-10">
          <p className="text-sm font-medium text-muted-foreground">
            En bref{typeValide ? ` — ${LABELS_TYPE_PLURIEL[typeValide]}` : ""}
          </p>
          <div className="mt-3 app-card p-5 sm:p-6">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Documents</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{statsTotal}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Montant total HT</p>
                <p className="mt-1 text-xl font-semibold text-foreground">
                  {new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(
                    statsSommeHt
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Hausses détectées</p>
                <p className={`mt-1 text-xl font-semibold ${statsHausses > 0 ? "text-red-400" : "text-foreground"}`}>
                  {statsHausses}
                </p>
              </div>
            </div>

            {statsParDistributeur.length > 0 && (
              <div className="mt-5 space-y-2.5 border-t border-border pt-4">
                <p className="text-xs text-muted-foreground">Répartition par distributeur</p>
                {statsParDistributeur.map((d) => (
                  <Link
                    key={d.norm}
                    href={`/documents?${typeValide ? `type=${typeValide}&` : ""}distributeur=${encodeURIComponent(d.norm)}#documents-envoyes`}
                    className="group block"
                  >
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="text-foreground group-hover:text-accent group-hover:underline">
                        {d.label}
                      </span>
                      <span className="text-muted-foreground">
                        {d.count} document{d.count > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
                      <div
                        className="h-full rounded-full bg-accent"
                        style={{ width: `${(d.count / maxStatsParDistributeur) * 100}%` }}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {bloquePaiementRequis && (
        <div className="mt-8">
          <EcranPaiementRequis />
        </div>
      )}
      {upgrade === "1" && !bloquePaiementRequis && (
        <div className="mt-8">
          <EcranPaiementRequis bloque={false} planInitial={planStripeValide(plan) ?? "pro"} />
        </div>
      )}

      {afficherPopupOnboarding && <PopupOnboardingDevis />}
    </div>
  );
}

export default function Page(props: { searchParams: Promise<Recherche> }) {
  return DocumentsPage(props);
}
