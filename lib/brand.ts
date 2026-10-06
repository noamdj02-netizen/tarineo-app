/** Identité de la marque : un seul endroit à changer. */
export const BRAND = {
  name: "TARINEO",
  /** À confirmer : domaine définitif (sert au canonique si NEXT_PUBLIC_APP_URL est absent). */
  domain: "tarineo.fr",
  /** Canonique SEO + emails (www). */
  siteUrl: "https://www.tarineo.fr",
  /** Picto app fond clair (sidebar / UI claire). */
  logoSrc: "/brand/tarineo-logo-light.png",
  /** Picto app fond sombre (sidebar / UI sombre). */
  logoDarkSrc: "/brand/tarineo-logo-dark.png",
  /** Icône PWA et écran d’accueil (fond noir, barres orange). */
  appIconSrc: "/brand/favicon/icon-512.png",
  /** Logo landing (nav + footer site public) — asset marketing, inchangé. */
  logoLandingSrc: "/brand/tarineo-mark.png",
  /** Expéditeur Resend : domaine vérifié = tarineo.com (tarineo.fr DNS pas encore prêt). */
  contactEmail: "contact@tarineo.com",
  tagline: "L’assistant qui protège votre marge.",
  /** Description courte (français) : balise meta, écran de connexion. */
  description:
    "Analysez vos devis et factures fournisseurs, détectez les hausses de prix et suivez l’évolution de vos achats avec TARINEO.",
} as const;
