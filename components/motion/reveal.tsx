"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Transition,
  type Variants,
} from "framer-motion";

/**
 * Motion Apple (WWDC Designing Fluid Interfaces) :
 * springs critically damped — pas de bounce sur les entrées marketing.
 * Response ~0.35–0.4s. Reduced motion = cross-fade only.
 */
export const APPLE_SPRING: Transition = {
  type: "spring",
  bounce: 0,
  duration: 0.4,
};

export const APPLE_SPRING_FAST: Transition = {
  type: "spring",
  bounce: 0,
  duration: 0.3,
};

/** @deprecated Prefer APPLE_SPRING — kept for nav/legacy cubic easings. */
export const EASE = [0.2, 0.8, 0.2, 1] as const;

export const SECTION_VIEW = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -6% 0px",
} as const;

const item: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: APPLE_SPRING,
  },
};

const itemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

export function RevealGroup({
  stagger = 0.06,
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      {...props}
    />
  );
}

export function Reveal(props: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  return <motion.div variants={reduce ? itemReduced : item} {...props} />;
}

export function SectionEnter({
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 18, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={SECTION_VIEW}
      transition={
        reduce
          ? { duration: 0.2 }
          : { ...APPLE_SPRING, delay }
      }
      {...props}
    />
  );
}
