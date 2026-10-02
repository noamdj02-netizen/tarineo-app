"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, Check, Clock } from "lucide-react";
import { useState } from "react";
import { EASE, Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingButton } from "@/components/site/landing-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { euroInt, PRICING, PRICING_NOTE, type TarineoPlan } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

type Period = "month" | "year";

const perMonth = (year: number) => `${(year / 12).toFixed(2).replace(".", ",")}\u00a0€`;

/** Grille Starter / Pro / Équipe — ToggleGroup pour mensuel / annuel. */
export function LandingPricing() {
  const [period, setPeriod] = useState<Period>("month");

  return (
    <div className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-6">
      <InView className="flex w-full flex-col items-center gap-6" stagger={0.08}>
        <Reveal>
          <ToggleGroup
            value={[period]}
            onValueChange={(next) => {
              const v = Array.isArray(next) ? next[0] : next;
              if (v === "month" || v === "year") setPeriod(v);
            }}
            spacing={0}
            className="rounded-xl bg-muted p-1"
            aria-label="Période de facturation"
          >
            <ToggleGroupItem value="month" className="min-h-9 rounded-lg px-4">
              Mensuel
            </ToggleGroupItem>
            <ToggleGroupItem value="year" className="min-h-9 gap-2 rounded-lg px-4">
              Annuel
              <Badge variant="secondary" className="bg-gain/15 text-gain">
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
          <p className="text-center text-[15px] text-muted-foreground sm:text-base">
            {PRICING_NOTE}
          </p>
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
    <Card
      className={cn(
        "card-lift relative h-full gap-0 rounded-2xl py-0",
        featured
          ? "bg-alert-wash text-white shadow-lift ring-brand-orange/40 lg:scale-[1.02]"
          : "shadow-soft",
      )}
    >
      {featured ? (
        <div
          aria-hidden
          className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[80%] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(236,88,33,0.22),transparent_70%)] blur-xl"
        />
      ) : null}

      <CardHeader
        className={cn(
          "relative gap-3 border-b px-6 pt-6 pb-5",
          featured && "border-white/10",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <CardTitle
            className={cn(
              "text-[15px] font-semibold tracking-[0.06em] uppercase",
              featured && "text-white/90",
            )}
          >
            {plan.name}
          </CardTitle>
          {plan.badge ? (
            <Badge className="bg-brand-orange text-white">{plan.badge}</Badge>
          ) : null}
        </div>
        <div className="flex items-baseline gap-1.5">
          <motion.span
            key={price}
            initial={reduce ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            className={cn(
              "font-display text-[44px] leading-none font-semibold tabular-nums",
              featured && "text-white",
            )}
          >
            {price}
          </motion.span>
          <span
            className={cn(
              "text-[14px]",
              featured ? "text-white/60" : "text-muted-foreground",
            )}
          >
            HT / mois
          </span>
        </div>
        <CardDescription
          className={cn("text-[15px] sm:text-base", featured && "text-white/75")}
        >
          {period === "year" ? `Facturé ${euroInt(plan.year)} HT par an. ` : ""}
          {plan.text}
        </CardDescription>
        <Badge
          variant="outline"
          className={cn(
            "w-fit",
            featured
              ? "border-white/20 bg-white/10 text-[#FFB37A]"
              : "border-brand-orange/35 bg-brand-orange/10 text-brand-orange-light",
          )}
        >
          1er mois offert
        </Badge>
      </CardHeader>

      <CardContent className="relative px-6 py-5">
        <ul className="flex flex-col gap-2.5">
          {plan.features.map((f) => (
            <li
              key={f.label}
              className={cn(
                "flex items-start gap-2.5 text-[15px] leading-snug sm:text-base",
                featured && !f.soon && "text-white/92",
                !featured && f.soon && "text-muted-foreground",
                featured && f.soon && "text-white/55",
              )}
            >
              {f.soon ? (
                <Clock
                  className={cn("mt-0.5 size-4 flex-none", featured && "text-white/45")}
                  aria-hidden
                />
              ) : (
                <Check
                  className={cn(
                    "mt-0.5 size-4 flex-none",
                    featured ? "text-brand-orange-light" : "text-foreground/70",
                  )}
                  aria-hidden
                />
              )}
              <span>
                {f.label}
                {f.soon ? (
                  <span className={cn("ml-1.5 text-[12px]", featured && "text-white/45")}>
                    (bientôt)
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="relative mt-auto bg-transparent px-6 py-5">
        <LandingButton
          href={`${plan.href}&interval=${period}`}
          variant={featured ? "orange" : "secondary"}
          icon={featured ? <ArrowUpRight aria-hidden /> : undefined}
          fullWidth
        >
          {plan.cta}
        </LandingButton>
      </CardFooter>
    </Card>
  );
}
