export type NavItem = {
  label: string;
  description?: string;
  href?: string;
};

export type NavColumn = {
  heading: string;
  items: NavItem[];
  accent?: boolean;
};

export type NavMenu = {
  id: string;
  columns: NavColumn[];
};

export type NavLink = {
  label: string;
  href?: string;
  menu?: NavMenu;
};

/** Nav desktop Tarineo — alignée Hero / marketing-nav (liens plats). */
export const LANDING_NAV_LINKS: NavLink[] = [
  { label: "Accueil", href: "/#top" },
  { label: "Fonctionnalités", href: "/#fonctionnalites" },
  { label: "Produit", href: "/#produit" },
  { label: "Tarifs", href: "/#tarifs" },
  { label: "Blog", href: "/blog" },
];
