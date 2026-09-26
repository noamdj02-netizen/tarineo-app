"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Illustration } from "@/components/illustration";
import { EASE } from "@/components/motion/reveal";
import type { IllustrationName } from "@/lib/illustrations";
import { cn } from "@/lib/utils";

export type MascotMood = "idle" | "focus" | "typing" | "submit";

const ART: Record<MascotMood, IllustrationName> = {
  idle: "landing-idee",
  focus: "feedback-question",
  typing: "dashboard-focus",
  submit: "feedback-envoye",
};

/**
 * Petit bonhomme posé au-dessus du champ : immobile, il change de pose selon `mood`
 * par un fondu flou court (façon Framer). En mouvement réduit, simple fondu.
 */
export function Mascot({
  mood,
  className,
  onDark = false,
}: {
  mood: MascotMood;
  className?: string;
  onDark?: boolean;
}) {
  const reduce = useReducedMotion();
  const hidden = reduce
    ? { opacity: 0 }
    : { opacity: 0, scale: 0.96, filter: "blur(4px)" };

  return (
    <div aria-hidden className={cn("pointer-events-none", className)}>
      <div className="relative size-full">
      <AnimatePresence initial={false}>
        <motion.div
          key={mood}
          className="absolute inset-0"
          initial={hidden}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          exit={hidden}
          transition={{ duration: 0.28, ease: EASE }}
        >
          <Illustration name={ART[mood]} className="size-full" tone={onDark ? "on-dark" : "default"} />
        </motion.div>
      </AnimatePresence>
      </div>
    </div>
  );
}
