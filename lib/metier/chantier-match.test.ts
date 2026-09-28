import assert from "node:assert/strict";
import test from "node:test";
import { scoreChantierHint, suggestChantierFromHint } from "@/lib/metier/chantier-match";

const villa = { id: "1", name: "Villa Martin — Lyon 3", address: "12 rue des Acacias 69003 Lyon" };
const culoz = { id: "2", name: "Atelier Culoz", address: "Culoz" };

test("propose Villa Martin si le hint reprend le nom", () => {
  const hit = suggestChantierFromHint("Villa Martin - 12 rue des Acacias 69003 Lyon", [villa, culoz]);
  assert.equal(hit?.id, "1");
  assert.ok(scoreChantierHint("Villa Martin - 12 rue des Acacias 69003 Lyon", villa) >= 2);
});

test("sans hint : pas de suggestion", () => {
  assert.equal(suggestChantierFromHint("", [villa]), null);
});

test("hint trop vague : pas de suggestion", () => {
  assert.equal(suggestChantierFromHint("Lyon", [villa, culoz]), null);
});
