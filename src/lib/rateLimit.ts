type Entree = { count: number; resetAt: number };

const store = new Map<string, Entree>();

/**
 * Rate limit en mémoire (instance unique / dev).
 * En production multi-instances, préférer Redis ou Upstash.
 */
export function verifierRateLimit(cle: string, limite: number, fenetreMs: number): boolean {
  const maintenant = Date.now();
  const existant = store.get(cle);

  if (!existant || maintenant >= existant.resetAt) {
    store.set(cle, { count: 1, resetAt: maintenant + fenetreMs });
    return true;
  }

  if (existant.count >= limite) {
    return false;
  }

  existant.count += 1;
  return true;
}

export function ipDepuisRequete(headers: Headers): string {
  return headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? headers.get("x-real-ip") ?? "inconnu";
}
