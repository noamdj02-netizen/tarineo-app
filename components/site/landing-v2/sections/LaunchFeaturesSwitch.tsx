"use client";

import { FeaturesChantierFiches } from "@/components/site/landing-v2/sections/FeaturesChantierFiches";

/** Suivi chantier — pin scroll sans parent `transform` (sinon sticky casse). */
export function LaunchFeaturesSwitch() {
  return (
    <section id="suivi-chantier" className="relative pt-10 sm:pt-14 lg:pt-16 pb-2 sm:pb-3 lg:pb-4">
      <div className="shell">
        <FeaturesChantierFiches />
      </div>
    </section>
  );
}
