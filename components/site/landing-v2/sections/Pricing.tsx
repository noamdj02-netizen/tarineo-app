"use client";

import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import {
  LandingFlipButton,
  LandingFlipCta,
} from "@/components/site/landing-v2/components/ui/LandingFlipCta";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { pricingIntro } from "@/lib/site/landing-v2-content";
import { PRICING, PRICING_NOTE, euroInt, type TarineoPlan } from "@/lib/site/tarineo";
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
      className="inline-flex rounded-md border border-ink-900/15 bg-paper-50 p-1"
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
            className={cn(active && "bg-paper-0 text-ink-900 shadow-sm")}
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

  return (
    <article
      className={cn(
        "relative flex h-full flex-col gap-6 overflow-hidden rounded-xl border border-ink-900/20 bg-paper-0 p-6",
        featured && "landing-launch-pricing-featured border-accent/30",
      )}
    >
      {featured ? <div className="landing-launch-pricing-glow" aria-hidden /> : null}

      <div className="relative z-10 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h3 className="text-xl font-semibold tracking-tight text-ink-900">{plan.name}</h3>
          {plan.badge ? (
            <Badge tone="accent" size="sm">
              {plan.badge}
            </Badge>
          ) : null}
        </div>
        <p className="text-sm leading-relaxed text-ink-500">{plan.text}</p>
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

      <div className="relative z-10 h-px w-full bg-line" aria-hidden />

      <ul className="relative z-10 flex flex-1 flex-col gap-2.5">
        {plan.features.map((feature) => (
          <li key={feature.label} className="flex items-start gap-2 text-sm text-ink-700">
            <Check className="mt-0.5 size-4 shrink-0 text-ink-900" strokeWidth={2.25} aria-hidden />
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
    </article>
  );
}

/** Pricing Launch UI — 3 cartes, Pro mis en avant avec glow. */
export function Pricing() {
  const [period, setPeriod] = useState<BillingPeriod>("month");

  return (
    <LandingSection id="tarifs" className="border-t border-line/80 py-16 sm:py-24">
      <div className="shell">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium text-accent-700">{pricingIntro.title}</p>
          <h2 className="mt-3 text-title font-semibold tracking-tight text-ink-900">
            {pricingIntro.headline}
          </h2>
          <p className="mt-4 text-lg text-ink-500">{pricingIntro.subtitle}</p>
          <p className="mt-2 text-sm text-ink-400">{PRICING_NOTE}</p>
        </div>

        <div className="mt-8 flex flex-col items-center gap-4">
          <p className="rounded-full border border-line bg-paper-0 px-4 py-2 text-sm font-medium text-ink-600 shadow-sm">
            {pricingIntro.founder}
          </p>
          <BillingToggle value={period} onChange={setPeriod} />
        </div>

        <LandingStagger
          className="mt-10 grid items-stretch gap-4 sm:mt-12 lg:grid-cols-3 lg:gap-4"
          stagger={0.1}
        >
          {PRICING.map((plan) => (
            <LandingStaggerItem key={plan.id} className="h-full">
              <PricingCard plan={plan} period={period} />
            </LandingStaggerItem>
          ))}
        </LandingStagger>

        <p className="mt-8 text-center text-sm text-ink-400">
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
      </div>
    </LandingSection>
  );
}
