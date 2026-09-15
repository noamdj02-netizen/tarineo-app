"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { landingFloatTransition } from "./landingMotionConfig";

interface Props {
  children: ReactNode;
  className?: string;
  /** Amplitude verticale en px */
  y?: number;
  /** Décalage de phase (s) */
  delay?: number;
}

export function LandingFloat({ children, className = "", y = 10, delay = 0 }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      animate={{ y: [-y * 0.4, y * 0.6] }}
      transition={{ ...landingFloatTransition, delay }}
    >
      {children}
    </motion.div>
  );
}
