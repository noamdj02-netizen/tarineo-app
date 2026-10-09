"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

const EASE = [0.22, 1, 0.36, 1] as const;

export function LandingSection({
  id,
  children,
  className,
  bleed,
}: {
  id?: string;
  children: ReactNode;
  className?: string;
  /** Bande légèrement plus claire entre sections */
  bleed?: boolean;
}) {
  const reduce = useReducedMotion();

  return (
    <motion.section
      id={id}
      className={cn(
        "relative py-20 sm:py-28 lg:py-32",
        bleed && "border-y border-line/80 bg-paper-50/40",
        className,
      )}
      initial={reduce ? false : { opacity: 0, y: 28 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8% 0px -8% 0px" }}
      transition={{ duration: 0.65, ease: EASE }}
    >
      {children}
    </motion.section>
  );
}
