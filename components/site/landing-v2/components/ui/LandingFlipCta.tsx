"use client";

import Link from "next/link";
import { motion, useReducedMotion, type Easing, type Transition } from "framer-motion";
import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { ArrowRight } from "@/components/site/landing-v2/components/ui/Button";
import { cn } from "@/lib/utils";

const flipCtaVariants = cva(
  [
    "group/flip relative inline-flex touch-manipulation items-center justify-center",
    "isolate overflow-clip rounded-[inherit]",
    "select-none outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100",
    "[-webkit-tap-highlight-color:transparent]",
  ].join(" "),
  {
    variants: {
      variant: {
        ink: "rounded-md bg-ink-900 text-paper-0 shadow-sm",
        secondary:
          "rounded-md border border-ink-900/20 bg-gradient-to-t from-ink-900/5 to-ink-900/10 text-ink-900",
        ghost: "rounded-full text-ink-700",
        primary: "rounded-full bg-accent text-white shadow-sm",
      },
      size: {
        sm: "h-9 px-3.5 text-[13px] font-medium leading-tight sm:h-10 sm:px-4 sm:text-sm",
        md: "h-11 px-5 text-sm font-medium leading-tight",
        lg: "h-12 min-h-11 px-6 text-[0.9375rem] font-medium leading-tight",
      },
    },
    defaultVariants: {
      variant: "ink",
      size: "md",
    },
  },
);

const SPRING_TEXT = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 1.3,
} as const satisfies Transition;

const EASE_WIPE = {
  duration: 0.5,
  ease: [0.32, 0.72, 0, 1] as Easing,
} as const satisfies Transition;

const MotionLink = motion.create(Link);

type LandingFlipCtaProps = VariantProps<typeof flipCtaVariants> & {
  href: string;
  label: string;
  className?: string;
  withArrow?: boolean;
};

function FlipLabel({ label, withArrow }: { label: string; withArrow?: boolean }) {
  return (
    <span className="inline-flex items-center justify-center gap-2">
      <span>{label}</span>
      {withArrow ? <ArrowRight /> : null}
    </span>
  );
}

/**
 * CTA wipe hover (accent → encre). Calques hors écran + opacity 0 au repos
 * pour éviter les triangles orange qui dépassent.
 */
export function LandingFlipCta({
  href,
  label,
  variant = "ink",
  size = "md",
  className,
  withArrow = false,
}: LandingFlipCtaProps) {
  const reduce = useReducedMotion();
  const cls = cn(flipCtaVariants({ variant, size }), className);

  if (reduce) {
    return (
      <Link href={href} className={cls}>
        <FlipLabel label={label} withArrow={withArrow} />
      </Link>
    );
  }

  return (
    <MotionLink
      href={href}
      className={cls}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      variants={{ initial: {}, hover: {} }}
    >
      <span className="invisible relative z-0 inline-flex" aria-hidden>
        <FlipLabel label={label} withArrow={withArrow} />
      </span>

      <motion.span
        className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center"
        variants={{
          initial: { y: 0, scale: 1, rotate: 0 },
          hover: { y: "-120%", scale: 0.55, rotate: -28 },
        }}
        transition={SPRING_TEXT}
        aria-hidden
      >
        <FlipLabel label={label} withArrow={withArrow} />
      </motion.span>

      <motion.span
        className="pointer-events-none absolute inset-0 z-[1] bg-accent will-change-transform"
        variants={{
          initial: { y: "125%", rotate: -36, opacity: 0 },
          hover: { y: 0, rotate: 0, opacity: 1 },
        }}
        transition={EASE_WIPE}
        aria-hidden
      >
        <motion.span
          className="absolute inset-0 bg-ink-900 will-change-transform"
          variants={{
            initial: { y: "145%", rotate: -52, opacity: 0 },
            hover: { y: 0, rotate: 0, opacity: 1 },
          }}
          transition={EASE_WIPE}
        />
      </motion.span>

      <motion.span
        className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center text-paper-0"
        variants={{
          initial: { y: "165%", rotate: -48, scale: 0.55, opacity: 0 },
          hover: { y: 0, rotate: 0, scale: 1, opacity: 1 },
        }}
        transition={SPRING_TEXT}
        aria-hidden
      >
        <FlipLabel label={label} withArrow={withArrow} />
      </motion.span>
    </MotionLink>
  );
}

export function LandingFlipButton({
  label,
  className,
  pressed,
  onClick,
  children,
}: {
  label: string;
  className?: string;
  pressed?: boolean;
  onClick?: () => void;
  children?: ReactNode;
}) {
  const reduce = useReducedMotion();
  const base = cn(
    "relative inline-flex min-h-10 items-center justify-center isolate overflow-clip rounded-md px-4 text-sm font-medium outline-none",
    "focus-visible:ring-2 focus-visible:ring-accent/45",
    pressed ? "bg-paper-0 text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-800",
    className,
  );

  if (reduce) {
    return (
      <button type="button" aria-pressed={pressed} className={base} onClick={onClick}>
        {children ?? label}
      </button>
    );
  }

  return (
    <motion.button
      type="button"
      aria-pressed={pressed}
      className={base}
      onClick={onClick}
      initial="initial"
      whileHover="hover"
      whileFocus="hover"
      variants={{ initial: {}, hover: {} }}
    >
      <span className="invisible relative z-0" aria-hidden>
        {children ?? label}
      </span>
      <motion.span
        className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center"
        variants={{
          initial: { y: 0, scale: 1, rotate: 0 },
          hover: { y: "-120%", scale: 0.55, rotate: -28 },
        }}
        transition={SPRING_TEXT}
        aria-hidden
      >
        {children ?? label}
      </motion.span>
      <motion.span
        className="pointer-events-none absolute inset-0 z-[1] bg-accent will-change-transform"
        variants={{
          initial: { y: "125%", rotate: -36, opacity: 0 },
          hover: { y: 0, rotate: 0, opacity: 1 },
        }}
        transition={EASE_WIPE}
        aria-hidden
      >
        <motion.span
          className="absolute inset-0 bg-ink-900 will-change-transform"
          variants={{
            initial: { y: "145%", rotate: -52, opacity: 0 },
            hover: { y: 0, rotate: 0, opacity: 1 },
          }}
          transition={EASE_WIPE}
        />
      </motion.span>
      <motion.span
        className="pointer-events-none absolute inset-0 z-[2] flex items-center justify-center text-paper-0"
        variants={{
          initial: { y: "165%", rotate: -48, scale: 0.55, opacity: 0 },
          hover: { y: 0, rotate: 0, scale: 1, opacity: 1 },
        }}
        transition={SPRING_TEXT}
        aria-hidden
      >
        {children ?? label}
      </motion.span>
    </motion.button>
  );
}
