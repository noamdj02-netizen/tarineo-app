/** Origine absolue pour les images hébergées (logo, visuels newsletter). */
export function origineEmail(origine?: string): string {
  const base = origine ?? process.env.AUTH_URL ?? "https://tarineo.fr";
  return base.replace(/\/$/, "");
}

export function urlAssetEmail(chemin: string, origine?: string): string {
  return `${origineEmail(origine)}${chemin.startsWith("/") ? chemin : `/${chemin}`}`;
}

export const ASSETS_EMAIL = {
  logo: "/emails/logo-mark.png",
  /** Mascotte pouce levé — email activation compte (Figma 178:28332 / 207:39410). */
  activationMascot: "/emails/activation-mascot.png",
  welcomeHero: "/emails/welcome-hero.png",
  welcomeUpload: "/emails/welcome-upload.png",
  welcomeScan: "/emails/welcome-scan.png",
  welcomeAlerts: "/emails/welcome-alerts.png",
  welcomeCtaIcon: "/emails/welcome-cta-icon.png",
  featureComparator: "/emails/feature-comparator.png",
  featureExport: "/emails/feature-export.png",
  featureMobile: "/emails/feature-mobile.png",
  featureCtaIcon: "/emails/feature-cta-icon.png",
  socialX: "/emails/social/x.svg",
  socialLinkedin: "/emails/social/linkedin.svg",
  socialYoutube: "/emails/social/youtube.svg",
  socialGithub: "/emails/social/github.svg",
} as const;
