import assert from "node:assert/strict";
import test from "node:test";
import {
  assertNoForeignDocumentIds,
  documentOwnedByViewer,
} from "@/lib/metier/list-documents-query";

/**
 * Suite A/B côté application (prédicats + fuite d’ids).
 * Ce n’est PAS une preuve RLS PostgREST sur le projet distant.
 * Pour la preuve DB : `npm run test:isolation:live` avec JWT staging.
 */

const USER_A = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
const USER_B = "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb";

const docsA = [
  { id: "doc-a-1", user_id: USER_A, kind: "devis" },
  { id: "doc-a-2", user_id: USER_A, kind: "facture" },
];
const docsB = [
  { id: "doc-b-1", user_id: USER_B, kind: "devis" },
  { id: "chantier-b-secret", user_id: USER_B, kind: "bon_commande" },
];

function visibleFor(viewer: string, universe: typeof docsA) {
  return universe.filter((d) => documentOwnedByViewer(d.user_id, viewer));
}

test("USER A ne lit que ses documents dans un univers mélangé", () => {
  const mixed = [...docsA, ...docsB];
  const forA = visibleFor(USER_A, mixed);
  assert.equal(forA.length, 2);
  const check = assertNoForeignDocumentIds(
    forA,
    docsB.map((d) => d.id),
  );
  assert.equal(check.ok, true);
});

test("USER B ne peut pas « ouvrir » un id de A via le prédicat ownership", () => {
  const target = docsA[0];
  assert.equal(documentOwnedByViewer(target.user_id, USER_B), false);
});

test("mutation simulée : B ne passe pas le check ownership sur ressource A", () => {
  const canUpdate = (viewer: string, doc: (typeof docsA)[0]) =>
    documentOwnedByViewer(doc.user_id, viewer);
  assert.equal(canUpdate(USER_A, docsA[0]), true);
  assert.equal(canUpdate(USER_B, docsA[0]), false);
  assert.equal(canUpdate(USER_B, docsB[0]), true);
});
