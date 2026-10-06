import assert from "node:assert/strict";
import { test } from "node:test";
import { computeDocumentMarginPct } from "@/lib/automation/margin-calc";
import type { DocumentCard } from "@/lib/metier/types";

function line(
  over: Partial<DocumentCard["lines"][number]> & Pick<DocumentCard["lines"][number], "buy_price" | "sell_price">,
): DocumentCard["lines"][number] {
  return {
    id: "l1",
    document_id: "d1",
    product_id: null,
    supplier_party_id: null,
    distributor_party_id: null,
    label: "A",
    qty: 1,
    unit: "u",
    position: 0,
    ...over,
  };
}

function devis(lines: DocumentCard["lines"]): DocumentCard {
  return {
    id: "d1",
    direction: "out",
    kind: "devis",
    title: "Devis",
    party_id: null,
    chantier_id: null,
    source_document_id: null,
    file_path: "",
    extract: {},
    status: "ready",
    error: "",
    seed_key: null,
    created_at: "2026-01-01T00:00:00.000Z",
    party_name: null,
    party_address: null,
    party_kind: "client",
    chantier_name: null,
    chantier_slug: null,
    lines,
  };
}

test("computeDocumentMarginPct — marge 30 %", () => {
  const m = computeDocumentMarginPct(
    devis([line({ buy_price: 70, sell_price: 100 })]),
  );
  assert.equal(m?.marginPct, 30);
});

test("computeDocumentMarginPct — sous seuil 22 %", () => {
  const m = computeDocumentMarginPct(
    devis([line({ buy_price: 78, sell_price: 100 })]),
  );
  assert.equal(m?.marginPct, 22);
});

test("computeDocumentMarginPct — égalité seuil 30 % (pas d’alerte côté métier)", () => {
  const m = computeDocumentMarginPct(
    devis([line({ buy_price: 70, sell_price: 100 })]),
  );
  assert.equal(m?.marginPct, 30);
});

test("computeDocumentMarginPct — document fournisseur ignoré", () => {
  const doc = devis([]);
  doc.direction = "in";
  assert.equal(computeDocumentMarginPct(doc), null);
});
