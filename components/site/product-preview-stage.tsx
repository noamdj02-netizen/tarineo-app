"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";
import { Illustration } from "@/components/illustration";
import { EASE } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";
import { AI_STORY } from "./product-preview-story";

const STEP_MS = 6500;

/** Étapes du copilote, sous le film. */
export function ProductPreviewStage({ hold = false }: { hold?: boolean }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const story = AI_STORY[step] ?? AI_STORY[0];

  const advance = useCallback(() => {
    setStep((i) => (i + 1) % AI_STORY.length);
  }, []);

  useEffect(() => {
    if (paused || reduce || hold) return;
    timer.current = setInterval(advance, STEP_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [paused, reduce, hold, advance, step]);

  return (
    <div
      className="flex flex-col gap-4"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={story.id}
          role="region"
          aria-label={story.title}
          aria-live="polite"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 10, filter: "blur(4px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6, filter: "blur(4px)" }}
          transition={{ duration: 0.4, ease: EASE }}
          className="card-soft flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:gap-5 sm:p-5"
        >
          <motion.div
            initial={reduce ? false : { scale: 0.94, rotate: -2 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto shrink-0 sm:mx-0"
            style={{ perspective: 900 }}
          >
            <Illustration
              name={story.art}
              depth={14}
              className="size-[88px] sm:size-[100px]"
              label={story.title}
            />
          </motion.div>
          <div className="min-w-0 flex-1 text-center sm:text-left">
            <p className="mono-label">{story.label}</p>
            <h3 className="mt-1.5 font-serif text-[clamp(1.35rem,4vw,1.65rem)] leading-[1.12] tracking-[-0.02em] text-balance">
              {story.title}
            </h3>
            <p className="mt-2 text-[14.5px] leading-relaxed text-muted-foreground">{story.body}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-center gap-1.5" role="tablist" aria-label="Étapes du copilote">
        {AI_STORY.map((s, i) => (
          <button
            key={s.id}
            type="button"
            role="tab"
            aria-selected={i === step}
            aria-label={s.title}
            onClick={() => setStep(i)}
            className={cn(
              "h-1.5 rounded-pill transition-all duration-300",
              i === step ? "w-8 bg-ink" : "w-4 bg-line hover:bg-ink/25",
            )}
          />
        ))}
      </div>

      {paused ? (
        <p className="text-center text-[12px] text-muted-foreground">Survolé — défilement en pause</p>
      ) : null}
    </div>
  );
}

