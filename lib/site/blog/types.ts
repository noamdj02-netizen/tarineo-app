export type BlogMetierSlug =
  | "plombier"
  | "electricien"
  | "peintre"
  | "macon"
  | "carreleur"
  | "menuisier"
  | "couvreur"
  | "chauffagiste"
  | "serrurier"
  | "entreprise";

export type BlogSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  metaDescription: string;
  metier: string;
  metierSlug: BlogMetierSlug;
  publishedAt: string;
  updatedAt: string;
  readingMinutes: number;
  /** Problèmes concrets (SEO + lecture rapide). */
  problems: string[];
  sections: BlogSection[];
  keywords: string[];
};
