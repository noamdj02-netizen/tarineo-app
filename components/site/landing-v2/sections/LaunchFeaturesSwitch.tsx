"use client";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingFeaturesSwitch } from "@/components/site/landing-v2/components/ui/LandingFeaturesSwitch";
import { LandingSurface } from "@/components/site/landing-v2/components/ui/LandingSurface";

/** Figma Features Section (193:511) — panneau cohérent avec le reste de la landing. */
export function LaunchFeaturesSwitch() {
  return (
    <LandingSection id="fonctionnalites">
      <div className="shell">
        <LandingSurface contentClassName="mx-auto max-w-[1120px]">
          <LandingFeaturesSwitch />
        </LandingSurface>
      </div>
    </LandingSection>
  );
}
