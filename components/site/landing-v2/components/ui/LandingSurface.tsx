"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { LANDING_EASE } from "@/components/site/landing-v2/lib/landing-motion";
import { cn } from "@/lib/utils";

export {
  LANDING_CARD_SHADOW,
  LANDING_CARD_SHADOW_HOVER,
} from "@/components/site/landing-v2/components/ui/landing-surface-tokens";

/**
 * Panneau blanc arrondi + atmosphère (grille + glow orange).
 * Référence visuelle : LandingParcoursFeatures / Desktop-76.
 */
export function LandingSurface({
  children,
  className,
  contentClassName,
  glow = true,
  dots = true,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  glow?: boolean;
  dots?: boolean;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[32px] bg-paper-0 px-5 py-14 sm:px-10 sm:py-20",
        className,
      )}
      {...rest}
    >
      {dots ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgba(26,26,26,0.07) 1px, transparent 0)",
            backgroundSize: "20px 20px",
            maskImage:
              "radial-gradient(ellipse 80% 70% at 50% 35%, black 20%, transparent 75%)",
          }}
        />
      ) : null}
      {glow ? (
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[280px] w-[min(100%,720px)] -translate-x-1/2 bg-[radial-gradient(ellipse_at_50%_0%,rgba(247,86,44,0.1),transparent_68%)]"
        />
      ) : null}
      <div className={cn("relative z-[1]", contentClassName)}>{children}</div>
    </div>
  );
}

/** En-tête section — pilule + titre clamp + sous-titre (qualité Parcours). */
export function LandingSectionHeading({
  badge,
  title,
  subtitle,
  align = "center",
  id,
  className,
}: {
  badge?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  id?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const centered = align === "center";

  return (
    <header
      className={cn(
        "flex max-w-[40rem] flex-col gap-5",
        centered && "mx-auto items-center text-center",
        className,
      )}
    >
      {badge ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, ease: LANDING_EASE }}
          className="inline-flex h-9 items-center rounded-full border border-black/[0.04] bg-paper-0 px-4 text-[13px] font-medium tracking-tight text-ink-800 shadow-[0_1px_0_rgba(0,0,0,0.04),0_2px_6px_rgba(0,0,0,0.04)]"
        >
          {badge}
        </motion.div>
      ) : null}
      <div className={cn("flex flex-col gap-3", centered && "items-center")}>
        <motion.h2
          id={id}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45, delay: badge ? 0.04 : 0, ease: LANDING_EASE }}
          className="text-balance text-[clamp(1.65rem,5.5vw,3.5rem)] font-semibold leading-[1.15] tracking-[-0.035em] text-ink-900"
        >
          {title}
        </motion.h2>
        {subtitle ? (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 10 }}
            whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: badge ? 0.08 : 0.04, ease: LANDING_EASE }}
            className="max-w-[36rem] text-pretty text-[15px] font-medium leading-[1.55] text-ink-500 sm:text-lg"
          >
            {subtitle}
          </motion.p>
        ) : null}
      </div>
    </header>
  );
}
