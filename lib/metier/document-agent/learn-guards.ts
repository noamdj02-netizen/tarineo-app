import type { StructuralHintDelta } from "@/lib/metier/document-agent/types";

const PRICE_LIKE = /\d{1,3}(?:[.,]\d{2,3}){1,2}/;
const EMAIL = /@[\w.-]+\.\w+/;
const PHONE = /(?:\+33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/;
/** Vérifie qu’une contribution ne contient pas de PII / contenu métier copié. */
export function isSafeHintDelta(delta: StructuralHintDelta): boolean {
  const raw = JSON.stringify(delta);
  if (raw.length > 800) return false;
  if (EMAIL.test(raw) || PHONE.test(raw)) return false;
  if (PRICE_LIKE.test(raw)) return false;
  // Pas de libellés produits : champs booléens / entiers uniquement
  for (const v of Object.values(delta) as Array<boolean | number | undefined>) {
    if (typeof v === "number" && !Number.isInteger(v)) return false;
  }
  const hasSignal =
    delta.kind_corrected ||
    delta.direction_corrected ||
    delta.party_kind_corrected ||
    (delta.line_count_delta != null && delta.line_count_delta !== 0) ||
    delta.totals_ht_mismatch;
  return Boolean(hasSignal);
}

export function hintDeltaHash(delta: StructuralHintDelta): string {
  const keys = Object.keys(delta).sort();
  const norm: Record<string, unknown> = {};
  for (const k of keys) {
    const v = delta[k as keyof StructuralHintDelta];
    if (v !== undefined && v !== false && v !== 0) norm[k] = v;
  }
  return JSON.stringify(norm);
}
