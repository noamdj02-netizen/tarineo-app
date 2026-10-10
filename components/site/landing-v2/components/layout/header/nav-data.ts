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
          heading: "Parcours",
          items: [
            {
              label: "Comment ça marche",
              description: "Du devis scrapé à la marge protégée",
              href: "/#parcours",
            },
            {
              label: "Fonctionnalités",
              description: "Scan, alertes, devis client",
              href: "/#preuve",
            },
          ],
        },
        {
          heading: "Suivi terrain",
          items: [
            {
              label: "Hausses de prix",
              description: "Courbe sur une référence",
              href: "/#hausses",
            },
            {
              label: "Alertes",
              description: "Fil d’activités en temps réel",
              href: "/#alertes",
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
