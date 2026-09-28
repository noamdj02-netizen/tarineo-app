import assert from "node:assert/strict";
import test from "node:test";
import { entrepriseDefaut, pieceDonneesFromDocument } from "@/lib/metier/pdf/piece-model";
import { genererPdfPiece } from "@/lib/metier/pdf/piece-pdf";
import type { DocumentCard } from "@/lib/metier/types";

function doc(kind: DocumentCard["kind"]): DocumentCard {
  return {
    id: "11111111-1111-1111-1111-111111111111",
    direction: "out",
    kind,
    title: "Devis client n°001",
    party_id: null,
    chantier_id: null,
    source_document_id: null,
    file_path: "",
    extract: { totals: { ht: 100.9, eco_contribution: null, pmcb: null, weight_kg: null } },
    status: "ready",
    error: "",
    seed_key: null,
    created_at: "2026-09-28T12:00:00.000Z",
    party_name: "Madame Martin",
    party_address: "Lyon",
    party_kind: "client",
    chantier_name: "Villa Martin — Lyon 3",
    chantier_slug: "villa-martin",
    lines: [
      {
        id: "l1",
        document_id: "11111111-1111-1111-1111-111111111111",
        product_id: null,
        supplier_party_id: null,
        distributor_party_id: null,
        label: "Tube PER nu 16 mm couronne 50 m",
        qty: 3,
        unit: "u",
        buy_price: 12.4,
        sell_price: 16.74,
        position: 0,
      },
    ],
  };
}

test("génère un PDF devis non vide avec les lignes", async () => {
  const entreprise = entrepriseDefaut("qa@tarineo.fr");
  entreprise.raisonSociale = "SARL Brochet QA";
  const piece = pieceDonneesFromDocument(doc("devis"), entreprise);
  const buf = await genererPdfPiece(entreprise, piece);
  assert.ok(buf.length > 200);
  assert.equal(buf.subarray(0, 4).toString(), "%PDF");
});

test("génère un PDF facture non vide", async () => {
  const entreprise = entrepriseDefaut("qa@tarineo.fr");
  const piece = pieceDonneesFromDocument(doc("facture"), entreprise);
  const buf = await genererPdfPiece(entreprise, piece);
  assert.ok(buf.length > 200);
  assert.equal(buf.subarray(0, 4).toString(), "%PDF");
});
