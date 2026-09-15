/** URL canonique du site (sitemap, Open Graph, JSON-LD). */
export function urlSite(): string {
  const brut = process.env.AUTH_URL ?? process.env.VERCEL_URL;
  if (!brut) return "http://localhost:3000";
  if (brut.startsWith("http")) return brut.replace(/\/$/, "");
  return `https://${brut.replace(/\/$/, "")}`;
}
