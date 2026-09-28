import "server-only";
import { brandLogoUrl } from "@/lib/resources/logo";

const FETCH_MS = 4_000;
const MAX_HTML = 400_000;

/** Récupère un logo fiable depuis un site (apple-touch → og:image → favicon). */
export async function resolveWebsiteLogo(website: string | null, domain: string | null): Promise<string | null> {
  const host = domain ?? hostnameOf(website);
  if (!host) return null;

  const fromSite = website ? await scrapeLogo(website.startsWith("http") ? website : `https://${host}`) : null;
  if (fromSite) return fromSite;

  // logo.dev (clé publique déjà utilisée ailleurs) — domaine seulement.
  return brandLogoUrl(host, 128);
}

async function scrapeLogo(pageUrl: string): Promise<string | null> {
  if (!isSafePublicHttpUrl(pageUrl)) return null;
  try {
    const res = await fetch(pageUrl, {
      signal: AbortSignal.timeout(FETCH_MS),
      headers: { Accept: "text/html", "User-Agent": "TARINEO-CompanyLookup/1.0" },
      redirect: "follow",
    });
    if (!res.ok) return null;
    const finalUrl = res.url;
    if (!isSafePublicHttpUrl(finalUrl)) return null;
    const html = (await res.text()).slice(0, MAX_HTML);
    const base = new URL(finalUrl);

    const apple = firstMatch(html, /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i)
      ?? firstMatch(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*apple-touch-icon[^"']*["']/i);
    const og = firstMatch(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      ?? firstMatch(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const icon = firstMatch(html, /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i)
      ?? firstMatch(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i);

    for (const candidate of [apple, preferLogoLikeOg(og), icon]) {
      const absolute = toAbsolute(candidate, base);
      if (absolute && isSafePublicHttpUrl(absolute) && looksLikeImage(absolute)) return absolute;
    }
  } catch {
    return null;
  }
  return null;
}

function preferLogoLikeOg(url: string | null) {
  if (!url) return null;
  const lower = url.toLowerCase();
  // Évite bannières / photos hero aléatoires.
  if (/(logo|brand|mark|icon|favicon)/i.test(lower)) return url;
  if (/\.(svg|png|webp)(\?|$)/i.test(lower) && !/(hero|banner|cover|photo|bg)/i.test(lower)) return url;
  return null;
}

function firstMatch(html: string, re: RegExp) {
  const m = html.match(re);
  return m?.[1]?.trim() || null;
}

function toAbsolute(href: string | null, base: URL) {
  if (!href) return null;
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function looksLikeImage(url: string) {
  return !url.startsWith("data:") && url.length < 2_000;
}

function hostnameOf(url: string | null) {
  if (!url) return null;
  try {
    return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

/** Bloque SSRF évident (localhost, IP privées, schémas non http). */
export function isSafePublicHttpUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    if (host === "localhost" || host.endsWith(".localhost") || host === "0.0.0.0") return false;
    if (host === "::1" || host.startsWith("[") ) return false;
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      const [a, b] = host.split(".").map(Number);
      if (a === 10 || a === 127 || a === 0) return false;
      if (a === 192 && b === 168) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
      if (a === 169 && b === 254) return false;
    }
    return true;
  } catch {
    return false;
  }
}
