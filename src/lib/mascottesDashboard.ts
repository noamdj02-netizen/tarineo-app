/** Variantes mascotte dashboard — assets Figma nodes 207:39413–207:39426. */
export type MascotteDashboardVariant =
  | "pouceLeve"
  | "clinOeilPointe"
  | "bulleProjets"
  | "clinOeilPoucePointe"
  | "panneauProjets"
  | "regardeGauche"
  | "salut"
  | "brasCroises"
  | "panneauTerrain"
  | "loupe"
  | "ordinateur";

export type MascotteDashboardConfig = {
  src: string;
  /** Cadre d'affichage Figma (px) */
  width: number;
  height: number;
  /** Dimensions source PNG pour next/image */
  imageWidth: number;
  imageHeight: number;
  alt: string;
};

export const MASCOTTE_DASHBOARD: Record<MascotteDashboardVariant, MascotteDashboardConfig> = {
  pouceLeve: {
    src: "/dashboard/mascottes/pouce-leve.png",
    width: 204,
    height: 170,
    imageWidth: 1374,
    imageHeight: 1145,
    alt: "Mascotte Tarineo — pouce levé",
  },
  clinOeilPointe: {
    src: "/dashboard/mascottes/clin-oeil-pointe.png",
    width: 204,
    height: 170,
    imageWidth: 1374,
    imageHeight: 1145,
    alt: "Mascotte Tarineo — clin d'œil",
  },
  bulleProjets: {
    src: "/dashboard/mascottes/bulle-projets.png",
    width: 255,
    height: 170,
    imageWidth: 1536,
    imageHeight: 1024,
    alt: "Mascotte Tarineo — On avance vos projets !",
  },
  clinOeilPoucePointe: {
    src: "/dashboard/mascottes/clin-oeil-pouce-pointe.png",
    width: 202,
    height: 170,
    imageWidth: 1367,
    imageHeight: 1151,
    alt: "Mascotte Tarineo",
  },
  panneauProjets: {
    src: "/dashboard/mascottes/panneau-projets.png",
    width: 163,
    height: 170,
    imageWidth: 1227,
    imageHeight: 1282,
    alt: "Mascotte Tarineo — On avance vos projets !",
  },
  regardeGauche: {
    src: "/dashboard/mascottes/regarde-gauche.png",
    width: 178,
    height: 170,
    imageWidth: 1282,
    imageHeight: 1227,
    alt: "Mascotte Tarineo",
  },
  salut: {
    src: "/dashboard/mascottes/salut.png",
    width: 178,
    height: 170,
    imageWidth: 1282,
    imageHeight: 1227,
    alt: "Mascotte Tarineo — bonjour",
  },
  brasCroises: {
    src: "/dashboard/mascottes/bras-croises.png",
    width: 164,
    height: 170,
    imageWidth: 1230,
    imageHeight: 1278,
    alt: "Mascotte Tarineo",
  },
  panneauTerrain: {
    src: "/dashboard/mascottes/panneau-terrain.png",
    width: 203,
    height: 170,
    imageWidth: 1371,
    imageHeight: 1147,
    alt: "Mascotte Tarineo — À vos côtés sur le terrain !",
  },
  loupe: {
    src: "/dashboard/mascottes/loupe.png",
    width: 162,
    height: 170,
    imageWidth: 1225,
    imageHeight: 1284,
    alt: "Mascotte Tarineo — analyse",
  },
  ordinateur: {
    src: "/dashboard/mascottes/ordinateur.png",
    width: 189,
    height: 170,
    imageWidth: 1322,
    imageHeight: 1190,
    alt: "Mascotte Tarineo — traitement en cours",
  },
};
