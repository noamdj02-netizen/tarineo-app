/** Rate limit extraction publique (coût Anthropic) : cookie + bucket IP en mémoire. */

export const LANDING_EXTRACT_RL_COOKIE = "tarineo_landing_extract_rl";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_EXTRACTS_PER_WINDOW = 5;
/** Limite IP plus stricte que le cookie (contournement cookie → encore borné). */
const MAX_EXTRACTS_PER_IP_WINDOW = 8;

type Window = { start: number; count: number };

const ipBuckets = new Map<string, Window>();

function parseCookie(raw: string | null): Window | null {
  if (!raw) return null;
  try {
    const j = JSON.parse(raw) as Window;
    if (typeof j.start === "number" && typeof j.count === "number") return j;
  } catch {
    /* ignore */
  }
  return null;
}

function bumpBucket(map: Map<string, Window>, key: string, max: number): boolean {
  const now = Date.now();
  let b = map.get(key);
  if (!b || now - b.start > WINDOW_MS) {
    b = { start: now, count: 0 };
  }
  if (b.count >= max) {
    map.set(key, b);
    return false;
  }
  b.count += 1;
  map.set(key, b);
  return true;
}

/** Première IP utile depuis les en-têtes proxy (sinon "unknown"). */
export function clientIpFromHeaders(headers: Headers | { get(name: string): string | null }): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first.slice(0, 64);
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real.slice(0, 64);
  return "unknown";
}

export function checkExtractRateLimit(
  cookieHeader: string | null,
  clientIp = "unknown",
): {
  allowed: boolean;
  setCookie?: string;
} {
  if (!bumpBucket(ipBuckets, `ip:${clientIp || "unknown"}`, MAX_EXTRACTS_PER_IP_WINDOW)) {
    return { allowed: false };
  }

  const match = cookieHeader?.match(new RegExp(`${LANDING_EXTRACT_RL_COOKIE}=([^;]+)`));
  const raw = match?.[1] ? decodeURIComponent(match[1]) : null;
  const now = Date.now();
  let window = parseCookie(raw);
  if (!window || now - window.start > WINDOW_MS) {
    window = { start: now, count: 0 };
  }
  if (window.count >= MAX_EXTRACTS_PER_WINDOW) {
    return { allowed: false };
  }
  window.count += 1;
  const payload = encodeURIComponent(JSON.stringify(window));
  const setCookie = `${LANDING_EXTRACT_RL_COOKIE}=${payload}; Path=/; Max-Age=${Math.ceil(WINDOW_MS / 1000)}; SameSite=Lax; HttpOnly`;
  return { allowed: true, setCookie };
}

export function resetLandingExtractRateLimitForTests() {
  ipBuckets.clear();
}
