import type { DocumentAgentMeta, DocumentRecap } from "@/lib/metier/document-agent/types";
import { buildDocumentRecap } from "@/lib/metier/document-agent/assess-recap";
import {
  DEMO_BUY_HT,
  DEMO_BUY_UNIT,
  DEMO_CLIENT_HT,
  DEMO_QTY,
} from "@/lib/metier/demo-seed-bundle";
import type { ExtractResult } from "@/lib/metier/types";

/** Lecture figée pour captures film — alignée sur le seed Cedeo / Dupont. */
export function filmAnalyseDraft(): {
  extracted: ExtractResult;
  agent: DocumentAgentMeta;
  recap: DocumentRecap;
} {
  const extracted: ExtractResult = {
    direction: "in",
    kind: "devis",
    title: "Devis Cedeo - tubes PVC",
    party_name: "Cedeo Lyon",
    party_kind: "distributeur",
    chantier_hint: "Chantier Madame Dupont",
    totals: { ht: DEMO_BUY_HT, eco_contribution: 0.42, pmcb: 0.42, weight_kg: 86.4, tva: null, ttc: null },
    lines: [
      {
        label: "Tube PVC Ø 500",
        qty: DEMO_QTY,
        unit: "ml",
        buy_price: DEMO_BUY_UNIT,
      },
    ],
    document_number: "2026-042",
    read_assessment: {
      summary: "Devis distributeur — 1 ligne, total HT cohérent.",
      quality: "fiable",
      caveats: [],
    },
  };
  const agent: DocumentAgentMeta = {
    vendor_key: "cedeo",
    vendor_display_name: "Cedeo",
    profile_version: 2,
    confidence: "high",
  };
  const recap = buildDocumentRecap(extracted, agent, extracted.read_assessment);
  return { extracted, agent, recap };
}
