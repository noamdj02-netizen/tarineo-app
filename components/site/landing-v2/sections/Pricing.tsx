"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { ArrowRight, Button } from "@/components/site/landing-v2/components/ui/Button";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { LandingTrustStrip } from "@/components/site/landing-v2/components/ui/LandingTrustStrip";
import { landingCardClass } from "@/components/site/landing-v2/components/ui/landing-card";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LANDING_PRIMARY_CTA_LABEL, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { pricingIntro, pricingTrust } from "@/lib/site/landing-v2-content";
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
      className="inline-flex rounded-full border border-line bg-paper-50 p-1 shadow-sm"
    >
      {(
        [
          { id: "month" as const, label: "Mensuel" },
          { id: "year" as const, label: "Annuel (−20 %)" },
        ] as const
      ).map((opt) => {
        const active = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(opt.id)}
            className={cn(
              "min-h-11 rounded-full px-4 text-sm font-medium transition-colors duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100",
              active
                ? "bg-paper-0 text-ink-900 shadow-sm"
                : "text-ink-500 hover:text-ink-700",
            )}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function PlanPrice({ plan, period }: { plan: TarineoPlan; period: BillingPeriod }) {
  if (period === "month") {
    return (
      <>
        <span className="text-[2.25rem] leading-none font-semibold tracking-tight text-ink-900 nums">
          {euroInt(plan.month)}
        </span>
        <span className="text-sm text-ink-400">HT / mois</span>
      </>
    );
  }
  const perMonth = Math.round(plan.year / 12);
  return (
    <>
      <span className="text-[2.25rem] leading-none font-semibold tracking-tight text-ink-900 nums">
        {euroInt(plan.year)}
      </span>
      <span className="text-sm text-ink-400">
        HT / an · soit {euroInt(perMonth)} / mois
      </span>
    </>
  );
}

function PricingCard({
  plan,
  period,
}: {
  plan: TarineoPlan;
  period: BillingPeriod;
}) {
  const featured = plan.featured;

  return (
    <Card
      className={cn(
        landingCardClass("relative flex h-full flex-col"),
        featured &&
          "z-[1] border-tarineo-orange/30 shadow-float ring-2 ring-tarineo-orange/25 lg:scale-[1.02]",
      )}
    >
      <CardContent className="flex flex-col gap-0 pt-6 sm:pt-7">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="text-heading font-semibold tracking-tight text-ink-900">{plan.name}</h3>
          {plan.badge ? (
            <Badge tone="accent" size="sm">{plan.badge}</Badge>
          ) : null}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{plan.text}</p>
        <div className="mt-6 flex flex-col gap-1">
          <PlanPrice plan={plan} period={period} />
        </div>
      </CardContent>
      <CardFooter className="mt-auto flex-col items-stretch gap-0 border-0 bg-transparent px-6 pb-6 pt-0 sm:px-7 sm:pb-7">
        <Separator className="mb-5 bg-line" />
        <ul className="flex flex-1 flex-col gap-2.5">
          {plan.features.map((feature) => (
            <li key={feature.label} className="flex items-start gap-2.5 text-sm">
              <span
                className={cn(
                  "mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full",
                  featured ? "bg-tarineo-orange/12 text-tarineo-orange" : "bg-paper-100 text-ink-500",
                )}
                aria-hidden
              >
                <Check className="size-3" strokeWidth={2.5} />
              </span>
              <span className="text-ink-600">
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
        <Button
          href={plan.href}
          size="md"
          variant={featured ? "primary" : "secondary"}
          className="mt-6 w-full min-h-11"
        >
          {plan.cta}
          <ArrowRight />
        </Button>
      </CardFooter>
    </Card>
  );
}

export function Pricing() {
  const reduce = useReducedMotion();
  const [period, setPeriod] = useState<BillingPeriod>("month");

  return (
    <LandingSection id="tarifs" className="border-t border-line/80 bg-paper-50/40">
      <div className="shell">
        <SectionHeading
          align="center"
          label={pricingIntro.title}
          title={
            <>
              {pricingIntro.headline}
              <span className="mt-2 block text-ink-400">{pricingIntro.headlineMuted}</span>
            </>
          }
          subtitle={PRICING_NOTE}
        />

        <div className="mt-8 flex flex-col items-center gap-4 sm:mt-10">
          <p className="rounded-full border border-line bg-paper-0 px-4 py-2 text-sm font-medium text-ink-600 shadow-sm">
            {pricingIntro.founder}
          </p>
          <BillingToggle value={period} onChange={setPeriod} />
        </div>

        <LandingStagger
          className="mt-10 grid items-stretch gap-5 sm:mt-12 lg:grid-cols-3 lg:gap-6"
          stagger={0.07}
        >
          {PRICING.map((plan) => (
            <LandingStaggerItem key={plan.id} className="h-full">
              <PricingCard plan={plan} period={period} />
            </LandingStaggerItem>
          ))}
        </LandingStagger>

        <p className="mt-8 text-center text-sm text-ink-400">
          Besoin du détail des limites et de la facturation ?{" "}
          <Link
            href="/prix"
            className="font-medium text-ink-700 underline-offset-4 hover:text-tarineo-orange hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/40 rounded-sm"
          >
            Voir la page Tarifs
          </Link>
        </p>

        <LandingTrustStrip items={pricingTrust} />

        <div className="mt-10 flex justify-center">
          <motion.div
            whileHover={reduce ? undefined : { y: -2 }}
            whileTap={reduce ? undefined : { scale: 0.97 }}
          >
            <Button href={LANDING_SIGNUP} size="lg" className="landing-cta-glow min-h-12">
              {LANDING_PRIMARY_CTA_LABEL}
              <ArrowRight />
            </Button>
          </motion.div>
        </div>
      </div>
    </LandingSection>
  );
}
