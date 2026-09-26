export type SeoCheck = { id: string; ok: boolean; label: string };

export type SeoSnapshot = {
  url: string;
  fetchedAt: string;
  source: "google" | "page";
  seo: number;
  performance: number;
  accessibility: number;
  practices: number;
  checks: SeoCheck[];
};

export type SeoPoint = {
  at: string;
  seo: number;
  performance: number;
};

export type ProjectSeo = {
  snapshot: SeoSnapshot | null;
  history: SeoPoint[];
  gaId: string;
  gsc: string;
};

export const EMPTY_SEO: ProjectSeo = { snapshot: null, history: [], gaId: "", gsc: "" };

export function seoPoint(snap: SeoSnapshot): SeoPoint {
  return { at: snap.fetchedAt, seo: snap.seo, performance: snap.performance };
}

export function appendSeoHistory(prev: SeoPoint[], snap: SeoSnapshot | null) {
  if (!snap?.fetchedAt) return prev.slice(-8);
  const last = prev[prev.length - 1];
  if (last?.at === snap.fetchedAt) return prev.slice(-8);
  return [...prev, seoPoint(snap)].slice(-8);
}

const KEY = "__seo";

function clamp100(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  if (!Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(100, Math.round(v)));
}

export function isGaId(raw: string) {
  return /^G-[A-Z0-9]{6,14}$/i.test(raw.trim());
}

export function isGscProperty(raw: string) {
  const v = raw.trim();
  if (/^sc-domain:[a-z0-9.-]+\.[a-z]{2,}$/i.test(v)) return true;
  try {
    const url = new URL(v);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function seoFromBusiness(business: Record<string, string> | null | undefined): ProjectSeo {
  const raw = business?.[KEY];
  if (!raw) return { ...EMPTY_SEO };
  try {
    const parsed = JSON.parse(raw) as Partial<ProjectSeo>;
    const snap = parsed.snapshot;
    return {
      snapshot: snap && typeof snap === "object"
        ? {
            url: typeof snap.url === "string" ? snap.url : "",
            fetchedAt: typeof snap.fetchedAt === "string" ? snap.fetchedAt : "",
            source: snap.source === "google" ? "google" : "page",
            seo: clamp100(snap.seo),
            performance: clamp100(snap.performance),
            accessibility: clamp100(snap.accessibility),
            practices: clamp100(snap.practices),
            checks: Array.isArray(snap.checks)
              ? snap.checks
                  .filter((c): c is SeoCheck => Boolean(c && typeof c === "object"))
                  .map((c) => ({
                    id: String(c.id ?? "").slice(0, 40),
                    ok: Boolean(c.ok),
                    label: String(c.label ?? "").slice(0, 120),
                  }))
              : [],
          }
        : null,
      history: Array.isArray(parsed.history)
        ? parsed.history
            .filter((p): p is SeoPoint => Boolean(p && typeof p === "object"))
            .map((p) => ({
              at: typeof p.at === "string" ? p.at : "",
              seo: clamp100(p.seo),
              performance: clamp100(p.performance),
            }))
            .filter((p) => p.at)
            .slice(-8)
        : [],
      gaId: typeof parsed.gaId === "string" ? parsed.gaId.slice(0, 24) : "",
      gsc: typeof parsed.gsc === "string" ? parsed.gsc.slice(0, 200) : "",
    };
  } catch {
    return { ...EMPTY_SEO };
  }
}

export function mergeSeo(
  business: Record<string, string> | null | undefined,
  seo: ProjectSeo,
) {
  return { ...(business ?? {}), [KEY]: JSON.stringify(seo) };
}

export function seoTone(score: number) {
  if (score >= 90) return "ok" as const;
  if (score >= 50) return "warn" as const;
  return "alert" as const;
}

export function seoPrompt(name: string, seo: ProjectSeo) {
  const s = seo.snapshot;
  const scores = s
    ? `SEO ${s.seo}/100, vitesse ${s.performance}, accessibilité ${s.accessibility}, pratiques ${s.practices} (${s.source === "google" ? "PageSpeed Google" : "lecture de page"}).`
    : "Pas encore de score.";
  const holes = s?.checks.filter((c) => !c.ok).map((c) => c.label).join(", ");
  return `Projet ${name}. ${scores}${holes ? ` Trous : ${holes}.` : ""} ${
    seo.gaId ? `GA4 ${seo.gaId}.` : "Pas de GA4 lié."
  } Donne 3 correctifs SEO concrets, dans l’ordre, sans pavé.`;
}
