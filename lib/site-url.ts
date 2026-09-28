import { BRAND } from "@/lib/brand";
import { isDeployedRuntime } from "@/lib/runtime-config";

const APP_CANONICAL = "https://app.tarineo.com";

/** URL publique canonique (sans slash final). Jamais localhost en déploiement. */
export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    const cleaned = fromEnv.replace(/\/$/, "");
    if (isDeployedRuntime() && /localhost|127\.0\.0\.1/i.test(cleaned)) {
      console.error("[config] NEXT_PUBLIC_APP_URL localhost ignoré");
      if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
      return APP_CANONICAL;
    }
    if (/navpit/i.test(cleaned)) {
      console.error("[config] NEXT_PUBLIC_APP_URL Navpit ignoré");
      return APP_CANONICAL;
    }
    return cleaned;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (isDeployedRuntime()) return APP_CANONICAL;
  return BRAND.siteUrl;
}
