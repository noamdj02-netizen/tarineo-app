"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  analysisCounts,
  learningActivityFeed,
} from "@/lib/site/landing-v2-content";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { Stat } from "@/components/site/landing-v2/components/ui/Stat";
import {
  LANDING_EASE,
  LANDING_VIEW,
  LandingProgressBar,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";

const INDEX_PERCENT = 78;

/** Panneau « analyse en cours » — chiffres, progression et flux récent. */
export function LearningAnalysisPanel() {
  const reduce = useReducedMotion();
  const [total, ...breakdown] = analysisCounts;

  return (
    <div className="landing-product-surface surface relative overflow-hidden p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <SectionLabel>Analyse en cours</SectionLabel>
        <Badge tone="accent" dot className="shrink-0">
          <span className="inline-flex items-center gap-2">
            {!reduce ? (
              <motion.span
                aria-hidden
                className="h-1.5 w-1.5 rounded-full bg-accent"
                animate={{ opacity: [0.35, 1, 0.35] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
              />
            ) : null}
            Lecture
          </span>
        </Badge>
      </div>

      <div className="mt-6 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <Stat value={total.value} label={total.label} duration={1200} />
        </div>
        <div className="w-full sm:max-w-[220px]">
          <div className="flex items-center justify-between text-xs text-ink-400">
            <span>Indexation</span>
            <span className="font-medium text-ink-900 nums">{INDEX_PERCENT} %</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-paper-200">
            <LandingProgressBar percent={INDEX_PERCENT} />
          </div>
        </div>
      </div>

      <LandingStagger className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4" stagger={0.06}>
        {breakdown.map((item) => (
          <LandingStaggerItem key={item.label}>
            <div className="surface-flat flex flex-col gap-3 p-3.5 sm:p-4">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
                <Icon name={item.icon} className="h-4 w-4" />
              </span>
              <Stat value={item.value} label={item.label} duration={900} compact />
            </div>
          </LandingStaggerItem>
        ))}
      </LandingStagger>

      <div className="mt-6">
        <p className="eyebrow text-ink-400">Dernières pièces lues</p>
        <ul className="mt-3 flex flex-col gap-2">
          {learningActivityFeed.map((event, index) => (
            <motion.li
              key={event.text}
              className="flex items-center gap-3 rounded-md bg-paper-50 px-3 py-2.5"
              initial={reduce ? false : { opacity: 0, x: -8 }}
              whileInView={reduce ? { opacity: 1 } : { opacity: 1, x: 0 }}
              viewport={LANDING_VIEW}
              transition={{
                duration: 0.4,
                ease: LANDING_EASE,
                delay: 0.2 + index * 0.1,
              }}
            >
              <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-line bg-paper-0 text-ink-400">
                <Icon name={event.icon} className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink-900">
                {event.text}
              </span>
              <span className="shrink-0 text-xs text-ink-400">{event.meta}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex items-start gap-3 border-t border-line pt-5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
          <Icon name="spark" className="h-4 w-4" />
        </span>
        <p className="text-sm leading-relaxed text-ink-600">
          Tarinéo ne demande rien : il lit ce que vous avez déjà et construit votre modèle
          d&apos;entreprise au fil des documents.
        </p>
      </div>
    </div>
  );
}
