import assert from "node:assert/strict";
import { test } from "node:test";
import {
  periodBounds,
  resolveDistributorGoal,
  spendByEnseigneInPeriod,
  spendGaugePct,
} from "@/lib/metier/supplier-spend";
import type { DocumentCard, DocumentLine } from "@/lib/metier/types";

function line(amount: number): DocumentLine {
  return {
    id: "l1",
    document_id: "d1",
    product_id: null,
    supplier_party_id: null,
    distributor_party_id: null,
    label: "Article",
    qty: 1,
    unit: "u",
    buy_price: amount,
    sell_price: 0,
    position: 0,
  };
}

function doc(input: {
  party_name: string;
  created_at: string;
  amount: number;
  party_id?: string | null;
}): DocumentCard {
  return {
    id: "d1",
    title: "Facture",
    kind: "facture",
    direction: "in",
    status: "ready",
    party_id: input.party_id ?? null,
    party_name: input.party_name,
    party_address: null,
    party_kind: "distributeur",
    chantier_id: null,
    chantier_slug: null,
    chantier_name: null,
    source_document_id: null,
    file_path: "",
    extract: {},
    error: "",
    seed_key: null,
    created_at: input.created_at,
    lines: [line(input.amount)],
  };
}

test("periodBounds month/year", () => {
  const ref = new Date(2026, 9, 15); // 15 oct 2026 local
  const m = periodBounds("month", ref);
  assert.equal(m.from.getFullYear(), 2026);
  assert.equal(m.from.getMonth(), 9);
  assert.equal(m.from.getDate(), 1);
  assert.equal(m.to.getMonth(), 10);
  const y = periodBounds("year", ref);
  assert.equal(y.from.getFullYear(), 2026);
  assert.equal(y.from.getMonth(), 0);
  assert.equal(y.to.getFullYear(), 2027);
});

test("spendByEnseigneInPeriod filtre le mois", () => {
  const docs = [
    doc({ party_name: "Pompée", created_at: "2026-10-02T10:00:00.000Z", amount: 2000 }),
    doc({ party_name: "Pompée", created_at: "2026-09-02T10:00:00.000Z", amount: 9000 }),
    doc({ party_name: "Point P", created_at: "2026-10-05T10:00:00.000Z", amount: 500 }),
  ];
  const rows = spendByEnseigneInPeriod(docs, "month", new Date(2026, 9, 9));
  assert.equal(rows.find((r) => r.label === "Pompée")?.amount, 2000);
  assert.equal(rows.find((r) => r.label === "Point P")?.amount, 500);
});

test("resolveDistributorGoal + gauge", () => {
  assert.equal(resolveDistributorGoal("pompée", { Pompée: 5000 }), 5000);
  assert.equal(spendGaugePct(2500, 5000), 50);
  assert.equal(spendGaugePct(6000, 5000), 100);
});
