"use client";

import { motion, useReducedMotion, type Transition } from "framer-motion";

import { APPLE_SPRING } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

function markerReveal(reduce: boolean | null, delay = 0): Transition {
  if (reduce) return { duration: 0.15 };
  return { ...APPLE_SPRING, delay };
}

export function HeroMarker({ reduce }: { reduce: boolean | null }) {
  const origin = "0% 52%";

  return (
    <>
      <motion.span
        aria-hidden
        className="hero-headline-marker hero-headline-marker--wash"
        initial={reduce ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={markerReveal(reduce, 0.22)}
        style={{ transformOrigin: origin }}
      />
      <motion.span
        aria-hidden
        className="hero-headline-marker hero-headline-marker--fill"
        initial={reduce ? false : { scaleX: 0, opacity: 0 }}
        animate={{ scaleX: 1, opacity: 1 }}
        transition={markerReveal(reduce, 0.1)}
        style={{ transformOrigin: origin }}
      />
    </>
  );
}

/** Titre hero — ligne éditoriale + question surlignée au marqueur. */
export function HeroHeadline({ lead, highlight }: { lead: string; highlight: string }) {
  const reduce = useReducedMotion();

  return (
    <h1 className="mt-5 text-ink">
      <span className="hero-headline-lead block text-balance">{lead}</span>

      <span className="mt-3 block sm:mt-4">
        <span className={cn("hero-headline-highlight-wrap")}>
          <span className="hero-headline-highlight-text">
            <HeroMarker reduce={reduce} />
            {highlight}
          </span>
        </span>
      </span>
    </h1>
  );
}
