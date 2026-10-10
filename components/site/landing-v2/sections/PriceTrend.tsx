"use client";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { PerformanceTrend } from "@/components/site/landing-v2/components/performance-trend/performance-trend";
import { LandingFloatCard } from "@/components/site/landing-v2/lib/landing-motion";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";

/** Section landing — tendance de hausses sur un produit exemple. */
export function PriceTrend() {
  return (
    <LandingSection id="hausses" className="border-t border-line/60 py-16 sm:py-24">
      <div className="shell">
        <SectionHeading
          align="center"
          label="Hausses de prix"
          title="Suivez une référence comme sur le terrain."
          subtitle="Exemple : un chauffe-eau 200 L chez Cedeo. Survolez la courbe pour lire le prix, la hausse et l’écart détecté au fil de l’année."
        />

        <div className="relative mx-auto mt-10 max-w-5xl sm:mt-14">
          <div
            className="landing-launch-glow pointer-events-none absolute -inset-6 opacity-40 sm:-inset-10"
            aria-hidden
          />
          <LandingFloatCard className="relative z-10">
            <PerformanceTrend />
          </LandingFloatCard>
        </div>
      </div>
    </LandingSection>
  );
}
