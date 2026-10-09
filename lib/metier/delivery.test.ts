import assert from "node:assert/strict";
import { test } from "node:test";
import {
  documentDeliveryDate,
  formatDeliveryDateFr,
  upcomingDeliveries,
} from "@/lib/metier/delivery";
import type { DocumentCard } from "@/lib/metier/types";

function stubDoc(partial: Partial<DocumentCard> & { id: string; extract: Record<string, unknown> }): DocumentCard {
  return {
    direction: "in",
    kind: "devis",
    title: "Devis",
    party_id: null,
    chantier_id: null,
    source_document_id: null,
    file_path: "",
    status: "ready",
    error: "",
    seed_key: null,
    created_at: "2026-01-01T00:00:00Z",
    party_name: null,
    party_address: null,
    party_kind: null,
    chantier_name: null,
    chantier_slug: null,
    lines: [],
    ...partial,
  };
}

test("formatDeliveryDateFr formate JJ/MM/AAAA", () => {
  assert.equal(formatDeliveryDateFr("2024-03-11"), "11/03/2024");
});

test("documentDeliveryDate lit l’extract", () => {
  assert.equal(documentDeliveryDate({ extract: { delivery_date: "2024-03-11" } }), "2024-03-11");
  assert.equal(documentDeliveryDate({ extract: { delivery_date: "nope" } }), null);
});

test("upcomingDeliveries ignore le passé et trie", () => {
  const docs = [
    stubDoc({
      id: "a",
      title: "A",
      extract: { delivery_date: "2020-01-01" },
    }),
    stubDoc({
      id: "b",
      title: "B",
      extract: { delivery_date: "2099-06-01" },
      party_name: "Point P",
      chantier_name: "Villa",
      chantier_slug: "villa",
    }),
    stubDoc({
      id: "c",
      title: "C",
      extract: { delivery_date: "2099-05-01" },
    }),
  ];
  const out = upcomingDeliveries(docs, { fromDay: "2099-01-01" });
  assert.equal(out.length, 2);
  assert.equal(out[0]!.day, "2099-05-01");
  assert.equal(out[1]!.documentId, "b");
});
