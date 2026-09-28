import { BRAND } from "@/lib/brand";
import type { CompanyProfile } from "@/lib/metier/company";
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

const TVA = 0.2;

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

export function pieceDonneesFromDocument(doc: DocumentCard, entreprise: EntrepriseInfoPdf): PiecePdfDonnees {
  const franchise = entreprise.regimeTva === "FRANCHISE_293B";
  const lignes: LigneDocumentPdf[] = doc.lines.map((l) => {
    const pu = Number(l.sell_price || l.buy_price) || 0;
    const qty = Number(l.qty) || 1;
    return {
      designation: l.label,
      quantite: qty,
      prixUnitaireHt: pu,
      tauxTva: franchise ? 0 : 20,
      totalHt: Math.round(pu * qty * 100) / 100,
    };
  });
  const totaux = totalsFromExtract(doc.extract);
  const totalHt = totaux.ht ?? lignes.reduce((s, l) => s + l.totalHt, 0);
  const totalTva = franchise ? 0 : Math.round(totalHt * TVA * 100) / 100;
  const kind = kindPdf(doc.kind);
  const numero = doc.title.match(/n[°º]\s*([A-Z0-9-]+)/i)?.[1] ?? doc.id.slice(0, 8).toUpperCase();
  return {
    kind,
    numero,
    dateEmission: new Date(doc.created_at),
    dateEcheance: kind === "facture" ? new Date(Date.now() + 30 * 86400000) : undefined,
    dureeValiditeJours: kind === "devis" || kind === "bon_commande" ? 30 : undefined,
    conditionsPaiement: kind === "facture" ? "Paiement à 30 jours." : "Acompte 30 % à la commande, solde à la livraison.",
    clientNom: doc.party_name || "Client",
    clientAdresse: doc.party_address,
    chantier: doc.chantier_name,
    lignes,
    totalHt,
    totalTva,
    totalTtc: Math.round((totalHt + totalTva) * 100) / 100,
    numeroOrigine:
      typeof doc.extract?.from_title === "string"
        ? (doc.extract.from_title.match(/n[°º]\s*([A-Z0-9-]+)/i)?.[1] ?? doc.extract.from_title)
        : undefined,
  };
}
