"use client";

import { motion } from "framer-motion";

import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import type { IconName } from "@/lib/site/landing-v2-content";
import {
  LANDING_EASE,
  LANDING_FILL_SPRING,
} from "@/components/site/landing-v2/lib/landing-motion";

type Doc = { icon: IconName; title: string; detail: string };

const contentVariants = {
  idle: {},
  filled: {
    transition: { staggerChildren: 0.045, delayChildren: 0.14 },
  },
};

const labelVariants = {
  idle: { opacity: 1, y: 0 },
  filled: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.38, ease: LANDING_EASE },
  },
};

const iconBoxVariants = {
  idle: {
    scale: 1,
    backgroundColor: "var(--color-paper-50)",
    borderColor: "var(--color-line)",
    color: "var(--color-ink-400)",
  },
  filled: {
    scale: 1,
    backgroundColor: "rgba(255,255,255,0.16)",
    borderColor: "rgba(255,255,255,0.28)",
    color: "#ffffff",
    transition: { duration: 0.35, ease: LANDING_EASE },
  },
};

/**
 * Carte « chemin » : remplissage accent type Framer (pill → pleine largeur + ressort).
 */
export function LandingPathFillCard({
  doc,
  filled,
  reduce,
  isActive,
}: {
  doc: Doc;
  filled: boolean;
  reduce: boolean | null;
  isActive?: boolean;
}) {
  const state = filled ? "filled" : "idle";

  return (
    <motion.div
      className="relative min-w-0 overflow-hidden rounded-[inherit]"
      animate={
        reduce || !isActive
          ? undefined
          : { scale: isActive ? [1, 1.012, 1] : 1 }
      }
      transition={{ duration: 0.55, ease: LANDING_EASE }}
      whileHover={reduce ? undefined : { y: -2, transition: { duration: 0.22, ease: [0, 0, 0.2, 1] } }}
    >
      {/* Fond neutre */}
      <div className="absolute inset-0 bg-paper-0" aria-hidden />

      {/* Calque remplissage (clip + coins type bouton primary) */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(145deg,var(--color-accent-fill)_0%,var(--color-accent-active)_100%)]"
        initial={false}
        animate={{
          clipPath: filled
            ? "inset(0 0% 0 0 round 6px)"
            : "inset(0 100% 0 0 round 999px)",
        }}
        transition={reduce ? { duration: 0.18 } : LANDING_FILL_SPRING}
      />

      {/* Reflet Framer sur le bord actif */}
      {isActive && !reduce ? (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-r from-white/25 via-white/8 to-transparent"
          initial={{ opacity: 0, x: "-30%" }}
          animate={{ opacity: [0, 1, 0.35], x: ["-30%", "85%", "100%"] }}
          transition={{ duration: 0.72, ease: LANDING_EASE }}
        />
      ) : null}

      {/* Lueur courte à l’activation */}
      {isActive && !reduce ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[1] ring-2 ring-white/30 ring-inset"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.65, ease: LANDING_EASE }}
        />
      ) : null}

      <motion.div
        className="relative z-10 flex min-w-0 items-start gap-3.5 p-4"
        variants={contentVariants}
        initial="idle"
        animate={state}
      >
        <motion.span
          variants={iconBoxVariants}
          className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border"
        >
          <Icon name={doc.icon} className="h-4 w-4" />
        </motion.span>

        <div className="min-w-0">
          <motion.p
            variants={labelVariants}
            className={`text-sm font-medium ${filled ? "text-white" : "text-ink-900"}`}
            animate={
              reduce
                ? undefined
                : filled
                  ? { color: "#ffffff" }
                  : { color: "var(--color-ink-900)" }
            }
            transition={{ duration: 0.32, ease: LANDING_EASE, delay: filled ? 0.1 : 0 }}
          >
            {doc.title}
          </motion.p>
          <motion.p
            variants={labelVariants}
            className={`mt-0.5 truncate text-sm ${filled ? "text-white/85" : "text-ink-400"}`}
            animate={
              reduce
                ? undefined
                : filled
                  ? { color: "rgba(255,255,255,0.85)" }
                  : { color: "var(--color-ink-400)" }
            }
            transition={{ duration: 0.32, ease: LANDING_EASE, delay: filled ? 0.16 : 0 }}
          >
            {doc.detail}
          </motion.p>
        </div>
      </motion.div>
    </motion.div>
  );
}
