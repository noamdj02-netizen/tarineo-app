export function normalizeChantierText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

/** Score 0–3. >= 2 = assez certain pour proposer le chantier, pas pour l’imposer. */
export function scoreChantierHint(hint: string, chantier: { name: string; address: string }) {
  const h = normalizeChantierText(hint);
  if (!h) return 0;
  const name = normalizeChantierText(chantier.name);
  const address = normalizeChantierText(chantier.address);
  if (name && h.includes(name)) return 3;
  const hintTokens = h.split(" ").filter((w) => w.length > 2);
  if (name && hintTokens.length >= 2 && h.length >= 8 && name.includes(h)) return 3;
  const nameWords = name.split(" ").filter((w) => w.length > 3);
  if (nameWords.length && nameWords.every((w) => h.includes(w))) return 2;
  const hintWords = h.split(" ").filter(Boolean);
  if (hintWords.length >= 3 && address.length > 8 && (h.includes(address) || address.includes(h))) return 2;
  if (nameWords.some((w) => h.includes(w))) return 1;
  return 0;
}

export function suggestChantierFromHint<T extends { name: string; address: string }>(
  hint: string,
  chantiers: T[],
): T | null {
  let best: T | null = null;
  let bestScore = 0;
  for (const c of chantiers) {
    const s = scoreChantierHint(hint, c);
    if (s > bestScore) {
      best = c;
      bestScore = s;
    }
  }
  return bestScore >= 2 ? best : null;
}
