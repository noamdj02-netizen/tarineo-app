"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Quote } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { landingCardClass } from "@/components/site/landing-v2/components/ui/landing-card";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { Card } from "@/components/ui/card";
import { ARTISAN_LANDING_REVIEWS, type LandingTestimonial } from "@/lib/site/content";
import { cn } from "@/lib/utils";

const STORIES = ARTISAN_LANDING_REVIEWS;
const AUTO_MS = 9000;

function StoryPhoto({
  story,
  className,
  priority,
}: {
  story: LandingTestimonial;
  className?: string;
  priority?: boolean;
}) {
  const graphic = story.photoVariant === "graphic";

  return (
    <div
      className={cn(
        "relative min-h-[220px] w-full overflow-hidden bg-paper-50 sm:min-h-[280px] lg:min-h-0 lg:h-full lg:max-h-[440px]",
        graphic ? "flex items-center justify-center" : "",
        className,
      )}
      style={story.photoBg ? { backgroundColor: story.photoBg } : undefined}
    >
      {!graphic ? (
        <>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-ink-900/50 via-ink-900/10 to-transparent"
          />
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-[2] p-5 sm:p-6">
            <p className="text-sm font-semibold text-white">{story.name}</p>
            <p className="text-xs text-white/85">{story.role}</p>
          </div>
        </>
      ) : null}
      <Image
        src={story.photo}
        alt={`${story.name}, ${story.role}`}
        fill
        priority={priority}
        sizes="(max-width: 1024px) 100vw, 42vw"
        className={cn(
          "transition-transform duration-700 ease-out motion-safe:group-hover/story:scale-[1.02]",
          graphic ? "object-contain p-8" : "object-cover",
        )}
        style={{ objectPosition: story.photoPosition ?? "center" }}
      />
    </div>
  );
}

function StoryDistributeurs({ story }: { story: LandingTestimonial }) {
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Distributeurs concernés">
      {story.stackTools.map((tool) => (
        <li key={tool.domain}>
          <Badge tone="outline" size="sm">{tool.label}</Badge>
        </li>
      ))}
    </ul>
  );
}

function StoryTabs({
  stories,
  index,
  onSelect,
}: {
  stories: LandingTestimonial[];
  index: number;
  onSelect: (i: number) => void;
}) {
  return (
    <div
      role="tablist"
      aria-label="Choisir un témoignage"
      className="flex gap-2 overflow-x-auto border-b border-line bg-paper-50/60 p-2 sm:p-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {stories.map((story, i) => {
        const active = i === index;
        return (
          <button
            key={story.id}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`terrain-panel-${story.id}`}
            id={`terrain-tab-${story.id}`}
            onClick={() => onSelect(i)}
            className={cn(
              "flex min-w-[min(100%,220px)] shrink-0 items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-[border-color,background-color,box-shadow] duration-200",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/40",
              active
                ? "border-tarineo-orange/35 bg-paper-0 shadow-sm ring-1 ring-tarineo-orange-ring"
                : "border-transparent bg-transparent hover:border-line hover:bg-paper-0/80",
            )}
          >
            <div className="relative size-11 shrink-0 overflow-hidden rounded-lg bg-paper-100 ring-1 ring-line">
              <Image
                src={story.photo}
                alt=""
                fill
                sizes="44px"
                className="object-cover"
                style={{ objectPosition: story.photoPosition ?? "center" }}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-ink-900">{story.name}</p>
              <p className="truncate text-xs text-ink-500">{story.brand}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function FeaturedStory({ story, panelId }: { story: LandingTestimonial; panelId: string }) {
  return (
    <div
      id={panelId}
      role="tabpanel"
      aria-labelledby={`terrain-tab-${story.id}`}
      className="animate-in fade-in duration-300 motion-reduce:animate-none"
    >
      <div className="grid lg:grid-cols-[minmax(0,42%)_minmax(0,1fr)] lg:items-stretch">
        <StoryPhoto story={story} className="lg:rounded-none" priority />
        <div className="flex flex-col p-6 sm:p-8 lg:py-9 lg:pl-8 lg:pr-9">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-semibold text-tarineo-orange">{story.brand}</p>
            <Quote className="size-8 shrink-0 text-tarineo-orange/25" aria-hidden strokeWidth={1.25} />
          </div>
          <blockquote className="mt-3 text-pretty text-[1.0625rem] font-medium leading-snug tracking-tight text-ink-900 sm:text-lg">
            {story.quote}
          </blockquote>
          <div className="mt-5 flex items-center gap-3 lg:hidden">
            <div className="relative size-10 overflow-hidden rounded-full ring-1 ring-line">
              <Image
                src={story.photo}
                alt=""
                fill
                sizes="40px"
                className="object-cover"
                style={{ objectPosition: story.photoPosition ?? "center" }}
              />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink-900">{story.name}</p>
              <p className="text-xs text-ink-500">{story.role}</p>
            </div>
          </div>
          {story.insight ? (
            <div className="mt-6 rounded-xl bg-paper-50 px-4 py-3.5 ring-1 ring-line sm:px-5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-400">En pratique</p>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{story.insight}</p>
            </div>
          ) : null}
          <div className="mt-auto pt-6">
            <StoryDistributeurs story={story} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CarouselControls({
  index,
  count,
  onPrev,
  onNext,
  onPick,
}: {
  index: number;
  count: number;
  onPrev: () => void;
  onNext: () => void;
  onPick: (i: number) => void;
}) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-paper-0 text-ink-900 transition-colors hover:bg-paper-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/40"
          aria-label="Témoignage précédent"
        >
          <ChevronLeft className="size-5" strokeWidth={1.75} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onNext}
          className="inline-flex size-11 items-center justify-center rounded-xl border border-line bg-paper-0 text-ink-900 transition-colors hover:bg-paper-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/40"
          aria-label="Témoignage suivant"
        >
          <ChevronRight className="size-5" strokeWidth={1.75} aria-hidden />
        </button>
      </div>
      <div className="flex items-center gap-2" role="tablist" aria-label="Choisir un témoignage">
        {Array.from({ length: count }, (_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Témoignage ${i + 1}`}
            onClick={() => onPick(i)}
            className={cn(
              "h-2 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/40",
              i === index ? "w-6 bg-tarineo-orange" : "w-2 bg-line hover:bg-ink-400/40",
            )}
          />
        ))}
      </div>
    </div>
  );
}

function AutoProgress({ index, paused, reduce }: { index: number; paused: boolean; reduce: boolean }) {
  if (reduce || paused) {
    return <div className="h-0.5 w-full bg-line" aria-hidden />;
  }
  return (
    <div className="h-0.5 w-full overflow-hidden bg-line" aria-hidden>
      <div
        key={index}
        className="h-full w-full origin-left bg-tarineo-orange motion-safe:animate-[terrain-progress_9s_linear_forwards]"
      />
    </div>
  );
}

export function TerrainStories() {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = STORIES.length;
  const active = STORIES[index] ?? STORIES[0];

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
    <LandingSection id="terrain">
      <div className="shell">
        <SectionHeading
          label="Terrain"
          title={
            <>
              Quatre situations que vous reconnaissez
              <span className="mt-2 block text-ink-400">sur vos achats, vos chantiers et votre compta.</span>
            </>
          }
          subtitle="Scénarios illustratifs basés sur les flux réels du produit — pas des avis clients vérifiés. Chaque exemple montre comment un métier utilise Tarinéo au quotidien."
        />

        <Card
          className={cn(
            landingCardClass("group/story mt-14 hidden overflow-hidden shadow-float ring-1 ring-line lg:block"),
          )}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <StoryTabs stories={STORIES} index={index} onSelect={setIndex} />
          <AutoProgress index={index} paused={paused} reduce={!!reduce} />
          <FeaturedStory key={active.id} story={active} panelId={`terrain-panel-${active.id}`} />
        </Card>

        <div
          className="mt-12 lg:hidden"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div className="overflow-hidden rounded-2xl ring-1 ring-line">
            <div
              className="flex transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
              style={{ transform: `translateX(-${index * 100}%)` }}
              aria-live="polite"
            >
              {STORIES.map((story) => (
                <div key={story.id} className="w-full shrink-0">
                  <Card className={cn(landingCardClass("group/story overflow-hidden"), "rounded-none border-0 shadow-none ring-0")}>
                    <FeaturedStory story={story} panelId={`terrain-panel-mobile-${story.id}`} />
                  </Card>
                </div>
              ))}
            </div>
          </div>
          <CarouselControls
            index={index}
            count={n}
            onPrev={() => go(-1)}
            onNext={() => go(1)}
            onPick={setIndex}
          />
        </div>
      </div>
    </LandingSection>
  );
}
