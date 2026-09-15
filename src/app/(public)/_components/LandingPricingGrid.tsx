"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { landingSpringSoft } from "./motion/landingMotionConfig";

interface Plan {
  nom: string;
  prix: string;
  desc: string;
  features: string[];
  populaire?: boolean;
}

interface Props {
  plans: Plan[];
  ctaHref: string;
}

export function LandingPricingGrid({ plans, ctaHref }: Props) {
  const reduce = useReducedMotion();

  return (
    <div className="grid items-start gap-6 lg:grid-cols-3">
      {plans.map((plan, i) => (
        <motion.article
          key={plan.nom}
          className={`flex flex-col rounded-3xl border px-7 py-8 ${
            plan.populaire
              ? "border-2 border-[var(--landing-border-popular)] lg:min-h-[477px]"
              : "min-h-[402px] border-[1.5px] border-[var(--landing-border)]"
          }`}
          initial={reduce ? false : { opacity: 0, y: 32 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ ...landingSpringSoft, delay: i * 0.1 }}
          whileHover={
            reduce
              ? undefined
              : {
                  y: plan.populaire ? -8 : -4,
                  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                }
          }
        >
          {plan.populaire && (
            <span className="landing-gradient-bg landing-display mb-5 inline-flex w-fit rounded-full px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-white">
              Populaire
            </span>
          )}
          {!plan.populaire && <div className="mb-5 h-[30px]" aria-hidden="true" />}
          <p className="landing-display text-xl font-semibold text-[var(--landing-text)]">{plan.nom}</p>
          <p className="mt-3 flex items-baseline gap-1">
            <span className="landing-display text-[3.375rem] font-semibold leading-none text-[var(--landing-text)]">{plan.prix}</span>
            <span className="landing-body text-base text-[var(--landing-muted)]">/mois</span>
          </p>
          <p className="landing-body mt-3 text-sm leading-normal text-[var(--landing-muted)]">{plan.desc}</p>
          <div className="my-5 h-px bg-[var(--landing-border)]" />
          <ul className="landing-body mb-8 flex-1 space-y-2.5 text-sm text-[var(--landing-text)]">
            {plan.features.map((f) => (
              <li key={f}>✓ {f}</li>
            ))}
          </ul>
          <Link
            href={ctaHref}
            className={`landing-display block rounded-full py-3.5 text-center text-base font-medium transition-transform hover:opacity-90 active:scale-[0.98] ${
              plan.populaire ? "landing-gradient-bg text-white" : "bg-[var(--landing-text)] text-white"
            }`}
          >
            Commencer
          </Link>
        </motion.article>
      ))}
    </div>
  );
}
