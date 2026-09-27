"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { CSSProperties } from "react";
import { EASE } from "@/components/motion/reveal";

/** Barre qui se déploie à l'entrée dans l'écran (horizontale ou verticale). */
export function GrowBar({
  className,
  style,
  delay = 0,
  axis = "x",
}: {
  className?: string;
  style?: CSSProperties;
  delay?: number;
  axis?: "x" | "y";
}) {
  const reduce = useReducedMotion();
  const from = axis === "x" ? { scaleX: 0 } : { scaleY: 0 };
  const to = axis === "x" ? { scaleX: 1 } : { scaleY: 1 };
  return (
    <motion.div
      className={className}
      style={{ transformOrigin: axis === "x" ? "left" : "bottom", ...style }}
      initial={reduce ? false : from}
      whileInView={to}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 1, ease: EASE, delay }}
    />
  );
}
