export type LibrarySource = {
  name: string;
  url: string;
  domain: string;
  note: string;
};

/** Composants à copier avant de coder from scratch. */
export const CODE_LIBS: LibrarySource[] = [
  {
    name: "Magic UI",
    url: "https://magicui.design",
    domain: "magicui.design",
    note: "Blocs animés shadcn",
  },
  {
    name: "Aceternity UI",
    url: "https://ui.aceternity.com",
    domain: "ui.aceternity.com",
    note: "Hero, cards 3D",
  },
  {
    name: "HyperUI",
    url: "https://www.hyperui.dev",
    domain: "hyperui.dev",
    note: "Tailwind copier-coller",
  },
  {
    name: "daisyUI",
    url: "https://daisyui.com",
    domain: "daisyui.com",
    note: "Classes sémantiques",
  },
  {
    name: "shadcn/ui",
    url: "https://ui.shadcn.com",
    domain: "ui.shadcn.com",
    note: "Base du cockpit",
  },
];

/** Inspiration, pas de code. */
export const REF_LIBS: LibrarySource[] = [
  {
    name: "Mobbin",
    url: "https://mobbin.com",
    domain: "mobbin.com",
    note: "Écrans réels",
  },
  {
    name: "Page Flows",
    url: "https://pageflows.com",
    domain: "pageflows.com",
    note: "Parcours complets",
  },
  {
    name: "Land-book",
    url: "https://land-book.com",
    domain: "land-book.com",
    note: "Landings",
  },
  {
    name: "Dribbble",
    url: "https://dribbble.com",
    domain: "dribbble.com",
    note: "Direction visuelle",
  },
  {
    name: "Material 3",
    url: "https://m3.material.io",
    domain: "m3.material.io",
    note: "Design system",
  },
];
