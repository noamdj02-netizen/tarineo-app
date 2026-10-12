import { clientIpFromHeaders } from "@/lib/site/landing-demo-rate-limit";

const WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_IP = 6;

type Window = { start: number; count: number };
const buckets = new Map<string, Window>();

export function checkArtisanContactRateLimit(headers: Headers): boolean {
  const key = clientIpFromHeaders(headers);
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.start > WINDOW_MS) {
    b = { start: now, count: 0 };
  }
  if (b.count >= MAX_PER_IP) {
    buckets.set(key, b);
    return false;
  }
  b.count += 1;
  buckets.set(key, b);
  return true;
}
