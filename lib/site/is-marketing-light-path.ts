/** Pages publiques au chrome landing-v2 (fond clair, nav marketing). */

const MARKETING_LIGHT_PREFIXES = [
  "/blog",
  "/prix",
  "/avis",
  "/mentions-legales",
  "/confidentialite",
  "/cgv",
] as const;

export function isMarketingLightPath(pathname: string): boolean {
  return MARKETING_LIGHT_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}
