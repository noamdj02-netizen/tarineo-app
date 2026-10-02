import type { ReactNode } from "react";

/** Toile landing : tokens `landing-*`, grain fixe, halos discrets. */
export function LandingAtmosphere({ children }: { children: ReactNode }) {
  return (
    <div className="theme-light relative isolate overflow-x-clip bg-landing-canvas text-ink">
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
