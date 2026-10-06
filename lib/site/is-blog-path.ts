/** Routes blog publiques (index, article, hub métier). */
export function isBlogPath(pathname: string): boolean {
  return pathname === "/blog" || pathname.startsWith("/blog/");
}
