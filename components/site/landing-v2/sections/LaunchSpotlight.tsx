"use client";

import { Check } from "lucide-react";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingChantierCard } from "@/components/site/landing-v2/components/ui/LandingChantierCard";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";
import { landingChantierCards, launchSpotlight } from "@/lib/site/landing-v2-content";

/** Produit — titre + points au-dessus, 3 cartes chantier en dessous. */
export function LaunchSpotlight() {
  return (
    <LandingSection id="produit" className="border-t border-line/60 py-16 sm:py-24">
      <div className="shell">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-title font-semibold tracking-tight text-ink-900">
            {launchSpotlight.title}
          </h2>
          <LandingStagger
            className="mt-8 grid gap-5 text-left sm:mt-10 sm:grid-cols-3 sm:gap-6 sm:text-center"
            stagger={0.1}
          >
            {launchSpotlight.points.map((point) => (
              <LandingStaggerItem key={point.title}>
                <div className="flex gap-3 sm:flex-col sm:items-center sm:gap-2">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-ink-900 text-paper-0 sm:mt-0">
                    <Check className="size-3.5" strokeWidth={2.5} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-ink-900">{point.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-500">{point.text}</p>
                  </div>
                </div>
              </LandingStaggerItem>
            ))}
          </LandingStagger>
          <p className="mt-6 text-xs text-ink-400">
            Aperçu des fiches chantier de l’app — données d’exemple.
          </p>
        </div>

        <div className="relative mt-12 sm:mt-14">
          <div
            className="landing-launch-glow pointer-events-none absolute -inset-6 opacity-50 sm:-inset-10"
            aria-hidden
          />
          <LandingStagger
            className="relative z-10 mx-auto grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
            stagger={0.1}
          >
            {landingChantierCards.map((card) => (
              <LandingStaggerItem key={card.title}>
                <LandingChantierCard data={card} />
              </LandingStaggerItem>
            ))}
          </LandingStagger>
        </div>
      </div>
    </LandingSection>
  );
}
