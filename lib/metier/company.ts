import type { RegimeTva } from "@/lib/metier/pdf/mentions";

export type CompanyProfile = {
  raison_sociale: string;
  siret: string;
  forme_juridique: string;
  adresse_rue: string;
  adresse_code_postal: string;
  adresse_ville: string;
  telephone: string;
  email_contact: string;
  regime_tva: RegimeTva;
  registre_immatriculation: string;
  assurance_nom: string;
  assurance_adresse: string;
  assurance_numero_contrat: string;
  assurance_activites_garanties: string;
  assurance_zone_geographique: string;
  logo_path: string;
  marge_par_defaut_pct: number;
};

export const LABELS_REGIME_TVA: Record<RegimeTva, string> = {
  NORMAL: "TVA classique (20 % par ligne)",
  FRANCHISE_293B: "Franchise en base — TVA non applicable, art. 293 B du CGI",
};

/**
 * Valide un SIRET (14 chiffres) via Luhn depuis la droite.
 * Important : la parité dépend de la longueur — un algo calqué sur le SIREN
 * (9 chiffres) rejette une grande partie des SIRET officiels (ex. API gouv).
 * Exception La Poste (356000000…) : somme simple des chiffres % 5 === 0.
 */
export function siretValide(siret: string) {
  const chiffres = siret.replace(/\s/g, "");
  if (!/^\d{14}$/.test(chiffres)) return false;
  // Établissements La Poste : règle spécifique INSEE
  if (chiffres.startsWith("356000000")) {
    let somme = 0;
    for (const c of chiffres) somme += Number(c);
    return somme % 5 === 0;
  }
  let somme = 0;
  for (let i = 0; i < 14; i++) {
    // Depuis la droite : le chiffre des unités (index 13) n’est pas doublé.
    const fromRight = 13 - i;
    let n = Number(chiffres[i]) * (fromRight % 2 === 0 ? 1 : 2);
    if (n > 9) n -= 9;
    somme += n;
  }
  return somme % 10 === 0;
}

export function emptyCompany(email = ""): CompanyProfile {
  return {
    raison_sociale: "",
    siret: "",
    forme_juridique: "",
    adresse_rue: "",
    adresse_code_postal: "",
    adresse_ville: "",
    telephone: "",
    email_contact: email,
    regime_tva: "FRANCHISE_293B",
    registre_immatriculation: "",
    assurance_nom: "",
    assurance_adresse: "",
    assurance_numero_contrat: "",
    assurance_activites_garanties: "",
    assurance_zone_geographique: "",
    logo_path: "",
    marge_par_defaut_pct: 35,
  };
}
