import { genererPdfPiece, type PiecePdfDonnees, type PiecePdfKind } from "@/lib/metier/pdf/piece-pdf";
import type { LandingExtractLine } from "@/lib/site/landing-quote-extract.types";
import type { LandingDemoOutputKind } from "@/lib/site/landing-quote-transform-demo";
import type { EntrepriseInfoPdf, LigneDocumentPdf } from "@/lib/metier/pdf/pdf-clients";
import {
  clientUnitFromSupplier,
  LANDING_QUOTE_DEMO,
  lineTotalHt,
} from "@/lib/site/landing-quote-transform-demo";

const DEMO_TVA = 10;

const LANDING_DEMO_ENTREPRISE: EntrepriseInfoPdf = {
  raisonSociale: "Plomberie Martin SARL",
  formeJuridique: "SARL au capital de 10 000 €",
  siret: "123 456 789 00012",
  adresseRue: "8 rue des Artisans",
  adresseCodePostal: "69003",
  adresseVille: "Lyon",
  telephone: "04 78 00 00 00",
  emailContact: "contact@plomberie-martin-exemple.fr",
  regimeTva: "NORMAL",
  registreImmatriculation: "RCS Lyon B 123 456 789",
  assuranceNom: "Assurance décennale — Exemple",
  assuranceAdresse: "1 place de l’Assurance, 75008 Paris",
  assuranceNumeroContrat: "DEC-2026-0001",
  assuranceActivitesGaranties: "Plomberie, chauffage",
  assuranceZoneGeographique: "France métropolitaine",
  logoDataUrl: null,
};

function clampMargin(marginPct: number) {
  const min = LANDING_QUOTE_DEMO.minMarginPct;
  const max = 45;
  return Math.min(max, Math.max(min, Math.round(marginPct)));
}

function buildClientLignesFromExtract(
  lines: LandingExtractLine[],
  marginPct: number,
): LigneDocumentPdf[] {
  return lines.map((line, index) => {
    const prixUnitaireHt = clientUnitFromSupplier(line.unitPriceHT, marginPct);
    const totalHt = lineTotalHt(line.qty, prixUnitaireHt);
    const ref = line.reference?.trim();
    const designation = ref ? `${ref} — ${line.label}` : line.label;
    return {
      designation: designation.slice(0, 500) || `Ligne ${index + 1}`,
      quantite: line.qty,
      prixUnitaireHt,
      tauxTva: line.vatRate ?? DEMO_TVA,
      totalHt,
    };
  });
}

function buildClientLignes(marginPct: number): LigneDocumentPdf[] {
  return LANDING_QUOTE_DEMO.lines.map((line) => {
    const prixUnitaireHt = clientUnitFromSupplier(line.unitHt, marginPct);
    const totalHt = lineTotalHt(line.qty, prixUnitaireHt);
    return {
      designation: `${line.ref} — ${line.label}`,
      quantite: line.qty,
      prixUnitaireHt,
      tauxTva: DEMO_TVA,
      totalHt,
    };
  });
}

function buildSupplierLignes(): LigneDocumentPdf[] {
  return LANDING_QUOTE_DEMO.lines.map((line) => {
    const totalHt = lineTotalHt(line.qty, line.unitHt);
    return {
      designation: `${line.ref} — ${line.label}`,
      quantite: line.qty,
      prixUnitaireHt: line.unitHt,
      tauxTva: DEMO_TVA,
      totalHt,
    };
  });
}

const LANDING_DEMO_FOURNISSEUR: EntrepriseInfoPdf = {
  raisonSociale: "Négoce Pro BTP — Exemple",
  formeJuridique: "SAS",
  siret: "987 654 321 00011",
  adresseRue: "Zone industrielle Nord",
  adresseCodePostal: "69100",
  adresseVille: "Villeurbanne",
  telephone: "04 72 00 00 00",
  emailContact: "devis@negoce-pro-exemple.fr",
  regimeTva: "NORMAL",
  registreImmatriculation: "RCS Lyon 987 654 321",
  assuranceNom: null,
  assuranceAdresse: null,
  assuranceNumeroContrat: null,
  assuranceActivitesGaranties: null,
  assuranceZoneGeographique: null,
  logoDataUrl: null,
};

export async function buildLandingSupplierDemoPdf(): Promise<Buffer> {
  const lignes = buildSupplierLignes();
  const totalHt = lignes.reduce((acc, l) => acc + l.totalHt, 0);
  const totalTva = lignes.reduce((acc, l) => acc + l.totalHt * (l.tauxTva / 100), 0);
  const totalTtc = totalHt + totalTva;

  const piece: PiecePdfDonnees = {
    kind: "devis",
    numero: "FOUR-2026-014",
    dateEmission: new Date(),
    dureeValiditeJours: 30,
    conditionsPaiement: "Paiement à 30 jours fin de mois.",
    clientNom: LANDING_DEMO_ENTREPRISE.raisonSociale,
    clientAdresse: `${LANDING_DEMO_ENTREPRISE.adresseRue}, ${LANDING_DEMO_ENTREPRISE.adresseCodePostal} ${LANDING_DEMO_ENTREPRISE.adresseVille}`,
    chantier: LANDING_QUOTE_DEMO.clientSubtitle,
    lignes,
    totalHt,
    totalTva,
    totalTtc,
    mentionPiedPage:
      "Devis fournisseur d’exemple — à utiliser avec la démo tarineo.fr (sans valeur contractuelle).",
  };

  return genererPdfPiece(LANDING_DEMO_FOURNISSEUR, piece);
}

function numeroForKind(kind: PiecePdfKind): string {
  switch (kind) {
    case "facture":
      return "FAC-DEMO-2026";
    case "bon_commande":
      return "BC-DEMO-2026";
    case "bon_enlevement":
      return "BE-DEMO-2026";
    default:
      return "DEV-DEMO-2026";
  }
}

function conditionsForKind(kind: PiecePdfKind): string {
  switch (kind) {
    case "facture":
      return "Paiement à 30 jours fin de mois.";
    case "bon_commande":
      return "Bon pour commande — merci de confirmer les quantités.";
    case "bon_enlevement":
      return "Enlèvement sur site selon créneau convenu.";
    default:
      return "30 % à la commande, solde à réception des travaux.";
  }
}

export async function buildLandingDemoDevisPdf(
  marginPct: number,
  clientName: string,
  sourceRef?: string | null,
  documentKind: LandingDemoOutputKind = "devis",
  clientAddress?: string | null,
  extractLines?: LandingExtractLine[] | null,
  meta?: { documentNumber?: string; issueDate?: string },
): Promise<Buffer> {
  const marge = clampMargin(marginPct);
  const fromUserDocument = Boolean(extractLines?.length);
  const lignes =
    fromUserDocument ? buildClientLignesFromExtract(extractLines!, marge) : buildClientLignes(marge);
  const totalHt = lignes.reduce((acc, l) => acc + l.totalHt, 0);
  const totalTva = lignes.reduce((acc, l) => acc + l.totalHt * (l.tauxTva / 100), 0);
  const totalTtc = totalHt + totalTva;
  const kind: PiecePdfKind = documentKind;

  const emission = meta?.issueDate ? new Date(meta.issueDate) : new Date();
  const dateEmission = Number.isNaN(emission.getTime()) ? new Date() : emission;

  const refTrim = sourceRef?.trim();
  const clientNom = clientName.trim()
    ? clientName.trim()
    : fromUserDocument
      ? "Client"
      : LANDING_QUOTE_DEMO.clientName;
  const chantier = refTrim
    ? refTrim
    : fromUserDocument
      ? "—"
      : LANDING_QUOTE_DEMO.clientSubtitle;
  const numeroOrigine = refTrim
    ? refTrim.slice(0, 160)
    : fromUserDocument
      ? undefined
      : LANDING_QUOTE_DEMO.supplierSubtitle.slice(0, 160);

  const piece: PiecePdfDonnees = {
    kind,
    numero: (meta?.documentNumber?.trim() || numeroForKind(kind)).slice(0, 40),
    dateEmission,
    dureeValiditeJours: kind === "devis" ? 30 : undefined,
    dateEcheance: kind === "facture" ? new Date(Date.now() + 30 * 86400000) : undefined,
    conditionsPaiement: conditionsForKind(kind),
    clientNom,
    clientAdresse: clientAddress?.trim() || "—",
    chantier,
    numeroOrigine,
    lignes,
    totalHt,
    totalTva,
    totalTtc,
    mentionPiedPage:
      "Document de démonstration généré sur tarineo.fr — sans valeur contractuelle. Marge appliquée : " +
      `${marge} %.`,
  };

  return genererPdfPiece(LANDING_DEMO_ENTREPRISE, piece);
}
