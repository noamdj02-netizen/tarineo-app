"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

import {
  AiSendMessageIcon,
  IconWell,
} from "@/components/site/landing-v2/components/grid-animated-cards/icons";
import { cn } from "@/lib/utils";

const PHASE_DURATIONS = [900, 1200, 2200, 400];
const TOTAL_PHASES = 4;

const SUMMARY_ITEMS = [
  "3 hausses vs historique",
  "Devis Cedeo · Exemple",
  "Écart total +127,50 €",
];

export function CardAnimation04({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(
      () => setPhase((p) => (p + 1) % TOTAL_PHASES),
      PHASE_DURATIONS[phase],
    );
    return () => clearTimeout(t);
  }, [phase, reduce]);

  const active = reduce ? 2 : phase;
  const isBlank = active === 3;
  const leftTyping = active === 0;
  const rightTyping = active === 0 || active === 1;

  return (
    <div className="h-full w-full overflow-hidden">
      <div className={cn("flex h-full w-full items-center justify-center", className)}>
        <motion.div
          className="relative h-full w-[25rem]"
          initial={false}
          animate={{ opacity: isBlank ? 0 : 1 }}
          transition={{ duration: 0.35 }}
        >
          <div className="absolute top-0 left-0 z-[1] h-40 w-80 rounded-2xl border border-line bg-paper-0 p-4 shadow-sm">
            <Bubble side="left" typing={leftTyping} variant="accent" />
            <Bubble side="right" typing={rightTyping} variant="gray" />
          </div>

          <div className="absolute right-0 bottom-0 z-[2] w-80 rounded-2xl border border-line bg-paper-0 p-4 shadow-sm">
            <div className="mb-3 flex items-center gap-2.5">
              <IconWell tone="solid" className="size-9 rounded-xl">
                <AiSendMessageIcon className="size-4 text-white" />
              </IconWell>
              <p className="text-base font-bold text-ink-900">Synthèse devis</p>
            </div>
            <div className="flex flex-col gap-1 rounded-xl border border-line p-2">
              {SUMMARY_ITEMS.map((text) => (
                <div key={text} className="flex items-center gap-2">
                  <motion.div
                    className="size-2 shrink-0 rounded-full bg-accent"
                    animate={
                      reduce
                        ? undefined
                        : { scale: [0.9, 1, 0.9], opacity: [0.7, 1, 0.7] }
                    }
                    transition={{
                      duration: 0.65,
                      repeat: Infinity,
                      repeatType: "loop",
                    }}
                  />
                  <p className="text-xs text-ink-600">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Bubble({
  side,
  typing,
  variant,
}: {
  side: "left" | "right";
  typing: boolean;
  variant: "accent" | "gray";
}) {
  const isLeft = side === "left";
  const bgClass = variant === "accent" ? "bg-accent-soft" : "bg-paper-100";

  return (
    <div
      className={`absolute rounded-2xl px-3 py-2.5 ${bgClass}`}
      style={{
        top: isLeft ? 14 : 82,
        left: isLeft ? 14 : undefined,
        right: isLeft ? undefined : 14,
      }}
    >
      <AnimatePresence mode="wait" initial={false}>
        {typing ? (
          <motion.div
            key="dots"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TypingDots variant={variant} />
          </motion.div>
        ) : (
          <motion.div
            key="text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <TextLines variant={variant} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function TypingDots({ variant }: { variant: "accent" | "gray" }) {
  const dotClass = variant === "accent" ? "bg-accent/70" : "bg-ink-300";
  return (
    <div className="flex h-4 items-center gap-1 px-0.5">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`size-1.5 rounded-full ${dotClass}`}
          animate={{ y: [0, -5, 0] }}
          transition={{
            duration: 0.65,
            repeat: Infinity,
            repeatType: "loop",
            delay: i * 0.14,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function TextLines({ variant }: { variant: "accent" | "gray" }) {
  const from = variant === "accent" ? "from-accent/40" : "from-ink-300";
  const to = variant === "accent" ? "to-accent/10" : "to-paper-100";
  return (
    <div className="flex flex-col gap-0.5 py-0.5">
      <div className={`h-1.5 w-50 rounded-full bg-gradient-to-r ${from} ${to}`} />
      <div className={`h-1.5 w-30 rounded-full bg-gradient-to-r ${from} ${to}`} />
    </div>
  );
}
