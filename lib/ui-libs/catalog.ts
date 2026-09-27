import type { UiLib } from "./types";

function prompt(name: string, url: string, extra: string) {
  return `Dans ce projet Next.js (App Router) + Tailwind, prépare l'usage de ${name} (${url}).

${extra}

Règles :
- Installe uniquement ce que la doc officielle recommande. Ne colle pas le code source d'un composant ici.
- Réutilise les tokens et composants déjà présents dans le projet. N'invente pas une nouvelle palette.
- Si une partie est Pro / payante, reste sur les blocs gratuits ou décris l'alternative from scratch.
- Accessible : labels, focus visible, reduced-motion pour les animations.`;
}

export const UI_LIBS: UiLib[] = [
  {
    id: "LIB-01",
    name: "shadcn/ui",
    url: "https://ui.shadcn.com",
    description: "Composants React copiés dans le projet, base du design system.",
    category: "base",
    pricing: "free",
    license: "MIT",
    tags: ["hero", "features", "pricing"],
    stack: ["React", "Tailwind", "shadcn"],
    starterPrompt: prompt(
      "shadcn/ui",
      "https://ui.shadcn.com/docs/installation/next",
      "Suis l'installation Next.js, puis ajoute seulement Button, Card, Dialog et les primitives dont tu as besoin via le CLI.",
    ),
  },
  {
    id: "LIB-02",
    name: "HyperUI",
    url: "https://www.hyperui.dev",
    description: "Sections Tailwind prêtes à adapter : hero, features, pricing, footer.",
    category: "sections",
    pricing: "free",
    license: "MIT",
    tags: ["hero", "features", "pricing"],
    stack: ["React", "Tailwind"],
    starterPrompt: prompt(
      "HyperUI",
      "https://www.hyperui.dev",
      "Ouvre le site, choisis 1 ou 2 sections (hero + features). Recrée-les dans nos composants existants en t'inspirant de la structure, pas en collant le markup tel quel.",
    ),
  },
  {
    id: "LIB-03",
    name: "Float UI",
    url: "https://floatui.com",
    description: "Blocs marketing Tailwind pour landings et pages produit.",
    category: "sections",
    pricing: "free",
    license: "MIT",
    tags: ["hero", "features", "pricing"],
    stack: ["React", "Tailwind"],
    starterPrompt: prompt(
      "Float UI",
      "https://floatui.com",
      "Repère une section hero et une grille de features. Reproduis la composition (rythme, hiérarchie) avec nos tokens Tailwind.",
    ),
  },
  {
    id: "LIB-04",
    name: "Animata",
    url: "https://animata.design",
    description: "Micro-interactions et effets texte/fond, à brancher sur une UI déjà posée.",
    category: "animated",
    pricing: "free",
    license: "MIT",
    tags: ["text-effect", "background", "hero"],
    stack: ["React", "Tailwind", "Framer Motion"],
    starterPrompt: prompt(
      "Animata",
      "https://animata.design",
      "Choisis un effet (texte ou fond) documenté. Implémente-le avec Framer Motion déjà dans le projet, sans ajouter de dépendance inutile.",
    ),
  },
  {
    id: "LIB-05",
    name: "Eldora UI",
    url: "https://www.eldoraui.site",
    description: "Composants animés pour heros et fonds, orientés Next + Tailwind.",
    category: "animated",
    pricing: "free",
    license: "MIT",
    tags: ["hero", "background", "text-effect"],
    stack: ["React", "Tailwind", "Framer Motion"],
    starterPrompt: prompt(
      "Eldora UI",
      "https://www.eldoraui.site",
      "Sélectionne un motif hero ou background. Recrée le mouvement avec Framer Motion et les tokens du projet.",
    ),
  },
  {
    id: "LIB-06",
    name: "Origin UI",
    url: "https://originui.com",
    description: "Primitives soignées (inputs, dialogs, tables) au-dessus de shadcn.",
    category: "base",
    pricing: "free",
    license: "MIT",
    tags: ["features", "pricing"],
    stack: ["React", "Tailwind", "shadcn"],
    starterPrompt: prompt(
      "Origin UI",
      "https://originui.com",
      "Compare avec nos composants shadcn. N'ajoute que les variantes manquantes (champ, select, table) en suivant leur API officielle.",
    ),
  },
  {
    id: "LIB-07",
    name: "Magic UI",
    url: "https://magicui.design",
    description: "Effets et blocs animés autour de shadcn ; une partie reste Pro.",
    category: "animated",
    pricing: "free_with_pro",
    license: "MIT (partie free)",
    tags: ["hero", "text-effect", "background"],
    stack: ["React", "Tailwind", "Framer Motion", "shadcn"],
    starterPrompt: prompt(
      "Magic UI",
      "https://magicui.design",
      "Reste sur les composants marqués gratuits. Installe via leur doc shadcn. Si un effet est Pro, propose un équivalent Motion maison.",
    ),
  },
  {
    id: "LIB-08",
    name: "Aceternity UI",
    url: "https://ui.aceternity.com",
    description: "Heros, cartes et fonds spectaculaires ; le catalogue mixe free et Pro.",
    category: "animated",
    pricing: "free_with_pro",
    license: "Voir le site",
    tags: ["hero", "background", "text-effect"],
    stack: ["React", "Tailwind", "Framer Motion"],
    starterPrompt: prompt(
      "Aceternity UI",
      "https://ui.aceternity.com",
      "Ouvre un composant free (hero ou background). Recrée l'intention visuelle dans notre stack Motion. N'importe pas de snippet Pro.",
    ),
  },
  {
    id: "LIB-09",
    name: "Motion Primitives",
    url: "https://motion-primitives.com",
    description: "Primitives d'animation (texte, reveal, carousel) pour React.",
    category: "animated",
    pricing: "free_with_pro",
    license: "MIT",
    tags: ["text-effect", "hero", "features"],
    stack: ["React", "Tailwind", "Framer Motion"],
    starterPrompt: prompt(
      "Motion Primitives",
      "https://motion-primitives.com",
      "Prends une primitive free (text reveal ou in-view). Branche-la sur un titre existant. Respecte prefers-reduced-motion.",
    ),
  },
  {
    id: "LIB-10",
    name: "Cult UI",
    url: "https://www.cult-ui.com",
    description: "Composants animés et blocs marketing, avec offre Pro en plus.",
    category: "animated",
    pricing: "free_with_pro",
    license: "MIT",
    tags: ["hero", "features", "background"],
    stack: ["React", "Tailwind", "Framer Motion"],
    starterPrompt: prompt(
      "Cult UI",
      "https://www.cult-ui.com",
      "Choisis un bloc free (hero ou features). Recrée la structure dans nos pages, animations via Framer Motion déjà installé.",
    ),
  },
  {
    id: "LIB-11",
    name: "Kokonut UI",
    url: "https://kokonutui.com",
    description: "Kit de composants UI modernes ; le catalogue étendu est Pro.",
    category: "base",
    pricing: "free_with_pro",
    license: "MIT",
    tags: ["features", "pricing", "hero"],
    stack: ["React", "Tailwind"],
    starterPrompt: prompt(
      "Kokonut UI",
      "https://kokonutui.com",
      "Liste les composants free utiles (bouton, carte, pricing). Intègre-les seulement s'ils n'existent pas déjà dans le projet.",
    ),
  },
  {
    id: "LIB-12",
    name: "Tailark",
    url: "https://github.com/tailark/blocks",
    description: "Blocs de landing (hero, features, pricing) versionnés sur GitHub.",
    category: "sections",
    pricing: "free_with_pro",
    license: "Voir le dépôt",
    tags: ["hero", "features", "pricing"],
    stack: ["React", "Tailwind"],
    starterPrompt: prompt(
      "Tailark",
      "https://github.com/tailark/blocks",
      "Parcours le dépôt, identifie un bloc free (hero ou pricing). Recrée la section chez nous sans copier un fichier entier du repo.",
    ),
  },
  {
    id: "LIB-13",
    name: "Preline",
    url: "https://preline.co",
    description: "Large catalogue de sections Tailwind ; plugins et packs vont au Pro.",
    category: "sections",
    pricing: "free_with_pro",
    license: "MIT",
    tags: ["hero", "features", "pricing"],
    stack: ["React", "Tailwind"],
    starterPrompt: prompt(
      "Preline",
      "https://preline.co",
      "Prends une section free (hero ou features). Adapte le HTML/Tailwind à nos tokens. N'active pas de plugin Pro.",
    ),
  },
];

export function getUiLib(id: string) {
  return UI_LIBS.find((lib) => lib.id === id) ?? null;
}

export function allUiLibTags() {
  return [...new Set(UI_LIBS.flatMap((lib) => lib.tags))].sort();
}
