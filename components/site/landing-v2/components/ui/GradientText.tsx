"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Remplissage dégradé animé — palette Tarineo (encre ↔ orange), pas violet. */
export function GradientText({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) {
    return <span className={cn("text-ink-900", className)}>{children}</span>;
  }

  return (
    <motion.span
      className={cn("inline", className)}
      style={{
        backgroundImage:
          "linear-gradient(90deg, var(--color-ink-900) 0%, var(--color-accent) 42%, var(--color-accent-700) 58%, var(--color-ink-900) 100%)",
        backgroundSize: "220% 100%",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
      animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    >
      {children}
    </motion.span>
  );
}
