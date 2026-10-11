"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";
import { cn } from "@/lib/utils";

/** Rythme vertical unique pour toutes les sections landing-v2. */
export const LANDING_SECTION_PAD = "py-10 sm:py-14 lg:py-16";

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
      className={cn("relative", LANDING_SECTION_PAD, bleed && "bg-paper-50/40", className)}
      initial={reduce ? false : { opacity: 0, y: 16 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6% 0px -6% 0px" }}
      transition={{ duration: 0.5, ease: LANDING_EASE }}
    >
      {children}
    </motion.section>
  );
}
