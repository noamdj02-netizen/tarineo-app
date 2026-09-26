"use client";

import { motion, useInView, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

const EASE = [0.16, 1, 0.3, 1] as const;

/** Chaque mot monte depuis 20px. Une fois, au premier passage. */
export function WordsPullUp({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduce = useReducedMotion();
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const words = text.split(" ");

  return (
    <span ref={ref} className={cn("inline", className)}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="inline-block overflow-hidden align-bottom whitespace-nowrap">
          <motion.span
            className="inline-block"
            initial={reduce ? false : { y: 20, opacity: 0 }}
            animate={inView || reduce ? { y: 0, opacity: 1 } : undefined}
            transition={
              reduce
                ? { duration: 0 }
                : { duration: 0.55, delay: delay + i * 0.08, ease: EASE }
            }
          >
            {word}
            {i < words.length - 1 ? "\u00a0" : null}
          </motion.span>
        </span>
      ))}
    </span>
  );
}
