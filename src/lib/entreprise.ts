// Aide pure pour l'espace "Mon entreprise" (CompanyProfile) : validation SIRET et
// libellés du régime de TVA. Volontairement sans aucun import server-only (Supabase,
// etc.) — ce module est importé depuis FormulaireEntreprise.tsx ("use client"), et un
// seul import server-only ici ferait planter le bundle navigateur avec "supabaseUrl is
// required" (process.env.SUPABASE_URL n'existe pas côté client). L'upload du logo, qui a
// besoin de Supabase, vit dans entreprise/actions.ts (déjà "use server") plutôt qu'ici.
import type { RegimeTva } from "@prisma/client";

export const LABELS_REGIME_TVA: Record<RegimeTva, string> = {
  NORMAL: "TVA classique (taux appliqué par ligne)",
  FRANCHISE_293B: "Franchise en base — TVA non applicable, art. 293 B du CGI",
};

// Mention à faire figurer sur le PDF quand la franchise en base s'applique. Le texte
// change au 1er janvier 2027 (art. L. 233-1 du CIBS remplace l'art. 293 B du CGI, avec
// tolérance d'usage de l'ancienne mention jusqu'au 30 juin 2028) — à réviser à cette
// échéance. Source : legalstart.fr/fiches-pratiques/fiscalite-entreprises/article-293b-cgi
export const MENTION_FRANCHISE_TVA = "TVA non applicable, art. 293 B du CGI";

// Validation du SIRET par clé de Luhn (14 chiffres). Ne garantit pas que le SIRET existe
// réellement (pas d'appel à l'API INSEE/Sirene en V1), seulement qu'il est bien formé.
export function siretValide(siret: string): boolean {
  const chiffres = siret.replace(/\s/g, "");
  if (!/^\d{14}$/.test(chiffres)) return false;

  let somme = 0;
  for (let i = 0; i < 14; i++) {
    let n = Number(chiffres[i]) * (i % 2 === 0 ? 1 : 2);
    if (n > 9) n -= 9;
    somme += n;
  }
  return somme % 10 === 0;
}

/** Normalise un SIRET (chiffres seuls) ou null si invalide. */
export function normaliserSiret(brut: string | null | undefined): string | null {
  if (!brut) return null;
  const chiffres = brut.replace(/\D/g, "");
  return siretValide(chiffres) ? chiffres : null;
}

export function sirenValide(siren: string): boolean {
  const chiffres = siren.replace(/\s/g, "");
  if (!/^\d{9}$/.test(chiffres)) return false;
  // Même algorithme de Luhn que le SIRET, sur 9 chiffres.
  let somme = 0;
  for (let i = 0; i < 9; i++) {
    let n = Number(chiffres[i]) * (i % 2 === 0 ? 1 : 2);
    if (n > 9) n -= 9;
    somme += n;
  }
  return somme % 10 === 0;
}

export function normaliserSiren(brut: string | null | undefined): string | null {
  if (!brut) return null;
  const chiffres = brut.replace(/\D/g, "");
  if (chiffres.length === 14 && siretValide(chiffres)) return chiffres.slice(0, 9);
  return sirenValide(chiffres) ? chiffres : null;
}

/** TVA intracommunautaire française : FR + clé (2) + SIREN (9). */
export function numeroTvaFrValide(tva: string): boolean {
  const normalise = tva.replace(/\s/g, "").toUpperCase();
  const m = /^FR([0-9A-Z]{2})(\d{9})$/.exec(normalise);
  if (!m) return false;
  const cle = m[1];
  const siren = m[2];
  if (!sirenValide(siren)) return false;
  // Clé numérique classique : (12 + 3 × (SIREN mod 97)) mod 97
  if (/^\d{2}$/.test(cle)) {
    const attendue = String((12 + 3 * (Number(siren) % 97)) % 97).padStart(2, "0");
    return cle === attendue;
  }
  // Clés alphanumériques acceptées en format seulement (rare) — on garde le motif FR+2+SIREN.
  return true;
}

export function normaliserNumeroTva(brut: string | null | undefined): string | null {
  if (!brut) return null;
  const normalise = brut.replace(/\s/g, "").toUpperCase();
  return numeroTvaFrValide(normalise) ? normalise : null;
}

/** Checksum IBAN mod 97. */
export function ibanValide(iban: string): boolean {
  const compact = iban.replace(/\s/g, "").toUpperCase();
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(compact)) return false;
  if (compact.startsWith("FR") && compact.length !== 27) return false;
  const rearrange = compact.slice(4) + compact.slice(0, 4);
  const numerique = rearrange.replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let reste = 0;
  for (const chiffre of numerique) {
    reste = (reste * 10 + Number(chiffre)) % 97;
  }
  return reste === 1;
}

export function normaliserIban(brut: string | null | undefined): string | null {
  if (!brut) return null;
  const compact = brut.replace(/\s/g, "").toUpperCase();
  return ibanValide(compact) ? compact : null;
}

/** Affiche un IBAN masqué (conserve pays + 4 derniers). */
export function masquerIban(iban: string): string {
  const compact = iban.replace(/\s/g, "").toUpperCase();
  if (compact.length < 8) return "••••";
  return `${compact.slice(0, 4)} •••• •••• ${compact.slice(-4)}`;
}

export function normaliserTelephoneFr(brut: string | null | undefined): string | null {
  if (!brut) return null;
  let digits = brut.replace(/[^\d+]/g, "");
  if (digits.startsWith("0033")) digits = `+33${digits.slice(4)}`;
  if (digits.startsWith("+33")) {
    const reste = digits.slice(3).replace(/\D/g, "");
    if (reste.length !== 9) return null;
    return `0${reste}`;
  }
  const locaux = digits.replace(/\D/g, "");
  if (!/^0[1-9]\d{8}$/.test(locaux)) return null;
  return locaux;
}

export function formaterTelephoneAffichage(tel: string): string {
  const d = tel.replace(/\D/g, "");
  if (d.length !== 10) return tel;
  return d.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
}

export function formaterSiretAffichage(siret: string): string {
  const d = siret.replace(/\D/g, "");
  if (d.length !== 14) return siret;
  return `${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6, 9)} ${d.slice(9)}`;
}

export function emailValide(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function normaliserEmail(brut: string | null | undefined): string | null {
  if (!brut) return null;
  const e = brut.trim().toLowerCase();
  return emailValide(e) ? e : null;
}

/** Couleur hex #RRGGBB. */
export function normaliserCouleurHex(brut: string | null | undefined): string | null {
  if (!brut) return null;
  const m = /^#?([0-9a-fA-F]{6})$/.exec(brut.trim());
  return m ? `#${m[1].toLowerCase()}` : null;
}
