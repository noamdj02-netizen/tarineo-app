"use client";

import { motion, useReducedMotion } from "framer-motion";

import {
  LANDING_CIRCUIT_CURRENT,
  LANDING_CIRCUIT_DURATION,
  LANDING_CIRCUIT_TIMES,
} from "@/components/site/landing-v2/lib/landing-circuit-motion";
import { cn } from "@/lib/utils";

const TRACK = "#F8D3D4";
const CURRENT = "#FF6B1A";

const motionTransition = {
  duration: LANDING_CIRCUIT_DURATION,
  ease: "linear" as const,
  times: [...LANDING_CIRCUIT_TIMES],
  repeat: Infinity,
};

/** Trait horizontal fin + courant (même épaisseur que les pistes hero). */
export function LandingTitleCircuit({
  className,
  align = "left",
}: {
  className?: string;
  align?: "left" | "center";
}) {
  const reduce = useReducedMotion();
  const path = "M0 1 H120";

  return (
    <span
      className={cn(
        "relative block h-2 w-[7.5rem] shrink-0 sm:h-2.5 sm:w-32",
        align === "center" && "mx-auto",
        className,
      )}
      aria-hidden
    >
      <svg viewBox="0 0 120 2" className="h-full w-full overflow-visible" fill="none">
        <path
          d={path}
          stroke={TRACK}
          strokeOpacity={0.9}
          strokeWidth={1.5}
          strokeLinecap="round"
        />
        {reduce ? null : (
          <motion.path
            d={path}
            pathLength={1}
            stroke={CURRENT}
            strokeWidth={2}
            strokeLinecap="round"
            initial={{ opacity: 0, strokeDasharray: "0 1", strokeDashoffset: 0 }}
            animate={LANDING_CIRCUIT_CURRENT}
            transition={motionTransition}
          />
        )}
      </svg>
    </span>
  );
}
