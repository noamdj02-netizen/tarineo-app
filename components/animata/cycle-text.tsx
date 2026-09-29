"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { PRODUCT_EASE } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

/**
 * Texte cyclique (Animata cycle-text) — phrases métier Tarineo.
 * Source: https://github.com/codse/animata (MIT)
 */
export function CycleText({
  words,
  className,
  intervalMs = 2200,
}: {
  words: readonly string[];
  className?: string;
  intervalMs?: number;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const total = words.length;

  useEffect(() => {
    if (reduce || total <= 1) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % total);
    }, intervalMs);
    return () => window.clearInterval(id);
  }, [reduce, total, intervalMs]);

  if (reduce || total === 0) {
    return <span className={cn("inline-block", className)}>{words[0]}</span>;
  }

  return (
    <span className={cn("inline-grid overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={words[index]}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.22, ease: PRODUCT_EASE }}
          className="col-start-1 row-start-1 inline-block"
        >
          {words[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
