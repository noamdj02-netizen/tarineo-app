"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";

const formaterDefaut = (n: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/**
 * Compte jusqu'à la valeur cible (effet « caisse enregistreuse »).
 * Respecte prefers-reduced-motion.
 */
export function AnimatedNumber({
  value,
  format = formaterDefaut,
  durationMs = 900,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  durationMs?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [affiche, setAffiche] = useState(0);
  const prev = useRef(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (reduce) {
      prev.current = value;
      return;
    }

    const debut = prev.current;
    const delta = value - debut;
    if (delta === 0) {
      return;
    }

    const t0 = performance.now();
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    function tick(now: number) {
      const p = Math.min(1, (now - t0) / durationMs);
      const courant = debut + delta * easeOut(p);
      setAffiche(courant);
      if (p < 1) {
        frame.current = requestAnimationFrame(tick);
      } else {
        prev.current = value;
        setAffiche(value);
      }
    }

    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [value, durationMs, reduce]);

  const afficheFinal = reduce ? value : affiche;

  return (
    <span className={className} aria-label={format(value)}>
      {format(afficheFinal)}
    </span>
  );
}
