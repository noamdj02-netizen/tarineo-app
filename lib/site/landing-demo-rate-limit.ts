/** Rate limit léger pour l’extraction publique (coût Anthropic). */

export const LANDING_EXTRACT_RL_COOKIE = "tarineo_landing_extract_rl";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_EXTRACTS_PER_WINDOW = 5;

type Window = { start: number; count: number };

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

export function checkExtractRateLimit(cookieHeader: string | null): {
  allowed: boolean;
  setCookie?: string;
} {
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
