"use client";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingActivityDropdown } from "@/components/site/landing-v2/components/ui/LandingActivityDropdown";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { LandingFloatCard } from "@/components/site/landing-v2/lib/landing-motion";

/** Section landing — tiroir d’alertes (relances, hausses, devis). */
export function Notifications() {
  return (
    <LandingSection id="alertes" className="border-t border-line/60 py-16 sm:py-24">
      <div className="shell">
        <SectionHeading
          align="center"
          label="Alertes & relances"
          title="Tout ce qui compte, dans un tiroir."
          subtitle="Hausses de prix, relances fournisseurs et devis générés — ouvrez le panneau pour voir le fil d’activités (exemple)."
        />

        <div className="relative mx-auto mt-10 flex max-w-md justify-center sm:mt-14">
          <div
            className="landing-launch-glow pointer-events-none absolute -inset-8 opacity-30 sm:-inset-14"
            aria-hidden
          />
          <LandingFloatCard className="relative z-10 w-full max-w-md">
            <LandingActivityDropdown />
          </LandingFloatCard>
        </div>
      </div>
    </LandingSection>
  );
}
