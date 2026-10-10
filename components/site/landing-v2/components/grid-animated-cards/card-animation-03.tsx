"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  IconWell,
  MessageQuestionIcon,
  ReceiptItemIcon,
  TickCircleIcon,
  UserSquareIcon,
} from "@/components/site/landing-v2/components/grid-animated-cards/icons";
import { cn } from "@/lib/utils";

const CARDS = [
  { icon: UserSquareIcon, name: "Chantier", subtitle: "Rattacher le devis", tone: "ink" as const },
  { icon: MessageQuestionIcon, name: "Alerte prix", subtitle: "Hausse détectée", tone: "accent" as const },
  { icon: ReceiptItemIcon, name: "Devis client", subtitle: "Préparer l’envoi", tone: "plain" as const },
];

const CARD_H = 88;
const GAP = 10;
const STEP = CARD_H + GAP;
const TOTAL_PHASES = 5;
const HOLD_MS = 1100;
const SPRING = { type: "spring" as const, stiffness: 260, damping: 26, mass: 1 };

function getCardAnimate(cardIndex: number, phase: number) {
  if (phase === 4) return { y: 0, opacity: 0, scale: 0.92, zIndex: 0 };
  if (phase === 3) {
    if (cardIndex === 1) return { y: 0, opacity: 1, scale: 1.12, zIndex: 3 };
    return { y: 0, opacity: 0, scale: 0.92, zIndex: 1 };
  }
  const visibleCount = Math.min(phase + 1, 3);
  if (cardIndex >= visibleCount) {
    return { y: STEP * 2, opacity: 0, scale: 0.92, zIndex: 0 };
  }
  const listCenter = (visibleCount - 1) / 2;
  const relPos = cardIndex - listCenter;
  return { y: relPos * STEP, opacity: 1, scale: 1, zIndex: visibleCount - cardIndex };
}

function isChecked(cardIndex: number, phase: number) {
  return phase >= Math.min(cardIndex + 1, 2);
}

export function CardAnimation03({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(() => setPhase((p) => (p + 1) % TOTAL_PHASES), HOLD_MS);
    return () => clearTimeout(t);
  }, [phase, reduce]);

  const active = reduce ? 2 : phase;

  return (
    <div className="h-full w-full overflow-hidden">
      <div className={cn("flex h-full w-full items-center justify-center", className)}>
        <div className="relative" style={{ width: 280, height: CARD_H }}>
          {CARDS.map((card, i) => {
            const { zIndex, ...anim } = getCardAnimate(i, active);
            return (
              <motion.div
                key={card.name}
                className="absolute inset-0"
                style={{ zIndex }}
                initial={false}
                animate={anim}
                transition={reduce ? { duration: 0 } : SPRING}
              >
                <TeamCard card={card} checked={isChecked(i, active)} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function TeamCard({
  card,
  checked,
}: {
  card: (typeof CARDS)[0];
  checked: boolean;
}) {
  const Icon = card.icon;
  return (
    <div className="relative flex h-full w-full flex-col justify-between rounded-xl border border-line bg-paper-0 p-3.5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconWell tone={card.tone}>
            <Icon />
          </IconWell>
          <div className="min-w-0">
            <p className="text-xs leading-snug font-bold text-ink-900">{card.name}</p>
            <p className="text-[10px] leading-tight text-ink-400">{card.subtitle}</p>
          </div>
        </div>
        <motion.div
          className="flex size-7 shrink-0 items-center justify-center rounded-full"
          initial={false}
          animate={{
            backgroundColor: checked
              ? "var(--color-accent)"
              : "color-mix(in srgb, var(--color-accent) 18%, white)",
            color: checked ? "#fff" : "var(--color-accent)",
          }}
          transition={{ duration: 0.25 }}
        >
          <TickCircleIcon />
        </motion.div>
      </div>
      <div className="mt-1 flex flex-col gap-1">
        {[100, 78].map((pct, j) => (
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
