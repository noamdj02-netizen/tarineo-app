"use client";

import { motion, useReducedMotion } from "framer-motion";
import { POP_PAGE } from "@/components/motion/pop";

type Variant = "app" | "auth" | "site" | "onboard";

const presets: Record<
  Variant,
  { y: number; scale: number; opacityOnly?: boolean }
> = {
  app: { y: 10, scale: 0.985 },
  auth: { y: 12, scale: 0.98 },
  onboard: { y: 12, scale: 0.98 },
  /** Landing : fade + léger pop (même famille spring). */
  site: { y: 0, scale: 0.992, opacityOnly: true },
};

/**
 * Transition de route — même référence **Pop in** que les validations
 * (`SuccessPop` / Relances), en version discrète.
 */
export function PageEnter({
  children,
  variant = "app",
}: {
  children: React.ReactNode;
  variant?: Variant;
}) {
  const reduce = useReducedMotion();
  const p = presets[variant];
  const box = variant === "onboard" ? "flex h-full min-h-0 flex-col" : "min-h-0";

  if (reduce) return <div className={box}>{children}</div>;

  return (
    <motion.div
      className={box}
      initial={{
        opacity: 0,
        y: p.opacityOnly ? 0 : p.y,
        scale: p.scale,
      }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={POP_PAGE}
    >
      {children}
    </motion.div>
  );
}
