/** Identité de la marque : un seul endroit à changer. */
export const BRAND = {
  name: "TARINEO",
  /** À confirmer : domaine définitif (sert au canonique si NEXT_PUBLIC_APP_URL est absent). */
  domain: "tarineo.fr",
  /** Canonique SEO + emails (www). */
  siteUrl: "https://www.tarineo.fr",
  /** Logo app clair (JSON-LD, emails, PWA). */
  logoSrc: "/brand/tarineo-logo-light.png",
  /** Logo app sombre (chrome noir). */
  logoDarkSrc: "/brand/tarineo-logo-dark.png",
  /** Logo landing (nav + footer site public) — asset marketing, inchangé. */
  logoLandingSrc: "/brand/tarineo-mark.png",
  /** À confirmer : adresse de contact publique. */
  contactEmail: "contact@tarineo.fr",
  tagline: "L’assistant qui protège votre marge.",
  /** Description courte (français) : balise meta, écran de connexion. */
  description:
    "Analysez vos devis et factures fournisseurs, détectez les hausses de prix et suivez l’évolution de vos achats avec TARINEO.",
} as const;
