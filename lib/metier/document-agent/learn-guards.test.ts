import assert from "node:assert/strict";
import { test } from "node:test";
import { hintDeltaHash, isSafeHintDelta } from "@/lib/metier/document-agent/learn-guards";
import { structuralDiff } from "@/lib/metier/document-agent/learn-diff";

test("isSafeHintDelta accepte un diff structurel", () => {
  assert.equal(isSafeHintDelta({ kind_corrected: true }), true);
  assert.equal(isSafeHintDelta({ line_count_delta: 2 }), true);
});

test("isSafeHintDelta refuse un JSON avec montant", () => {
  assert.equal(isSafeHintDelta({ line_count_delta: 12.99 }), false);
});

test("hintDeltaHash stable", () => {
  const a = hintDeltaHash({ kind_corrected: true, line_count_delta: 1 });
  const b = hintDeltaHash({ line_count_delta: 1, kind_corrected: true });
  assert.equal(a, b);
});

test("structuralDiff détecte corrections", () => {
  const raw = {
    direction: "in" as const,
    kind: "devis" as const,
    title: "x",
    party_name: "p",
    party_kind: "distributeur" as const,
    chantier_hint: "",
    totals: { ht: 100, eco_contribution: null, pmcb: null, weight_kg: null },
    lines: [{ label: "a", qty: 1, unit: "u", buy_price: 1 }],
  };
  const delta = structuralDiff(raw, {
    kind: "facture",
    direction: "in",
    partyKind: "distributeur",
    totals: { ht: 120 },
    lines: [{ label: "a" }, { label: "b" }],
  });
  assert.equal(delta.kind_corrected, true);
  assert.equal(delta.line_count_delta, 1);
  assert.equal(delta.totals_ht_mismatch, true);
});
