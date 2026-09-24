/** Identité de la marque : un seul endroit à changer. */
export const BRAND = {
  name: "Navpit",
  domain: "navpit.com",
  /** Canonique SEO + emails (www). */
  siteUrl: "https://www.navpit.com",
  /** Logo statique (header site + app). */
  logoSrc: "/icons/logoNavPit.png",
  tagline: "The operating system for focused founders.",
  /** Description courte (français) : balise meta, écran de connexion. */
  description:
    "Ton cockpit pour créer tes SaaS : un projet en focus, la prochaine action, tes ressources design et un copilote IA qui connaît tout ça.",
} as const;
