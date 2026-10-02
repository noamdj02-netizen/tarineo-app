import { BRAND } from "@/lib/brand";
import type { CompanyProfile } from "@/lib/metier/company";
import { calculateQuoteTotals } from "@/lib/metier/devis/totals";
import type { EntrepriseInfoPdf, LigneDocumentPdf } from "@/lib/metier/pdf/pdf-clients";

export const formaterEuros = (v: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(v);
export const formaterDate = (d: Date) =>
  d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export function assuranceRenseignee(e: EntrepriseInfoPdf): boolean {
  return Boolean(
    e.assuranceNom && e.assuranceAdresse && e.assuranceNumeroContrat && e.assuranceActivitesGaranties && e.assuranceZoneGeographique,
  );
}
import type { PiecePdfDonnees, PiecePdfKind } from "@/lib/metier/pdf/piece-pdf";
import { totalsFromExtract, type DocumentCard } from "@/lib/metier/types";

export const PIECE_TITRES: Record<PiecePdfKind, string> = {
  devis: "DEVIS",
  facture: "FACTURE",
  bon_commande: "BON DE COMMANDE",
  bon_enlevement: "BON D’ENLÈVEMENT",
};

export function kindPdf(kind: DocumentCard["kind"]): PiecePdfKind {
  if (kind === "facture") return "facture";
  if (kind === "bon_commande") return "bon_commande";
  if (kind === "bon_enlevement") return "bon_enlevement";
  return "devis";
}

export function entrepriseDefaut(email?: string | null): EntrepriseInfoPdf {
  return {
    raisonSociale: "Votre entreprise",
    siret: "À renseigner",
    formeJuridique: "Micro-entreprise",
    adresseRue: "Adresse à renseigner",
    adresseCodePostal: "",
    adresseVille: "",
    telephone: "",
    emailContact: email || BRAND.contactEmail,
    regimeTva: "FRANCHISE_293B",
    registreImmatriculation: null,
    assuranceNom: null,
    assuranceAdresse: null,
    assuranceNumeroContrat: null,
    assuranceActivitesGaranties: null,
    assuranceZoneGeographique: null,
    logoDataUrl: null,
  };
}

export function entrepriseFromCompany(
  p: CompanyProfile | null | undefined,
  email?: string | null,
  logoDataUrl?: string | null,
): EntrepriseInfoPdf {
  const base = entrepriseDefaut(email);
  if (!p?.raison_sociale) return { ...base, logoDataUrl: logoDataUrl ?? null };
  return {
    raisonSociale: p.raison_sociale,
    siret: p.siret,
    formeJuridique: p.forme_juridique || null,
    adresseRue: p.adresse_rue,
    adresseCodePostal: p.adresse_code_postal,
    adresseVille: p.adresse_ville,
    telephone: p.telephone,
    emailContact: p.email_contact || email || BRAND.contactEmail,
    regimeTva: p.regime_tva,
    registreImmatriculation: p.registre_immatriculation || null,
    assuranceNom: p.assurance_nom || null,
    assuranceAdresse: p.assurance_adresse || null,
    assuranceNumeroContrat: p.assurance_numero_contrat || null,
    assuranceActivitesGaranties: p.assurance_activites_garanties || null,
    assuranceZoneGeographique: p.assurance_zone_geographique || null,
    logoDataUrl: logoDataUrl ?? null,
  };
}

export function pieceDonneesFromDocument(
  doc: DocumentCard,
  entreprise: EntrepriseInfoPdf,
  defaults?: {
    conditionsPaiement?: string;
    validiteDevisJours?: number | null;
    acomptePct?: number | null;
    mentionPiedPage?: string;
  },
): PiecePdfDonnees {
  const franchise = entreprise.regimeTva === "FRANCHISE_293B";
  const vatRates = Array.isArray(doc.extract?.line_vat_rates)
    ? (doc.extract.line_vat_rates as unknown[]).map((v) => (Number.isFinite(Number(v)) ? Number(v) : 20))
    : null;
  const defaultVat = franchise ? 0 : 20;

  const quoteLines = doc.lines.map((l, i) => ({
    description: l.label,
    quantity: Number(l.qty) || 1,
    unit: l.unit || "u",
    unitPriceHT: Number(l.sell_price || l.buy_price) || 0,
    vatRate: franchise ? 0 : (vatRates?.[i] ?? defaultVat),
  }));
  const computed = calculateQuoteTotals(quoteLines);
  const lignes: LigneDocumentPdf[] = computed.lines.map((l) => ({
    designation: l.description,
    quantite: l.quantity,
    prixUnitaireHt: l.unitPriceHT,
    tauxTva: l.vatRate,
    totalHt: l.totalHT,
  }));

  const totaux = totalsFromExtract(doc.extract);
  const totalHt = totaux.ht ?? computed.totalHT;
  const totalTva = franchise ? 0 : (totaux.tva ?? computed.totalTVA);
  const totalTtc = totaux.ttc ?? Math.round((totalHt + totalTva) * 100) / 100;
  const kind = kindPdf(doc.kind);
  const extractNum =
    typeof doc.extract?.document_number === "string" ? doc.extract.document_number.trim() : "";
  const numero =
    extractNum ||
    doc.title.match(/n[°º]\s*([A-Z0-9-]+)/i)?.[1] ||
    doc.id.slice(0, 8).toUpperCase();
  const extractDate =
    typeof doc.extract?.issue_date === "string" ? doc.extract.issue_date.trim() : "";
  const parsedDate = extractDate ? new Date(extractDate) : null;
  const dateEmission =
    parsedDate && !Number.isNaN(+parsedDate) ? parsedDate : new Date(doc.created_at);
  const configuredValidity =
    typeof defaults?.validiteDevisJours === "number" && defaults.validiteDevisJours > 0
      ? defaults.validiteDevisJours
      : 30;
  const validity =
    typeof doc.extract?.validity_days === "number" && doc.extract.validity_days > 0
      ? doc.extract.validity_days
      : configuredValidity;
  const configuredPayment = defaults?.conditionsPaiement?.trim();
  const acompte =
    typeof defaults?.acomptePct === "number" && defaults.acomptePct > 0
      ? `Acompte ${defaults.acomptePct} % à la commande, solde à la livraison.`
      : "Acompte 30 % à la commande, solde à la livraison.";
  const payment =
    typeof doc.extract?.payment_terms === "string" && doc.extract.payment_terms
      ? doc.extract.payment_terms
      : configuredPayment
        ? configuredPayment
        : kind === "facture"
          ? "Paiement à 30 jours."
          : acompte;
  return {
    kind,
    numero,
    dateEmission,
    dateEcheance: kind === "facture" ? new Date(Date.now() + 30 * 86400000) : undefined,
    dureeValiditeJours: kind === "devis" || kind === "bon_commande" ? validity : undefined,
    conditionsPaiement: payment,
    clientNom: doc.party_name || "Client",
    clientAdresse: doc.party_address,
    chantier: doc.chantier_name,
    lignes,
    totalHt,
    totalTva,
    totalTtc,
    numeroOrigine:
      typeof doc.extract?.from_title === "string"
        ? (doc.extract.from_title.match(/n[°º]\s*([A-Z0-9-]+)/i)?.[1] ?? doc.extract.from_title)
        : undefined,
    mentionPiedPage: defaults?.mentionPiedPage,
  };
}
