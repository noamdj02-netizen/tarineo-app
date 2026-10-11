"use client";

import { Check } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingChantierCard } from "@/components/site/landing-v2/components/ui/LandingChantierCard";
import {
  LANDING_CARD_SHADOW,
  LANDING_CARD_SHADOW_HOVER,
  LandingSectionHeading,
  LandingSurface,
} from "@/components/site/landing-v2/components/ui/LandingSurface";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";
import { landingChantierCards, launchSpotlight } from "@/lib/site/landing-v2-content";
import { cn } from "@/lib/utils";

/** Produit — titre + points + cartes chantier, rendu Parcours. */
export function LaunchSpotlight() {
  const reduce = useReducedMotion();

  return (
    <LandingSection id="produit">
      <div className="shell">
        <LandingSurface contentClassName="mx-auto flex max-w-[1120px] flex-col items-center gap-12 sm:gap-14">
          <LandingSectionHeading
            badge="Produit"
            title={launchSpotlight.title}
            subtitle="Aperçu des fiches chantier de l’app — données d’exemple."
          />

          <LandingStagger
            className="grid w-full max-w-4xl gap-4 text-left sm:grid-cols-3 sm:gap-5 sm:text-center"
            stagger={0.1}
          >
            {launchSpotlight.points.map((point) => (
              <LandingStaggerItem key={point.title}>
                <motion.div
                  whileHover={
                    reduce
                      ? undefined
                      : { y: -3, transition: { type: "spring", stiffness: 380, damping: 28 } }
                  }
                  className={cn(
                    "flex h-full gap-3 rounded-[22px] border border-black/[0.04] bg-paper-0 p-5 transition-[box-shadow,border-color] duration-300 sm:flex-col sm:items-center sm:gap-3",
                    LANDING_CARD_SHADOW,
                    "hover:border-black/[0.06]",
                    LANDING_CARD_SHADOW_HOVER,
                  )}
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-[#f7562c] text-white sm:mt-0">
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-semibold tracking-tight text-ink-900">
                      {point.title}
                    </h3>
                    <p className="mt-1 text-sm font-medium leading-relaxed text-ink-500">
                      {point.text}
                    </p>
                  </div>
                </motion.div>
              </LandingStaggerItem>
            ))}
          </LandingStagger>

          <LandingStagger
            className="grid w-full max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
            stagger={0.1}
          >
            {landingChantierCards.map((card) => (
              <LandingStaggerItem key={card.title} className="h-full">
                <LandingChantierCard data={card} className="h-full" />
              </LandingStaggerItem>
            ))}
          </LandingStagger>
        </LandingSurface>
      </div>
    </LandingSection>
  );
}
