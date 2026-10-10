"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  IconWell,
  ScanDevisIcon,
} from "@/components/site/landing-v2/components/grid-animated-cards/icons";
import { cn } from "@/lib/utils";

const PHASES = 8;
const HOLD_MS = 750;
const SPRING = { type: "spring" as const, stiffness: 200, damping: 22, mass: 1 };

export function CardAnimation02({ className }: { className?: string }) {
  return (
    <div className="h-full w-full overflow-hidden">
      <div className={cn("flex h-full w-full items-center justify-center", className)}>
        <PhaseCard />
      </div>
    </div>
  );
}

function PhaseCard() {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setPhase((p) => (p + 1) % PHASES), HOLD_MS);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  const active = reduce ? PHASES - 1 : phase;

  return (
    <div className="relative h-[150px] w-[280px] rounded-xl border border-line bg-paper-0 p-3.5 shadow-sm">
      <div className="flex h-full w-full flex-col justify-between">
        <div className="flex items-center gap-3">
          <IconWell tone="accent">
            <ScanDevisIcon />
          </IconWell>
          <div className="min-w-0">
            <p className="text-xs leading-snug font-bold text-ink-900">Analyse en cours</p>
            <p className="text-[10px] leading-tight text-ink-400">Lecture instantanée</p>
          </div>
        </div>

        <div className="mt-3.5 flex flex-grow items-center gap-0.5">
          {Array.from({ length: PHASES }).map((_, i) => {
            const isCompleted = i < active;
            const isActive = i === active;
            return (
              <div
                key={i}
                className="relative h-full w-12 overflow-hidden rounded-lg border border-line bg-paper-0"
              >
                <motion.div
                  className="absolute inset-0 h-full w-full bg-accent"
                  initial={false}
                  animate={{
                    width: isCompleted || isActive ? "100%" : "0%",
                    opacity: isActive ? 1 : isCompleted ? 0.7 : 0,
                  }}
                  transition={reduce ? { duration: 0 } : SPRING}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
