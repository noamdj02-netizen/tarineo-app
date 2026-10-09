/** Liens landing : ancres depuis `/`, chemins absolus depuis les autres pages site. */
export function landingNavHref(href: string, pathname: string): string {
  if (!href.startsWith("#")) return href;
  if (pathname === "/") return href;
  return `/${href}`;
}

export function isBlogRoute(pathname: string): boolean {
  return pathname === "/blog" || pathname.startsWith("/blog/");
}
