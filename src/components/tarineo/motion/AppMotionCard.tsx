"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

/** Carte interactive — léger scale au survol (desktop uniquement). */
export function AppMotionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}
