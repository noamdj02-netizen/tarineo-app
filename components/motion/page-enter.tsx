"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "@/components/motion/reveal";

type Variant = "app" | "auth" | "site" | "onboard";

const presets: Record<
  Variant,
  { y: number; duration: number; opacityOnly?: boolean }
> = {
  app: { y: 8, duration: 0.28 },
  auth: { y: 10, duration: 0.32 },
  onboard: { y: 10, duration: 0.32 },
  site: { y: 0, duration: 0.38, opacityOnly: true },
};

/** Transition légère à chaque changement de route (template.tsx). */
export function PageEnter({
  children,
  variant = "app",
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  const reduce = useReducedMotion();
  const p = presets[variant];

  if (reduce) return <div className="min-h-0">{children}</div>;

  return (
    <motion.div
      className="min-h-0"
      initial={{ opacity: 0, y: p.opacityOnly ? 0 : p.y }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: p.duration, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
