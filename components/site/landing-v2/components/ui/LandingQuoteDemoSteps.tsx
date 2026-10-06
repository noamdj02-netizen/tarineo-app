"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import { Mascot, type MascotName } from "@/components/site/landing-v2/components/ui/Mascot";
import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";
import { cn } from "@/lib/utils";
import { formatEuroHt } from "@/lib/site/landing-quote-transform-demo";

function mascotForState(extracting: boolean, extracted: boolean): { name: MascotName; alt: string } {
  if (extracting) {
    return {
      name: "loupe",
      alt: "La mascotte Tarinéo examine votre devis avec une loupe",
    };
  }
  if (extracted) {
    return {
      name: "devis-valide",
      alt: "La mascotte Tarinéo valide votre devis client",
    };
  }
  return {
    name: "ordinateur",
    alt: "La mascotte Tarinéo suit la transformation de votre document",
  };
}

const STEPS = [
  { key: "supplier", label: "Devis fournisseur" },
  { key: "analysis", label: "Analyse" },
  { key: "margin", label: "Marge" },
  { key: "client", label: "Devis client" },
] as const;

const listVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const rowVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: LANDING_EASE },
  },
};

const rowVariantsReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
};

type Props = {
  activeIndex: number;
  marginPct: number;
  supplierHt: number;
  clientHt: number;
  sourceRef: string | null;
  extracted: boolean;
  extracting: boolean;
};

export function LandingQuoteDemoSteps({
  activeIndex,
  marginPct,
  supplierHt,
  clientHt,
  sourceRef,
  extracted,
  extracting,
}: Props) {
  const reduce = useReducedMotion();
  const row = reduce ? rowVariantsReduced : rowVariants;

  const detailFor = (index: number): string => {
    switch (index) {
      case 0:
        return sourceRef
          ? `Réf. ${sourceRef} · ${formatEuroHt(supplierHt)} HT`
          : extracted
            ? formatEuroHt(supplierHt) + " HT"
            : "PDF ou photo fournisseur";
      case 1:
        return extracting ? "Lecture en cours…" : extracted ? "Lignes extraites" : "Extraction IA";
      case 2:
        return `+${marginPct} % sur chaque ligne`;
      case 3:
        return extracted
          ? `Devis client · ${formatEuroHt(clientHt)} HT`
          : "Prix client calculé ici";
      default:
        return "";
    }
  };

  const mascot = mascotForState(extracting, extracted);

  return (
    <div className="relative mt-9 overflow-visible sm:mt-10">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={mascot.name}
          className="pointer-events-none absolute -top-7 right-1 z-20 sm:-top-9 sm:right-2 md:-top-10"
          initial={reduce ? false : { opacity: 0, x: 8, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={reduce ? undefined : { opacity: 0, x: 6, scale: 0.96 }}
          transition={{ duration: 0.24, ease: LANDING_EASE }}
        >
          <Mascot
            name={mascot.name}
            alt={mascot.alt}
            widthClass="w-[5.25rem] sm:w-[6.25rem]"
            className="drop-shadow-[0_12px_28px_rgb(120_58_32/0.18)]"
          />
        </motion.div>
      </AnimatePresence>

      <div className="relative overflow-visible rounded-lg border border-line bg-paper-0/90 shadow-sm">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-3 top-2 h-20 w-20 rounded-full bg-accent-soft/60 blur-2xl sm:h-24 sm:w-24"
        />

        <div className="relative min-h-[4.5rem] border-b border-line/70 px-3 pb-3 pt-3 sm:min-h-[4.75rem] sm:px-4 sm:pb-3.5 sm:pt-3.5">
          <div className="relative z-[1] max-w-[calc(100%-5.25rem)] pr-1 sm:max-w-[calc(100%-6.75rem)]">
            <p className="eyebrow text-ink-400">Aperçu en direct</p>
            <p className="mt-1 text-xs leading-snug text-ink-500 sm:text-[13px]">
              Suivez la transformation, étape par étape.
            </p>
          </div>
        </div>

      <motion.ol
        className="landing-steps landing-steps-vertical px-3 pb-3 pt-2 sm:px-4 sm:pb-4 sm:pt-2.5"
        variants={listVariants}
        initial="hidden"
        animate="show"
        aria-label="Étapes de transformation"
      >
        {STEPS.map((step, index) => {
          const done = index < activeIndex;
          const active = index === activeIndex;
          const pending = index > activeIndex;
          const detail = detailFor(index);
          const connectorLit = done || active;

          return (
            <motion.li
              key={step.key}
              className={cn(
                "landing-step",
                (done || active) && "landing-step-primary",
              )}
              variants={row}
              layout={!reduce}
            >
              {index < STEPS.length - 1 ? (
                <motion.span
                  aria-hidden
                  className="absolute left-[0.6875rem] top-7 bottom-0 w-px origin-top bg-line"
                  initial={false}
                  animate={{
                    scaleY: connectorLit ? 1 : 0.35,
                    backgroundColor: connectorLit
                      ? "color-mix(in srgb, var(--color-accent) 38%, transparent)"
                      : "var(--color-line)",
                  }}
                  transition={{ duration: 0.28, ease: LANDING_EASE }}
                />
              ) : null}

              <motion.span
                className="landing-step-marker"
                aria-hidden
                initial={false}
                animate={{
                  scale: active && !reduce ? 1.12 : 1,
                  boxShadow:
                    active && !reduce
                      ? "0 0 0 4px color-mix(in srgb, var(--color-accent) 18%, transparent)"
                      : "0 0 0 0px transparent",
                }}
                transition={{ duration: 0.22, ease: LANDING_EASE }}
              >
                <AnimatePresence mode="popLayout" initial={false}>
                  {done ? (
                    <motion.span
                      key="check"
                      initial={reduce ? false : { scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ duration: 0.18, ease: LANDING_EASE }}
                    >
                      ✓
                    </motion.span>
                  ) : (
                    <motion.span
                      key={`num-${index}`}
                      initial={reduce ? false : { opacity: 0.6 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.15 }}
                    >
                      {index + 1}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.span>

              <div className="min-w-0 flex-1 pt-0.5">
                <motion.p
                  className={cn(
                    "text-sm font-medium leading-tight",
                    active || done ? "text-ink-900" : "text-ink-500",
                  )}
                  animate={{ x: active && !reduce ? 2 : 0 }}
                  transition={{ duration: 0.2, ease: LANDING_EASE }}
                >
                  {step.label}
                </motion.p>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={detail}
                    className="mt-0.5 text-xs leading-snug text-ink-400 nums"
                    initial={reduce ? false : { opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduce ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.2, ease: LANDING_EASE }}
                    role={index === 1 && extracting ? "status" : undefined}
                    aria-live={index === 1 && extracting ? "polite" : undefined}
                  >
                    {detail}
                  </motion.p>
                </AnimatePresence>
              </div>
            </motion.li>
          );
        })}
      </motion.ol>
      </div>
    </div>
  );
}
