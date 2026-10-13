"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check, Clock } from "lucide-react";
import { useState } from "react";
import { EASE, Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingButton } from "@/components/site/landing-button";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { OFFER, PRICING, PRICING_NOTE, euroInt, type TarineoPlan } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

type Period = "month" | "year";

const perMonth = (year: number) => `${(year / 12).toFixed(2).replace(".", ",")}\u00a0€`;

export function LandingPricing() {
  const [period, setPeriod] = useState<Period>("month");

  return (
    <div className="mx-auto flex w-full max-w-[1180px] flex-col items-center gap-8">
      <InView className="flex w-full flex-col items-center gap-8" stagger={0.08}>
        <Reveal>
          <ToggleGroup
            value={[period]}
            onValueChange={(next) => {
              const v = Array.isArray(next) ? next[0] : next;
              if (v === "month" || v === "year") setPeriod(v);
            }}
            spacing={0}
            className="rounded-pill bg-white p-1 shadow-soft"
            aria-label="Période de facturation"
          >
            <ToggleGroupItem value="month" className="min-h-9 rounded-pill px-4">
              Mensuel
            </ToggleGroupItem>
            <ToggleGroupItem value="year" className="min-h-9 gap-2 rounded-pill px-4">
              Annuel
              <Badge variant="secondary" className="bg-gain/15 text-[#166534]">
                −20 %
              </Badge>
            </ToggleGroupItem>
          </ToggleGroup>
        </Reveal>

        <div className="grid w-full items-stretch gap-4 lg:grid-cols-3 lg:gap-5">
          {PRICING.map((plan) => (
            <Reveal key={plan.id} className="h-full">
              <PlanCard plan={plan} period={period} />
            </Reveal>
          ))}
        </div>
        <Reveal>
          <p className="text-center text-[15px] text-muted-foreground sm:text-base">{PRICING_NOTE}</p>
        </Reveal>
      </InView>
    </div>
  );
}

function PlanCard({ plan, period }: { plan: TarineoPlan; period: Period }) {
  const reduce = useReducedMotion();
  const featured = plan.featured;
  const price = period === "month" ? euroInt(plan.month) : perMonth(plan.year);

  return (
    <article
      className={cn(
        "relative flex h-full flex-col rounded-[28px] border bg-white p-6 shadow-soft",
        featured ? "border-brand-orange/35 ring-4 ring-brand-orange/10" : "border-line",
      )}
    >
      {plan.badge ? (
        <p className="mb-2 text-[12px] font-semibold tracking-[0.12em] text-brand-orange uppercase">{plan.badge}</p>
      ) : null}
      <h3 className="font-display text-[28px] font-semibold">{plan.name}</h3>
      <p className="mt-1 text-[15px] text-muted-foreground">{plan.text}</p>
      <div className="mt-4 flex items-baseline gap-1">
        <motion.span
          key={price}
          initial={reduce ? false : { opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          className="font-display text-[40px] leading-none font-semibold tabular-nums"
        >
          {price}
        </motion.span>
        <span className="text-[14px] text-muted-foreground">/ mois</span>
      </div>
      <p className="mt-2 text-[13px] text-muted-foreground">{OFFER}</p>

      <ul className="mt-6 flex flex-col gap-2.5">
        {plan.features.map((f) => (
          <li
            key={f.label}
            className={cn("flex items-start gap-2.5 text-[15px] leading-snug", f.soon && "text-muted-foreground")}
          >
            {f.soon ? (
              <Clock className="mt-0.5 size-4 flex-none" aria-hidden />
            ) : (
              <Check className="mt-0.5 size-4 flex-none text-ink" aria-hidden />
            )}
            <span>
              {f.label}
              {f.soon ? <span className="ml-1.5 text-[12px]">(bientôt)</span> : null}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <LandingButton
          href={`${plan.href}&interval=${period}`}
          variant="orange"
          className="px-7"
        >
          {plan.cta}
        </LandingButton>
      </div>
    </article>
  );
}
