// Extrait tel quel de « Studio Noam.html ».

/** Les 6 étapes d’un projet (stage 1 à 6). */
export const STAGES = ["Valider","MVP","Bêta","1ère vente","100 clients","Scale"] as const;

export const RESOURCE_CATEGORIES = [
  "Inspiration",
  "Composants UI",
  "Prompt Design",
  "Animation & 3D",
  "Couleurs & Polices",
  "Outils Dev",
  "Facturation"
] as const;

export type ResourceCategory = (typeof RESOURCE_CATEGORIES)[number];

/** Couleur du monogramme de chaque catégorie. */
export const CATEGORY_COLORS: Record<string, string> = {
  "Inspiration": "#E4447A",
  "Composants UI": "#2F5BFF",
  "Prompt Design": "#7C4DFF",
  "Animation & 3D": "#0E9F8E",
  "Couleurs & Polices": "#C77A00",
  "Outils Dev": "#3A4046",
  "Facturation": "#138A43"
};

export type CuratedResource = {
  name: string;
  url: string;
  cat: string;
  note: string;
  tags: string[];
  source: "curated";
};

/** Sites d’inspiration choisis à la main (« curated »). */
export const CURATED_RESOURCES: CuratedResource[] = [
  {
    "name": "Dribbble",
    "url": "https://dribbble.com",
    "cat": "Inspiration",
    "note": "Shots UI : repérer une direction visuelle, des couleurs, des cartes.",
    "tags": [
      "UI"
    ],
    "source": "curated"
  },
  {
    "name": "Behance",
    "url": "https://www.behance.net",
    "cat": "Inspiration",
    "note": "Études de cas complètes (WayPilot, Demand IQ…) : toute la page, pas juste un écran.",
    "tags": [
      "Case study"
    ],
    "source": "curated"
  },
  {
    "name": "Mobbin",
    "url": "https://mobbin.com",
    "cat": "Inspiration",
    "note": "Vrais écrans d’apps en prod, classés par flow (onboarding, paywall, pricing).",
    "tags": [
      "App",
      "Flows"
    ],
    "source": "curated"
  },
  {
    "name": "Page Flows",
    "url": "https://pageflows.com",
    "cat": "Inspiration",
    "note": "User flows complets : login, checkout, onboarding.",
    "tags": [
      "Flows"
    ],
    "source": "curated"
  },
  {
    "name": "Material Design 3",
    "url": "https://m3.material.io",
    "cat": "Inspiration",
    "note": "Guidelines de design system (composants, motion, couleur).",
    "tags": [
      "System"
    ],
    "source": "curated"
  },
  {
    "name": "Godly",
    "url": "https://godly.website",
    "cat": "Inspiration",
    "note": "Landing pages animées très haut de gamme.",
    "tags": [
      "Landing",
      "Motion"
    ],
    "source": "curated"
  },
  {
    "name": "Land-book",
    "url": "https://land-book.com",
    "cat": "Inspiration",
    "note": "Galerie de landing pages triées par type (SaaS, app, agence).",
    "tags": [
      "Landing",
      "SaaS"
    ],
    "source": "curated"
  },
  {
    "name": "Lapa Ninja",
    "url": "https://www.lapa.ninja",
    "cat": "Inspiration",
    "note": "Landing pages + sections isolées (hero, pricing, FAQ).",
    "tags": [
      "Landing"
    ],
    "source": "curated"
  },
  {
    "name": "SaaS Landing Page",
    "url": "https://saaslandingpage.com",
    "cat": "Inspiration",
    "note": "Uniquement des landings SaaS, filtrables par section.",
    "tags": [
      "SaaS"
    ],
    "source": "curated"
  },
  {
    "name": "Awwwards",
    "url": "https://www.awwwards.com",
    "cat": "Inspiration",
    "note": "Sites primés : pour les idées d’animation et de mise en page.",
    "tags": [
      "Motion"
    ],
    "source": "curated"
  },
  {
    "name": "Refero",
    "url": "https://refero.design",
    "cat": "Inspiration",
    "note": "UI rangée par pattern et par composant, avec recherche.",
    "tags": [
      "UI",
      "Patterns"
    ],
    "source": "curated"
  },
  {
    "name": "21st.dev",
    "url": "https://21st.dev",
    "cat": "Composants UI",
    "note": "Composants React + Tailwind de la communauté, avec prompt IA prêt à coller.",
    "tags": [
      "React",
      "Tailwind"
    ],
    "source": "curated"
  },
  {
    "name": "Magic UI",
    "url": "https://magicui.design",
    "cat": "Composants UI",
    "note": "Composants animés (marquee, bento, shiny button) compatibles shadcn.",
    "tags": [
      "React",
      "Motion"
    ],
    "source": "curated"
  },
  {
    "name": "Aceternity UI",
    "url": "https://ui.aceternity.com",
    "cat": "Composants UI",
    "note": "Effets visuels spectaculaires pour hero et sections.",
    "tags": [
      "React",
      "Motion"
    ],
    "source": "curated"
  },
  {
    "name": "HyperUI",
    "url": "https://www.hyperui.dev",
    "cat": "Composants UI",
    "note": "Blocs Tailwind en HTML pur, à copier sans React.",
    "tags": [
      "Tailwind"
    ],
    "source": "curated"
  },
  {
    "name": "daisyUI",
    "url": "https://daisyui.com",
    "cat": "Composants UI",
    "note": "Plugin Tailwind, classes sémantiques (btn, card). À piocher, pas à installer en global.",
    "tags": [
      "Tailwind"
    ],
    "source": "curated"
  },
  {
    "name": "shadcn/ui",
    "url": "https://ui.shadcn.com",
    "cat": "Composants UI",
    "note": "Base du cockpit Navpit. Tu copies le composant, tu le possèdes.",
    "tags": [
      "React",
      "Tailwind"
    ],
    "source": "curated"
  },
  {
    "name": "motionsites.ai",
    "url": "https://motionsites.ai",
    "cat": "Animation & 3D",
    "note": "Prompts de landings animées (payant : vérifier la licence avant revente).",
    "tags": [
      "Prompts",
      "Payant/Licence à vérifier"
    ],
    "source": "curated"
  },
  {
    "name": "Motion",
    "url": "https://motion.dev",
    "cat": "Animation & 3D",
    "note": "Librairie d’animation React (ex-Framer Motion).",
    "tags": [
      "React"
    ],
    "source": "curated"
  },
  {
    "name": "GSAP",
    "url": "https://gsap.com",
    "cat": "Animation & 3D",
    "note": "Animations au scroll avancées (ScrollTrigger).",
    "tags": [
      "Scroll"
    ],
    "source": "curated"
  },
  {
    "name": "Spline",
    "url": "https://spline.design",
    "cat": "Animation & 3D",
    "note": "Scènes 3D sans code, exportables dans un site.",
    "tags": [
      "3D"
    ],
    "source": "curated"
  },
  {
    "name": "Realtime Colors",
    "url": "https://www.realtimecolors.com",
    "cat": "Couleurs & Polices",
    "note": "Teste une palette + typo directement sur une fausse landing.",
    "tags": [
      "Palette"
    ],
    "source": "curated"
  },
  {
    "name": "Coolors",
    "url": "https://coolors.co",
    "cat": "Couleurs & Polices",
    "note": "Générer et sauvegarder des palettes.",
    "tags": [
      "Palette"
    ],
    "source": "curated"
  },
  {
    "name": "UI Colors",
    "url": "https://uicolors.app",
    "cat": "Couleurs & Polices",
    "note": "Génère une échelle Tailwind 50→950 depuis une couleur.",
    "tags": [
      "Tailwind"
    ],
    "source": "curated"
  },
  {
    "name": "Google Fonts",
    "url": "https://fonts.google.com",
    "cat": "Couleurs & Polices",
    "note": "Polices gratuites utilisées dans tes thèmes.",
    "tags": [
      "Fonts"
    ],
    "source": "curated"
  },
  {
    "name": "Fontshare",
    "url": "https://www.fontshare.com",
    "cat": "Couleurs & Polices",
    "note": "Polices gratuites plus originales (Satoshi, Clash…).",
    "tags": [
      "Fonts"
    ],
    "source": "curated"
  },
  {
    "name": "Lucide",
    "url": "https://lucide.dev",
    "cat": "Couleurs & Polices",
    "note": "Les icônes utilisées sur cette page.",
    "tags": [
      "Icons"
    ],
    "source": "curated"
  },
  {
    "name": "v0",
    "url": "https://v0.dev",
    "cat": "Outils Dev",
    "note": "Génère une UI React depuis un prompt ou une capture.",
    "tags": [
      "IA"
    ],
    "source": "curated"
  },
  {
    "name": "Cursor Directory",
    "url": "https://cursor.directory",
    "cat": "Outils Dev",
    "note": "Fichiers de règles Cursor prêts à l’emploi par stack.",
    "tags": [
      "Rules"
    ],
    "source": "curated"
  }
];
