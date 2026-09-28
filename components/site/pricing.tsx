"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { useState } from "react";
import { Illustration } from "@/components/illustration";
import { BrandFocus } from "@/components/site/brand-focus";
import { LandingButton } from "@/components/site/landing-button";
import { GLOW_HALO, type FeatureGlowTint } from "@/components/site/landing-feature-card";
import { EASE } from "@/components/motion/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  FEATURES,
  FOUNDER,
  PRO,
  PRO_TRIAL_DAYS,
  STARTER,
  SUBSCRIPTION_LOYALTY,
  type Interval,
} from "@/lib/billing/plans";
import type { IllustrationName } from "@/lib/illustrations";
import { cn } from "@/lib/utils";

const euro = (n: number) => `${n} €`;

function LoyaltyLadder({
  title,
  prices,
  labels,
  interval,
}: {
  title: string;
  prices: readonly [number, number, number];
  labels: readonly [string, string, string];
  interval: Interval;
}) {
  const unit = interval === "month" ? "/ mois" : "/ an";
  return (
    <div className="rounded-[18px] border border-line bg-surface px-4 py-3.5">
      <p className="text-[13px] font-semibold tracking-tight">{title}</p>
      <ol className="mt-2.5 flex flex-col gap-1.5">
        {labels.map((label, i) => (
          <li key={label} className="flex items-baseline justify-between gap-3 text-[13px]">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-mono tabular-nums">
              {euro(prices[i])}
              <span className="ml-1 font-sans text-[11px] text-muted-foreground">{unit}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function loyaltyFootnote(plan: "starter" | "pro", interval: Interval) {
  const ladder = SUBSCRIPTION_LOYALTY[plan][interval];
  const unit = interval === "month" ? "/mois" : "/an";
  return `Puis ${euro(ladder[1])}${unit} (2e année), ${euro(ladder[2])}${unit} dès la 3e — automatique.`;
}

/** Grille Création / Pro / Fondateur. */
export function Pricing() {
  const [interval, setPeriod] = useState<Interval>("month");
  const unit = interval === "month" ? "/ mois" : "/ an";
  const loyaltyPrices = interval === "month" ? "month" : "year";

  return (
    <div className="flex w-full flex-col items-center gap-6 px-0 sm:gap-8">
      <Card className="w-full max-w-[1080px] flex-col items-stretch gap-3 rounded-[20px] border-line bg-surface-2 py-4 shadow-soft ring-1 ring-line sm:flex-row sm:items-center sm:gap-6 sm:rounded-[24px] sm:py-5">
        <div className="hidden shrink-0 pl-(--card-spacing) sm:block">
          <Illustration name="landing-commencer" className="size-[88px]" label="Commencer sans carte" />
        </div>
        <CardContent className="flex min-w-0 flex-1 flex-col gap-1.5 px-4 py-0 sm:px-(--card-spacing)">
          <CardTitle className="font-display text-[17px] font-semibold tracking-tight text-ink sm:text-[18px]">
            {PRO_TRIAL_DAYS} jours d’essai Pro gratuit
          </CardTitle>
          <CardDescription className="text-[14px] leading-relaxed">
            Sans carte à l’inscription : tu testes tout Pro (illimité). Ensuite, Création à {STARTER.month} € ou Pro à{" "}
            {PRO.month} € — et ton abonnement{" "}
            <span className="font-medium text-ink">baisse chaque année</span> tant que tu restes client. Sans paiement
            avant la fin de l’essai, le compte est supprimé.
          </CardDescription>
        </CardContent>
        <div className="flex justify-center pb-1 sm:hidden">
          <Illustration name="landing-commencer" className="size-16" label="Commencer sans carte" />
        </div>
      </Card>

      <div
        role="radiogroup"
        aria-label="Période de paiement"
        className="relative flex w-full max-w-[min(100%,340px)] rounded-pill border border-line bg-surface-2 p-1 sm:max-w-none"
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
              "relative min-h-10 flex-1 rounded-pill px-3 text-[13px] font-medium sm:px-5 sm:text-[14px]",
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
            <span className="relative flex flex-col items-center gap-0.5 sm:flex-row sm:gap-0">
              {i === "month" ? "Mensuel" : "Annuel"}
              {i === "year" ? (
                <span className="font-mono text-[9px] tracking-[0.06em] uppercase opacity-70 sm:ml-2 sm:text-[10.5px]">
                  2 mois offerts
                </span>
              ) : null}
            </span>
          </Button>
        ))}
      </div>

      <Card className="w-full max-w-[1080px] gap-4 rounded-[20px] border-line bg-surface-2 py-4 shadow-soft ring-1 ring-line sm:rounded-[24px] sm:py-5 sm:px-2">
        <CardContent className="flex flex-col gap-4 px-4 py-0 sm:px-6">
          <div className="max-w-[62ch]">
            <CardTitle className="font-display text-[17px] font-semibold tracking-tight sm:text-[18px]">
              Prix fidélité : tu paies moins cher chaque année
            </CardTitle>
            <CardDescription className="mt-1.5 text-[14px] leading-relaxed">
              Sur Création ({STARTER.month} €) et Pro ({PRO.month} €), le tarif affiché est celui de ta{" "}
              <strong className="font-medium text-ink">1re année</strong>. À chaque anniversaire d’abonnement, le
              prochain renouvellement est moins élevé — sans code promo ni démarche.
            </CardDescription>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <LoyaltyLadder
              title="Création"
              labels={SUBSCRIPTION_LOYALTY.starter.labels}
              prices={SUBSCRIPTION_LOYALTY.starter[loyaltyPrices]}
              interval={interval}
            />
            <LoyaltyLadder
              title="Pro"
              labels={SUBSCRIPTION_LOYALTY.pro.labels}
              prices={SUBSCRIPTION_LOYALTY.pro[loyaltyPrices]}
              interval={interval}
            />
          </div>
        </CardContent>
      </Card>

      <div className="mx-auto grid w-full max-w-[1080px] items-stretch gap-5 lg:grid-cols-3">
        <PlanCard
          art="landing-idee"
          glow="glow-1"
          name="Création"
          price="0 €"
          unit={`pendant ${PRO_TRIAL_DAYS} jours`}
          thenPrice={euro(interval === "month" ? STARTER.month : STARTER.year)}
          thenUnit={unit}
          loyaltyNote={loyaltyFootnote("starter", interval)}
          text="Pour lancer sans te disperser : assez de projets et d’IA pour un vrai side project."
          features={FEATURES.starter}
          cta="Commencer l’essai gratuit"
          href={`/inscription?plan=starter&interval=${interval}`}
        />
        <PlanCard
          featured
          art="landing-progression"
          glow="glow-2"
          name="Pro"
          price="0 €"
          unit={`pendant ${PRO_TRIAL_DAYS} jours`}
          thenPrice={euro(interval === "month" ? PRO.month : PRO.year)}
          thenUnit={unit}
          text="Tout TARINEO : illimité, agenda branché, copilote sans plafond schéma."
          features={FEATURES.pro}
          cta="Essayer puis passer Pro"
          href={`/inscription?plan=pro&interval=${interval}`}
          badge="Complet"
          loyaltyNote={loyaltyFootnote("pro", interval)}
        />
        <PlanCard
          art="landing-victoire"
          glow="glow-3"
          name="Fondateur"
          price={euro(FOUNDER.price)}
          unit="une fois"
          text="Les premiers qui croient au produit : Pro à vie, sans abonnement."
          features={FEATURES.founder}
          cta="Devenir fondateur"
          href="/inscription?plan=founder"
        />
      </div>
    </div>
  );
}

function PlanCard({
  art,
  glow = "glow-2",
  name,
  price,
  unit,
  thenPrice,
  thenUnit,
  trialNote,
  loyaltyNote,
  text,
  features,
  cta,
  href,
  badge,
  featured,
}: {
  art: IllustrationName;
  glow?: FeatureGlowTint;
  name: string;
  price: string;
  unit: string;
  thenPrice?: string;
  thenUnit?: string;
  trialNote?: string;
  loyaltyNote?: string;
  text: string;
  features: string[];
  cta: string;
  href: string;
  badge?: string;
  featured?: boolean;
}) {
  return (
    <Card
      className={cn(
        "relative h-full gap-0 overflow-visible rounded-[22px] py-0 ring-1 sm:rounded-[28px]",
        featured
          ? "border-0 bg-ink text-accent-ink shadow-lift ring-accent-ink/15 lg:scale-[1.02] lg:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.35)]"
          : "border-line bg-surface shadow-soft ring-line",
      )}
    >
      {featured ? (
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 rounded-t-[28px] bg-[linear-gradient(180deg,rgba(255,255,255,0.08)_0%,transparent_100%)]"
          aria-hidden
        />
      ) : null}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute -top-10 right-[-6%] h-44 w-52 rounded-full blur-2xl",
          featured ? "opacity-40" : "opacity-90",
          GLOW_HALO[glow],
        )}
      />

      <CardHeader
        className={cn(
          "relative gap-3 border-b px-4 pt-5 pb-4 sm:px-7 sm:pt-7 sm:pb-5",
          featured ? "border-accent-ink/10" : "border-line",
        )}
      >
        <p className={cn("mono-label", featured && "text-accent-ink/60")}>{`/ ${name} ///`}</p>
        <div className="flex flex-wrap items-end justify-between gap-3 pr-[4.25rem] sm:pr-24">
          <div className="flex min-w-0 flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0">
              <motion.span
                key={price}
                initial={{ opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.3, ease: EASE }}
                className="font-display text-[clamp(2rem,7vw,2.5rem)] leading-none font-semibold tracking-tightest"
              >
                <BrandFocus className={cn(featured && "brand-focus-inherit")}>{price}</BrandFocus>
              </motion.span>
              <span className={cn("text-[14px]", featured ? "text-accent-ink/60" : "text-muted-foreground")}>
                {unit}
              </span>
            </div>
            {thenPrice ? (
              <p className={cn("text-[13px]", featured ? "text-accent-ink/65" : "text-muted-foreground")}>
                puis {thenPrice}
                {thenUnit ? <span className="ml-1">{thenUnit}</span> : null}
              </p>
            ) : null}
            {trialNote ? (
              <p className={cn("text-[13px]", featured ? "text-accent-ink/65" : "text-muted-foreground")}>
                {trialNote}
              </p>
            ) : null}
            {loyaltyNote ? (
              <p className={cn("text-[12.5px] leading-snug", featured ? "text-accent-ink/55" : "text-muted-foreground")}>
                {loyaltyNote}
              </p>
            ) : null}
          </div>
          {badge ? (
            <Badge
              variant={featured ? "secondary" : "outline"}
              className={cn(
                "rounded-pill font-mono text-[10px] tracking-widest uppercase",
                featured && "border-accent-ink/20 bg-accent-ink/10 text-accent-ink",
              )}
            >
              {badge}
            </Badge>
          ) : null}
        </div>
        <CardTitle
          className={cn(
            "text-[14.5px] leading-relaxed font-normal",
            featured ? "text-accent-ink/80" : "text-muted-foreground",
          )}
        >
          {text}
        </CardTitle>
        <CardAction className="row-span-3 max-sm:top-5 max-sm:right-4">
          <Illustration
            name={art}
            className={cn("size-[4.25rem] sm:size-20 md:size-[92px]", featured && "sm:-translate-y-1")}
            label={name}
            depth={featured ? 6 : 4}
            tone={featured ? "on-dark" : "default"}
          />
        </CardAction>
      </CardHeader>

      <CardContent className="flex flex-col gap-5 px-4 py-4 sm:px-7 sm:py-5">
        <Separator className={featured ? "bg-accent-ink/12" : undefined} />
        <ul className="flex flex-col gap-2.5">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2.5 text-[14px] leading-snug">
              <Check
                className={cn("mt-0.5 size-4 flex-none", featured ? "text-accent-ink" : "text-ink")}
                aria-hidden
              />
              {f}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter
        className={cn(
          "mt-auto border-t px-4 py-4 sm:px-7 sm:py-5",
          featured ? "border-accent-ink/10 bg-accent-ink/[0.04]" : "border-line bg-surface-2/80",
        )}
      >
        <LandingButton href={href} variant={featured ? "pricingOnDark" : "pricingOnLight"} fullWidth className="mt-0">
          {cta}
        </LandingButton>
      </CardFooter>
    </Card>
  );
}
