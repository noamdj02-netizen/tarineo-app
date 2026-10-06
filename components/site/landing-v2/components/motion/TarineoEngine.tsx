"use client";

import { motion } from "framer-motion";

import { LogoMark } from "@/components/site/landing-v2/components/layout/Logo";
import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";

export function TarineoEngine({
  status,
  pulse,
  pulseKey,
  reduced,
  revealed,
}: {
  status?: string;
  pulse: boolean;
  pulseKey: string;
  reduced: boolean;
  revealed: boolean;
}) {
  return (
    <motion.div
      className="relative z-20 flex flex-col items-center"
      initial={reduced ? false : { opacity: 0, scale: 0.94, y: 6 }}
      animate={
        revealed || reduced
          ? { opacity: 1, scale: 1, y: 0 }
          : { opacity: 0, scale: 0.94, y: 6 }
      }
      transition={{ duration: 0.5, ease: LANDING_EASE }}
    >
      {!reduced && pulse ? (
        <motion.span
          key={pulseKey}
          aria-hidden
          className="absolute inset-0 -m-4 rounded-3xl bg-accent/[0.08]"
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: [0, 0.45, 0], scale: [0.94, 1.06, 1] }}
          transition={{ duration: 1.15, ease: LANDING_EASE }}
        />
      ) : null}

      <div className="relative rounded-2xl border border-line bg-paper-0 p-5 shadow-float sm:p-[1.375rem]">
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/[0.04]"
        />
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-px rounded-2xl bg-[radial-gradient(circle_at_50%_0%,color-mix(in_srgb,var(--color-accent)_10%,transparent),transparent_58%)]"
        />

        <div className="relative flex flex-col items-center">
          <LogoMark className="h-[3.25rem] w-[3.25rem] sm:h-[3.75rem] sm:w-[3.75rem]" />
          <span className="mt-3 text-[0.6875rem] font-bold tracking-[0.16em] text-ink-900 sm:text-xs">
            TARINEO
          </span>
          {status ? (
            <motion.p
              key={status}
              className="mt-2 max-w-[11rem] text-center text-[0.6875rem] leading-snug text-ink-500 sm:text-xs"
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.35, ease: LANDING_EASE }}
            >
              {status}
            </motion.p>
          ) : (
            <span className="mt-2 block h-4" aria-hidden />
          )}
        </div>
      </div>
    </motion.div>
  );
}
