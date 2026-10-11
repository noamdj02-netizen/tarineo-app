"use client";

import Link from "next/link";
import { type Easing, motion, type Transition, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export type LandingNavItem = {
  label: string;
  href: string;
  active?: boolean;
};

const MotionLink = motion.create(Link);

const SPRING_TEXT = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 1.3,
} as Transition;

const EASE_WIPE = {
  duration: 0.45,
  ease: [0.32, 0.72, 0, 1] as Easing,
} as Transition;

/** Lien wipe orange → encre (hover only, jamais visible au repos). */
export function LandingWipeLink({
  href,
  label,
  className,
  restClassName,
}: {
  href: string;
  label: ReactNode;
  className?: string;
  /** Couleur / style du label au repos (avant wipe). */
  restClassName?: string;
}) {
  const reduce = useReducedMotion();
  const text = typeof label === "string" ? label : undefined;

  if (reduce) {
    return (
      <Link
        href={href}
        className={cn(
          "inline-flex min-h-11 items-center justify-center rounded-md px-3.5 py-2 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-accent/55 sm:min-h-10 sm:px-4 sm:text-sm",
          restClassName,
          className,
        )}
      >
        {label}
      </Link>
    );
  }

  return (
    <MotionLink
      href={href}
      aria-label={text}
      className={cn(
        "relative isolate inline-flex min-h-11 items-center justify-center overflow-hidden rounded-md px-3.5 text-[13px] font-medium leading-tight outline-none focus-visible:ring-2 focus-visible:ring-accent/55 sm:min-h-10 sm:px-4 sm:text-sm [clip-path:inset(0_round_0.375rem)]",
        className,
      )}
      initial="initial"
      whileHover="hover"
      variants={{ initial: {}, hover: {} }}
    >
      <span aria-hidden className="inline-flex h-full w-full items-center justify-center">
        <span className="invisible">{label}</span>
        <motion.span
          className={cn(
            "absolute inset-0 z-[2] flex items-center justify-center",
            restClassName,
          )}
          variants={{
            initial: { y: 0, opacity: 1 },
            hover: { y: "-110%", opacity: 0 },
          }}
          transition={SPRING_TEXT}
        >
          {label}
        </motion.span>
        <motion.span
          className="absolute inset-0 z-[1] bg-accent"
          variants={{
            initial: { y: "100%", opacity: 0 },
            hover: { y: 0, opacity: 1 },
          }}
          transition={EASE_WIPE}
        >
          <motion.span
            className="absolute inset-0 bg-ink-900"
            variants={{
              initial: { y: "100%", opacity: 0 },
              hover: { y: 0, opacity: 1 },
            }}
            transition={EASE_WIPE}
          />
        </motion.span>
        <motion.span
          className="absolute inset-0 z-[2] flex items-center justify-center text-paper-0"
          variants={{
            initial: { y: "100%", opacity: 0 },
            hover: { y: 0, opacity: 1 },
          }}
          transition={SPRING_TEXT}
        >
          {label}
        </motion.span>
      </span>
    </MotionLink>
  );
}

/** Nav landing — wipe orange → encre au hover. */
export function LandingNavMenu({
  items,
  className,
}: {
  items: LandingNavItem[];
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex items-center justify-center rounded-lg bg-paper-0/80 p-1 shadow-[0px_3px_2px_rgba(0,0,0,0.04),0px_1px_0.5px_rgba(0,0,0,0.08)] backdrop-blur-sm",
        className,
      )}
      aria-label="Principal"
    >
      <ul className="flex min-h-11 items-center gap-0.5 md:gap-1">
        {items.map((item) => (
          <li key={item.label} className="overflow-hidden text-[15px] font-semibold leading-[1.5]">
            <LandingWipeLink
              href={item.href}
              label={item.label}
              className="h-auto min-h-11 rounded-md px-3 py-2 text-[15px] font-semibold sm:min-h-10 sm:px-3 sm:text-[15px]"
              restClassName={item.active ? "text-ink-900" : "text-ink-700"}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
