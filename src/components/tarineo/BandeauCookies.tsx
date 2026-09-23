import Script from "next/script";

/**
 * Bandeau cookies en JS vanilla (fichier public) — indépendant de l'hydratation React.
 */
export function BandeauCookies() {
  return <Script src="/bandeau-cookies.js?v=2" strategy="afterInteractive" />;
}
