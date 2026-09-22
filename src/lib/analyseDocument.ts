import type { ComparaisonLigne } from "@/lib/comparaisonPrix";
import { z } from "zod";

export type FiltreLigne = "toutes" | "hausses" | "nouvelles" | "baisses" | "economies";

export const lineReviewSchema = z.object({
  status: z.enum(["verified", "ignored"]),
  at: z.string(),
});

export const lineReviewsSchema = z.record(z.string(), lineReviewSchema);

export type LineReview = z.infer<typeof lineReviewSchema>;
export type LineReviews = z.infer<typeof lineReviewsSchema>;

export function parserLineReviews(valeur: unknown): LineReviews {
  const analyse = lineReviewsSchema.safeParse(valeur);
  return analyse.success ? analyse.data : {};
}

export function categoriserLigne(c?: ComparaisonLigne): "hausse" | "nouvelle" | "baisse" | "stable" | "inconnu" {
  if (!c) return "inconnu";
  if (c.alerte) return "hausse";
  if (c.dernierPrix === null) return "nouvelle";
  if (c.ecartEuros !== null && c.ecartEuros < 0) return "baisse";
  return "stable";
}

export function ligneCorrespondAuFiltre(
  filtre: FiltreLigne,
  c?: ComparaisonLigne,
  ignoree = false,
): boolean {
  if (filtre === "toutes") return true;
  if (filtre === "hausses") return Boolean(c?.alerte) && !ignoree;
  if (filtre === "nouvelles") return c !== undefined && c.dernierPrix === null;
  if (filtre === "baisses") return c !== undefined && c.ecartEuros !== null && c.ecartEuros < 0;
  if (filtre === "economies") return Boolean(c?.meilleurPrixAilleurs);
  return true;
}

type LignePourConfiance = {
  reference: string;
  designation: string;
  manufacturerRef: string | null;
  quantity: number;
  unitPriceHt: number;
};

export function confianceLigneExtraction(ligne: LignePourConfiance, confianceGlobale?: number | null): number {
  let score = confianceGlobale !== null && confianceGlobale !== undefined ? Math.round(confianceGlobale * 100) : 85;

  if (!ligne.reference.trim() || ligne.reference.trim().length < 2) score -= 25;
  if (!ligne.designation.trim() || ligne.designation.trim().length < 4) score -= 15;
  if (!ligne.manufacturerRef?.trim()) score -= 10;
  if (ligne.quantity <= 0) score -= 20;
  if (ligne.unitPriceHt <= 0) score -= 20;

  return Math.max(0, Math.min(100, score));
}

export function verifierTotauxDocument(totalLignes: number, totalDocument: number | null) {
  if (totalDocument === null || totalDocument <= 0) {
    return { totalLignes, totalDocument, ecart: null, coherent: null as boolean | null };
  }
  const ecart = Math.round((totalLignes - totalDocument) * 100) / 100;
  const coherent = Math.abs(ecart) < 0.05;
  return { totalLignes, totalDocument, ecart, coherent };
}

export function construireResumeAnalyse(params: {
  repartition: { alertes: number; nouvelles: number; baisses: number };
  impactTotal: number;
  economies: number;
  avecHistorique: number;
  nombreLignes: number;
}) {
  const { repartition, impactTotal, economies, avecHistorique, nombreLignes } = params;

  if (avecHistorique === 0 && nombreLignes > 0) {
    return "Premier document chez ce fournisseur — Tarineo enregistre ces prix pour les prochaines comparaisons.";
  }

  const parties: string[] = [];
  if (repartition.alertes > 0) {
    parties.push(
      `${repartition.alertes} hausse${repartition.alertes > 1 ? "s" : ""}${impactTotal > 0 ? ` (+${impactTotal.toFixed(0)} € estimés)` : ""}`,
    );
  }
  if (repartition.baisses > 0) {
    parties.push(`${repartition.baisses} baisse${repartition.baisses > 1 ? "s" : ""}`);
  }
  if (repartition.nouvelles > 0) {
    parties.push(`${repartition.nouvelles} nouvelle${repartition.nouvelles > 1 ? "s" : ""} réf.`);
  }
  if (economies > 0) {
    parties.push(`${economies} économie${economies > 1 ? "s" : ""} possible${economies > 1 ? "s" : ""} ailleurs`);
  }

  if (parties.length === 0) {
    return "Aucune hausse significative — les prix sont alignés sur votre historique.";
  }

  return parties.join(" · ");
}
