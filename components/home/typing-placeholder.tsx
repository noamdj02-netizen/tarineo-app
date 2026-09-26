"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { Mascot } from "@/components/home/mascot";
import { cn } from "@/lib/utils";

const TYPE_MS = 42;
const DELETE_MS = 16;
const HOLD_MS = 1700;
const GAP_MS = 380;

type Phase = "typing" | "hold" | "deleting";

/**
 * Placeholder animé : la mascotte écrit les exemples lettre par lettre et avance avec le texte,
 * puis efface et passe au suivant. `onExample` signale l'exemple en cours (-1 entre deux).
 */
export function TypingPlaceholder({
  examples,
  paused,
  onExample,
  className,
  onDark = false,
}: {
  examples: string[];
  paused: boolean;
  onExample?: (index: number) => void;
  className?: string;
  onDark?: boolean;
}) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing");
  const text = examples[index] ?? "";
  const animated = !reduce && !paused && examples.length > 0;

  useEffect(() => {
    if (!animated) return;
    let delay: number;
    let step: () => void;
    if (phase === "typing") {
      if (count < text.length) {
        const ch = text[count];
        delay = TYPE_MS + (ch === " " ? 50 : Math.random() * 40);
        step = () => setCount((c) => c + 1);
      } else {
        delay = 0;
        step = () => setPhase("hold");
      }
    } else if (phase === "hold") {
      delay = HOLD_MS;
      step = () => setPhase("deleting");
    } else if (count > 0) {
      delay = DELETE_MS;
      step = () => setCount((c) => c - 1);
    } else {
      delay = GAP_MS;
      step = () => {
        setIndex((i) => (i + 1) % examples.length);
        setPhase("typing");
      };
    }
    const t = window.setTimeout(step, delay);
    return () => window.clearTimeout(t);
  }, [animated, phase, count, text, examples.length]);

  const live = animated && (phase !== "deleting" || count > 0);
  useEffect(() => {
    onExample?.(live ? index : -1);
  }, [live, index, onExample]);

  if (!animated) {
    return (
      <span className="flex min-w-0 items-center gap-1.5">
        <Mascot mood={paused ? "focus" : "idle"} onDark={onDark} className="-my-1 size-9 flex-none" />
        <span className={cn("truncate", className)}>Demande à ton copilote…</span>
      </span>
    );
  }

  return (
    <span className="flex min-w-0 max-w-full items-center overflow-hidden">
      <span className={cn("min-w-0 truncate", className ?? "text-ink/55")}>{text.slice(0, count)}</span>
      <motion.span
        layout="position"
        transition={{ type: "spring", stiffness: 520, damping: 38, mass: 0.6 }}
        className="-my-1 ml-0.5 flex-none"
      >
        <Mascot mood={phase === "hold" ? "idle" : "typing"} onDark={onDark} className="size-9" />
      </motion.span>
    </span>
  );
}
