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
import { SEUIL_CONFIANCE } from "@/lib/extraction";
import { GraphiqueHistoriquePrix, type PointHistoriquePrix } from "./GraphiqueHistoriquePrix";
import type { Prisma } from "@prisma/client";

const formaterMontant = (valeur: Prisma.Decimal | number | string | null) =>
  valeur === null
    ? "—"
    : new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(valeur));

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(valeur);

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

  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id },
    include: { lineItems: true },
  });

  if (!document) {
    notFound();
  }

  const extraction = document.rawExtraction as
    | { numero?: string | null; confiance?: number }
    | null;
  const totalManquant = document.totalHt === null || Number(document.totalHt) === 0;

  let comparaisons: ComparaisonLigne[] = [];
  if (document.status === "VALIDATED" && document.distributor && document.documentDate) {
    comparaisons = await comparerLignesAuHistorique(prisma, {
      userId: session.user.id,
      distributor: document.distributor,
      documentId: document.id,
      documentDate: document.documentDate,
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
    comparaisons.length > 0 && referencesNorm.length > 0
      ? await prisma.priceHistory.findMany({
          where: { userId: session.user.id, referenceNorm: { in: referencesNorm } },
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
  const aUneAlerte = comparaisons.some((c) => c.alerte);

  return (
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

      <SuiviAnalyseDocument actif={document.status === "PROCESSING"} />

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

      {aUneAlerte && (
        <p className="mt-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
          ▲ Au moins une ligne a augmenté de plus de 3 % par rapport à vos derniers achats chez{" "}
          {document.distributor}
          {impactTotal !== 0
            ? ` — impact estimé de ${formaterEuros(impactTotal)} sur ce document.`
            : "."}
        </p>
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

              <h2 className="mt-6 text-sm font-medium text-muted-foreground">Lignes produits</h2>
              <div className="mt-2 space-y-3">
                {document.lineItems.length === 0 ? (
                  <p className="rounded-2xl border border-[var(--border)] bg-white shadow-[var(--app-card-shadow)] p-6 text-center text-sm text-muted-foreground">
                    Aucune ligne extraite.
                  </p>
                ) : (
                  document.lineItems.map((ligne) => {
                    const c = comparaisonParLigne.get(ligne.id);
                    const enBaisse = c?.ecartEuros !== null && c?.ecartEuros !== undefined && c.ecartEuros < 0;
                    return (
                      <div
                        key={ligne.id}
                        className={`app-card-sm p-5 ${c?.alerte ? "border-red-200 bg-red-50/50" : ""}`}
                      >
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-2">
                          <div className="min-w-0">
                            <p className="break-words font-semibold text-foreground">{ligne.designation}</p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Réf. {ligne.reference} · Qté {Number(ligne.quantity)} ×{" "}
                              {formaterMontant(ligne.unitPriceHt)}
                            </p>
                          </div>
                          <p className="shrink-0 text-lg font-bold text-[var(--foreground)]">{formaterMontant(ligne.totalHt)}</p>
                        </div>

                        {comparaisons.length > 0 &&
                          (c && c.dernierPrix !== null ? (
                            <div className="mt-4 flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t border-border/60 pt-3 text-xs">
                              <span className="text-muted-foreground">
                                Prix habituel :{" "}
                                <span
                                  className={`font-semibold ${
                                    c.alerte ? "text-red-400" : enBaisse ? "text-green-400" : "text-foreground"
                                  }`}
                                >
                                  {c.alerte ? "▲ " : enBaisse ? "▼ " : ""}
                                  {formaterEuros(c.dernierPrix)}
                                </span>
                                {c.ecartPourcent !== null && (
                                  <span className="ml-1 text-muted-foreground">
                                    ({c.ecartPourcent > 0 ? "+" : ""}
                                    {c.ecartPourcent.toFixed(1)}%)
                                  </span>
                                )}
                              </span>
                              {c.moyenne12Mois !== null && (
                                <span className="text-muted-foreground">Moy. 12 mois : {formaterEuros(c.moyenne12Mois)}</span>
                              )}
                            </div>
                          ) : (
                            <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
                              Nouveau produit chez ce distributeur — pas encore d&apos;historique de prix.
                            </p>
                          ))}

                        {c?.alerte && (
                          <div className="mt-3 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2.5 text-xs">
                            <p className="flex items-start gap-2 font-medium text-red-300">
                              <span className="leading-none">⚠️</span>
                              <span>
                                Hausse détectée
                                {c.ecartPourcent !== null ? ` de ${c.ecartPourcent.toFixed(1)}%` : ""} par rapport à
                                votre dernier achat chez {document.distributor}.
                              </span>
                            </p>
                            {!c.referenceFabricantDetectee ? (
                              <p className="mt-1 pl-6 text-red-300/70">
                                Comparaison inter-enseignes indisponible (référence fabricant non identifiée).
                              </p>
                            ) : c.meilleurPrixAilleurs ? (
                              <p className="mt-1 pl-6 font-medium text-emerald-400">
                                💡 Moins cher chez {c.meilleurPrixAilleurs.distributor} :{" "}
                                {formaterEuros(c.meilleurPrixAilleurs.prixHt)} (le{" "}
                                {c.meilleurPrixAilleurs.date.toLocaleDateString("fr-FR")}).
                              </p>
                            ) : (
                              <p className="mt-1 pl-6 text-red-300/70">
                                Aucun prix plus bas trouvé ailleurs dans votre historique.
                              </p>
                            )}
                          </div>
                        )}

                        <GraphiqueHistoriquePrix points={historiqueParReference.get(ligne.referenceNorm) ?? []} />
                      </div>
                    );
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
