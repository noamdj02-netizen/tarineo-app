import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateQuoteTotals, roundMoney } from "@/lib/metier/devis/totals";
import { draftFromProposal } from "@/lib/metier/devis/from-proposal";
import { matchClients, matchChantiers } from "@/lib/metier/devis/match";
import { normalizeDevisLine, validateDevisDraft } from "@/lib/metier/devis/validate";
import type { ChantierCard, Party } from "@/lib/metier/types";

describe("calculateQuoteTotals", () => {
  it("calcule HT / TVA / TTC avec décimales correctes", () => {
    const t = calculateQuoteTotals([
      { description: "Tube PVC Ø500", quantity: 18, unit: "m", unitPriceHT: 33.2, vatRate: 10 },
      { description: "Pose", quantity: 1, unit: "forfait", unitPriceHT: 450, vatRate: 10 },
    ]);
    assert.equal(t.lines[0].totalHT, 597.6);
    assert.equal(t.lines[1].totalHT, 450);
    assert.equal(t.totalHT, 1047.6);
    assert.equal(t.totalTVA, 104.76);
    assert.equal(t.totalTTC, 1152.36);
  });

  it("roundMoney gère les centimes", () => {
    assert.equal(roundMoney(0.1 + 0.2), 0.3);
    assert.equal(roundMoney(33.2 * 18), 597.6);
  });
});

describe("validateDevisDraft", () => {
  it("accepte un brouillon valide", () => {
    const r = validateDevisDraft({
      client: { name: "Dupont" },
      lines: [{ description: "Pose", quantity: 1, unitPriceHT: 450, vatRate: 10 }],
      source: "voice",
    });
    assert.equal(r.ok, true);
  });

  it("accepte un brouillon sans lignes (devis vide)", () => {
    const r = validateDevisDraft({
      client: { name: "Dupont" },
      lines: [],
      source: "manual",
    });
    assert.equal(r.ok, true);
  });

  it("refuse un client sans nom", () => {
    const r = validateDevisDraft({
      client: { name: "" },
      lines: [{ description: "Pose", quantity: 1, unitPriceHT: 450, vatRate: 10 }],
      source: "voice",
    });
    assert.equal(r.ok, false);
  });
});

describe("draftFromProposal", () => {
  it("ne fabrique pas de prix absent", () => {
    const draft = draftFromProposal({
      summary: "Test",
      clientQuery: "Dupont",
      defaultVatRate: 10,
      lines: [
        {
          label: "Tube PVC",
          qty: 18,
          unit: "m",
          unitPrice: null,
          vatRate: 10,
          note: null,
          missing: ["prix"],
        },
      ],
      questions: [],
      warnings: [],
    });
    assert.equal(draft.lines[0].unitPriceHT, 0);
    assert.ok(draft.lines[0].missing?.includes("prix"));
  });
});

describe("normalizeDevisLine", () => {
  it("marque le prix manquant", () => {
    const l = normalizeDevisLine({ label: "PER", qty: 12, unit: "m" });
    assert.equal(l.unitPriceHT, 0);
    assert.ok(l.missing?.includes("prix"));
  });
});

describe("matchClients / matchChantiers", () => {
  const clients: Party[] = [
    { id: "1", kind: "client", name: "Dupont", address: "", seed_key: null },
    { id: "2", kind: "client", name: "Dupond SA", address: "", seed_key: null },
    { id: "3", kind: "client", name: "Martin", address: "", seed_key: null },
  ];

  it("détecte l’ambiguïté Dupont / Dupond", () => {
    const m = matchClients("Dupont", clients);
    assert.equal(m.ambiguous, true);
    assert.equal(m.exact, null);
    assert.ok(m.candidates.length >= 2);
  });

  it("match exact Martin", () => {
    const m = matchClients("Martin", clients);
    assert.equal(m.exact?.id, "3");
    assert.equal(m.ambiguous, false);
  });

  it("signale plusieurs chantiers", () => {
    const chantiers = [
      {
        id: "a",
        slug: "a",
        name: "Villa Dupont",
        address: "",
        client_id: "1",
        project_id: null,
        status: "focus" as const,
        seed_key: null,
        created_at: "",
        updated_at: "",
        client_name: "Dupont",
        docs_count: 0,
      },
      {
        id: "b",
        slug: "b",
        name: "Appart Dupont",
        address: "",
        client_id: "1",
        project_id: null,
        status: "pause" as const,
        seed_key: null,
        created_at: "",
        updated_at: "",
        client_name: "Dupont",
        docs_count: 0,
      },
    ] satisfies ChantierCard[];
    const m = matchChantiers("Dupont", chantiers);
    assert.equal(m.ambiguous, true);
  });
});
