import { timingSafeEqual } from "crypto";

/** CRON_SECRET obligatoire. Comparaison en temps constant. */
export function cronBearerAuthorized(header: string | null, secret: string | undefined) {
  if (!secret) return false;
  if (!header || !header.startsWith("Bearer ")) return false;
  const token = header.slice("Bearer ".length);
  const a = Buffer.from(token);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
