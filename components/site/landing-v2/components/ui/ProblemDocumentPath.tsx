"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

import { LandingPathFillCard } from "@/components/site/landing-v2/components/ui/LandingPathFillCard";
import { LANDING_VIEW } from "@/components/site/landing-v2/lib/landing-motion";
import type { IconName } from "@/lib/site/landing-v2-content";

/** Aligné sur la durée du spring de remplissage (Framer-like). */
const STEP_MS = 520;

type Doc = { icon: IconName; title: string; detail: string };

/** Grille documents dispersés — remplissage orange un par un (lecture → chemin). */
export function ProblemDocumentPath({ documents }: { documents: Doc[] }) {
  const reduce = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { ...LANDING_VIEW, once: true });
  const [filledUpTo, setFilledUpTo] = useState(reduce ? documents.length - 1 : -1);

  useEffect(() => {
    if (reduce) {
      setFilledUpTo(documents.length - 1);
      return;
    }
    if (!inView) return;

    setFilledUpTo(-1);
    const timeouts: number[] = [];
    for (let index = 0; index < documents.length; index += 1) {
      timeouts.push(
        window.setTimeout(() => {
          setFilledUpTo(index);
        }, 120 + index * STEP_MS),
      );
    }

    return () => {
      for (const id of timeouts) window.clearTimeout(id);
    };
  }, [inView, reduce, documents.length]);

  return (
    <div
      ref={rootRef}
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
    >
      {documents.map((doc, index) => (
        <div
          key={doc.title}
          className="surface-flat overflow-hidden rounded-[var(--radius-md,0.375rem)]"
        >
          <LandingPathFillCard
            doc={doc}
            filled={index <= filledUpTo}
            reduce={reduce}
            isActive={index === filledUpTo}
          />
        </div>
      ))}
    </div>
  );
}
