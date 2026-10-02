import { normalizeName } from "@/lib/company/parse-query";
import type { CompanyLookupResult } from "@/lib/company/types";

/** Score interne 0–100 (non présenté comme probabilité IA). */
export function scoreMatch(
  company: CompanyLookupResult,
  nameForMatch: string,
  cityHint: string | null,
  postalHint: string | null,
  digits: string | null,
): number {
  let score = 0;
  if (digits) {
    if (company.siret === digits) return 100;
    if (company.siren === digits) return 95;
  }
  if (!nameForMatch) return score;

  const names = [company.legalName, company.name, company.tradeName]
    .filter(Boolean)
    .map((n) => normalizeName(n!));

  if (names.some((n) => n === nameForMatch)) score += 50;
  else if (names.some((n) => n.startsWith(nameForMatch) || nameForMatch.startsWith(n))) score += 35;
  else if (names.some((n) => n.includes(nameForMatch) || nameForMatch.includes(n))) score += 25;
  else if (names.some((n) => tokenOverlap(n, nameForMatch) >= 0.6)) score += 18;

  if (cityHint && company.city) {
    const c = normalizeName(company.city);
    const h = normalizeName(cityHint);
    if (c === h || c.includes(h) || h.includes(c)) score += 15;
  }
  if (postalHint && company.postalCode === postalHint) score += 15;
  if (company.active === true) score += 5;
  if (company.active === false) score -= 10;
  if (company.siretValid) score += 5;

  return Math.max(0, Math.min(100, score));
}

function tokenOverlap(a: string, b: string) {
  const ta = new Set(a.split(" ").filter((t) => t.length > 1));
  const tb = b.split(" ").filter((t) => t.length > 1);
  if (!tb.length) return 0;
  let hit = 0;
  for (const t of tb) if (ta.has(t)) hit++;
  return hit / tb.length;
}
