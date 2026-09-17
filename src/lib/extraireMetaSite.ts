/** Extrait nom et logo depuis le HTML d'une page d'entreprise (Open Graph / title). */
export function extraireMetaSite(html: string, pageUrl: string): {
  nom: string | null;
  logoUrl: string | null;
} {
  const meta = (propriete: string) => {
    const m1 = html.match(
      new RegExp(`<meta[^>]+property=["']${propriete}["'][^>]+content=["']([^"']+)["']`, "i")
    );
    if (m1?.[1]) return m1[1];
    const m2 = html.match(
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${propriete}["']`, "i")
    );
    return m2?.[1] ?? null;
  };

  const nom =
    meta("og:site_name") ??
    meta("og:title") ??
    html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() ??
    null;

  const logoRelatif =
    meta("og:image") ??
    html.match(/<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i)?.[1] ??
    html.match(/<link[^>]+href=["']([^"']+)["'][^>]+rel=["']apple-touch-icon["']/i)?.[1] ??
    null;

  let logoUrl: string | null = null;
  if (logoRelatif) {
    try {
      logoUrl = new URL(logoRelatif, pageUrl).href;
    } catch {
      logoUrl = null;
    }
  }

  const nomNettoye = nom?.replace(/\s*[|\-–—].*$/, "").trim() || null;

  return { nom: nomNettoye, logoUrl };
}
