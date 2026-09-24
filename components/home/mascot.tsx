"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useEffect, useRef } from "react";
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

const SPRING = { stiffness: 140, damping: 16, mass: 0.5 };
const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));

/**
 * Petit bonhomme en 3D légère : flotte, suit la souris et change de pose selon `mood`.
 * En mouvement réduit, il reste immobile et change de pose en fondu.
 */
export function Mascot({
  mood,
  className,
  depth = 16,
}: {
  mood: MascotMood;
  className?: string;
  depth?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, SPRING);
  const ry = useSpring(0, SPRING);

  useEffect(() => {
    if (reduce || !window.matchMedia("(pointer: fine)").matches) return;
    const onMove = (e: PointerEvent) => {
      const r = ref.current?.getBoundingClientRect();
      if (!r) return;
      const dx = (e.clientX - (r.left + r.width / 2)) / window.innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / window.innerHeight;
      ry.set(clamp(dx * 60, 22));
      rx.set(clamp(-dy * 50, 16));
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduce, rx, ry]);

  return (
    <div
      ref={ref}
      aria-hidden
      className={cn("pointer-events-none [perspective:500px]", className)}
    >
      <motion.div
        className="size-full"
        animate={reduce ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="relative size-full"
          style={
            reduce
              ? undefined
              : { rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }
          }
        >
          <AnimatePresence initial={false}>
            <motion.div
              key={mood}
              className="absolute inset-0"
              style={reduce ? undefined : { transformStyle: "preserve-3d" }}
              initial={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.8, rotateY: -35 }
              }
              animate={
                reduce
                  ? { opacity: 1 }
                  : mood === "submit"
                    ? {
                        opacity: 1,
                        scale: 1,
                        rotateY: 0,
                        x: [0, 0, 14],
                        y: [0, 0, -14],
                      }
                    : { opacity: 1, scale: 1, rotateY: 0 }
              }
              exit={
                reduce
                  ? { opacity: 0 }
                  : { opacity: 0, scale: 0.8, rotateY: 35 }
              }
              transition={{ duration: 0.35, ease: EASE }}
            >
              <Illustration
                name={ART[mood]}
                depth={reduce ? 0 : depth}
                className="size-full"
              />
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}
