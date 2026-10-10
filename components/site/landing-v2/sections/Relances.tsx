"use client";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingRelanceTable } from "@/components/site/landing-v2/components/ui/LandingRelanceTable";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { LandingFloatCard } from "@/components/site/landing-v2/lib/landing-motion";

/** Section landing — file de relances fournisseurs / clients. */
export function Relances() {
  return (
    <LandingSection id="relances" className="border-t border-line/60 py-16 sm:py-24">
      <div className="shell">
        <SectionHeading
          align="center"
          label="Relances"
          title="Fournisseurs à négocier, clients à suivre."
          subtitle="Relances commerciales et devis clients — le statut passe de « en cours » à « répondu » pendant que vous travaillez (exemple)."
        />

        <div className="relative mx-auto mt-10 max-w-2xl sm:mt-14">
          <div
            className="landing-launch-glow pointer-events-none absolute -inset-8 opacity-30 sm:-inset-12"
            aria-hidden
          />
          <LandingFloatCard className="relative z-10">
            <LandingRelanceTable />
          </LandingFloatCard>
        </div>
      </div>
    </LandingSection>
  );
}
