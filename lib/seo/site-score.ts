import { safeUrl } from "@/lib/projects/types";
import type { SeoCheck, SeoSnapshot } from "@/lib/projects/seo";

type PsiCategory = { score?: number | null };
type PsiJson = {
  lighthouseResult?: {
    categories?: {
      seo?: PsiCategory;
      performance?: PsiCategory;
      accessibility?: PsiCategory;
      "best-practices"?: PsiCategory;
    };
  };
  error?: { message?: string };
};

function pct(score: number | null | undefined) {
  if (typeof score !== "number" || !Number.isFinite(score)) return 0;
  return Math.max(0, Math.min(100, Math.round(score * 100)));
}

function attr(html: string, name: string) {
  const re = new RegExp(
    `<meta[^>]+(?:name|property)=["']${name}["'][^>]+content=["']([^"']*)["']`,
    "i",
  );
  const alt = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:name|property)=["']${name}["']`,
    "i",
  );
  return html.match(re)?.[1]?.trim() || html.match(alt)?.[1]?.trim() || "";
}

async function getText(url: string, ms = 8000) {
  try {
    const res = await fetch(url, {
      redirect: "follow",
      signal: AbortSignal.timeout(ms),
      headers: { "User-Agent": "NavpitSEO/1.0" },
    });
    return { ok: res.ok, status: res.status, text: await res.text() };
  } catch {
    return { ok: false, status: 0, text: "" };
  }
}

function onPageChecks(html: string, url: string, extras: { robots: boolean; sitemap: boolean }): SeoCheck[] {
  const title = html.match(/<title[^>]*>([^<]*)/i)?.[1]?.trim() ?? "";
  const desc = attr(html, "description");
  const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)?.[1] ?? "";
  const h1 = (html.match(/<h1\b/gi) ?? []).length;
  const robotsMeta = attr(html, "robots").toLowerCase();
  return [
    { id: "https", ok: url.startsWith("https://"), label: "HTTPS" },
    { id: "title", ok: title.length >= 12 && title.length <= 65, label: "Title 12–65 car." },
    { id: "desc", ok: desc.length >= 50 && desc.length <= 170, label: "Meta description" },
    { id: "h1", ok: h1 === 1, label: "Un seul H1" },
    { id: "canonical", ok: Boolean(canonical), label: "Canonical" },
    { id: "index", ok: !/noindex/.test(robotsMeta), label: "Indexable" },
    { id: "viewport", ok: Boolean(attr(html, "viewport")), label: "Viewport mobile" },
    { id: "og", ok: Boolean(attr(html, "og:title") && attr(html, "og:image")), label: "Open Graph" },
    { id: "schema", ok: /application\/ld\+json/i.test(html), label: "JSON-LD" },
    { id: "lang", ok: /<html[^>]+lang=/i.test(html), label: "Attribut lang" },
    { id: "robots", ok: extras.robots, label: "robots.txt" },
    { id: "sitemap", ok: extras.sitemap, label: "sitemap.xml" },
  ];
}

async function pagespeed(url: string): Promise<{
  seo: number;
  performance: number;
  accessibility: number;
  practices: number;
} | null> {
  const params = new URLSearchParams({ url, strategy: "mobile" });
  for (const category of ["SEO", "PERFORMANCE", "ACCESSIBILITY", "BEST_PRACTICES"]) {
    params.append("category", category);
  }
  const key = process.env.GOOGLE_PSI_API_KEY || process.env.GOOGLE_API_KEY || "";
  if (key) params.set("key", key);
  try {
    const res = await fetch(
      `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`,
      { signal: AbortSignal.timeout(50000), cache: "no-store" },
    );
    if (!res.ok) return null;
    const json = (await res.json()) as PsiJson;
    const cats = json.lighthouseResult?.categories;
    if (!cats?.seo) return null;
    return {
      seo: pct(cats.seo.score),
      performance: pct(cats.performance?.score),
      accessibility: pct(cats.accessibility?.score),
      practices: pct(cats["best-practices"]?.score),
    };
  } catch {
    return null;
  }
}

/** Score SEO du site : PageSpeed Google + checklist on-page. */
export async function scoreSite(rawUrl: string): Promise<SeoSnapshot> {
  const url = safeUrl(rawUrl);
  if (!url) throw new Error("URL du site invalide.");

  const origin = new URL(url).origin;
  const [page, robots, sitemap, psi] = await Promise.all([
    getText(url, 12000),
    getText(`${origin}/robots.txt`, 6000),
    getText(`${origin}/sitemap.xml`, 6000),
    pagespeed(url),
  ]);

  const checks = onPageChecks(page.text, url, {
    robots: robots.ok && /user-agent|sitemap/i.test(robots.text),
    sitemap: sitemap.ok && /<urlset|<sitemapindex/i.test(sitemap.text),
  });
  const pageScore = Math.round((checks.filter((c) => c.ok).length / checks.length) * 100);

  if (psi) {
    return {
      url,
      fetchedAt: new Date().toISOString(),
      source: "google",
      seo: psi.seo,
      performance: psi.performance,
      accessibility: psi.accessibility,
      practices: psi.practices,
      checks,
    };
  }

  return {
    url,
    fetchedAt: new Date().toISOString(),
    source: "page",
    seo: pageScore,
    performance: 0,
    accessibility: 0,
    practices: 0,
    checks,
  };
}
