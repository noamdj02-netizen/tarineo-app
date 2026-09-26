export type HeroCategory = "3d" | "shaders" | "particules" | "video" | "ui";
export type HeroLevel = "facile" | "moyen" | "avance";
export type HeroAccess = "gratuit" | "pro";
export type HeroVarType = "texte" | "couleur" | "nombre" | "url";

export type HeroVariable = {
  key: string;
  label: string;
  type: HeroVarType;
  defaut: string;
};

export type HeroCard = {
  id: string;
  slug: string;
  nom: string;
  categorie: HeroCategory;
  tags: string[];
  niveau: HeroLevel;
  stack: string[];
  poids: string;
  pour: string;
  acces: HeroAccess;
  variables: HeroVariable[];
  prompt: string;
  apercuVideoUrl?: string | null;
  apercuPosterUrl?: string | null;
};

export const HERO_CATEGORY_LABELS: Record<HeroCategory, string> = {
  "3d": "3D",
  shaders: "Shaders",
  particules: "Particules",
  video: "Vidéo",
  ui: "UI & produit",
};

export const HERO_LEVEL_LABELS: Record<HeroLevel, string> = {
  facile: "Facile",
  moyen: "Moyen",
  avance: "Avancé",
};

export const COPY_TOOLS = ["Cursor", "Claude Code", "Lovable", "v0"] as const;
export type CopyTool = (typeof COPY_TOOLS)[number];
