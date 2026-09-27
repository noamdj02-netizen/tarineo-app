"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";

/** Courbe Framer / Figma : expo-out, masse puis arrêt net. */
export const EASE = [0.16, 1, 0.3, 1] as const;

/** Viewport partagé : une fois dans l'écran, on ne rejoue pas. */
export const SECTION_VIEW = {
  once: true,
  amount: 0.18,
  margin: "0px 0px -6% 0px",
} as const;

/** Entrée marketing : opacity + y + scale (GPU). Pas de blur. */
const item: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.55, ease: EASE },
  },
};

const itemReduced: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.2 } },
};

/** Conteneur qui décale l'apparition de ses enfants <Reveal>. */
export function RevealGroup({
  stagger = 0.07,
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

/** Entrée autonome d'un bloc (démos différées, grilles) — ne dépend pas d'un parent InView. */
export function SectionEnter({
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { delay?: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.985 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={SECTION_VIEW}
      transition={{ duration: reduce ? 0.2 : 0.6, ease: EASE, delay }}
      {...props}
    />
  );
}
