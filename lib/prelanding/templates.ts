/**
 * Bibliothèque des pre-landings : des structures complètes de landing page.
 * Un thème (onglet Thèmes) = le style visuel ; une pre-landing = l'ordre et le rôle des sections.
 * L'aperçu de chaque template est un composant React (components/prelanding/previews), clé = `id`.
 */

export const CATEGORIES = ["SaaS", "AI", "DevTool", "B2B", "Agency", "Portfolio"] as const;
export const STYLES = [
  "Minimal",
  "Dark",
  "Editorial",
  "Bento",
  "Product-first",
  "Animated",
  "Bold",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Style = (typeof STYLES)[number];

export type SectionKind =
  | "navbar"
  | "hero"
  | "social-proof"
  | "product"
  | "features"
  | "bento"
  | "stats"
  | "how-it-works"
  | "code"
  | "story"
  | "testimonials"
  | "pricing"
  | "faq"
  | "cta"
  | "footer";

export type TemplateSection = {
  kind: SectionKind;
  /** consigne courte pour écrire la section (reprise dans les tâches du projet) */
  brief: string;
};

export type PreLandingTemplate = {
  id: string;
  number: string;
  name: string;
  description: string;
  categories: Category[];
  styles: Style[];
  tags: string[];
  /** thème de l'onglet Thèmes qui va le mieux avec cette structure */
  theme: string;
  sections: TemplateSection[];
};

export const SECTION_LABELS: Record<SectionKind, string> = {
  navbar: "Navbar",
  hero: "Hero",
  "social-proof": "Social proof",
  product: "Product showcase",
  features: "Features",
  bento: "Bento grid",
  stats: "Stats",
  "how-it-works": "How it works",
  code: "Code snippet",
  story: "Story",
  testimonials: "Testimonials",
  pricing: "Pricing",
  faq: "FAQ",
  cta: "CTA",
  footer: "Footer",
};

const s = (kind: SectionKind, brief: string): TemplateSection => ({ kind, brief });

export const PRE_LANDING_TEMPLATES: PreLandingTemplate[] = [
  {
    id: "launchpad",
    number: "01",
    name: "Launchpad",
    description: "Clean SaaS launch page",
    categories: ["SaaS", "B2B"],
    styles: ["Minimal"],
    tags: ["SaaS", "Minimal", "Conversion"],
    theme: "chantier",
    sections: [
      s("navbar", "logo, 3 liens, un bouton CTA"),
      s("hero", "titre = le résultat promis, sous-titre, 2 CTA, « sans carte bancaire »"),
      s("social-proof", "logos clients ou intégrations réelles"),
      s("product", "vraie capture de l'app dans une fenêtre"),
      s("features", "3 bénéfices, une icône chacun"),
      s("testimonials", "3 vrais témoignages avec prénom et métier"),
      s("pricing", "3 offres, celle du milieu mise en avant"),
      s("faq", "5 vraies objections"),
      s("cta", "répéter la promesse et le CTA"),
    ],
  },
  {
    id: "linear",
    number: "02",
    name: "Linear",
    description: "Ultra minimal, type-driven",
    categories: ["SaaS", "DevTool"],
    styles: ["Minimal"],
    tags: ["SaaS", "Minimal", "Typography"],
    theme: "papier",
    sections: [
      s("navbar", "logo texte, liens discrets"),
      s("hero", "titre énorme sur 2 lignes, beaucoup de vide"),
      s("product", "liste produit en bordures fines"),
      s("features", "3 principes numérotés 01 / 02 / 03"),
      s("testimonials", "une seule citation, grande"),
      s("pricing", "tableau sobre en lignes"),
      s("footer", "une ligne de liens"),
    ],
  },
  {
    id: "dark-terminal",
    number: "03",
    name: "Dark Terminal",
    description: "Developer tool, terminal-first",
    categories: ["DevTool"],
    styles: ["Dark"],
    tags: ["DevTool", "Dark", "Code"],
    theme: "nuit",
    sections: [
      s("navbar", "logo mono, docs, GitHub"),
      s("hero", "commande d'install copiable + terminal animé"),
      s("code", "exemple de code réel en 10 lignes"),
      s("features", "grille de fonctions techniques"),
      s("stats", "chiffres de performance mesurés"),
      s("cta", "commande d'install à copier"),
      s("footer", "liens docs, changelog, statut"),
    ],
  },
  {
    id: "editorial",
    number: "04",
    name: "Editorial",
    description: "Premium magazine layout",
    categories: ["Agency", "Portfolio"],
    styles: ["Editorial"],
    tags: ["Agency", "Editorial", "Serif"],
    theme: "atelier",
    sections: [
      s("navbar", "nom du studio, index, contact"),
      s("hero", "titre serif géant, mise en page asymétrique, grande image"),
      s("story", "texte d'intro en colonnes"),
      s("product", "projets en grandes images"),
      s("testimonials", "citation client en pull quote"),
      s("cta", "prise de contact"),
      s("footer", "adresse, réseaux"),
    ],
  },
  {
    id: "bento",
    number: "05",
    name: "Bento",
    description: "Feature grid with stats",
    categories: ["SaaS", "B2B"],
    styles: ["Bento", "Bold"],
    tags: ["SaaS", "Bento", "Stats"],
    theme: "papier",
    sections: [
      s("navbar", "logo, liens, CTA"),
      s("hero", "titre énorme centré, un CTA"),
      s("bento", "grille de cartes de tailles différentes : fonction star en grand"),
      s("stats", "3 chiffres réels"),
      s("product", "aperçu produit"),
      s("pricing", "2 offres"),
      s("cta", "bandeau final"),
    ],
  },
  {
    id: "orbit",
    number: "06",
    name: "Orbit",
    description: "AI product at the center",
    categories: ["AI", "SaaS"],
    styles: ["Animated"],
    tags: ["AI", "Animated", "Futuristic"],
    theme: "aurora",
    sections: [
      s("navbar", "logo, liens, CTA"),
      s("hero", "produit au centre, fonctions en orbite autour"),
      s("social-proof", "logos ou modèles compatibles"),
      s("how-it-works", "3 étapes : demande, l'IA travaille, résultat"),
      s("features", "cas d'usage concrets"),
      s("faq", "données, confidentialité, prix"),
      s("cta", "essai gratuit"),
    ],
  },
  {
    id: "split",
    number: "07",
    name: "Split",
    description: "Two columns, one clear CTA",
    categories: ["B2B", "SaaS"],
    styles: ["Minimal", "Bold"],
    tags: ["B2B", "Conversion", "Split"],
    theme: "chantier",
    sections: [
      s("navbar", "logo seul + connexion : zéro distraction"),
      s("hero", "texte à gauche, produit à droite, champ email + CTA"),
      s("social-proof", "note et logos sous le formulaire"),
      s("how-it-works", "3 étapes"),
      s("testimonials", "un témoignage chiffré"),
      s("cta", "même CTA que le hero"),
    ],
  },
  {
    id: "product-first",
    number: "08",
    name: "Product First",
    description: "The product is the hero",
    categories: ["SaaS"],
    styles: ["Product-first"],
    tags: ["SaaS", "Product-led", "Screenshot"],
    theme: "papier",
    sections: [
      s("navbar", "logo, liens, CTA"),
      s("hero", "titre court sur une ligne + CTA"),
      s("product", "énorme capture du produit, pleine largeur"),
      s("features", "3 zones du produit annotées"),
      s("social-proof", "logos clients"),
      s("cta", "essayer le produit"),
      s("footer", "liens"),
    ],
  },
  {
    id: "founder",
    number: "09",
    name: "Founder",
    description: "Indie hacker, personal story",
    categories: ["Portfolio", "SaaS"],
    styles: ["Editorial", "Bold"],
    tags: ["Indie", "Personal", "Story"],
    theme: "atelier",
    sections: [
      s("hero", "photo, prénom, ce que tu construis et pour qui"),
      s("story", "pourquoi tu as créé le produit, en 3 paragraphes"),
      s("product", "le produit en une carte"),
      s("social-proof", "messages de vrais utilisateurs"),
      s("cta", "essayer + te suivre"),
    ],
  },
  {
    id: "command",
    number: "10",
    name: "Command",
    description: "Cockpit-style control center",
    categories: ["SaaS", "DevTool", "B2B"],
    styles: ["Dark", "Product-first", "Animated"],
    tags: ["Cockpit", "Dark", "Dashboard"],
    theme: "nuit",
    sections: [
      s("navbar", "logo, barre de commande ⌘K"),
      s("hero", "titre en deux tons, trajectoires sur grille fine"),
      s("product", "panneaux : métriques, navigation, barre de commande"),
      s("features", "raccourcis clavier et commandes"),
      s("stats", "métriques en temps réel"),
      s("cta", "lancer le cockpit"),
      s("footer", "liens"),
    ],
  },
];

/** Point de départ vide pour « Create from scratch ». */
export const SCRATCH_TEMPLATE: PreLandingTemplate = {
  id: "scratch",
  number: "00",
  name: "Blank structure",
  description: "The 12-frame essentials, nothing else",
  categories: [],
  styles: [],
  tags: [],
  theme: "papier",
  sections: [
    s("navbar", "logo, 3 liens, un bouton"),
    s("hero", "résultat promis, sous-titre, CTA"),
    s("social-proof", "preuves réelles"),
    s("features", "3 bénéfices"),
    s("pricing", "offres et prix visibles"),
    s("faq", "vraies objections"),
    s("cta", "répéter la promesse"),
    s("footer", "liens légaux"),
  ],
};

export function findTemplate(id: string) {
  return id === SCRATCH_TEMPLATE.id
    ? SCRATCH_TEMPLATE
    : PRE_LANDING_TEMPLATES.find((t) => t.id === id);
}
