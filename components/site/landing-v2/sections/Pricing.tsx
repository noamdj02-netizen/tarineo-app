"use client";

import { motion, useReducedMotion } from "framer-motion";

import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { plans } from "@/lib/site/landing-v2-content";
import { ArrowRight, Button } from "@/components/site/landing-v2/components/ui/Button";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { LandingFeatureCard, LandingStagger } from "@/components/site/landing-v2/lib/landing-motion";

export function Pricing() {
  const reduce = useReducedMotion();

  return (
    <section id="tarifs" className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          align="center"
          label="Tarifs"
          title="Un prix clair, sans engagement."
          subtitle="Vous commencez seul et vous gardez vos données. Les fonctions en préparation sont annoncées comme telles."
        />

        <LandingStagger className="mt-14 grid gap-5 lg:grid-cols-3" stagger={0.08}>
          {plans.map((plan) => (
            <LandingFeatureCard
              key={plan.name}
              className={`surface relative flex flex-col p-6 sm:p-7 ${
                plan.featured ? "border-accent-100 shadow-float lg:-mt-3 lg:mb-3" : ""
              }`}
            >
              {plan.featured ? (
                <span className="absolute -top-3 left-6">
                  <Badge tone="dark">Le plus choisi</Badge>
                </span>
              ) : null}

              <h3 className="text-heading font-semibold text-ink-900">{plan.name}</h3>
              <p className="mt-1.5 text-sm text-ink-400">{plan.tagline}</p>

              <p className="mt-6 flex items-baseline gap-2">
                <span className="text-[2rem] leading-none font-semibold text-ink-900 nums">
                  {plan.price}
                </span>
              </p>
              <p className="mt-2 text-sm text-ink-400">{plan.priceNote}</p>

              <ul className="mt-6 flex flex-col gap-3 border-t border-line pt-6">
                {plan.features.map((feature) => (
                  <li key={feature.label} className="flex items-start gap-3 text-sm">
                    <span
                      className={`mt-0.5 inline-flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full ${
                        feature.soon
                          ? "border border-dashed border-line-strong"
                          : "bg-accent-soft text-accent-700"
                      }`}
                      style={{ height: "1.125rem", width: "1.125rem" }}
                    >
                      {feature.soon ? null : <Icon name="check" className="h-3 w-3" strokeWidth={2} />}
                    </span>
                    <span className={feature.soon ? "text-ink-400" : "text-ink-600"}>
                      {feature.label}
                      {feature.soon ? (
                        <span className="ml-2 rounded-full bg-paper-50 px-2 py-0.5 text-xs text-ink-400">
                          bientôt disponible
                        </span>
                      ) : null}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 pt-2">
                <motion.div
                  whileHover={reduce ? undefined : { y: -2 }}
                  whileTap={reduce ? undefined : { scale: 0.97 }}
                >
                  <Button
                    href={plan.name === "Tarinéo Business" ? "mailto:contact@tarineo.com" : LANDING_SIGNUP}
                    variant={plan.featured ? "primary" : "secondary"}
                    className="w-full"
                  >
                    {plan.cta}
                    <ArrowRight />
                  </Button>
                </motion.div>
              </div>
            </LandingFeatureCard>
          ))}
        </LandingStagger>
      </div>
    </section>
  );
}
