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

/** Nav desktop Tarineo — mega menus (tokens landing). */
export const LANDING_NAV_LINKS: NavLink[] = [
  {
    label: "Produit",
    menu: {
      id: "produit",
      columns: [
        {
          heading: "Produit",
          items: [
            {
              label: "Fonctionnalités",
              description: "Copilote, chantiers, alertes",
              href: "/#fonctionnalites",
            },
            {
              label: "Film",
              description: "Voir Tarineo en action",
              href: "/#film",
            },
            {
              label: "Relances",
              description: "Fournisseurs & clients",
              href: "/#relances",
            },
          ],
        },
        {
          heading: "Chantiers",
          accent: true,
          items: [
            {
              label: "Fiches chantier",
              description: "Aperçu produit",
              href: "/#produit",
            },
          ],
        },
      ],
    },
  },
  { label: "Tarifs", href: "/#tarifs" },
  { label: "FAQ", href: "/#faq" },
  { label: "Blog", href: "/blog" },
];
