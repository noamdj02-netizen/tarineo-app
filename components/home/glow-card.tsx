"use client";

import { motion, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const SPRING = { stiffness: 280, damping: 34, mass: 0.85 };

/** Halo pastel flou qui dérive lentement en bas de la carte. */
function Glow({ soft }: { soft?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-[min(70%,520px)] transition-opacity duration-700",
        soft ? "opacity-45" : "opacity-100",
      )}
    >
      <div
        className={cn(
          "absolute -bottom-[20%] left-[-18%] h-[95%] w-[70%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-1)_20%,transparent)] blur-2xl",
          !soft && "animate-[glow-drift_16s_ease-in-out_infinite]",
        )}
      />
      <div
        className={cn(
          "absolute -bottom-[10%] left-[18%] h-[100%] w-[64%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-2)_20%,transparent)] blur-2xl",
          !soft && "animate-[glow-drift_19s_ease-in-out_-6s_infinite]",
        )}
      />
      <div
        className={cn(
          "absolute right-[-18%] -bottom-[20%] h-[95%] w-[62%] rounded-full bg-[radial-gradient(closest-side,var(--color-glow-3)_20%,transparent)] blur-2xl",
          !soft && "animate-[glow-drift_22s_ease-in-out_-11s_infinite]",
        )}
      />
    </div>
  );
}

/**
 * Carte douce façon « assistant » : fond clair, halo pastel animé.
 * `tilt` l'incline légèrement vers le pointeur (souris uniquement, jamais en mouvement réduit).
 */
export function GlowCard({
  children,
  className,
  tilt = false,
  soft = false,
}: {
  children: React.ReactNode;
  className?: string;
  tilt?: boolean;
  soft?: boolean;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const rx = useSpring(0, SPRING);
  const ry = useSpring(0, SPRING);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (min-width: 1024px)");
    const sync = () => setFine(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const active = tilt && fine && !reduce;

  return (
    <div className={active ? "[perspective:1400px]" : undefined}>
      <motion.div
        ref={ref}
        onPointerMove={
          active
            ? (e) => {
                const r = ref.current?.getBoundingClientRect();
                if (!r) return;
                ry.set(((e.clientX - r.left) / r.width - 0.5) * 5);
                rx.set(-((e.clientY - r.top) / r.height - 0.5) * 4);
              }
            : undefined
        }
        onPointerLeave={
          active
            ? () => {
                rx.set(0);
                ry.set(0);
              }
            : undefined
        }
        style={active ? { rotateX: rx, rotateY: ry } : undefined}
        className={cn(
          "relative isolate overflow-clip rounded-[28px] border border-line bg-surface-2 shadow-soft",
          className,
        )}
      >
        <Glow soft={soft} />
        {children}
      </motion.div>
    </div>
  );
}
