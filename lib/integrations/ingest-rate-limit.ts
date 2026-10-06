/** Limite souple par utilisateur (processus unique ; sur serverless, préférer Redis plus tard). */

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_WINDOW = 40;

const buckets = new Map<string, { start: number; count: number }>();

export function checkIngestRateLimit(userId: string): boolean {
  const now = Date.now();
  let b = buckets.get(userId);
  if (!b || now - b.start > WINDOW_MS) {
    b = { start: now, count: 0 };
  }
  if (b.count >= MAX_PER_WINDOW) {
    buckets.set(userId, b);
    return false;
  }
  b.count += 1;
  buckets.set(userId, b);
  return true;
}

export function resetIngestRateLimitForTests() {
  buckets.clear();
}
