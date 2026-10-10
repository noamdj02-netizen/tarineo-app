"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  AiSendMessageIcon,
  IconWell,
} from "@/components/site/landing-v2/components/grid-animated-cards/icons";
import { cn } from "@/lib/utils";

const CARDS = [
  { count: 5, time: "il y a 2 min" },
  { count: 9, time: "il y a 32 min" },
  { count: 3, time: "il y a 25 min" },
];

const W = 280;
const H = 98;
const STEP = H + 8;

type CardState = {
  x: number;
  y: number;
  rotate: number;
  opacity: number;
  scale: number;
  zIndex: number;
};

const PHASES: CardState[][] = [
  [
    { x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.82, zIndex: 0 },
    { x: 0, y: 0, rotate: 0, opacity: 0, scale: 0.82, zIndex: 0 },
    { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1, zIndex: 2 },
  ],
  [
    { x: -65, y: -80, rotate: 0, opacity: 1, scale: 1, zIndex: 1 },
    { x: 65, y: 0, rotate: 0, opacity: 1, scale: 1, zIndex: 2 },
    { x: -65, y: 80, rotate: 0, opacity: 1, scale: 1, zIndex: 3 },
  ],
  [
    { x: 0, y: -STEP, rotate: 0, opacity: 1, scale: 1, zIndex: 3 },
    { x: 0, y: 0, rotate: 0, opacity: 1, scale: 1, zIndex: 2 },
    { x: 0, y: STEP, rotate: 0, opacity: 1, scale: 1, zIndex: 1 },
  ],
  [
    { x: 0, y: -STEP + 35, rotate: 5, opacity: 1, scale: 1, zIndex: 1 },
    { x: 0, y: 0, rotate: -5, opacity: 1, scale: 1, zIndex: 2 },
    { x: 0, y: STEP - 35, rotate: 5, opacity: 1, scale: 1, zIndex: 3 },
  ],
];

const SPRING = { type: "spring" as const, stiffness: 300, damping: 22, mass: 1 };
const HOLD_MS = 1000;

export function CardAnimation01({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setPhase((p) => (p + 1) % PHASES.length), HOLD_MS);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  const activePhase = reduce ? 2 : phase;

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div className={cn("relative h-0 w-0", className)}>
        {CARDS.map((card, i) => {
          const pos = PHASES[activePhase][i];
          return (
            <motion.div
              key={i}
              className="absolute"
              style={{
                width: W,
                height: H,
                top: -H / 2,
                left: -W / 2,
                zIndex: pos.zIndex,
              }}
              animate={{
                x: pos.x,
                y: pos.y,
                rotate: pos.rotate,
                opacity: pos.opacity,
                scale: pos.scale,
              }}
              transition={reduce ? { duration: 0 } : SPRING}
            >
              <NotificationCard count={card.count} time={card.time} />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function NotificationCard({ count, time }: { count: number; time: string }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between rounded-xl border border-line bg-paper-0 p-3.5 shadow-sm">
      <div className="flex items-center gap-3">
        <IconWell tone="accent">
          <AiSendMessageIcon />
        </IconWell>
        <div className="min-w-0">
          <p className="text-xs leading-snug font-bold text-ink-900">
            Nouveau devis{" "}
            <span className="font-semibold text-ink-400">({count})</span>
          </p>
          <p className="text-[10px] leading-tight text-ink-400">{time}</p>
        </div>
      </div>
      <div className="mt-1 flex flex-col gap-1">
        {[100, 78, 58].map((pct, j) => (
          <div
            key={j}
            className="h-1.5 rounded-full bg-gradient-to-r from-accent/25 to-accent/5"
            style={{ width: `${pct}%` }}
          />
        ))}
      </div>
    </div>
  );
}
