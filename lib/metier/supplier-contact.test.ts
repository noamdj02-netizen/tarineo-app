import assert from "node:assert/strict";
import { test } from "node:test";
import {
  ACCEPT_QUOTE_SCORE_MIN,
  buildAcceptQuoteMailto,
  buildRenegotiateMailto,
  canOfferAcceptQuoteCta,
  canOfferRenegotiateCta,
  isValidContactEmail,
  normalizeSupplierContact,
} from "@/lib/metier/supplier-contact";

test("normalizeSupplierContact ignore les champs vides", () => {
  assert.equal(normalizeSupplierContact({ name: "", email: "  ", phone: null }), null);
});

test("normalizeSupplierContact normalise e-mail et rôle", () => {
  const c = normalizeSupplierContact({
    name: "  Marie Dupont ",
    email: " Marie.Dupont@Point-P.fr ",
    phone: "06 12 34 56 78",
    role: "",
  });
  assert.ok(c);
  assert.equal(c!.name, "Marie Dupont");
  assert.equal(c!.email, "marie.dupont@point-p.fr");
  assert.equal(c!.role, "commercial");
});

test("canOfferAcceptQuoteCta exige score, devis entrant et e-mail valide", () => {
  assert.equal(
    canOfferAcceptQuoteCta({
      score: ACCEPT_QUOTE_SCORE_MIN,
      direction: "in",
      kind: "devis",
      contactEmail: "a@b.fr",
    }),
    true,
  );
  assert.equal(
    canOfferAcceptQuoteCta({
      score: ACCEPT_QUOTE_SCORE_MIN - 1,
      direction: "in",
      kind: "devis",
      contactEmail: "a@b.fr",
    }),
    false,
  );
  assert.equal(
    canOfferAcceptQuoteCta({
      score: 95,
      direction: "out",
      kind: "devis",
      contactEmail: "a@b.fr",
    }),
    false,
  );
  assert.equal(isValidContactEmail("pas-un-mail"), false);
});

test("buildAcceptQuoteMailto encode sujet et corps", () => {
  const href = buildAcceptQuoteMailto({
    toEmail: "marie@point-p.fr",
    contactName: "Marie",
    partyName: "Point P",
    documentTitle: "Devis toiture",
    documentNumber: "D-42",
    deliveryDate: "2024-03-11",
    chantierHint: "Villa Crevet",
  });
  assert.ok(href.startsWith("mailto:marie@point-p.fr?"));
  assert.ok(href.includes("subject="));
  assert.ok(href.includes("body="));
  assert.ok(href.includes(encodeURIComponent("Acceptation")));
  assert.ok(href.includes(encodeURIComponent("11/03/2024")));
  assert.ok(href.includes(encodeURIComponent("Villa Crevet")));
});

test("canOfferRenegotiateCta sur devis/BC entrant quel que soit le score", () => {
  assert.equal(
    canOfferRenegotiateCta({ score: ACCEPT_QUOTE_SCORE_MIN - 1, direction: "in", kind: "devis" }),
    true,
  );
  assert.equal(
    canOfferRenegotiateCta({ score: ACCEPT_QUOTE_SCORE_MIN, direction: "in", kind: "devis" }),
    true,
  );
  assert.equal(canOfferRenegotiateCta({ score: 40, direction: "out", kind: "devis" }), false);
});

test("buildRenegotiateMailto inclut hausses et lignes sans score agent", () => {
  const href = buildRenegotiateMailto({
    toEmail: "marie@point-p.fr",
    contactName: "Marie",
    partyName: "Point P",
    kind: "devis",
    documentTitle: "Devis toiture",
    documentNumber: "D-42",
    totals: { ht: 120, tva: null, ttc: null, eco_contribution: null, pmcb: null, weight_kg: null },
    lines: [{ label: "Tuile", qty: 10, unit: "u", buy_price: 12, sell_price: 0 }],
    priorHits: [
      {
        label: "Tuile",
        currentPrice: 12,
        priorPrice: 10,
        pct: 20,
        priorDocTitle: "Devis 2025",
      },
    ],
    score: 100,
    closingBlock: "Cordialement,\nJean Dupont\nSARL Toiture",
  });
  assert.ok(href.startsWith("mailto:marie@point-p.fr?"));
  assert.ok(href.includes(encodeURIComponent("révision")));
  assert.ok(href.includes(encodeURIComponent("Tuile")));
  assert.ok(href.includes(encodeURIComponent("+20.0")));
  assert.ok(href.includes(encodeURIComponent("Jean Dupont")));
  assert.equal(href.includes("Fiabilité"), false);
  assert.equal(href.includes(encodeURIComponent("100/100")), false);
  assert.equal(href.includes(encodeURIComponent("agent")), false);
});
