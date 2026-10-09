import assert from "node:assert/strict";
import { test } from "node:test";
import { ExtractError, parseExtractResponse } from "@/lib/metier/extract-parse";

test("parseExtractResponse lit un JSON valide", () => {
  const raw = JSON.stringify({
    direction: "in",
    kind: "devis",
    title: "Devis Point P",
    party_name: "Point P Lyon",
    party_kind: "distributeur",
    chantier_hint: "Toiture",
    totals: { ht: 120 },
    lines: [{ label: "Tuile", qty: 10, unit: "u", buy_price: 12 }],
  });
  const out = parseExtractResponse(raw, "scan.pdf");
  assert.equal(out.party_name, "Point P Lyon");
  assert.equal(out.lines[0].label, "Tuile");
  assert.equal(out.totals.ht, 120);
});

test("parseExtractResponse refuse un texte sans JSON", () => {
  assert.throws(() => parseExtractResponse("désolé je ne peux pas", "x.pdf"), ExtractError);
});

test("parseExtractResponse refuse un JSON sans lignes", () => {
  assert.throws(
    () => parseExtractResponse(JSON.stringify({ kind: "devis", lines: [] }), "x.pdf"),
    ExtractError,
  );
});

test("parseExtractResponse n’invente pas Dupont / PVC / 442.8", () => {
  assert.throws(() => parseExtractResponse("{}", "facture.pdf"), ExtractError);
  try {
    parseExtractResponse("échec", "client-dupont.pdf");
  } catch (e) {
    const msg = e instanceof Error ? e.message : "";
    assert.equal(/Dupont|Cedeo|PVC|442/.test(msg + JSON.stringify(e)), false);
  }
});

test("parseExtractResponse lit le contact commercial", () => {
  const raw = JSON.stringify({
    direction: "in",
    kind: "devis",
    title: "Devis Point P",
    party_name: "Point P Lyon",
    party_kind: "distributeur",
    chantier_hint: "",
    contact_name: "Marie Dupont",
    contact_email: "marie.dupont@point-p.fr",
    contact_phone: "06 00 00 00 00",
    contact_role: "commercial",
    totals: { ht: 120 },
    lines: [{ label: "Tuile", qty: 10, unit: "u", buy_price: 12 }],
  });
  const out = parseExtractResponse(raw, "scan.pdf");
  assert.equal(out.contact_name, "Marie Dupont");
  assert.equal(out.contact_email, "marie.dupont@point-p.fr");
  assert.equal(out.contact_phone, "06 00 00 00 00");
  assert.equal(out.contact_role, "commercial");
});

test("parseExtractResponse lit delivery_date ISO", () => {
  const raw = JSON.stringify({
    direction: "in",
    kind: "bl",
    title: "BL Point P",
    party_name: "Point P",
    party_kind: "distributeur",
    chantier_hint: "",
    delivery_date: "2026-10-15",
    issue_date: "pas-une-date",
    totals: { ht: 10 },
    lines: [{ label: "A", qty: 1, unit: "u", buy_price: 10 }],
  });
  const out = parseExtractResponse(raw, "bl.pdf");
  assert.equal(out.delivery_date, "2026-10-15");
  assert.equal(out.issue_date, undefined);
});

test("parseExtractResponse ignore un contact entièrement vide", () => {
  const raw = JSON.stringify({
    direction: "in",
    kind: "devis",
    title: "Devis",
    party_name: "Cedeo",
    party_kind: "distributeur",
    chantier_hint: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    totals: { ht: 10 },
    lines: [{ label: "A", qty: 1, unit: "u", buy_price: 10 }],
  });
  const out = parseExtractResponse(raw, "scan.pdf");
  assert.equal(out.contact_name, undefined);
  assert.equal(out.contact_email, undefined);
});
