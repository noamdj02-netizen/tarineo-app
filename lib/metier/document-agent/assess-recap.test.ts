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

test("buildDocumentRecap crédite le contact commercial", () => {
  const base = {
    direction: "in" as const,
    kind: "devis" as const,
    title: "Devis",
    party_name: "Cedeo Lyon",
    party_kind: "distributeur" as const,
    chantier_hint: "",
    totals: { ht: 100, eco_contribution: null, pmcb: null, weight_kg: null },
    lines: [{ label: "A", qty: 1, unit: "u", buy_price: 80, sell_price: 0 }],
  };
  const without = buildDocumentRecap(base, { ...agent, confidence: "low" });
  const withContact = buildDocumentRecap(
    {
      ...base,
      contact_name: "Marie",
      contact_email: "marie@cedeo.fr",
    },
    { ...agent, confidence: "low" },
  );
  assert.ok(withContact.score >= without.score + 4);
  assert.ok(withContact.checks.some((c) => c.id === "contact" && c.ok));
  assert.ok(without.checks.some((c) => c.id === "contact" && !c.ok));
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
