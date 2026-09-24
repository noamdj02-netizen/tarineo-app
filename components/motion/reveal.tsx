"use client";

import { motion, useReducedMotion, type HTMLMotionProps, type Variants } from "framer-motion";

export const EASE = [0.2, 0.8, 0.2, 1] as const;

/** Apparition Mono Lead : fondu + glissement de 14 px + flou léger. */
const item: Variants = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: EASE } },
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
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      {...props}
    />
  );
}

export function Reveal(props: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  return <motion.div variants={reduce ? itemReduced : item} {...props} />;
}
