import "server-only";
import { BRAND } from "@/lib/brand";
import { getDb } from "@/lib/db";
import { getCompanyProfile } from "@/lib/metier/queries";
import type { EntrepriseInfoPdf, LigneDocumentPdf } from "@/lib/metier/pdf/pdf-clients";
import { genererPdfPiece, type PiecePdfKind } from "@/lib/metier/pdf/piece-pdf";
import { totalsFromExtract, type DocumentCard } from "@/lib/metier/types";

const TVA = 0.2;

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

async function entrepriseFromProfile(email?: string | null): Promise<EntrepriseInfoPdf> {
  const base = entrepriseDefaut(email);
  const p = await getCompanyProfile();
  if (!p?.raison_sociale) return base;
  let logoDataUrl: string | null = null;
  const db = await getDb();
  if (db && p.logo_path) {
    const { data } = await db.supabase.storage.from("documents").download(p.logo_path);
    if (data) {
      const buf = Buffer.from(await data.arrayBuffer());
      const mime = p.logo_path.endsWith(".png") ? "image/png" : p.logo_path.endsWith(".webp") ? "image/webp" : "image/jpeg";
      logoDataUrl = `data:${mime};base64,${buf.toString("base64")}`;
    }
  }
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
    logoDataUrl,
  };
}

function kindPdf(kind: DocumentCard["kind"]): PiecePdfKind {
  if (kind === "facture") return "facture";
  if (kind === "bon_commande") return "bon_commande";
  if (kind === "bon_enlevement") return "bon_enlevement";
  return "devis";
}

export async function pdfFromDocument(doc: DocumentCard, email?: string | null) {
  const entreprise = await entrepriseFromProfile(email);
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
  const numero = doc.title.match(/n[°º]\s*([A-Z0-9-]+)/i)?.[1] ?? doc.id.slice(0, 8).toUpperCase();
  const kind = kindPdf(doc.kind);
  const buffer = await genererPdfPiece(entreprise, {
    kind,
    numero,
    dateEmission: new Date(doc.created_at),
    dateEcheance: kind === "facture" ? new Date(Date.now() + 30 * 86400000) : undefined,
    dureeValiditeJours: kind === "devis" || kind === "bon_commande" ? 30 : undefined,
    conditionsPaiement: kind === "facture" ? "Paiement à 30 jours." : "Acompte 30 % à la commande, solde à la livraison.",
    clientNom: doc.party_name || "Client",
    clientAdresse: null,
    chantier: doc.chantier_name,
    lignes,
    totalHt,
    totalTva,
    totalTtc: Math.round((totalHt + totalTva) * 100) / 100,
  });
  const slug = doc.title.replace(/[^\wÀ-ÿ -]+/g, "").trim() || "document";
  return { buffer, filename: `${slug}.pdf` };
}
