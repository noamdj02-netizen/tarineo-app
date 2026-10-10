"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { FolderTabCard } from "@/components/metier/folder-tab-card";
import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingStepPreview } from "@/components/site/landing-v2/components/ui/LandingStepPreview";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { journeySteps } from "@/lib/site/landing-v2-content";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { cn } from "@/lib/utils";

const AUTO_MS = 5200;
const GAP_PX = 16;

/** Desktop : 3 cartes visibles ; tablette 2 ; mobile 1. Défile carte par carte. */
function useVisibleCount() {
  const [count, setCount] = useState(3);
  useEffect(() => {
    const mqSm = window.matchMedia("(min-width: 640px)");
    const mqLg = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      if (mqLg.matches) setCount(3);
      else if (mqSm.matches) setCount(2);
      else setCount(1);
    };
    apply();
    mqSm.addEventListener("change", apply);
    mqLg.addEventListener("change", apply);
    return () => {
      mqSm.removeEventListener("change", apply);
      mqLg.removeEventListener("change", apply);
    };
  }, []);
  return count;
}

export function JourneyFiveSteps() {
  const reduce = useReducedMotion();
  const visible = useVisibleCount();
  const n = journeySteps.length;
  const maxIndex = Math.max(0, n - visible);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    setIndex((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const next = i + delta;
        if (next < 0) return maxIndex;
        if (next > maxIndex) return 0;
        return next;
      });
    },
    [maxIndex],
  );

  useEffect(() => {
    if (reduce || paused || maxIndex < 1) return;
    const t = window.setInterval(() => go(1), AUTO_MS);
    return () => window.clearInterval(t);
  }, [go, paused, reduce, maxIndex]);

  const slidePct = 100 / visible;

  return (
    <LandingSection id="parcours">
      <div className="shell">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <SectionHeading
            label="Parcours"
            title="De la facture fournisseur à la facture client, en 5 étapes."
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-paper-0 text-ink-900 transition-[background-color,transform] duration-150 ease-out hover:bg-paper-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.96] [-webkit-tap-highlight-color:transparent]"
              aria-label="Étapes précédentes"
            >
              <ChevronLeft className="size-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-paper-0 text-ink-900 transition-[background-color,transform] duration-150 ease-out hover:bg-paper-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 active:scale-[0.96] [-webkit-tap-highlight-color:transparent]"
              aria-label="Étapes suivantes"
            >
              <ChevronRight className="size-5" strokeWidth={1.75} />
            </button>
          </div>
        </div>

        <div
          className="relative mt-12"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="overflow-hidden"
            role="region"
            aria-roledescription="carousel"
            aria-label="Parcours en 5 étapes"
          >
            <ul
              className={cn(
                "flex list-none p-0",
                !reduce && "transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
              )}
              style={{
                gap: GAP_PX,
                transform: `translateX(calc(-${index} * (${slidePct}% + ${GAP_PX / visible}px)))`,
              }}
            >
              {journeySteps.map((step) => (
                <li
                  key={step.step}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`Étape ${step.step} : ${step.title}`}
                  className="min-w-0 shrink-0"
                  style={{
                    width: `calc((100% - ${(visible - 1) * GAP_PX}px) / ${visible})`,
                  }}
                >
                  <FolderTabCard
                    href={LANDING_SIGNUP}
                    wideTitle
                    className="mx-auto h-full max-w-[360px]"
                    title={step.title}
                    subtitle={step.detail}
                    metricValue={String(step.step).padStart(2, "0")}
                    metricLabel="/ 05"
                    meta=""
                    media={
                      <div className="origin-top scale-[0.92] opacity-95 [&_*]:!shadow-none">
                        <LandingStepPreview step={step.step} />
                      </div>
                    }
                  />
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2" role="tablist" aria-label="Position du carrousel">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Afficher à partir de l’étape ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-[width,background-color] duration-300",
                  i === index ? "w-7 bg-accent" : "w-2 bg-line-strong hover:bg-ink-300",
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
