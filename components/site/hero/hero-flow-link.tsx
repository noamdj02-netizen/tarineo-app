"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Arc montant vers le moteur, puis arc descendant vers la pièce produite. */
const PATH = {
  in: "M3 92 C 30 90, 44 44, 77 38",
  out: "M3 38 C 36 32, 50 78, 77 74",
} as const;

type HeroFlowLinkProps = {
  side: "in" | "out";
  active: boolean;
  reduced: boolean;
  className?: string;
};

/**
 * Lien visuel entre deux cartes : trace l’arc, puis fait circuler une comète
 * orange dans le sens de la lecture. Purement décoratif.
 */
export function HeroFlowLink({ side, active, reduced, className }: HeroFlowLinkProps) {
  const gradientId = `hero-flow-${side}`;

  return (
    <svg
      aria-hidden
      viewBox="0 0 80 120"
      fill="none"
      className={cn("pointer-events-none absolute w-[clamp(52px,6vw,96px)]", className)}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#FFE4D1" stopOpacity="0.15" />
          <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="1" stopColor="#FFE4D1" stopOpacity="0.15" />
        </linearGradient>
      </defs>

      <motion.path
        d={PATH[side]}
        stroke={`url(#${gradientId})`}
        strokeWidth="2"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: active ? 1 : 0, opacity: active ? 1 : 0 }}
        transition={reduced ? { duration: 0.2 } : { duration: 0.7, ease: "easeOut" }}
      />

      {active && !reduced ? (
        <motion.path
          d={PATH[side]}
          stroke="#FFFFFF"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray="12 240"
          initial={{ strokeDashoffset: 252 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity, repeatDelay: 0.5 }}
          style={{ filter: "drop-shadow(0 0 4px rgba(255,255,255,0.85))" }}
        />
      ) : null}
    </svg>
  );
}
