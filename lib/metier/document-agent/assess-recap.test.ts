import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDocumentRecap } from "@/lib/metier/document-agent/assess-recap";
import type { DocumentAgentMeta } from "@/lib/metier/document-agent/types";

const agent: DocumentAgentMeta = {
  vendor_key: "cedeo",
  vendor_display_name: "Cedeo",
  profile_version: 2,
  confidence: "medium",
};

test("buildDocumentRecap marque fiable si totaux alignés", () => {
  const recap = buildDocumentRecap(
    {
      direction: "in",
      kind: "devis",
      title: "Devis",
      party_name: "Cedeo Lyon",
      party_kind: "distributeur",
      chantier_hint: "12 rue Test",
      document_number: "D-1",
      totals: { ht: 100, eco_contribution: null, pmcb: null, weight_kg: null },
      lines: [{ label: "A", qty: 2, unit: "u", buy_price: 50, sell_price: 0 }],
      read_assessment: { summary: "Devis Cedeo net.", quality: "fiable", caveats: [] },
    },
    agent,
    { summary: "Devis Cedeo net.", quality: "fiable", caveats: [] },
  );
  assert.ok(recap.score >= 75);
  assert.equal(recap.reliability, "fiable");
  assert.equal(recap.stats.totalsAligned, true);
});

test("buildDocumentRecap baisse le score si totaux incohérents", () => {
  const recap = buildDocumentRecap(
    {
      direction: "in",
      kind: "facture",
      title: "Facture",
      party_name: "Inconnu",
      party_kind: "distributeur",
      chantier_hint: "",
      totals: { ht: 200, eco_contribution: null, pmcb: null, weight_kg: null },
      lines: [{ label: "A", qty: 1, unit: "u", buy_price: 50, sell_price: 0 }],
    },
    { ...agent, vendor_key: "unknown", vendor_display_name: "?", confidence: "low" },
  );
  assert.ok(recap.score < 60);
  assert.ok(recap.caveats.length >= 1);
});
