"use client";
import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion } from "@/components/site/landing-v2/lib/motion";

/**
 * Chiffre clé. La valeur monte une seule fois, quand le chiffre entre à
 * l'écran : l'animation sert à faire remarquer le volume traité, pas à décorer.
 */
export function Stat({
  value,
  label,
  suffix = "",
  duration = 1100,
  compact = false,
}: {
  value: number;
  label: string;
  suffix?: string;
  duration?: number;
  compact?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState(() => (prefersReducedMotion() ? value : 0));

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (prefersReducedMotion()) {
      setDisplay(value);
      return;
    }

    let frame = 0;
    let start = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        observer.disconnect();

        const step = (now: number) => {
          if (!start) start = now;
          const progress = Math.min((now - start) / duration, 1);
          // Départ franc, arrivée posée.
          const eased = 1 - Math.pow(1 - progress, 3);
          setDisplay(Math.round(eased * value));
          if (progress < 1) frame = requestAnimationFrame(step);
        };

        frame = requestAnimationFrame(step);
      },
      { threshold: 0.4 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [value, duration]);

  return (
    <div ref={ref}>
      <div
        className={
          compact
            ? "text-xl leading-none font-semibold text-ink-900 nums"
            : "text-[2rem] leading-none font-semibold text-ink-900 nums"
        }
      >
        {display}
        {suffix}
      </div>
      <div className={`text-ink-400 ${compact ? "mt-1.5 text-xs" : "mt-2 text-sm"}`}>{label}</div>
    </div>
  );
}