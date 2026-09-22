export const PREFIXE_LEGAL = "/legal";

export const PAGES_LEGALES = [
  { href: "/legal/confidentialite", label: "Politique de confidentialité" },
  { href: "/legal/cgu", label: "Conditions générales d'utilisation" },
  { href: "/legal/cgv", label: "Conditions générales de vente" },
  { href: "/legal/mentions-legales", label: "Mentions légales" },
  { href: "/legal/cookies", label: "Politique cookies" },
] as const;

export function estRouteLegale(pathname: string): boolean {
  return pathname === PREFIXE_LEGAL || pathname.startsWith(`${PREFIXE_LEGAL}/`);
}
