"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
  type Variants,
} from "framer-motion";
import type { ReactNode } from "react";

/** Ease Framer / easeOutQuint (skill motion-animations). */
export const LANDING_EASE = [0.22, 1, 0.36, 1] as const;

export const LANDING_SPRING: Transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

/** Remplissage type Framer (bouton / carte chemin) — léger dépassement puis stabilisation. */
export const LANDING_FILL_SPRING: Transition = {
  type: "spring",
  stiffness: 118,
  damping: 26,
  mass: 0.85,
};

export const LANDING_VIEW = {
  once: true,
  margin: "-80px",
  amount: 0.2,
} as const;

/** Entrées marketing : ease-out, scale(0.98) — pas depuis 0 (web-animation-design). */
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.5, ease: LANDING_EASE },
  },
};

const fadeUpReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

/** Entrée stagger infrequente — better-ui: blur 4 + y 12 / 300ms / 100ms apart. */
const staggerItem: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const staggerItemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.15 } },
};

/** Entrée hero au chargement (pas au scroll). */
export function LandingHeroStagger({
  stagger = 0.1,
  delay = 0,
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number; delay?: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate={reduce ? "show" : "show"}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function LandingStagger({
  stagger = 0.1,
  delay = 0,
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number; delay?: number; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={LANDING_VIEW}
      variants={{
        hidden: {},
        show: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function LandingReveal({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? fadeUpReduced : fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={LANDING_VIEW}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function LandingStaggerItem({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className={className} variants={reduce ? staggerItemReduced : staggerItem} {...props}>
      {children}
    </motion.div>
  );
}

/** Carte produit hero : légère montée + scale à l’entrée. */
export function LandingFloatCard({
  className,
  children,
  delay = 0,
  trigger = "view",
  ...props
}: HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
  /** `mount` = animation au chargement (hero), `view` = au scroll. */
  trigger?: "view" | "mount";
}) {
  const reduce = useReducedMotion();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.98 };
  const shown = reduce ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 };
  const transition = reduce
    ? { duration: 0.25, delay }
    : { duration: 0.55, ease: LANDING_EASE, delay };

  return (
    <motion.div
      className={className}
      initial={hidden}
      animate={trigger === "mount" ? shown : undefined}
      whileInView={trigger === "view" ? shown : undefined}
      viewport={{ once: true, margin: "-60px" }}
      transition={transition}
      whileHover={reduce ? undefined : { y: -2, transition: { duration: 0.2, ease: [0, 0, 0.2, 1] } }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Séquence interne (hero produit) — jouée au montage, pas au scroll. */
export function LandingMountSequence({
  className,
  children,
  stagger = 0.07,
  delay = 0.14,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number; delay?: number; children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: reduce ? 0 : delay,
          },
        },
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const landingMountItem: Variants = {
  hidden: { opacity: 0, y: 10, scale: 0.99 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.48, ease: LANDING_EASE },
  },
};

export const landingMountItemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

export function LandingMountItem({
  className,
  children,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      variants={reduce ? landingMountItemReduced : landingMountItem}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** Passe de lecture (scan) unique — hero / upload. */
export function LandingScanPass({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.span
      aria-hidden
      className={`pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] ${className}`}
    >
      <motion.span
        className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-accent/[0.12] to-transparent"
        initial={{ x: "-120%" }}
        animate={{ x: "320%" }}
        transition={{ duration: 1.15, ease: LANDING_EASE, delay: 0.35 }}
      />
    </motion.span>
  );
}

/** Lignes de convergence (section Problème) — cartes → hub Tarinéo. */
export function LandingFlowLines({ className = "h-[4.5rem] w-[min(100%,18rem)]" }: { className?: string }) {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.14,
        delayChildren: reduce ? 0 : 0.08,
      },
    },
  };

  const path = {
    hidden: { pathLength: 0, opacity: 0 },
    show: {
      pathLength: 1,
      opacity: 1,
      transition: { duration: reduce ? 0.25 : 0.85, ease: LANDING_EASE },
    },
  };

  const hubShow = reduce
    ? { scale: 1, opacity: 1, transition: { duration: 0.2, delay: 0.1 } }
    : {
        scale: 1,
        opacity: 1,
        transition: { type: "spring" as const, stiffness: 380, damping: 22, delay: 0.45 },
      };

  const hub = {
    hidden: { scale: 0.6, opacity: 0 },
    show: hubShow,
  };

  const strokeProps = {
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round" as const,
    vectorEffect: "non-scaling-stroke" as const,
  };

  return (
    <div className="flex w-full flex-col items-center py-3 sm:py-4">
      <motion.svg
        viewBox="0 0 240 72"
        className={`text-ink-300 ${className}`}
        fill="none"
        initial="hidden"
        whileInView="show"
        viewport={{ ...LANDING_VIEW, amount: 0.6 }}
        variants={container}
        aria-hidden
      >
        <motion.path d="M24 0C24 28 52 32 120 50" variants={path} {...strokeProps} />
        <motion.path d="M120 0V50" variants={path} {...strokeProps} />
        <motion.path d="M216 0C216 28 188 32 120 50" variants={path} {...strokeProps} />
        <motion.circle
          cx="120"
          cy="58"
          r="5"
          className="fill-accent"
          variants={hub}
        />
        <motion.circle
          cx="120"
          cy="58"
          r="9"
          className="fill-accent/15"
          variants={hub}
        />
      </motion.svg>

      <motion.div
        className="surface-flat -mt-1 flex items-center gap-2 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-ink-600 shadow-card"
        initial={reduce ? false : { opacity: 0, y: 6 }}
        whileInView={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
        viewport={LANDING_VIEW}
        transition={{ duration: 0.45, ease: LANDING_EASE, delay: reduce ? 0 : 0.55 }}
      >
        <span className="inline-flex h-5 w-5 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
          <svg viewBox="0 0 20 20" className="h-3 w-3" fill="currentColor" aria-hidden>
            <path d="M10 2.5l1.8 4.7 4.7 1.8-4.7 1.8L10 15.5l-1.8-4.7L3.5 9l4.7-1.8z" />
          </svg>
        </span>
        Tarinéo
      </motion.div>
    </div>
  );
}

/** Carte feature : entrée stagger + léger lift au hover (desktop). */
export function LandingFeatureCard({
  className = "",
  children,
  ...props
}: HTMLMotionProps<"div"> & { children: ReactNode }) {
  const reduce = useReducedMotion();
  return (
    <LandingStaggerItem {...props}>
      <motion.div
        className={`landing-product-surface ${className}`}
        whileHover={
          reduce
            ? undefined
            : { y: -2, transition: { duration: 0.2, ease: [0, 0, 0.2, 1] } }
        }
      >
        {children}
      </motion.div>
    </LandingStaggerItem>
  );
}

/** Barre de progression (width animée une fois). */
export function LandingProgressBar({
  percent,
  className = "h-full rounded-full bg-accent",
}: {
  percent: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? { width: `${percent}%` } : { width: "0%" }}
      whileInView={{ width: `${percent}%` }}
      viewport={LANDING_VIEW}
      transition={reduce ? { duration: 0.2 } : { duration: 0.7, ease: LANDING_EASE, delay: 0.15 }}
    />
  );
}

/** Halo discret pour le CTA final (une seule apparition). */
export function LandingCtaGlow() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -right-[20%] -top-[30%] h-[min(420px,70vw)] w-[min(420px,70vw)] rounded-full bg-[radial-gradient(circle,rgba(255,107,26,0.12)_0%,transparent_68%)]"
      initial={{ opacity: 0, scale: 0.92 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.9, ease: LANDING_EASE }}
    />
  );
}

export function LandingIconPop({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      className={className}
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
      whileInView={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      viewport={LANDING_VIEW}
      transition={reduce ? { duration: 0.15 } : { duration: 0.45, ease: LANDING_EASE }}
    >
      {children}
    </motion.span>
  );
}
