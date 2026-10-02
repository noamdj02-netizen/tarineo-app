"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { TarineoMark } from "@/components/site/tarineo-mark";
import type { HeroScene } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;
const INK_FAINT = "color-mix(in oklab, var(--color-ink) 6%, transparent)";
const BRAND = "var(--tarineo-orange)";

type HeroEngineCardProps = {
  engine: HeroScene["engine"];
  visible: boolean;
  running: boolean;
  done: boolean;
  stepsVisible: boolean;
  reduced: boolean;
  enableFloat?: boolean;
  className?: string;
};

/** Moteur TARINEO : progression puis validation des étapes d’analyse. */
export function HeroEngineCard({
  engine,
  visible,
  running,
  done,
  stepsVisible,
  reduced,
  enableFloat = true,
  className,
}: HeroEngineCardProps) {
  const stepsOn = stepsVisible && (running || done);

  return (
    <motion.div
      className={cn("w-full", className)}
      initial={false}
      animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.98 }}
      transition={reduced ? { duration: 0.2 } : { duration: 0.6, ease: EASE }}
    >
      <motion.div
        className="hero-card px-4 py-4"
        animate={reduced || !enableFloat ? undefined : { y: [0, -2, 0] }}
        transition={
          reduced || !enableFloat
            ? undefined
            : { duration: 9, ease: "easeInOut", repeat: Infinity, delay: 0.4 }
        }
      >
        <div className="flex items-center gap-2">
          <TarineoMark className="size-[22px]" priority={false} />
          <p className="font-display text-[14px] font-semibold tracking-[-0.02em] text-ink">
            TARINEO
          </p>
        </div>

        <p className="mt-3 text-[11.5px] font-medium text-muted-foreground">{`${engine.title}…`}</p>

        <span
          aria-hidden
          className="mt-2 block h-[5px] w-full overflow-hidden rounded-full bg-ink/[0.08]"
        >
          <motion.span
            className="hero-engine-progress block h-full origin-left rounded-full"
            initial={false}
            animate={{ scaleX: done ? 1 : running ? 0.72 : stepsVisible ? 0.18 : 0 }}
            transition={reduced ? { duration: 0.2 } : { duration: 1.6, ease: EASE }}
          />
        </span>

        <ul className="mt-3.5 flex flex-col gap-2">
          {engine.steps.map((label, i) => {
            const acquired = done || reduced;
            const stepDelay = acquired ? 0 : running ? i * 0.58 : 0;
            const showCheck = acquired || running;

            return (
              <motion.li
                key={label}
                className="flex items-center gap-2"
                initial={false}
                animate={{ opacity: stepsOn ? 1 : 0.5, x: 0 }}
                transition={reduced ? { duration: 0.2 } : { duration: 0.45, ease: EASE }}
              >
                <motion.span
                  aria-hidden
                  className="grid size-[15px] shrink-0 place-items-center rounded-full text-white"
                  initial={false}
                  animate={{
                    backgroundColor: acquired
                      ? BRAND
                      : showCheck
                        ? [INK_FAINT, INK_FAINT, BRAND]
                        : INK_FAINT,
                  }}
                  transition={
                    reduced
                      ? { duration: 0.2 }
                      : { duration: 0.32, ease: EASE, delay: stepDelay, times: [0, 0.88, 1] }
                  }
                >
                  <motion.span
                    initial={false}
                    animate={{
                      opacity: showCheck ? 1 : 0,
                      scale: showCheck ? 1 : 0.75,
                    }}
                    transition={
                      reduced
                        ? { duration: 0.2 }
                        : { duration: 0.32, ease: EASE, delay: stepDelay }
                    }
                  >
                    <Check className="size-[9px]" strokeWidth={3.5} />
                  </motion.span>
                </motion.span>
                <span className="text-[11.5px] text-landing-ink-muted">
                  {label}
                  <motion.span
                    className="text-muted-foreground"
                    initial={false}
                    animate={{ opacity: acquired ? 1 : 0 }}
                    transition={
                      reduced
                        ? { duration: 0.2 }
                        : { duration: 0.28, ease: EASE, delay: stepDelay + 0.1 }
                    }
                    aria-hidden
                  >
                    {" "}
                    ✓
                  </motion.span>
                </span>
              </motion.li>
            );
          })}
        </ul>
      </motion.div>
    </motion.div>
  );
}
