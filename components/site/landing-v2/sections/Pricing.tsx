"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import {
  LandingFlipButton,
  LandingFlipCta,
} from "@/components/site/landing-v2/components/ui/LandingFlipCta";
import {
  LANDING_CARD_SHADOW,
  LANDING_CARD_SHADOW_HOVER,
  LandingSectionHeading,
  LandingSurface,
} from "@/components/site/landing-v2/components/ui/LandingSurface";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";
import { PRO_TRIAL_DAYS } from "@/lib/billing/plans";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { pricingIntro } from "@/lib/site/landing-v2-content";
import { PRICING, euroInt, type TarineoPlan } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

type BillingPeriod = "month" | "year";

function BillingToggle({
  value,
  onChange,
}: {
  value: BillingPeriod;
  onChange: (v: BillingPeriod) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Période de facturation"
      className="inline-flex rounded-full border border-black/[0.06] bg-paper-50 p-1 shadow-[0_1px_0_rgba(0,0,0,0.03)]"
    >
      {(
        [
          { id: "month" as const, label: "Mensuel" },
          { id: "year" as const, label: "Annuel (−20 %)" },
        ] as const
      ).map((opt) => {
        const active = value === opt.id;
        return (
          <LandingFlipButton
            key={opt.id}
            label={opt.label}
            pressed={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "rounded-full px-4",
              active && "bg-paper-0 text-ink-900 shadow-[0_2px_8px_rgba(97,44,0,0.08)]",
            )}
          >
            {opt.label}
          </LandingFlipButton>
        );
      })}
    </div>
  );
}

function PlanPrice({ plan, period }: { plan: TarineoPlan; period: BillingPeriod }) {
  if (period === "month") {
    return (
      <>
        <span className="text-[3.75rem] leading-none font-semibold tracking-tight text-ink-900 nums">
          {plan.month}
        </span>
        <span className="text-base text-ink-500">€</span>
        <span className="ms-1 text-sm text-ink-400">/ mois HT</span>
      </>
    );
  }
  const perMonth = Math.round(plan.year / 12);
  return (
    <>
      <span className="text-[3.75rem] leading-none font-semibold tracking-tight text-ink-900 nums">
        {plan.year}
      </span>
      <span className="text-base text-ink-500">€</span>
      <span className="ms-1 text-sm text-ink-400">/ an · {euroInt(perMonth)} / mois</span>
    </>
  );
}

function PricingCard({ plan, period }: { plan: TarineoPlan; period: BillingPeriod }) {
  const featured = plan.featured;
  const reduce = useReducedMotion();

  return (
    <motion.article
      whileHover={
        reduce
          ? undefined
          : { y: -5, transition: { type: "spring", stiffness: 380, damping: 28 } }
      }
      className={cn(
        "relative flex h-full flex-col gap-6 overflow-hidden rounded-[24px] border border-black/[0.04] bg-paper-0 p-6 transition-[box-shadow,border-color] duration-300",
        LANDING_CARD_SHADOW,
        "hover:border-black/[0.06]",
        LANDING_CARD_SHADOW_HOVER,
        featured && "ring-1 ring-accent/25",
      )}
    >
      {featured ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(ellipse_at_50%_0%,color-mix(in_srgb,var(--color-accent)_14%,transparent),transparent_70%)]"
        />
      ) : null}

      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold tracking-tight text-ink-900">{plan.name}</h3>
          {plan.badge ? (
            <Badge tone="accent" size="sm">
              {plan.badge}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm font-medium leading-relaxed text-ink-500">{plan.text}</p>
      </div>

      <div className="relative z-10 flex flex-wrap items-baseline gap-1">
        <PlanPrice plan={plan} period={period} />
      </div>

      <LandingFlipCta
        href={plan.href}
        label={plan.cta}
        size="md"
        variant={featured ? "ink" : "secondary"}
        withArrow
        className="relative z-10 w-full min-h-11"
      />

      <div className="relative z-10 h-px w-full bg-black/[0.06]" aria-hidden />

      <ul className="relative z-10 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2 text-sm text-ink-700">
            <Check className="mt-0.5 size-4 shrink-0 text-accent" strokeWidth={2.25} aria-hidden />
            <span>
              {feature.label}
              {feature.soon ? (
                <Badge tone="outline" size="sm" className="ml-2 align-middle">
                  Bientôt
                </Badge>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </motion.article>
  );
}

/** Pricing — 3 cartes, même langage visuel que Parcours. */
export function Pricing() {
  const [period, setPeriod] = useState<BillingPeriod>("month");

  return (
    <LandingSection id="tarifs">
      <div className="shell">
        <LandingSurface contentClassName="mx-auto flex max-w-[1120px] flex-col items-center gap-10 sm:gap-12">
          <LandingSectionHeading
            badge={pricingIntro.title}
            title={pricingIntro.headline}
            subtitle={pricingIntro.subtitle}
          />

          <div className="flex flex-col items-center gap-4">
            <div className="flex max-w-xl flex-col items-center gap-2 text-center">
              <p className="rounded-full border border-accent/20 bg-accent-soft px-4 py-2 text-sm font-semibold text-accent-700 shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_6px_color-mix(in_srgb,var(--color-accent)_8%,transparent)]">
                {pricingIntro.founder}
              </p>
              <p className="text-sm font-medium leading-relaxed text-ink-500">
                {PRO_TRIAL_DAYS} jours pour tester Pro sans carte, puis choisissez Starter, Pro
                ou Équipe. Prix HT, sans engagement.
              </p>
            </div>
            <BillingToggle value={period} onChange={setPeriod} />
          </div>

          <LandingStagger
            className="grid w-full items-stretch gap-4 lg:grid-cols-3 lg:gap-5"
            stagger={0.1}
          >
            {PRICING.map((plan) => (
              <LandingStaggerItem key={plan.id} className="h-full">
                <PricingCard plan={plan} period={period} />
              </LandingStaggerItem>
            ))}
          </LandingStagger>

          <p className="text-center text-sm text-ink-400">
            Besoin du détail ?{" "}
            <Link
              href="/prix"
              className="font-medium text-ink-700 underline-offset-4 hover:text-accent hover:underline"
            >
              Voir la page Tarifs
            </Link>
            {" · "}
            <Link href={LANDING_SIGNUP} className="font-medium text-ink-700 hover:text-accent">
              Commencer
            </Link>
          </p>
        </LandingSurface>
      </div>
    </LandingSection>
  );
}
