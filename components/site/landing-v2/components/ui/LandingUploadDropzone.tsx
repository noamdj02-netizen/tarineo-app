"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { LANDING_EASE, LANDING_VIEW, LandingScanPass } from "@/components/site/landing-v2/lib/landing-motion";

type Props = {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  className?: string;
};

export function LandingUploadDropzone({ children, disabled, onClick, className = "" }: Props) {
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`relative mt-5 flex w-full touch-manipulation flex-col items-center justify-center gap-2 overflow-hidden rounded-md border border-dashed border-line-strong bg-paper-50 px-4 py-6 text-center transition-colors outline-none hover:border-accent-100 hover:bg-paper-0 focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      initial={reduce ? false : { opacity: 0, y: 14, scale: 0.98 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
      viewport={LANDING_VIEW}
      transition={{ duration: 0.52, ease: LANDING_EASE }}
      whileHover={
        reduce || disabled
          ? undefined
          : { borderColor: "color-mix(in srgb, var(--color-accent) 38%, transparent)", transition: { duration: 0.2 } }
      }
      whileTap={reduce || disabled ? undefined : { scale: 0.96 }}
    >
      <LandingScanPass />
      {!disabled && !reduce ? (
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[inherit] border border-accent/0"
          initial={{ opacity: 0 }}
          whileInView={{
            opacity: [0, 0.35, 0],
            borderColor: [
              "color-mix(in srgb, var(--color-accent) 0%, transparent)",
              "color-mix(in srgb, var(--color-accent) 22%, transparent)",
              "color-mix(in srgb, var(--color-accent) 0%, transparent)",
            ],
          }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 2.4, delay: 0.25, ease: LANDING_EASE }}
        />
      ) : null}
      {children}
    </motion.button>
  );
}
