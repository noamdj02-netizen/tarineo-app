"use client";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { GridAnimatedCards } from "@/components/site/landing-v2/components/grid-animated-cards/grid-animated-cards";
import { launchBento } from "@/lib/site/landing-v2-content";

/** Parcours — grille animée 2×2 (motion Tarineo / orange). */
export function LaunchFeatureBento() {
  return (
    <LandingSection id="parcours" className="py-16 sm:py-20">
      <div className="shell">
        <h2 className="mx-auto max-w-2xl text-center text-title font-semibold tracking-tight text-ink-900">
          {launchBento.title}
        </h2>
        <div className="mt-10 sm:mt-12">
          <GridAnimatedCards />
        </div>
      </div>
    </LandingSection>
  );
}
