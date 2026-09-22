"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckIcon, EyeOffIcon, ExternalLinkIcon } from "lucide-react";
import type { ComparaisonLigne } from "@/lib/comparaisonPrix";
import type { PropositionRapprochement } from "@/lib/rapprochementProduit";
import { GraphiqueHistoriquePrix, MiniSparklinePrix, type PointHistoriquePrix } from "./GraphiqueHistoriquePrix";
import { useAnalyseDocument } from "./AnalyseDocumentContext";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const formaterMontant = (valeur: number | string) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(Number(valeur));

const formaterEuros = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(valeur);

const formaterDate = (valeur: Date | string | null | undefined) => {
  if (!valeur) return null;
  const date = valeur instanceof Date ? valeur : new Date(valeur);
  return date.toLocaleDateString("fr-FR");
};

export type LigneAnalyse = {
  id: string;
  designation: string;
  reference: string;
  manufacturerRef: string | null;
  quantity: number;
  unitPriceHt: number;
  totalHt: number;
  comparaison?: ComparaisonLigne;
  historique: PointHistoriquePrix[];
  confiancePct: number;
  propositionsRapprochement?: PropositionRapprochement[];
};

type Props = LigneAnalyse & {
  distributeur: string | null;
  afficherComparaison: boolean;
};

export function CarteLigneProduit({
  id,
  designation,
  reference,
  manufacturerRef,
  quantity,
  unitPriceHt,
  totalHt,
  comparaison: c,
  distributeur,
  historique,
  afficherComparaison,
  confiancePct,
  propositionsRapprochement = [],
}: Props) {
  const { documentId, lineReviews, setLineReviews } = useAnalyseDocument();
  const [enCours, setEnCours] = useState(false);

  const review = lineReviews[id];
  const ignoree = review?.status === "ignored";
  const verifiee = review?.status === "verified";
  const enBaisse = c?.ecartEuros !== null && c?.ecartEuros !== undefined && c.ecartEuros < 0;
  const aHistorique = historique.length > 0;

  async function mettreAJourReview(status: "verified" | "ignored" | "none") {
    setEnCours(true);
    try {
      const res = await fetch(`/api/documents/${documentId}/lignes/${id}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { reviews: typeof lineReviews };
      setLineReviews(data.reviews);
    } finally {
      setEnCours(false);
    }
  }

  return (
    <article
      className={cn(
        "app-card-sm p-5 transition-opacity",
        c?.alerte && !ignoree && "border-red-200 bg-red-50/50",
        ignoree && "opacity-60",
        verifiee && !c?.alerte && "border-emerald-200/80",
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="break-words font-semibold text-foreground">{designation}</p>
            <Badge
              variant={confiancePct >= 85 ? "secondary" : confiancePct >= 70 ? "outline" : "destructive"}
              title="Confiance sur l'extraction de cette ligne"
            >
              {confiancePct}% IA
            </Badge>
            {c?.alerte && !ignoree && <Badge variant="destructive">Hausse</Badge>}
            {enBaisse && <Badge variant="secondary">Baisse</Badge>}
            {afficherComparaison && c && c.dernierPrix === null && <Badge>Nouveau</Badge>}
            {verifiee && <Badge variant="secondary">Vérifié</Badge>}
            {ignoree && <Badge variant="outline">Alerte ignorée</Badge>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Réf. {reference}
            {manufacturerRef ? ` · Fab. ${manufacturerRef}` : ""}
            {" · "}Qté {quantity} × {formaterMontant(unitPriceHt)}
          </p>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <p className="text-lg font-bold text-foreground">{formaterMontant(totalHt)}</p>
          {aHistorique && <MiniSparklinePrix points={historique} />}
        </div>
      </div>

      {afficherComparaison &&
        (c && c.dernierPrix !== null ? (
          <div className="mt-4 flex flex-col gap-3 border-t border-border/60 pt-3">
            <p className="text-sm text-muted-foreground">
              Vous aviez payé{" "}
              <span className="font-semibold text-foreground">{formaterEuros(c.dernierPrix)}</span>
              {c.dernierPrixDate ? ` le ${formaterDate(c.dernierPrixDate)}` : ""}
              {distributeur ? ` chez ${distributeur}` : ""} → aujourd&apos;hui{" "}
              <span className={cn("font-semibold", c.alerte && !ignoree ? "text-destructive" : "text-foreground")}>
                {formaterEuros(c.prixActuel)}
              </span>
              {c.ecartPourcent !== null && (
                <span>
                  {" "}
                  ({c.ecartPourcent > 0 ? "+" : ""}
                  {c.ecartPourcent.toFixed(1)}%)
                </span>
              )}
              .
            </p>

            {c.dernierAchatDocumentId && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto justify-start px-0 text-primary"
                render={<Link href={`/documents/${c.dernierAchatDocumentId}`} />}
              >
                Voir le document source
                <ExternalLinkIcon data-icon="inline-end" />
              </Button>
            )}

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-background px-3 py-2">
                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">Prix actuel</p>
                <p className="mt-0.5 text-sm font-bold text-foreground">{formaterEuros(c.prixActuel)}</p>
              </div>
              <div className="rounded-lg bg-background px-3 py-2">
                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">Dernier achat</p>
                <p
                  className={cn(
                    "mt-0.5 text-sm font-bold",
                    c.alerte && !ignoree ? "text-destructive" : enBaisse ? "text-[var(--app-green)]" : "text-foreground",
                  )}
                >
                  {c.alerte && !ignoree ? "▲ " : enBaisse ? "▼ " : ""}
                  {formaterEuros(c.dernierPrix)}
                </p>
              </div>
              <div className="rounded-lg bg-background px-3 py-2">
                <p className="text-[0.65rem] uppercase tracking-wide text-muted-foreground">Moy. 12 mois</p>
                <p className="mt-0.5 text-sm font-bold text-foreground">
                  {c.moyenne12Mois !== null ? formaterEuros(c.moyenne12Mois) : "—"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-4 border-t border-border/60 pt-3 text-xs text-muted-foreground">
            Nouveau produit chez ce distributeur — pas encore d&apos;historique de prix. Tarineo enregistrera ce prix
            pour les prochaines comparaisons.
          </p>
        ))}

      {c?.alerte && !ignoree && (
        <div className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs">
          <p className="font-medium text-destructive">
            Hausse détectée
            {c.ecartPourcent !== null ? ` de ${c.ecartPourcent.toFixed(1)}%` : ""} par rapport à votre dernier achat
            chez {distributeur}.
          </p>
          {!c.referenceFabricantDetectee ? (
            <div className="mt-1 text-destructive/80">
              <p>Comparaison inter-enseignes indisponible (référence fabricant non identifiée).</p>
              {propositionsRapprochement.length > 0 && (
                <div className="mt-2 rounded-lg border border-border bg-background p-2 text-foreground">
                  <p className="text-xs font-medium">Est-ce le même produit dans votre historique ?</p>
                  <ul className="mt-1 space-y-1 text-xs">
                    {propositionsRapprochement.map((p) => (
                      <li key={p.referenceNorm}>
                        {p.designation} — {formaterEuros(p.prixHt)} chez {p.distributor} (
                        {formaterDate(p.documentDate)})
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : c.meilleurPrixAilleurs ? (
            <p className="mt-1 font-medium text-[var(--app-green)]">
              Moins cher chez {c.meilleurPrixAilleurs.distributor} : {formaterEuros(c.meilleurPrixAilleurs.prixHt)} (le{" "}
              {formaterDate(c.meilleurPrixAilleurs.date)}).
              <Button
                variant="link"
                size="sm"
                className="ml-1 inline h-auto p-0"
                render={<Link href={`/documents/${c.meilleurPrixAilleurs.documentId}`} />}
              >
                Voir l&apos;achat
              </Button>
            </p>
          ) : (
            <p className="mt-1 text-destructive/80">Aucun prix plus bas trouvé ailleurs dans votre historique.</p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-2 border-t border-border/60 pt-3">
        <Button
          type="button"
          variant={verifiee ? "default" : "outline"}
          size="sm"
          disabled={enCours}
          onClick={() => mettreAJourReview(verifiee ? "none" : "verified")}
        >
          <CheckIcon data-icon="inline-start" />
          {verifiee ? "Vérifié" : "Marquer vérifié"}
        </Button>
        {c?.alerte && (
          <Button
            type="button"
            variant={ignoree ? "secondary" : "outline"}
            size="sm"
            disabled={enCours}
            onClick={() => mettreAJourReview(ignoree ? "none" : "ignored")}
          >
            <EyeOffIcon data-icon="inline-start" />
            {ignoree ? "Alerte ignorée" : "Ignorer l'alerte"}
          </Button>
        )}
      </div>

      <GraphiqueHistoriquePrix points={historique} defautOuvert={historique.length >= 2 && historique.length <= 4} />
    </article>
  );
}
