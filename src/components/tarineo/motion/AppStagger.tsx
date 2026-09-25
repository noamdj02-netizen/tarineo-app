"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { appSpringSoft } from "./appMotionConfig";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
}

export function AppStagger({ children, className = "", stagger = 0.05, delayChildren = 0 }: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren } },
      }}
    >
      {children}
    </motion.div>
  );
}

export function AppStaggerItem({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      variants={{
        // Pas d'opacity:0 — évite les pages blanches si le stagger parent
        // n'atteint jamais l'état "visible" (display:contents, headless…).
        hidden: { opacity: 1, y: 10 },
        visible: { opacity: 1, y: 0, transition: appSpringSoft },
      }}
    >
      {children}
    </motion.div>
  );
}
