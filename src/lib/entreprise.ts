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
