/** Limite souple par IP pour POST /api/analytics/event (processus unique). */

const WINDOW_MS = 60 * 1000;
const MAX_PER_WINDOW = 60;

const buckets = new Map<string, { start: number; count: number }>();

export function checkAnalyticsEventRateLimit(clientIp: string): boolean {
  const key = clientIp || "unknown";
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.start > WINDOW_MS) {
    b = { start: now, count: 0 };
  }
  if (b.count >= MAX_PER_WINDOW) {
    buckets.set(key, b);
    return false;
  }
  b.count += 1;
  buckets.set(key, b);
  return true;
}

export function resetAnalyticsEventRateLimitForTests() {
  buckets.clear();
}
