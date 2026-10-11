"use client";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingCapabilitiesBento } from "@/components/site/landing-v2/components/ui/LandingCapabilitiesBento";
import {
  LandingSectionHeading,
  LandingSurface,
} from "@/components/site/landing-v2/components/ui/LandingSurface";

/** Relances — bento Figma 196:1481, compact + polish landing. */
export function Relances() {
  return (
    <LandingSection id="relances">
      <div className="shell">
        <LandingSurface
          className="px-4 py-9 sm:px-8 sm:py-12"
          contentClassName="mx-auto flex max-w-[1120px] flex-col items-center gap-7 sm:gap-9"
        >
          <LandingSectionHeading
            badge="Suivi chantier"
            title="Tout le suivi d’un chantier, au même endroit."
            subtitle="Devis fournisseurs, alertes de hausses et relances dans le dossier du chantier — prêts à ouvrir, relancer ou envoyer au client."
          />

          <LandingCapabilitiesBento />
        </LandingSurface>
      </div>
    </LandingSection>
  );
}
