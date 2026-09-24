"use client";

import { useEffect, useState, type CSSProperties } from "react";
import { cn } from "@/lib/utils";

/** Pêche, lavande, bleu doux — cycle 6 s (2 s par teinte). */
const FOCUS_TINTS = ["#f7c6a3", "#cbbdf3", "#b3cbf6"] as const;
const TINT_MS = 2000;

/** Mot « Focus » surligné. Styles : `.brand-focus` dans globals.css */
export function BrandFocus({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((n) => (n + 1) % FOCUS_TINTS.length);
    }, TINT_MS);
    return () => window.clearInterval(id);
  }, []);

  return (
    <span
      className={cn("brand-focus", className)}
      style={{ "--focus-glow": FOCUS_TINTS[index] } as CSSProperties}
    >
      Focus
    </span>
  );
}
