import assert from "node:assert/strict";
import test from "node:test";
import { normalizeName, parseCompanyQuery } from "@/lib/company/parse-query";
import { scoreMatch } from "@/lib/company/match-score";
import { siretValide } from "@/lib/metier/company";
import type { CompanyLookupResult } from "@/lib/company/types";

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

test("parseCompanyQuery — SIRET / SIREN avec espaces", () => {
  assert.equal(parseCompanyQuery("53371252700019")?.digits, "53371252700019");
  assert.equal(parseCompanyQuery("533 712 527 00019")?.digits, "53371252700019");
  assert.equal(parseCompanyQuery("533 712 527")?.digits, "533712527");
});

test("normalizeName — strip forme juridique", () => {
  assert.equal(normalizeName("EURL Dupont"), "dupont");
  assert.equal(normalizeName("SARL DUPONT PLOMBERIE"), "dupont plomberie");
});

test("siretValide — Luhn depuis la droite (SIRET officiels)", () => {
  assert.equal(siretValide("53371252700019"), true);
  assert.equal(siretValide("39465988200010"), true); // SARL DUPONT PLOMBERIE (API gouv)
  assert.equal(siretValide("83285726200014"), true);
  assert.equal(siretValide("41987704800019"), true);
  assert.equal(siretValide("53371252700018"), false);
  assert.equal(siretValide("123"), false);
});

test("scoreMatch — nom exact + ville", () => {
  const company = baseCompany({
    legalName: "DUPONT PLOMBERIE",
    city: "LYON",
    postalCode: "69003",
    siret: "53371252700019",
    siretValid: true,
    active: true,
  });
  const score = scoreMatch(company, "dupont plomberie", "lyon", "69003", null);
  assert.ok(score >= 72, `expected high score, got ${score}`);
});

test("scoreMatch — SIRET exact", () => {
  const company = baseCompany({
    legalName: "X",
    siret: "53371252700019",
    siretValid: true,
  });
  assert.equal(scoreMatch(company, "", null, null, "53371252700019"), 100);
});

function baseCompany(partial: Partial<CompanyLookupResult>): CompanyLookupResult {
  return {
    name: partial.legalName ?? null,
    legalName: partial.legalName ?? null,
    tradeName: null,
    legalForm: null,
    siren: partial.siret?.slice(0, 9) ?? null,
    siret: partial.siret ?? null,
    address: partial.address ?? null,
    postalCode: partial.postalCode ?? null,
    city: partial.city ?? null,
    activity: null,
    activityLabel: null,
    active: partial.active ?? null,
    website: null,
    logoUrl: null,
    siretValid: partial.siretValid ?? false,
    matchScore: 0,
    source: "recherche-entreprises",
  };
}
