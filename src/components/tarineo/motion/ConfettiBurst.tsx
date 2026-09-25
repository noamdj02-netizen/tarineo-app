"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, AnimatePresence } from "motion/react";

const EVENT = "tarineo:import-succes";
const COULEURS = ["#EC5821", "#F59E0B", "#10B981", "#3B82F6", "#F472B6", "#FBBF24"];

type Particule = { id: number; x: number; y: number; couleur: string; dx: number; dy: number; rot: number };

/** Écoute l'événement d'import réussi et affiche une salve légère de confettis. */
export function ConfettiBurstHost() {
  const reduce = useReducedMotion();
  const [particules, setParticules] = useState<Particule[]>([]);

  useEffect(() => {
    let timeoutId: number | undefined;

    function onImport() {
      if (reduce) return;
      const salve: Particule[] = Array.from({ length: 28 }, (_, i) => ({
        id: Date.now() + i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 18 + Math.random() * 8,
        couleur: COULEURS[i % COULEURS.length],
        dx: (Math.random() - 0.5) * 120,
        dy: 80 + Math.random() * 140,
        rot: (Math.random() - 0.5) * 540,
      }));
      setParticules(salve);
      window.clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => setParticules([]), 1200);
    }

    window.addEventListener(EVENT, onImport);
    return () => {
      window.removeEventListener(EVENT, onImport);
      window.clearTimeout(timeoutId);
    };
  }, [reduce]);

  return (
    <div className="pointer-events-none fixed inset-0 z-[100] overflow-hidden" aria-hidden>
      <AnimatePresence>
        {particules.map((p) => (
          <motion.span
            key={p.id}
            className="absolute size-2 rounded-[2px]"
            style={{ left: `${p.x}%`, top: `${p.y}%`, background: p.couleur }}
            initial={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: 0 }}
            animate={{ opacity: 0, scale: 0.4, x: p.dx, y: p.dy, rotate: p.rot }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: [0.16, 1, 0.3, 1] }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export function declencherConfettiImport() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(EVENT));
}
