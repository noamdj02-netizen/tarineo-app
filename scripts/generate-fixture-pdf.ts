/**
 * Génère un PDF devis de démo (sans Supabase) pour contrôle visuel avant mise en ligne.
 * Usage : npm run pdf:fixture
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { calculateQuoteTotals, roundMoney } from "@/lib/metier/devis/totals";
import type { CompanyProfile } from "@/lib/metier/company";
import { siretValide } from "@/lib/metier/company";
import { entrepriseFromCompany, pieceDonneesFromDocument } from "@/lib/metier/pdf/piece-model";
import { genererPdfPiece } from "@/lib/metier/pdf/piece-pdf";
import type { DocumentCard } from "@/lib/metier/types";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(root, "..");
const outDir = path.join(projectRoot, ".tmp");
const outFile = path.join(outDir, "tarineo-fixture-devis.pdf");

function logoDataUrl(): string | null {
  const logoPath = path.join(projectRoot, "public/landing/v2/tarineo-app-icon.png");
  if (!fs.existsSync(logoPath)) return null;
  const buf = fs.readFileSync(logoPath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const company: CompanyProfile = {
  raison_sociale: "SARL Dupont Rénovation",
  siret: "73282932000074",
  forme_juridique: "SARL",
  adresse_rue: "12 rue des Artisans",
  adresse_code_postal: "69003",
  adresse_ville: "Lyon",
  telephone: "04 78 00 00 00",
  email_contact: "contact@dupont-renovation.fr",
  regime_tva: "NORMAL",
  registre_immatriculation: "RCS Lyon B 732 829 320",
  assurance_nom: "AXA Entreprises",
  assurance_adresse: "Paris",
  assurance_numero_contrat: "DEC-123456",
  assurance_activites_garanties: "Plomberie, chauffage",
  assurance_zone_geographique: "France métropolitaine",
  logo_path: "",
  marge_par_defaut_pct: 35,
};

const docId = "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee";

const fixtureDoc: DocumentCard = {
  id: docId,
  direction: "out",
  kind: "devis",
  title: "Devis client n° DEV-2026-042",
  party_id: null,
  chantier_id: null,
  source_document_id: null,
  file_path: "",
  extract: {
    document_number: "DEV-2026-042",
    issue_date: "2026-10-09",
    totals: { ht: null, tva: null, ttc: null, eco_contribution: null, pmcb: null, weight_kg: null },
    line_vat_rates: [20, 10, 5.5],
  },
  status: "ready",
  error: "",
  seed_key: null,
  created_at: "2026-10-09T07:00:00.000Z",
  party_name: "Mme Sophie Martin",
  party_address: "8 avenue Jean Jaurès\n69007 Lyon",
  party_kind: "client",
  chantier_name: "Rénovation SDB — Martin",
  chantier_slug: "renovation-sdb-martin",
  lines: [
    {
      id: "l1",
      document_id: docId,
      product_id: null,
      supplier_party_id: null,
      distributor_party_id: null,
      label: "Pose douche italienne (forfait)",
      qty: 1,
      unit: "forfait",
      buy_price: 0,
      sell_price: 850,
      position: 0,
    },
    {
      id: "l2",
      document_id: docId,
      product_id: null,
      supplier_party_id: null,
      distributor_party_id: null,
      label: "Robinetterie chromée",
      qty: 2,
      unit: "u",
      buy_price: 0,
      sell_price: 124.5,
      position: 1,
    },
    {
      id: "l3",
      document_id: docId,
      product_id: null,
      supplier_party_id: null,
      distributor_party_id: null,
      label: "Évacuation PVC",
      qty: 6,
      unit: "ml",
      buy_price: 0,
      sell_price: 18.33,
      position: 2,
    },
  ],
};

async function main() {
  if (!siretValide(company.siret)) {
    console.error("SIRET fixture invalide — corrigez scripts/generate-fixture-pdf.ts");
    process.exit(1);
  }

  const entreprise = entrepriseFromCompany(company, "qa@tarineo.fr", logoDataUrl());
  const piece = pieceDonneesFromDocument(fixtureDoc, entreprise, {
    conditionsPaiement: "Acompte 30 % à la commande, solde à la livraison.",
    validiteDevisJours: 30,
  });

  const expected = calculateQuoteTotals(
    fixtureDoc.lines.map((l, i) => ({
      description: l.label,
      quantity: l.qty,
      unit: l.unit,
      unitPriceHT: l.sell_price,
      vatRate: [20, 10, 5.5][i] ?? 20,
    })),
  );

  console.log("Totaux attendus (calculateQuoteTotals) :");
  console.log(`  HT  ${roundMoney(expected.totalHT).toFixed(2)} €`);
  console.log(`  TVA ${roundMoney(expected.totalTVA).toFixed(2)} €`);
  console.log(`  TTC ${roundMoney(expected.totalTTC).toFixed(2)} €`);
  console.log("Totaux dans le PDF (pieceDonneesFromDocument) :");
  console.log(`  HT  ${piece.totalHt.toFixed(2)} €`);
  console.log(`  TVA ${piece.totalTva.toFixed(2)} €`);
  console.log(`  TTC ${piece.totalTtc.toFixed(2)} €`);

  const buf = await genererPdfPiece(entreprise, piece);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, buf);
  console.log(`\nPDF écrit : ${outFile} (${buf.length} octets)`);
  console.log("Note : le modèle PDF ne gère pas de ligne « remise » globale — uniquement lignes HT + TVA par ligne.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
