"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { TarineoHdMascot, type TarineoHdMascotName } from "@/components/tarineo-hd-mascot";
import { EASE } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export type MascotMood = "idle" | "focus" | "typing" | "submit";

const ART: Record<MascotMood, TarineoHdMascotName> = {
  idle: "14-bulle",
  focus: "06-loupe",
  typing: "07-ordinateur",
  submit: "01-pouce-leve",
};

export function Mascot({ mood, className }: { mood: MascotMood; className?: string }) {
  const reduce = useReducedMotion();
  const hidden = reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 };

  return (
    <div aria-hidden className={cn("pointer-events-none", className)}>
      <div className="relative size-full">
        <AnimatePresence initial={false}>
          <motion.div
            key={mood}
            className="absolute inset-0"
            initial={hidden}
            animate={{ opacity: 1, scale: 1 }}
            exit={hidden}
            transition={{ duration: 0.28, ease: EASE }}
          >
            <TarineoHdMascot name={ART[mood]} className="size-full" label="" />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
