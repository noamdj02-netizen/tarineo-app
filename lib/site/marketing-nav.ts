/** Nav marketing partagée — landing Hero + pages site (légal, prix, avis, blog). */

export type MarketingNavItem = {
  label: string;
  href: string;
  /** Préfixe de pathname pour l’état actif hors landing (ex. `/blog`). */
  match?: string;
};

export const MARKETING_NAV_LINKS: MarketingNavItem[] = [
  { label: "Accueil", href: "/#top", match: "/" },
  { label: "Fonctionnalités", href: "/#fonctionnalites" },
  { label: "Terrain", href: "/#terrain" },
  { label: "Tarifs", href: "/#tarifs", match: "/prix" },
  { label: "Blog", href: "/blog", match: "/blog" },
];

export function marketingNavItems(pathname: string): Array<MarketingNavItem & { active?: boolean }> {
  return MARKETING_NAV_LINKS.map((item) => {
    if (!item.match) return { ...item, active: false };
    if (item.match === "/") {
      return { ...item, active: pathname === "/" };
    }
    return { ...item, active: pathname === item.match || pathname.startsWith(`${item.match}/`) };
  });
}
