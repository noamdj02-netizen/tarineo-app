import assert from "node:assert/strict";
import test from "node:test";
import {
  assertNoForeignDocumentIds,
  documentOwnedByViewer,
  normalizeDocumentListPaging,
  pageDocumentRows,
  relatedIdsFromDocuments,
} from "@/lib/metier/list-documents-query";

test("normalizeDocumentListPaging — défaut sans plafond", () => {
  assert.deepEqual(normalizeDocumentListPaging(), { limit: null, offset: 0 });
  assert.deepEqual(normalizeDocumentListPaging({}), { limit: null, offset: 0 });
});

test("normalizeDocumentListPaging — clamp offset/limit", () => {
  assert.deepEqual(normalizeDocumentListPaging({ limit: 10, offset: -3 }), { limit: 10, offset: 0 });
  assert.deepEqual(normalizeDocumentListPaging({ limit: 0 }), { limit: 0, offset: 0 });
});

test("pageDocumentRows — première page et page suivante", () => {
  const rows = [1, 2, 3, 4, 5];
  assert.deepEqual(pageDocumentRows(rows, { limit: 2 }), [1, 2]);
  assert.deepEqual(pageDocumentRows(rows, { limit: 2, offset: 2 }), [3, 4]);
  assert.deepEqual(pageDocumentRows(rows, { limit: 2, offset: 10 }), []);
});

test("pageDocumentRows — liste vide", () => {
  assert.deepEqual(pageDocumentRows([], { limit: 10 }), []);
});

test("relatedIdsFromDocuments — seulement les ids référencés", () => {
  const rel = relatedIdsFromDocuments([
    { party_id: "p1", chantier_id: "c1" },
    { party_id: "p1", chantier_id: null },
    { party_id: null, chantier_id: "c2" },
  ]);
  assert.deepEqual(rel.partyIds.sort(), ["p1"]);
  assert.deepEqual(rel.chantierIds.sort(), ["c1", "c2"]);
});

test("documentOwnedByViewer — isolation A/B (prédicat app)", () => {
  assert.equal(documentOwnedByViewer("user-a", "user-a"), true);
  assert.equal(documentOwnedByViewer("user-a", "user-b"), false);
  assert.equal(documentOwnedByViewer(null, "user-a"), false);
});

test("assertNoForeignDocumentIds — fuite détectée", () => {
  const ok = assertNoForeignDocumentIds([{ id: "a1" }, { id: "a2" }], ["b1"]);
  assert.equal(ok.ok, true);
  const leak = assertNoForeignDocumentIds([{ id: "a1" }, { id: "b1" }], ["b1"]);
  assert.equal(leak.ok, false);
  if (!leak.ok) assert.deepEqual(leak.leaked, ["b1"]);
});
