"use client";

import { motion, useReducedMotion, type TargetAndTransition } from "motion/react";
import type { ReactNode } from "react";
import { appEase, appSpringSoft } from "./appMotionConfig";

type Variant = "up" | "fade" | "scale";

const hidden: Record<Variant, TargetAndTransition> = {
  up: { opacity: 0, y: 16 },
  fade: { opacity: 0 },
  scale: { opacity: 0, scale: 0.98 },
};

interface Props {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  delay?: number;
}

export function AppReveal({ children, className = "", variant = "up", delay = 0 }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={hidden[variant]}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ ...appSpringSoft, delay, ease: appEase }}
    >
      {children}
    </motion.div>
  );
}
