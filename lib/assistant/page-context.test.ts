import assert from "node:assert/strict";
import test from "node:test";
import { inferEntityType, parsePageContext } from "@/lib/assistant/page-context";

test("parse objet page context", () => {
  const p = parsePageContext({
    route: "/chantiers/martin",
    entityType: "chantier",
    entityId: "11111111-1111-1111-1111-111111111111",
  });
  assert.equal(p?.route, "/chantiers/martin");
  assert.equal(p?.entityType, "chantier");
  assert.equal(p?.entityId, "11111111-1111-1111-1111-111111111111");
});

test("entityId non UUID ignoré", () => {
  const p = parsePageContext({ route: "/pieces/not-uuid", entityId: "nope" });
  assert.equal(p?.entityId, undefined);
});

test("route string héritée", () => {
  const p = parsePageContext(undefined, "/accueil");
  assert.equal(p?.route, "/accueil");
});

test("infer types", () => {
  assert.equal(inferEntityType("/chantiers/villa"), "chantier");
  assert.equal(inferEntityType("/client/devis"), "devis");
  assert.equal(inferEntityType("/pieces/x"), "document");
  assert.equal(inferEntityType("/accueil"), "dashboard");
});
