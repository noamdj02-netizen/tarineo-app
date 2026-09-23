import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { LABELS_TYPE } from "@/lib/documentLabels";
import { BadgeStatutDocument } from "@/components/tarineo/BadgeStatutDocument";
import { FormulaireCorrection } from "./FormulaireCorrection";
import { BoutonRelancerAnalyse } from "./BoutonRelancerAnalyse";
import { SuiviAnalyseDocument } from "./SuiviAnalyseDocument";
import { ApercuDocument } from "./ApercuDocument";
import { ActionsDocument } from "../ActionsDocument";
import { isAnthropicConfigured } from "@/lib/anthropic";
import { comparerLignesAuHistorique, type ComparaisonLigne } from "@/lib/comparaisonPrix";
import { dateMinHistoriquePlan } from "@/lib/planGating";
import { SEUIL_CONFIANCE } from "@/lib/extractionConfig";
import { type PointHistoriquePrix } from "./GraphiqueHistoriquePrix";
import { BandeauAnalyseIA } from "./BandeauAnalyseIA";
import { AnalyseDocumentProvider } from "./AnalyseDocumentContext";
import { ListeLignesAnalyse } from "./ListeLignesAnalyse";
import {
  confianceLigneExtraction,
  construireResumeAnalyse,
  parserLineReviews,
  verifierTotauxDocument,
} from "@/lib/analyseDocument";
import { proposerRapprochementsProduit } from "@/lib/rapprochementProduit";
import type { Prisma } from "@prisma/client";

const formaterMontant = (valeur: Prisma.Decimal | number | string | null) =>
  valeur === null
    ? "—"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(valeur));

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const [document, utilisateur] = await Promise.all([
    prisma.document.findFirst({
      where: { id, userId: session.user.id },
      include: { lineItems: true },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, subscriptionStatus: true },
    }),
  ]);

  if (!document) {
    notFound();
  }

  const extraction = document.rawExtraction as
    | { numero?: string | null; confiance?: number }
    | null;
  const totalManquant = document.totalHt === null || Number(document.totalHt) === 0;

  const dateMinHistorique = dateMinHistoriquePlan(
    utilisateur?.plan ?? null,
    utilisateur?.subscriptionStatus ?? null,
    document.documentDate ?? new Date(),
  );

  let comparaisons: ComparaisonLigne[] = [];
  if (document.status === "VALIDATED" && document.distributor && document.documentDate) {
    comparaisons = await comparerLignesAuHistorique(prisma, {
      userId: session.user.id,
      distributor: document.distributor,
      documentId: document.id,
      documentDate: document.documentDate,
      dateMinHistorique,
      lignes: document.lineItems.map((l) => ({
        referenceNorm: l.referenceNorm,
        unitPriceHt: Number(l.unitPriceHt),
        manufacturerRefNorm: l.manufacturerRefNorm,
      })),
    });
  }
  const comparaisonParLigne = new Map(comparaisons.map((c, i) => [document.lineItems[i]?.id, c]));

  // Historique complet (tous distributeurs confondus) par référence, pour le graphique
  // d'évolution de prix de chaque carte produit — indépendant de comparerLignesAuHistorique
  // ci-dessus qui, lui, exclut volontairement le document courant et se limite au même
  // distributeur pour le calcul de l'alerte de hausse.
  const referencesNorm = [...new Set(document.lineItems.map((l) => l.referenceNorm))];
  const historiqueComplet =
    document.status === "VALIDATED" && referencesNorm.length > 0
      ? await prisma.priceHistory.findMany({
          where: {
            userId: session.user.id,
            referenceNorm: { in: referencesNorm },
            ...(dateMinHistorique ? { documentDate: { gte: dateMinHistorique } } : {}),
          },
          orderBy: { documentDate: "asc" },
        })
      : [];
  const historiqueParReference = new Map<string, PointHistoriquePrix[]>();
  for (const h of historiqueComplet) {
    const liste = historiqueParReference.get(h.referenceNorm) ?? [];
    liste.push({
      date: h.documentDate.toISOString(),
      prix: Number(h.unitPriceHt),
      distributor: h.distributor,
      distributorNorm: h.distributorNorm,
    });
    historiqueParReference.set(h.referenceNorm, liste);
  }
  const impactTotal = document.lineItems.reduce((somme, ligne) => {
    const c = comparaisonParLigne.get(ligne.id);
    if (!c || c.ecartEuros === null) return somme;
    return somme + c.ecartEuros * Number(ligne.quantity);
  }, 0);
  const repartitionLignes = comparaisons.reduce(
    (acc, c) => {
      if (c.alerte) acc.alertes += 1;
      else if (c.dernierPrix === null) acc.nouvelles += 1;
      else if (c.ecartEuros !== null && c.ecartEuros < 0) acc.baisses += 1;
      else acc.stables += 1;
      return acc;
    },
    { alertes: 0, baisses: 0, stables: 0, nouvelles: 0 },
  );
  const avecHistorique = comparaisons.filter((c) => c.dernierPrix !== null).length;
  const refsFabricant = document.lineItems.filter((l) => l.manufacturerRefNorm).length;
  const champsExtraits = [
    { label: "Distributeur", ok: Boolean(document.distributor) },
    { label: "Date document", ok: Boolean(document.documentDate) },
    { label: "Numéro", ok: Boolean(extraction?.numero) },
    { label: "Total HT", ok: document.totalHt !== null && Number(document.totalHt) > 0 },
    { label: "Total TTC", ok: document.totalTtc !== null && Number(document.totalTtc) > 0 },
    { label: `${document.lineItems.length} ligne${document.lineItems.length > 1 ? "s" : ""} produit`, ok: document.lineItems.length > 0 },
    { label: `${refsFabricant} réf. fabricant`, ok: refsFabricant > 0 },
  ];
  const afficherAnalyse = document.status === "VALIDATED" && document.lineItems.length > 0;
  const lineReviews = parserLineReviews(document.lineReviews);
  const economiesCount = comparaisons.filter((c) => c.meilleurPrixAilleurs).length;
  const totalLignesHt = document.lineItems.reduce((somme, ligne) => somme + Number(ligne.totalHt), 0);
  const verificationTotaux = verifierTotauxDocument(
    totalLignesHt,
    document.totalHt !== null ? Number(document.totalHt) : null,
  );
  const resumePhrase = construireResumeAnalyse({
    repartition: repartitionLignes,
    impactTotal,
    economies: economiesCount,
    avecHistorique,
    nombreLignes: document.lineItems.length,
  });
  const propositionsParLigne = new Map<string, Awaited<ReturnType<typeof proposerRapprochementsProduit>>>();
  for (const ligne of document.lineItems) {
    if (!ligne.manufacturerRefNorm && document.status === "VALIDATED") {
      const propositions = await proposerRapprochementsProduit(session.user.id, {
        designation: ligne.designation,
        reference: ligne.reference,
        manufacturerRefNorm: ligne.manufacturerRefNorm,
      });
      if (propositions.length > 0) {
        propositionsParLigne.set(ligne.id, propositions);
      }
    }
  }

  const lignesAnalyse = document.lineItems.map((ligne) => ({
    id: ligne.id,
    designation: ligne.designation,
    reference: ligne.reference,
    manufacturerRef: ligne.manufacturerRef,
    quantity: Number(ligne.quantity),
    unitPriceHt: Number(ligne.unitPriceHt),
    totalHt: Number(ligne.totalHt),
    comparaison: comparaisonParLigne.get(ligne.id),
    historique: historiqueParReference.get(ligne.referenceNorm) ?? [],
    confiancePct: confianceLigneExtraction(
      {
        reference: ligne.reference,
        designation: ligne.designation,
        manufacturerRef: ligne.manufacturerRef,
        quantity: Number(ligne.quantity),
        unitPriceHt: Number(ligne.unitPriceHt),
      },
      extraction?.confiance,
    ),
    propositionsRapprochement: propositionsParLigne.get(ligne.id) ?? [],
  }));

  const contenu = (
    <div className="app-page-wide flex flex-col gap-5">
      <Link href="/documents" className="text-sm text-muted-foreground hover:text-foreground">
        ← Retour à mes documents
      </Link>

      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="app-display text-2xl font-semibold text-[var(--foreground)]">
            {LABELS_TYPE[document.type] ?? document.type}
            {document.distributor ? ` · ${document.distributor}` : ""}
          </h1>
          <BadgeStatutDocument statut={document.status} className="mt-2" />
        </div>
        <ActionsDocument
          documentId={document.id}
          statut={document.status}
          libelle={`${LABELS_TYPE[document.type] ?? document.type}${document.distributor ? ` · ${document.distributor}` : ""}`}
        />
      </div>

      <SuiviAnalyseDocument documentId={document.id} actif={document.status === "PROCESSING"} />

      {document.status === "ERROR" && (
        <div className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <p className="font-medium">L&apos;analyse automatique a échoué.</p>
          <p className="mt-1">
            {isAnthropicConfigured()
              ? "Le fichier a bien été enregistré, mais l'IA n'a pas pu en extraire les informations. Vous pouvez relancer l'analyse."
              : "La clé API Anthropic (ANTHROPIC_API_KEY) n'est pas configurée dans votre fichier .env. Ajoutez-la, redémarrez le serveur de développement, puis relancez l'analyse."}
          </p>
          <div className="mt-3">
            <BoutonRelancerAnalyse documentId={document.id} />
          </div>
        </div>
      )}

      {document.status === "NEEDS_REVIEW" && document.possibleDoublon && (
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          ⚠ Doublon potentiel : un autre document a le même distributeur, la même date et le même montant total.
          Vérifiez qu&apos;il ne s&apos;agit pas d&apos;un envoi en double avant de valider.
        </p>
      )}

      {document.status === "NEEDS_REVIEW" && totalManquant && (
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          ⚠ Montant total manquant ou à 0€ — ce document ne comptera pour rien dans vos dépenses tant qu&apos;il
          n&apos;est pas corrigé.
        </p>
      )}

      {document.status === "NEEDS_REVIEW" && (extraction?.confiance === undefined || extraction.confiance < SEUIL_CONFIANCE) && (
        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          L&apos;IA n&apos;est pas sûre de cette extraction
          {extraction?.confiance !== undefined
            ? ` (confiance : ${Math.round(extraction.confiance * 100)}%)`
            : ""}
          . Vérifiez et corrigez les données ci-dessous.
        </p>
      )}

      {afficherAnalyse && (
        <BandeauAnalyseIA
          confiance={extraction?.confiance ?? null}
          nombreLignes={document.lineItems.length}
          avecHistorique={avecHistorique}
          refsFabricant={refsFabricant}
          repartition={repartitionLignes}
          impactTotal={impactTotal}
          distributeur={document.distributor}
          champsExtraits={champsExtraits}
          resumePhrase={resumePhrase}
          verificationTotaux={verificationTotaux}
          economiesCount={economiesCount}
        />
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-medium text-muted-foreground">Fichier original</h2>
          <div className="mt-2 overflow-hidden rounded-2xl border border-[var(--border)] bg-white shadow-[var(--app-card-shadow)]">
            <ApercuDocument documentId={document.id} estPdf={document.fileKey.endsWith(".pdf")} />
          </div>
        </div>

        <div>
          {document.status === "NEEDS_REVIEW" ? (
            <>
              <h2 className="text-sm font-medium text-muted-foreground">Corriger les informations</h2>
              <div className="mt-2">
                <FormulaireCorrection
                  documentId={document.id}
                  type={document.type}
                  distributor={document.distributor ?? ""}
                  documentDate={document.documentDate?.toISOString().slice(0, 10) ?? ""}
                  totalHt={document.totalHt !== null ? Number(document.totalHt).toFixed(2) : ""}
                  totalTtc={document.totalTtc !== null ? Number(document.totalTtc).toFixed(2) : ""}
                  lignes={document.lineItems.map((ligne) => ({
                    cle: ligne.id,
                    reference: ligne.reference,
                    manufacturerRef: ligne.manufacturerRef ?? "",
                    designation: ligne.designation,
                    quantity: Number(ligne.quantity).toString(),
                    unitPriceHt: Number(ligne.unitPriceHt).toFixed(2),
                    totalHt: Number(ligne.totalHt).toFixed(2),
                  }))}
                />
              </div>
            </>
          ) : (
            <>
              <h2 className="text-sm font-medium text-muted-foreground">Informations extraites</h2>
              <dl className="mt-2 space-y-2 app-card-sm p-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Distributeur</dt>
                  <dd>{document.distributor ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Numéro</dt>
                  <dd>{extraction?.numero || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Date</dt>
                  <dd>{document.documentDate?.toLocaleDateString("fr-FR") ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total HT</dt>
                  <dd>{formaterMontant(document.totalHt)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Total TTC</dt>
                  <dd>{formaterMontant(document.totalTtc)}</dd>
                </div>
              </dl>

              <h2 className="mt-6 text-sm font-medium text-muted-foreground">
                Lignes analysées ({document.lineItems.length})
              </h2>
              <div className="mt-2">
                {afficherAnalyse ? (
                  <ListeLignesAnalyse
                    lignes={lignesAnalyse}
                    distributeur={document.distributor}
                    afficherComparaison={comparaisons.length > 0}
                  />
                ) : (
                  <p className="rounded-2xl border border-[var(--border)] bg-white p-6 text-center text-sm text-muted-foreground">
                    Aucune ligne extraite.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (!afficherAnalyse) {
    return contenu;
  }

  return (
    <AnalyseDocumentProvider documentId={document.id} lineReviewsInitial={lineReviews}>
      {contenu}
    </AnalyseDocumentProvider>
  );
}
