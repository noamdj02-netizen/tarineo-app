"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

const LINES = [
  "Chaque hausse de prix,",
  "avant qu’elle mange votre marge.",
] as const;

/**
 * B11 — grand tagline mid-page : chaque mot passe du ton muted au plein
 * à mesure qu’il croise la ligne de trigger au scroll.
 */
export function TaglineReveal() {
  const reduce = useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(reduce ? Number.POSITIVE_INFINITY : -1);

  useEffect(() => {
    if (reduce) {
      setActive(Number.POSITIVE_INFINITY);
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const words = Array.from(section.querySelectorAll<HTMLElement>("[data-tag-word]"));
    if (!words.length) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = Number((entry.target as HTMLElement).dataset.tagWord);
          if (!Number.isFinite(index)) continue;
          setActive((prev) => Math.max(prev, index));
        }
      },
      {
        root: null,
        rootMargin: "-42% 0px -42% 0px",
        threshold: 0,
      },
    );

    for (const word of words) io.observe(word);
    return () => io.disconnect();
  }, [reduce]);

  let wordIndex = 0;

  return (
    <section
      ref={sectionRef}
      id="promesse"
      aria-label="Promesse Tarinéo"
      className="relative bg-paper-100 px-6 py-16 sm:px-8 sm:py-20 lg:py-24"
    >
      <div className="mx-auto max-w-[680px]">
        <p className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl lg:leading-none">
          {LINES.map((line) => (
            <span key={line} className="block">
              {line.split(" ").map((word, i, arr) => {
                const index = wordIndex++;
                const on = active >= index;
                return (
                  <span key={`${line}-${i}`}>
                    <span
                      data-tag-word={index}
                      className={cn(
                        "inline-block transition-[color,opacity,filter,transform] duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]",
                        on ? "text-ink-900 opacity-100" : "text-ink-900/30 opacity-100",
                      )}
                    >
                      {word}
                    </span>
                    {i < arr.length - 1 ? " " : null}
                  </span>
                );
              })}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
