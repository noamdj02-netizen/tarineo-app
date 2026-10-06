import type { ReactNode } from "react";

/**
 * Direction (design-direction) :
 * - Ambiance : minimal suisse + bento éditorial (ivoire chantier).
 * - Références : Stripe marketing, Linear docs, Framer « craft » landings.
 * - Palette : #F7F5F0 · orange #FF6B1A · encre #0A0A0A.
 * - Typo : Space Grotesk (titres) · Inter Tight (texte) · JetBrains (chiffres).
 * - Signature : grain + grille 1px + marqueur orange hero + cadres double bezel.
 */
export function LandingAtmosphere({ children }: { children: ReactNode }) {
  return (
    <div className="theme-light landing-surface relative isolate overflow-x-clip bg-landing-canvas text-ink">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 landing-editorial-grid opacity-[0.55]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 film-grain opacity-[0.032] mix-blend-multiply"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 landing-atmosphere-glow"
      />
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
