import type { ChantierCard, Party } from "@/lib/metier/types";

export type MatchCandidate<T> = { item: T; score: number; label: string };

function norm(s: string) {
  return s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function scoreName(query: string, name: string): number {
  const q = norm(query);
  const n = norm(name);
  if (!q || !n) return 0;
  if (q === n) return 100;
  if (n.startsWith(q) || q.startsWith(n)) return 85;
  if (n.includes(q) || q.includes(n)) return 70;
  const qTokens = q.split(/\s+/).filter(Boolean);
  const nTokens = n.split(/\s+/).filter(Boolean);
  const hits = qTokens.filter((t) => n.includes(t)).length;
  if (hits > 0) return Math.min(65, Math.round((hits / qTokens.length) * 60));
  // Proximité orthographique courte (Dupont / Dupond)
  for (const qt of qTokens) {
    for (const nt of nTokens) {
      if (qt.length >= 4 && nt.length >= 4 && qt.slice(0, 4) === nt.slice(0, 4)) {
        const dist = levenshtein(qt, nt);
        if (dist <= 2) return 78;
      }
    }
  }
  return 0;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

/**
 * Résolution client : exact > candidats > aucun.
 * Ne choisit jamais silencieusement un mauvais client.
 */
export function matchClients(
  query: string | null | undefined,
  clients: Party[],
): { exact: Party | null; candidates: MatchCandidate<Party>[]; ambiguous: boolean } {
  const q = query?.trim();
  if (!q) return { exact: null, candidates: [], ambiguous: false };

  const scored = clients
    .map((c) => ({ item: c, score: scoreName(q, c.name), label: c.name }))
    .filter((c) => c.score >= 50)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { exact: null, candidates: [], ambiguous: false };
  // Deux scores proches → ambigu (prioritaire sur l’exact fort)
  if (scored.length > 1 && scored[1].score >= 70 && scored[0].score - scored[1].score < 25) {
    return { exact: null, candidates: scored.slice(0, 5), ambiguous: true };
  }
  if (scored[0].score >= 95 && (scored.length === 1 || scored[1].score < 70)) {
    return { exact: scored[0].item, candidates: scored.slice(0, 5), ambiguous: false };
  }
  if (scored.length === 1 && scored[0].score >= 70) {
    return { exact: scored[0].item, candidates: scored, ambiguous: false };
  }
  if (scored[0].score >= 85) {
    return { exact: scored[0].item, candidates: scored.slice(0, 5), ambiguous: false };
  }
  return { exact: null, candidates: scored.slice(0, 5), ambiguous: scored.length > 1 };
}

/**
 * Résolution chantier : exact > candidats > aucun.
 */
export function matchChantiers(
  query: string | null | undefined,
  chantiers: ChantierCard[],
  clientId?: string | null,
): { exact: ChantierCard | null; candidates: MatchCandidate<ChantierCard>[]; ambiguous: boolean } {
  const q = query?.trim();
  const pool = clientId ? chantiers.filter((c) => c.client_id === clientId) : chantiers;
  if (!q) {
    if (clientId) {
      const forClient = pool;
      if (forClient.length === 1) return { exact: forClient[0], candidates: [], ambiguous: false };
      if (forClient.length > 1) {
        return {
          exact: null,
          candidates: forClient.slice(0, 5).map((c) => ({
            item: c,
            score: 60,
            label: c.name,
          })),
          ambiguous: true,
        };
      }
    }
    return { exact: null, candidates: [], ambiguous: false };
  }

  const scored = pool
    .map((c) => {
      const byName = scoreName(q, c.name);
      const byClient = c.client_name ? scoreName(q, c.client_name) : 0;
      const byAddr = c.address ? scoreName(q, c.address) : 0;
      const score = Math.max(byName, byClient * 0.9, byAddr * 0.7);
      return {
        item: c,
        score,
        label: c.client_name ? `${c.name} · ${c.client_name}` : c.name,
      };
    })
    .filter((c) => c.score >= 50)
    .sort((a, b) => b.score - a.score);

  if (scored.length === 0) return { exact: null, candidates: [], ambiguous: false };
  // Deux scores proches → ambigu (prioritaire sur l’exact fort)
  if (scored.length > 1 && scored[1].score >= 70 && scored[0].score - scored[1].score < 25) {
    return { exact: null, candidates: scored.slice(0, 5), ambiguous: true };
  }
  if (scored[0].score >= 95 && (scored.length === 1 || scored[1].score < 70)) {
    return { exact: scored[0].item, candidates: scored.slice(0, 5), ambiguous: false };
  }
  if (scored.length === 1 && scored[0].score >= 70) {
    return { exact: scored[0].item, candidates: scored, ambiguous: false };
  }
  if (scored[0].score >= 85) {
    return { exact: scored[0].item, candidates: scored.slice(0, 5), ambiguous: false };
  }
  return { exact: null, candidates: scored.slice(0, 5), ambiguous: scored.length > 1 };
}
