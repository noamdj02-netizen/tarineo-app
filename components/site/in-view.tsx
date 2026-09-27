"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { SECTION_VIEW } from "@/components/motion/reveal";

/** Comme RevealGroup, mais ne lance l'apparition de ses <Reveal> qu'à l'entrée dans l'écran. */
export function InView({
  stagger = 0.08,
  delay = 0,
  ...props
}: HTMLMotionProps<"div"> & { stagger?: number; delay?: number }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={SECTION_VIEW}
      variants={{
        show: {
          transition: { staggerChildren: stagger, delayChildren: delay },
        },
      }}
      {...props}
    />
  );
}
