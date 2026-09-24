"use client";

import { motion, type HTMLMotionProps } from "framer-motion";

/** Comme RevealGroup, mais ne lance l'apparition de ses <Reveal> qu'à l'entrée dans l'écran. */
export function InView({
  stagger = 0.08,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.2, margin: "0px 0px -8% 0px" }}
      variants={{ show: { transition: { staggerChildren: stagger } } }}
      {...props}
    />
  );
}
