"use client";

import { MOTION_HUB_SCENARIOS } from "@/lib/site/landing-motion-hub";
import { TarineoMotionHub } from "@/components/site/landing-v2/components/motion/TarineoMotionHub";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { LandingFloatCard, LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";

export function TarineoWorks() {
  return (
    <section id="moteur" className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          label="Tarinéo travaille pour vous"
          title={
            <>
              Vos documents entrent.
              <span className="mt-2 block text-ink-400">Les bonnes actions sortent.</span>
            </>
          }
          subtitle="Factures, devis, emails : Tarinéo lit, compare, calcule la marge et prépare ce que vous devez faire — sans bruit ni usine à gaz."
        />

        <LandingFloatCard
          className="surface mt-14 overflow-hidden px-4 py-8 sm:px-10 sm:py-12"
          delay={0.08}
        >
          <TarineoMotionHub />
        </LandingFloatCard>

        <LandingStagger className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {MOTION_HUB_SCENARIOS.map((s) => (
            <LandingStaggerItem
              key={s.id}
              className="surface-flat p-4"
            >
              <p className="text-sm font-medium text-ink-900">{s.title}</p>
              <p className="mt-1 text-xs text-ink-400">{s.insight}</p>
              <p className="mt-2 text-xs font-medium text-accent-700">{s.action}</p>
            </LandingStaggerItem>
          ))}
        </LandingStagger>
      </div>
    </section>
  );
}
