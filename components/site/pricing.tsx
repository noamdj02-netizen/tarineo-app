"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { LandingButton } from "@/components/site/landing-button";
import { EASE } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FEATURES,
  FOUNDER,
  LOYALTY_TIERS,
  type Interval,
} from "@/lib/billing/plans";
import { cn } from "@/lib/utils";

const euro = (n: number) => `${n} €`;

/** Grille des 3 offres + escalier du prix fidélité. */
export function Pricing() {
  const [interval, setPeriod] = useState<Interval>("month");
  const first = LOYALTY_TIERS[0];
  const unit = interval === "month" ? "/ mois" : "/ an";

  return (
    <div className="flex flex-col items-center gap-8">
      <div
        role="radiogroup"
        aria-label="Période de paiement"
        className="relative flex rounded-pill border border-line bg-surface-2 p-1"
      >
        {(["month", "year"] as const).map((i) => (
          <Button
            key={i}
            type="button"
            variant="ghost"
            role="radio"
            aria-checked={interval === i}
            onClick={() => setPeriod(i)}
            className={cn(
              "relative min-h-10 rounded-pill px-5 text-[14px] font-medium",
              interval === i ? "text-accent-ink hover:bg-transparent" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {interval === i ? (
              <motion.span
                layoutId="interval-pill"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
                className="absolute inset-0 rounded-pill bg-ink shadow-dark"
              />
            ) : null}
            <span className="relative">
              {i === "month" ? "Mensuel" : "Annuel"}
              {i === "year" ? (
                <span className="ml-2 font-mono text-[10.5px] tracking-[0.06em] uppercase opacity-70">
                  2 mois offerts
                </span>
              ) : null}
            </span>
          </Button>
        ))}
      </div>

      <div className="grid w-full gap-4 md:grid-cols-3">
        <PlanCard
          name="Gratuit"
          price="0 €"
          unit="pour toujours"
          text="Pour découvrir le cockpit sur un ou deux projets."
          features={FEATURES.free}
          cta="Commencer gratuitement"
          href="/inscription"
        />
        <PlanCard
          dark
          name="Pro"
          price={euro(interval === "month" ? first.month : first.year)}
          unit={unit}
          text="Tout Navpit, et ton prix baisse chaque année où tu restes."
          features={FEATURES.pro}
          cta="Passer Pro"
          href={`/inscription?plan=pro&interval=${interval}`}
          badge="Le plus choisi"
        >
          <Staircase interval={interval} />
        </PlanCard>
        <PlanCard
          name="Fondateur"
          price={euro(FOUNDER.price)}
          unit="une fois"
          text="Pour les premiers qui y croient : Pro à vie, sans abonnement."
          features={FEATURES.founder}
          cta="Devenir fondateur"
          href="/inscription?plan=founder"
        />
      </div>
    </div>
  );
}

function PlanCard({
  name,
  price,
  unit,
  text,
  features,
  cta,
  href,
  badge,
  dark,
  children,
}: {
  name: string;
  price: string;
  unit: string;
  text: string;
  features: string[];
  cta: string;
  href: string;
  badge?: string;
  dark?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col gap-5 rounded-[24px] p-6 sm:p-7",
        dark ? "bg-ink text-accent-ink shadow-lift" : "border border-line bg-surface shadow-soft",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <p className={cn("mono-label", dark && "text-accent-ink/60")}>{`/ ${name} ///`}</p>
        {badge ? (
          <Badge variant="secondary" className="rounded-pill font-mono text-[10px] tracking-widest uppercase">
            {badge}
          </Badge>
        ) : null}
      </div>
      <div className="flex items-baseline gap-2">
        <motion.span
          key={price}
          initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.3, ease: EASE }}
          className="font-display text-[44px] leading-none font-semibold tracking-tightest"
        >
          {price}
        </motion.span>
        <span className={cn("text-[14px]", dark ? "text-accent-ink/60" : "text-muted-foreground")}>{unit}</span>
      </div>
      <p className={cn("text-[14.5px] leading-relaxed", dark ? "text-accent-ink/75" : "text-muted-foreground")}>
        {text}
      </p>
      {children}
      <ul className="flex flex-col gap-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[14.5px]">
            <Check
              className={cn("mt-0.5 size-4 flex-none", dark ? "text-accent-ink" : "text-ink")}
              aria-hidden
            />
            {f}
          </li>
        ))}
      </ul>
      <LandingButton
        href={href}
        variant={dark ? "pricingOnDark" : "pricingOnLight"}
        fullWidth
      >
        {cta}
      </LandingButton>
    </div>
  );
}

/** Escalier 15 → 12 → 9 : chaque marche est une année d'abonnement. */
function Staircase({ interval }: { interval: Interval }) {
  const reduce = useReducedMotion();
  const max = LOYALTY_TIERS[0][interval];
  return (
    <div className="rounded-[16px] bg-accent-ink/[0.06] p-4">
      <p className="mb-3 text-[12.5px] text-accent-ink/70">Ton prix fidélité, année après année</p>
      <div className="flex h-24 items-end gap-2">
        {LOYALTY_TIERS.map((t, i) => (
          <div key={t.fromYear} className="flex flex-1 flex-col items-center gap-1.5">
            <span className="font-mono text-[12px] font-medium">{euro(t[interval])}</span>
            <motion.div
              initial={reduce ? false : { scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: EASE }}
              style={{ height: `${(t[interval] / max) * 56}px` }}
              className={cn(
                "w-full origin-bottom rounded-[8px]",
                i === 0 ? "bg-accent-ink/30" : i === 1 ? "bg-accent-ink/55" : "bg-accent-ink",
              )}
            />
            <span className="text-center text-[11px] leading-tight text-accent-ink/60">{t.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
