"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { APPLE_SPRING, APPLE_SPRING_FAST } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

type FluidIconProps = {
  icon: LucideIcon;
  label?: string;
  className?: string;
  /** Accent ring / fill — Tarineo orange by default. */
  tone?: "orange" | "ink" | "muted";
  size?: "sm" | "md" | "lg";
  /** Delay for entrance stagger (seconds). */
  delay?: number;
};

const SIZE = {
  sm: { box: "size-9", glyph: "size-4", radius: "rounded-[11px]" },
  md: { box: "size-11", glyph: "size-5", radius: "rounded-[13px]" },
  lg: { box: "size-14", glyph: "size-6", radius: "rounded-[16px]" },
} as const;

const TONE = {
  orange: {
    wrap: "bg-[rgba(255,107,26,0.1)] text-[#FF6B1A] ring-[rgba(255,107,26,0.16)]",
    hover: "hover:bg-[rgba(255,107,26,0.16)]",
  },
  ink: {
    wrap: "bg-[#0A0A0A]/[0.04] text-[#0A0A0A] ring-[rgba(10,10,10,0.08)]",
    hover: "hover:bg-[#0A0A0A]/[0.07]",
  },
  muted: {
    wrap: "bg-[#FFFFFF] text-[#6E6E6E] ring-[rgba(10,10,10,0.08)]",
    hover: "hover:text-[#0A0A0A]",
  },
} as const;

/**
 * Icône dans un disque — entrée spring + press scale (Apple fluid).
 * Pas de bounce ; interruptible via Motion.
 */
export function FluidIcon({
  icon: Icon,
  label,
  className,
  tone = "orange",
  size = "md",
  delay = 0,
}: FluidIconProps) {
  const reduce = useReducedMotion();
  const s = SIZE[size];
  const t = TONE[tone];

  return (
    <motion.span
      initial={reduce ? false : { opacity: 0, y: 10, scale: 0.92 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.4 }}
      whileHover={reduce ? undefined : { scale: 1.04, y: -1 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={
        reduce
          ? { duration: 0.15 }
          : { ...APPLE_SPRING_FAST, delay }
      }
      className={cn(
        "inline-flex flex-col items-center gap-1.5",
        className,
      )}
    >
      <span
        className={cn(
          "grid place-items-center ring-1 transition-colors duration-150",
          s.box,
          s.radius,
          t.wrap,
          t.hover,
        )}
      >
        <Icon className={s.glyph} strokeWidth={1.75} aria-hidden />
      </span>
      {label ? (
        <span className="text-[11px] font-medium tracking-[-0.01em] text-[#6E6E6E]">
          {label}
        </span>
      ) : null}
    </motion.span>
  );
}

type FluidChipProps = HTMLMotionProps<"div"> & {
  icon: LucideIcon;
  children: ReactNode;
  delay?: number;
};

/** Chip produit fluide — icône + label, hover léger. */
export function FluidChip({
  icon: Icon,
  children,
  delay = 0,
  className,
  ...props
}: FluidChipProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 12, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.35 }}
      whileHover={reduce ? undefined : { y: -2, scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.96 }}
      transition={reduce ? { duration: 0.15 } : { ...APPLE_SPRING, delay }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-[rgba(10,10,10,0.06)] bg-[#FFFFFF]/90 px-3 py-1.5 shadow-[0_1px_2px_rgba(10,10,10,0.04)] backdrop-blur-sm",
        className,
      )}
      {...props}
    >
      <span className="grid size-6 place-items-center rounded-full bg-[rgba(255,107,26,0.12)] text-[#FF6B1A]">
        <Icon className="size-3.5" strokeWidth={2} aria-hidden />
      </span>
      <span className="text-[12px] font-medium tracking-[-0.01em] text-[#0A0A0A] sm:text-[13px]">
        {children}
      </span>
    </motion.div>
  );
}

/** Flèche CTA qui se décale au hover du parent `group/cta`. */
export function FluidCtaArrow({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "grid size-7 place-items-center rounded-full bg-black/10 transition-transform duration-200 ease-out group-hover/cta:translate-x-0.5 group-hover/cta:-translate-y-px group-active/cta:scale-95",
        className,
      )}
    >
      <Icon className="size-3.5" strokeWidth={2.25} aria-hidden />
    </span>
  );
}
