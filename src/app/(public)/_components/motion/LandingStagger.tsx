"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { landingSpringSoft } from "./landingMotionConfig";

interface Props {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}

export function LandingStagger({ children, className = "", stagger = 0.08, delayChildren = 0 }: Props) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function LandingStaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: { opacity: 1, y: 0, transition: landingSpringSoft },
      }}
    >
      {children}
    </motion.div>
  );
}
