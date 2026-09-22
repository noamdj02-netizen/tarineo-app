"use client";

import { motion, useReducedMotion } from "motion/react";
import { appEase } from "./appMotionConfig";

export function AnimatedBarFill({
  widthPct,
  className = "h-full rounded-full bg-primary",
  delay = 0,
}: {
  widthPct: number;
  className?: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className} style={{ width: `${widthPct}%` }} />;
  }

  return (
    <motion.div
      className={className}
      initial={{ width: 0 }}
      animate={{ width: `${widthPct}%` }}
      transition={{ duration: 0.45, delay, ease: appEase }}
    />
  );
}

export function AnimatedVerticalBar({
  heightPx,
  className,
  delay = 0,
}: {
  heightPx: number;
  className: string;
  delay?: number;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <div className={className} style={{ height: heightPx }} />;
  }

  return (
    <motion.div
      className={className}
      initial={{ height: 0 }}
      animate={{ height: heightPx }}
      transition={{ duration: 0.5, delay, ease: appEase }}
      style={{ originY: 1 }}
    />
  );
}
