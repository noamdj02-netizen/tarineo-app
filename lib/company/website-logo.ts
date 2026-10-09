import "server-only";

const FETCH_MS = 4_000;
const MAX_HTML = 400_000;

type LogoHints = {
  legalName?: string | null;
  tradeName?: string | null;
};

/** Récupère un logo fiable : scrape site → logo.dev (domaine) → guess domaine marque. */
export async function resolveWebsiteLogo(
  website: string | null,
  domain: string | null,
  hints?: LogoHints,
): Promise<string | null> {
  const host = domain ?? hostnameOf(website);
  if (host) {
    const fromSite = website
      ? await scrapeLogo(website.startsWith("http") ? website : `https://${host}`)
      : await scrapeLogo(`https://${host}`);
    if (fromSite) return fromSite;
    const fromLogoDev = logoDevUrl(host);
    if (fromLogoDev) return fromLogoDev;
  }

  // Sans site fourni : tenter logo.dev sur un domaine probable (slug.fr / .com).
  for (const guess of guessDomains(hints?.tradeName, hints?.legalName)) {
    const url = logoDevUrl(guess);
    if (url) return url;
  }
  return null;
}

function logoDevUrl(host: string) {
  const token = process.env.NEXT_PUBLIC_LOGO_DEV_TOKEN?.trim();
  if (!token) return null;
  return `https://img.logo.dev/${host}?token=${token}&size=128&format=png&retina=true`;
}

/** Domaines probables à partir du nom commercial / raison sociale. */
function guessDomains(...names: (string | null | undefined)[]) {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const name of names) {
    const slug = slugifyBrand(name);
    if (!slug || slug.length < 3) continue;
    for (const tld of ["fr", "com"]) {
      const host = `${slug}.${tld}`;
      if (seen.has(host)) continue;
      seen.add(host);
      out.push(host);
    }
  }
  return out.slice(0, 4);
}

function slugifyBrand(value: string | null | undefined) {
  if (!value) return null;
  const n = value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .replace(/\b(sarl|sas|sasu|eurl|sa|sci|snc|ei|sarl|ste|societe|société)\b/g, " ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-+/g, "-");
  return n || null;
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

    const apple =
      firstMatch(html, /<link[^>]+rel=["'][^"']*apple-touch-icon[^"']*["'][^>]+href=["']([^"']+)["']/i) ??
      firstMatch(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'][^"']*apple-touch-icon[^"']*["']/i);
    const og =
      firstMatch(html, /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ??
      firstMatch(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    const icon =
      firstMatch(html, /<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i) ??
      firstMatch(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["'](?:shortcut )?icon["']/i);

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
    if (host === "::1" || host.startsWith("[")) return false;
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
