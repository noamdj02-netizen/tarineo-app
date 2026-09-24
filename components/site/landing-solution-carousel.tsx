"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { EASE } from "@/components/motion/reveal";
import { LandingFeatureCard } from "@/components/site/landing-feature-card";
import { SOLUTION_PREVIEW_PANELS } from "@/components/site/landing-solution-previews";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HOW_WORKS_ROWS } from "@/lib/site/content";
import { cn } from "@/lib/utils";

const STEP_MS = 6500;

const TINT_BG: Record<(typeof HOW_WORKS_ROWS)[number]["tint"], string> = {
  "glow-1": "from-glow-1/35 via-glow-1/15 to-surface",
  "glow-2": "from-glow-2/40 via-glow-2/18 to-surface",
  "glow-3": "from-glow-3/35 via-glow-3/15 to-surface",
};

/** Carrousel — pile verticale sur mobile, deux colonnes + contrôles latéraux sur desktop. */
export function LandingSolutionCarousel() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = HOW_WORKS_ROWS.length;
  const row = HOW_WORKS_ROWS[index];
  const Preview = SOLUTION_PREVIEW_PANELS[index] ?? SOLUTION_PREVIEW_PANELS[0];

  const go = useCallback(
    (dir: 1 | -1) => {
      setIndex((i) => (i + dir + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (paused || reduce) return;
    const id = window.setInterval(() => go(1), STEP_MS);
    return () => window.clearInterval(id);
  }, [paused, reduce, go, index]);

  return (
    <div
      className="flex flex-col gap-4 lg:flex-row lg:items-stretch lg:gap-6"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="relative min-h-0 flex-1 lg:min-h-[min(380px,70vh)]"
        role="region"
        aria-roledescription="carousel"
        aria-label="Étapes du cockpit"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={row.title}
            role="group"
            aria-roledescription="slide"
            aria-label={`${index + 1} sur ${count} — ${row.title}`}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16, filter: "blur(4px)" }}
            transition={{ duration: 0.4, ease: EASE }}
            className={cn(
              "grid items-stretch gap-3 sm:gap-4",
              "lg:absolute lg:inset-0 lg:grid-cols-2 lg:gap-6",
            )}
          >
            <LandingFeatureCard
              mascot={row.mascot}
              title={row.title}
              description={row.description}
              kicker={row.kicker}
              glow={row.tint}
              className="h-full"
            />
            <Card
              className={cn(
                "h-full min-h-0 gap-0 overflow-hidden rounded-[20px] border-line py-0 shadow-soft ring-1 ring-line sm:rounded-[24px]",
                "bg-gradient-to-b",
                TINT_BG[row.tint],
              )}
            >
              <CardContent className="flex min-h-0 flex-1 flex-col p-0">
                <Preview />
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Mobile : pagination + flèches horizontales */}
      <div className="flex items-center justify-between gap-3 lg:hidden">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0 rounded-full border-line bg-surface"
          aria-label="Étape précédente"
          onClick={() => go(-1)}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <div className="flex flex-1 flex-col items-center gap-2">
          <div className="flex gap-2" role="tablist" aria-label="Étapes">
            {HOW_WORKS_ROWS.map((r, i) => (
              <button
                key={r.title}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={r.title}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-1.5 rounded-pill transition-all duration-300",
                  i === index ? "w-8 bg-ink" : "w-4 bg-line",
                )}
              />
            ))}
          </div>
          <p className="text-center font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
            {index + 1} / {count}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-10 shrink-0 rounded-full border-line bg-surface"
          aria-label="Étape suivante"
          onClick={() => go(1)}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>

      {/* Desktop : contrôles verticaux */}
      <div className="hidden flex-col items-center justify-center gap-4 lg:flex">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 rounded-full border-line bg-surface shadow-soft ring-1 ring-line hover:bg-surface-2"
          aria-label="Slide précédente"
          onClick={() => go(-1)}
        >
          <ChevronUp aria-hidden />
        </Button>
        <div className="flex flex-col gap-2" role="tablist" aria-label="Étapes">
          {HOW_WORKS_ROWS.map((r, i) => (
            <button
              key={r.title}
              type="button"
              role="tab"
              aria-selected={i === index}
              aria-label={r.title}
              onClick={() => setIndex(i)}
              className={cn(
                "rounded-pill transition-all duration-300",
                i === index ? "h-8 w-1.5 bg-ink" : "h-4 w-1.5 bg-line hover:bg-ink/30",
              )}
            />
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="size-11 rounded-full border-line bg-surface shadow-soft ring-1 ring-line hover:bg-surface-2"
          aria-label="Slide suivante"
          onClick={() => go(1)}
        >
          <ChevronDown aria-hidden />
        </Button>
      </div>
    </div>
  );
}
