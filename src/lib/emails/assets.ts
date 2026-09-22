/** Origine absolue pour les images hébergées (logo, visuels newsletter). */
export function origineEmail(origine?: string): string {
  const base = origine ?? process.env.AUTH_URL ?? "https://app.tarineo.com";
  return base.replace(/\/$/, "");
}

export function urlAssetEmail(chemin: string, origine?: string): string {
  return `${origineEmail(origine)}${chemin.startsWith("/") ? chemin : `/${chemin}`}`;
}

export const ASSETS_EMAIL = {
  logo: "/emails/logo-mark.png",
  /** Mascotte pouce levé — email activation compte (Figma 178:28332 / 207:39410). */
  activationMascot: "/emails/activation-mascot.png",
  /** Chronomètre — fin d'essai gratuit (Figma 179:28899). */
  essaiExpireMascot: "/emails/essai-expire-mascot.png",
  /** Équipe artisans — invitation (Figma 179:28865). */
  invitationEquipeMascot: "/emails/invitation-equipe-mascot.png",
  /** Facture disponible (Figma 179:28933). */
  factureMascot: "/emails/facture-mascot.png",
  welcomeHero: "/emails/welcome-hero.png",
  welcomeUpload: "/emails/welcome-upload.png",
  welcomeScan: "/emails/welcome-scan.png",
  welcomeAlerts: "/emails/welcome-alerts.png",
  welcomeCtaIcon: "/emails/welcome-cta-icon.png",
  featureComparator: "/emails/feature-comparator.png",
  featureExport: "/emails/feature-export.png",
  featureMobile: "/emails/feature-mobile.png",
  featureCtaIcon: "/emails/feature-cta-icon.png",
  /** Mockup iPhone hero — calque Figma 178:27484 (sous le titre « Notes de version »). */
  notesHeroPhone: "/emails/notes-hero-phone.png",
  /** Icônes bloc « nouvelles façons » — Figma 217:3811 */
  notesIconAutomation: "/emails/notes-icon-automation.svg",
  notesIconChantier: "/emails/notes-icon-chantier.svg",
  socialX: "/emails/social/x.svg",
  socialLinkedin: "/emails/social/linkedin.svg",
  socialYoutube: "/emails/social/youtube.svg",
  socialGithub: "/emails/social/github.svg",
} as const;
