"use client";

import { motion, AnimatePresence } from "framer-motion";

import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import type { MotionHubNode } from "@/lib/site/landing-motion-hub";
import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";

export type CardStateTone = "idle" | "analyzing" | "success" | "business";

export function MotionNodeCard({
  node,
  active,
  dimmed,
  stateLabel,
  stateTone = "idle",
  revealDelay = 0,
  revealed,
  reduced,
}: {
  node: MotionHubNode;
  active?: boolean;
  dimmed?: boolean;
  stateLabel?: string;
  stateTone?: CardStateTone;
  revealDelay?: number;
  revealed: boolean;
  reduced: boolean;
}) {
  const label = stateLabel ?? node.stateIdle;

  return (
    <motion.div
      className={`landing-product-surface surface relative z-10 w-[min(100%,11.5rem)] min-w-[10.5rem] p-4 sm:w-[12.25rem] sm:p-[1.125rem] ${
        active ? "shadow-card" : ""
      }`}
      initial={reduced ? false : { opacity: 0, y: 14, scale: 0.98 }}
      animate={
        revealed || reduced
          ? {
              opacity: dimmed ? 0.62 : 1,
              y: 0,
              scale: active ? 1.008 : 1,
            }
          : { opacity: 0, y: 14, scale: 0.98 }
      }
      transition={{
        duration: 0.5,
        ease: LANDING_EASE,
        delay: reduced ? 0 : revealDelay,
      }}
      style={{
        borderColor: active ? "color-mix(in srgb, var(--color-accent) 32%, transparent)" : undefined,
      }}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`inline-flex size-10 shrink-0 items-center justify-center rounded-sm border ${
            active
              ? "border-accent-100 bg-accent-soft text-accent-700"
              : "border-line bg-paper-50 text-ink-400"
          }`}
        >
          <Icon name={node.icon} className="h-[1.125rem] w-[1.125rem]" />
        </span>
        {stateTone === "analyzing" ? (
          <span className="rounded-full border border-line bg-paper-50 px-2 py-0.5 text-[0.625rem] font-medium text-ink-500">
            …
          </span>
        ) : null}
        {stateTone === "success" ? (
          <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[0.625rem] font-medium text-accent-700">
            OK
          </span>
        ) : null}
      </div>

      <p className="mt-3 text-sm font-semibold leading-snug text-ink-900">{node.label}</p>
      <p className="mt-1 text-xs text-ink-400">{node.sub}</p>

      <div className="mt-3 border-t border-line pt-2.5">
        <AnimatePresence mode="wait">
          <motion.p
            key={label}
            className={`text-[0.6875rem] font-medium leading-snug nums ${
              stateTone === "business"
                ? "text-sm text-accent-700"
                : stateTone === "success"
                  ? "text-ink-700"
                  : stateTone === "analyzing"
                    ? "text-ink-500"
                    : "text-ink-500"
            }`}
            initial={reduced ? false : { opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            transition={{ duration: 0.28, ease: LANDING_EASE }}
          >
            {label}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
