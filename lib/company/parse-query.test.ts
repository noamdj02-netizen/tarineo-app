import assert from "node:assert/strict";
import test from "node:test";
import { parseCompanyQuery } from "@/lib/company/parse-query";
import { siretValide } from "@/lib/metier/company";

test("parseCompanyQuery — nom simple", () => {
  const p = parseCompanyQuery("Dupont Plomberie");
  assert.equal(p?.searchText, "Dupont Plomberie");
  assert.equal(p?.domain, null);
  assert.equal(p?.digits, null);
});

test("parseCompanyQuery — domaine et URL", () => {
  assert.equal(parseCompanyQuery("dupont-plomberie.fr")?.domain, "dupont-plomberie.fr");
  assert.equal(parseCompanyQuery("https://www.dupont-plomberie.fr/contact")?.domain, "dupont-plomberie.fr");
  assert.equal(parseCompanyQuery("dupont-plomberie.fr")?.searchText.includes("dupont"), true);
});

test("parseCompanyQuery — SIRET / SIREN", () => {
  assert.equal(parseCompanyQuery("53371252700019")?.digits, "53371252700019");
  assert.equal(parseCompanyQuery("533 712 527")?.digits, "533712527");
});

test("siretValide — Luhn conservé", () => {
  assert.equal(siretValide("53371252700019"), true);
  assert.equal(siretValide("53371252700018"), false);
  assert.equal(siretValide("123"), false);
});
