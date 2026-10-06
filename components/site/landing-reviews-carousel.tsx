"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { SectionEnter } from "@/components/motion/reveal";
import { TestimonialCard } from "@/components/site/landing-testimonials";
import { ARTISAN_LANDING_REVIEWS } from "@/lib/site/content";
import { cn } from "@/lib/utils";

const REVIEWS = ARTISAN_LANDING_REVIEWS;
const AUTO_MS = 9000;

export function LandingReviewsCarousel({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = REVIEWS.length;

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => (i + delta + n) % n);
    },
    [n],
  );

  useEffect(() => {
    if (reduce || paused || n < 2) return;
    const t = window.setInterval(() => go(1), AUTO_MS);
    return () => window.clearInterval(t);
  }, [go, paused, reduce, n]);

  return (
    <SectionEnter className={cn("mx-auto mt-10 max-w-[920px]", className)}>
      <div
        className="relative"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div className="overflow-hidden rounded-[1.25rem] ring-1 ring-line">
          <div
            className="flex transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none"
            style={{ transform: `translateX(-${index * 100}%)` }}
            aria-live="polite"
          >
            {REVIEWS.map((t) => (
              <div key={t.id} className="w-full shrink-0">
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => go(-1)}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/35"
              aria-label="Avis précédent"
            >
              <ChevronLeft className="size-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/35"
              aria-label="Avis suivant"
            >
              <ChevronRight className="size-5" strokeWidth={1.75} />
            </button>
          </div>

          <div className="flex items-center gap-2" role="tablist" aria-label="Choisir un avis">
            {REVIEWS.map((t, i) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Avis ${i + 1} — ${t.name}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all",
                  i === index ? "w-6 bg-tarineo-orange" : "w-2 bg-line hover:bg-muted-foreground/40",
                )}
              />
            ))}
          </div>

          <Link
            href="/avis"
            className="text-[13px] font-medium text-tarineo-orange transition-colors hover:underline"
          >
            Tous les avis →
          </Link>
        </div>
      </div>
    </SectionEnter>
  );
}
