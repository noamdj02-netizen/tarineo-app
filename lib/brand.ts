/** Identité de la marque : un seul endroit à changer. */
export const BRAND = {
  name: "Tarinéo",
  /** À confirmer : domaine définitif (sert au canonique si NEXT_PUBLIC_APP_URL est absent). */
  domain: "tarineo.fr",
  /** Canonique SEO + emails (www). */
  siteUrl: "https://www.tarineo.fr",
  /** Logo statique (JSON-LD, emails). Le header utilise le composant <TarineoMark />. */
  logoSrc: "/brand/tarineo-logo.png",
  /** Logo landing (nav + footer site public). */
  logoLandingSrc: "/brand/tarineo-logo.png",
  /** À confirmer : adresse de contact publique. */
  contactEmail: "contact@tarineo.fr",
  tagline: "L’assistant qui protège votre marge.",
  /** Description courte (français) : balise meta, écran de connexion. */
  description:
    "Analysez vos devis et factures fournisseurs, détectez les hausses de prix et suivez l’évolution de vos achats avec Tarinéo.",
} as const;
