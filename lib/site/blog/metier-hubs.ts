import type { BlogMetierSlug } from "@/lib/site/blog/types";

export type BlogMetierHub = {
  slug: BlogMetierSlug;
  label: string;
  title: string;
  description: string;
  intro: string;
};

export const BLOG_METIER_HUBS: BlogMetierHub[] = [
  {
    slug: "plombier",
    label: "Plombier",
    title: "Plombier : devis fournisseurs, marge et chantiers",
    description:
      "Guides pour plombiers : lire les devis négoce, suivre les hausses sur sanitaire et chauffage, protéger la marge sur chaque chantier.",
    intro:
      "Rénovation SDB, chauffage, dépannage : les plombiers jonglent avec plusieurs PDF fournisseurs par dossier. Ces articles couvrent la comparaison de prix, le lien devis achat → devis client et l’administratif terrain.",
  },
  {
    slug: "electricien",
    label: "Électricien",
    title: "Électricien : prix matériel, devis et marge",
    description:
      "Ressources pour électriciens : suivre les tarifs grossistes, sécuriser les devis chantier et limiter les écarts entre commande et facture.",
    intro:
      "Câbles, tableaux, gaines : les catalogues bougent souvent. Retrouvez ici des pistes concrètes pour analyser vos devis fournisseur et garder une marge lisible par chantier.",
  },
  {
    slug: "peintre",
    label: "Peintre",
    title: "Peintre en bâtiment : achats, devis client et marge",
    description:
      "Peintres du bâtiment : structurer consommables et peinture pro, éviter les oublis dans le devis client après le devis dépôt.",
    intro:
      "Petits montants qui s’additionnent, reprises non chiffrées : le blog peinture se concentre sur le suivi fournisseur et la transformation en devis client rentable.",
  },
  {
    slug: "macon",
    label: "Maçon",
    title: "Maçon : gros œuvre, volume de lignes et entreprise",
    description:
      "Maçonnerie et gros œuvre : devis volumineux, achats urgents sur chantier et visibilité marge pour les TPE.",
    intro:
      "Béton, parpaings, location : quand le devis fait plusieurs pages, l’extraction et le classement par chantier deviennent indispensables.",
  },
  {
    slug: "carreleur",
    label: "Carreleur",
    title: "Carreleur : du showroom au devis client",
    description:
      "Carreleurs : transformer un devis fournisseur en devis client sans perdre colle, chutes et pose dans la marge.",
    intro:
      "Showrooms et formats PDF variés : ces contenus aident à repartir des lignes fournisseur avec un coefficient de pose maîtrisé.",
  },
  {
    slug: "menuisier",
    label: "Menuisier",
    title: "Menuisier : devis atelier, pose et dossier client",
    description:
      "Menuiserie fenêtres et bois : suivre devis fabricant, devis pose et relances sur un même dossier.",
    intro:
      "Options, vitrages, coloris : un fil documentaire par chantier limite les versions contradictoires entre atelier et client final.",
  },
  {
    slug: "couvreur",
    label: "Couvreur",
    title: "Couvreur : toiture, urgence et devis fournisseur",
    description:
      "Couvreurs : devis toiture et zinguerie, matériaux sensibles aux délais, marge après lecture des offres négoce.",
    intro:
      "Sinistres et intempéries imposent la réactivité ; garder une trace du devis du jour reste la base pour justifier le prix client.",
  },
  {
    slug: "chauffagiste",
    label: "Chauffagiste",
    title: "Chauffagiste : PAC, chaudières et hausses sur devis",
    description:
      "Chauffagistes : analyser les devis longs (PAC, accessoires) et limiter l’écart entre devis fournisseur et facture après pose.",
    intro:
      "Lots techniques, fluides, régulation : séparer matériel et main d’œuvre dans le suivi clarifie la marge sur chaque installation.",
  },
  {
    slug: "serrurier",
    label: "Serrurier",
    title: "Serrurier : devis, sécurité et marge sur intervention",
    description:
      "Serruriers : chiffrer portes, blindages et dépannages, lire les devis fournisseurs et garder une marge sur les urgences.",
    intro:
      "Dépannage, pose de serrures multipoints, blindage : les devis arrivent vite et les pièces varient selon les marques. Ces ressources couvrent le suivi fournisseur et le devis client sans ressaisie.",
  },
  {
    slug: "entreprise",
    label: "Entreprise & chantier",
    title: "Entreprise artisanale : chantiers et administratif",
    description:
      "TPE du bâtiment : facturation électronique, dossiers chantier, marge et relances — sans ERP lourd.",
    intro:
      "Réforme e-facture, devis fournisseur → facture client, exports compta : guides pour dirigeants qui veulent des documents cohérents avant l’envoi réglementaire.",
  },
];

export function isBlogMetierSlug(value: string): value is BlogMetierSlug {
  return BLOG_METIER_HUBS.some((hub) => hub.slug === value);
}

export function getBlogMetierHub(slug: BlogMetierSlug): BlogMetierHub | undefined {
  return BLOG_METIER_HUBS.find((hub) => hub.slug === slug);
}
