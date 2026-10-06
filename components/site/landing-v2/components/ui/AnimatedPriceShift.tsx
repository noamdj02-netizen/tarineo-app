"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { LANDING_EASE, LANDING_VIEW } from "@/components/site/landing-v2/lib/landing-motion";

/** Avant → après : le prix « monte » une fois à l’écran (hausses fournisseur). */
export function AnimatedPriceShift({
  from,
  to,
  className = "",
}: {
  from: string;
  to: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLParagraphElement>(null);
  const [showTo, setShowTo] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        window.setTimeout(() => setShowTo(true), 600);
      },
      { threshold: 0.35 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <motion.p
      ref={ref}
      className={`text-sm font-medium text-ink-900 nums ${className}`}
      initial={reduce ? false : { opacity: 0, y: 6 }}
      whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
      viewport={LANDING_VIEW}
      transition={{ duration: 0.4, ease: LANDING_EASE }}
    >
      <motion.span
        animate={{ opacity: showTo ? 0.45 : 1 }}
        transition={{ duration: 0.35, ease: LANDING_EASE }}
      >
        {from}
      </motion.span>
      <span className="text-ink-300"> → </span>
      <motion.span
        className="text-accent-700"
        animate={{ opacity: showTo ? 1 : 0.35 }}
        transition={{ duration: 0.4, ease: LANDING_EASE, delay: showTo ? 0 : 0 }}
      >
        {to}
      </motion.span>
    </motion.p>
  );
}

/** Variante inline (listes alertes prix). */
export function AnimatedInlinePriceShift({
  from,
  to,
  className = "text-sm text-ink-600 nums",
}: {
  from: string;
  to: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const [showTo, setShowTo] = useState(reduce);

  useEffect(() => {
    if (reduce) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        observer.disconnect();
        window.setTimeout(() => setShowTo(true), 450);
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [reduce]);

  return (
    <span ref={ref} className={className}>
      <motion.span animate={{ opacity: showTo ? 0.4 : 1 }} transition={{ duration: 0.35, ease: LANDING_EASE }}>
        {from}
      </motion.span>
      <span className="text-ink-300"> → </span>
      <motion.span
        className="font-medium text-accent-700"
        animate={{ opacity: showTo ? 1 : 0.35 }}
        transition={{ duration: 0.4, ease: LANDING_EASE }}
      >
        {to}
      </motion.span>
    </span>
  );
}
