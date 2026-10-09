import assert from "node:assert/strict";
import { test } from "node:test";
import { findPriorBuyPrices } from "@/lib/metier/prior-prices";

test("findPriorBuyPrices détecte une hausse vs historique", () => {
  const hits = findPriorBuyPrices(
    [{ label: "Tuile plate", buy_price: 12 }],
    [
      {
        title: "Devis ancien",
        created_at: "2026-01-01T00:00:00Z",
        lines: [{ label: "Tuile plate", buy_price: 10 }],
      },
    ],
  );
  assert.equal(hits.length, 1);
  assert.ok(hits[0]!.pct > 0);
  assert.equal(hits[0]!.priorPrice, 10);
  assert.equal(hits[0]!.currentPrice, 12);
});

test("findPriorBuyPrices ignore les baisses si minPct > 0", () => {
  const hits = findPriorBuyPrices(
    [{ label: "Vis", buy_price: 1 }],
    [
      {
        title: "Facture",
        created_at: "2026-01-01T00:00:00Z",
        lines: [{ label: "Vis", buy_price: 2 }],
      },
    ],
    { minPct: 0.01 },
  );
  assert.equal(hits.length, 0);
});
