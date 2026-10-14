"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingFigmaSectionHeader } from "@/components/site/landing-v2/components/ui/LandingFigmaSectionHeader";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";
import { pricingIntro } from "@/lib/site/landing-v2-content";
import { PRICING, type TarineoPlan } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

function PricingCard({ plan }: { plan: TarineoPlan }) {
  const featured = plan.featured;
  const reduce = useReducedMotion();

  return (
    <motion.article
      whileHover={reduce ? undefined : { y: -4 }}
      className={cn(
        "relative flex h-full min-h-[462px] flex-col rounded-[24px] bg-white p-6",
        "shadow-[0_4px_2px_rgba(255,107,26,0.15),inset_0_4px_4px_rgba(10,10,10,0.08)]",
        featured && "shadow-[0_12px_16px_rgba(255,107,26,0.15),inset_0_4px_4px_rgba(2,3,28,0.12)]",
      )}
    >
      {featured ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3px] text-[#ec5821]">Le plus choisi</p>
      ) : (
        <span className="h-4" aria-hidden />
      )}

      <h3 className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-[#0a0a0a]">{plan.name}</h3>
      <p className="mt-1 text-sm leading-5 text-[#53616a]">{plan.text}</p>

      <p className="mt-4 text-[#0a0a0a]">
        <span className="text-[36px] font-semibold leading-10 tracking-[-0.03em]">{plan.month} €</span>
        <span className="text-base font-medium text-[#53616a]"> / mois</span>
      </p>

      <ul className="mt-5 flex flex-1 flex-col gap-2 text-sm leading-5 text-[#53616a]">
        {plan.features.map((feature) => (
          <li key={feature.label}>
            {feature.label}
            {feature.soon ? <span className="text-[#53616a]/80"> (bientôt)</span> : null}
          </li>
        ))}
      </ul>

      <Link
        href={plan.href}
        className="mt-8 inline-flex h-11 w-fit items-center justify-center rounded-full bg-[#ff6b1a] px-5 text-sm font-semibold text-white shadow-[0_1px_1px_rgba(23,41,53,0.05)] transition-opacity hover:opacity-90"
      >
        {plan.cta}
      </Link>
    </motion.article>
  );
}

type PricingProps = {
  /** Masquer le lien « Voir la page Tarifs » (page dédiée `/prix`). */
  showFooterLink?: boolean;
};

/** Tarifs — Figma 235:34823 */
export function Pricing({ showFooterLink = true }: PricingProps) {
  return (
    <LandingSection id="tarifs" className="pb-16 sm:pb-20">
      <div className="shell">
        <div className="mx-auto flex max-w-[1124px] flex-col items-center gap-10">
          <LandingFigmaSectionHeader
            align="center"
            badge={pricingIntro.title}
            title={pricingIntro.headline}
            subtitle={pricingIntro.subtitle}
          />

          <LandingStagger className="grid w-full gap-4 lg:grid-cols-3" stagger={0.08}>
            {PRICING.map((plan) => (
              <LandingStaggerItem key={plan.id} className="h-full">
                <PricingCard plan={plan} />
              </LandingStaggerItem>
            ))}
          </LandingStagger>

          {showFooterLink ? (
            <p className="text-center text-sm text-[#53616a]">
              Besoin du détail ?{" "}
              <Link href="/prix" className="font-medium text-[#111827] underline-offset-4 hover:underline">
                Voir la page Tarifs
              </Link>
            </p>
          ) : null}
        </div>
      </div>
    </LandingSection>
  );
}
