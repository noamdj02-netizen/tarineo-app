"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { TerrainReviewCard } from "@/components/site/landing-v2/components/TerrainReviewCard";
import { TerrainSocialProof } from "@/components/site/landing-v2/components/TerrainSocialProof";
import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingFigmaSectionHeader } from "@/components/site/landing-v2/components/ui/LandingFigmaSectionHeader";
import { launchTerrain } from "@/lib/site/landing-v2-content";
import { cn } from "@/lib/utils";

const ASSETS = {
  carouselPrev: "/landing/figma/testimonials/carousel-prev.svg",
  carouselNext: "/landing/figma/testimonials/carousel-next.svg",
} as const;

function trackGapPx(track: HTMLElement) {
  const gap = getComputedStyle(track).columnGap || getComputedStyle(track).gap;
  const n = parseFloat(gap);
  return Number.isFinite(n) ? n : 16;
}

function trackStep(track: HTMLElement) {
  const card = track.querySelector<HTMLElement>("[data-testimonial-card]");
  if (!card) return 0;
  return card.offsetWidth + trackGapPx(track);
}

function pageCountForTrack(track: HTMLElement, reviewCount: number) {
  const step = trackStep(track);
  if (step <= 0) return Math.max(1, reviewCount);
  const gap = trackGapPx(track);
  const visible = Math.max(1, Math.floor((track.clientWidth + gap) / step));
  return Math.max(1, reviewCount - visible + 1);
}

/** Scénarios terrain + bandeau preuve d’usage (honnête, pas d’avis tiers fictifs). */
export function LaunchTestimonials() {
  const { badge, title, disclaimer, socialProof, reviews } = launchTerrain;
  const trackRef = useRef<HTMLDivElement>(null);
  const [page, setPage] = useState(0);
  const [pageCount, setPageCount] = useState(Math.max(1, reviews.length));

  const remeasure = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const nextCount = pageCountForTrack(track, reviews.length);
    setPageCount(nextCount);
    const step = trackStep(track);
    if (step > 0) {
      const index = Math.round(track.scrollLeft / step);
      setPage(Math.min(nextCount - 1, Math.max(0, index)));
    }
  }, [reviews.length]);

  const syncPageFromScroll = useCallback(() => {
    const track = trackRef.current;
    if (!track) return;
    const step = trackStep(track);
    if (step <= 0) return;
    const index = Math.round(track.scrollLeft / step);
    setPage(Math.min(pageCount - 1, Math.max(0, index)));
  }, [pageCount]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    remeasure();
    const ro = new ResizeObserver(remeasure);
    ro.observe(track);
    track.addEventListener("scroll", syncPageFromScroll, { passive: true });
    return () => {
      ro.disconnect();
      track.removeEventListener("scroll", syncPageFromScroll);
    };
  }, [remeasure, syncPageFromScroll]);

  function scrollToPage(next: number) {
    const track = trackRef.current;
    if (!track) return;
    const step = trackStep(track);
    if (step <= 0) return;
    const clamped = Math.min(pageCount - 1, Math.max(0, next));
    track.scrollTo({ left: clamped * step, behavior: "smooth" });
    setPage(clamped);
  }

  return (
    <LandingSection id="terrain" className="bg-[#f5f5f9]" aria-labelledby="terrain-title">
      <div className="shell flex flex-col items-center gap-8 sm:gap-10">
        <LandingFigmaSectionHeader
          align="center"
          badge={badge}
          title={title}
          titleId="terrain-title"
          subtitle={disclaimer}
          className="max-w-3xl px-0"
        />

        <TerrainSocialProof
          eyebrow={socialProof.eyebrow}
          stats={socialProof.stats}
          trustLine={socialProof.trustLine}
          reviews={reviews}
        />

        <div className="relative w-full max-w-[1120px]">
          <div
            ref={trackRef}
            className={cn(
              "landing-terrain-track -mx-5 flex gap-4 overflow-x-auto overscroll-x-contain pb-2 pl-5 pr-5",
              "snap-x snap-mandatory scroll-smooth",
              "sm:-mx-0 sm:gap-8 sm:pl-0 sm:pr-0",
              "[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden",
            )}
            aria-label="Parcours types artisans"
          >
            {reviews.map((review) => (
              <TerrainReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>

        <div className="flex w-full max-w-[1120px] items-center justify-center gap-4 sm:gap-6">
          <button
            type="button"
            onClick={() => scrollToPage(page - 1)}
            disabled={page <= 0}
            aria-label="Parcours précédents"
            className="grid size-11 min-h-11 min-w-11 shrink-0 place-items-center rounded-full transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-[#ff642b]/45 disabled:opacity-35"
          >
            <Image src={ASSETS.carouselPrev} alt="" width={43} height={43} aria-hidden />
          </button>
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-2" role="tablist" aria-label="Position du carrousel">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === page}
                aria-label={`Position ${i + 1} sur ${pageCount}`}
                onClick={() => scrollToPage(i)}
                className="flex size-10 items-center justify-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-[#ff642b]/45 sm:size-11"
              >
                <span
                  className={cn(
                    "block size-2.5 rounded-full transition-colors",
                    i === page ? "bg-[#202939]" : "bg-[#d7d6de] hover:bg-[#b8b6c0]",
                  )}
                />
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollToPage(page + 1)}
            disabled={page >= pageCount - 1}
            aria-label="Parcours suivants"
            className="grid size-11 min-h-11 min-w-11 shrink-0 place-items-center rounded-full transition-opacity outline-none focus-visible:ring-2 focus-visible:ring-[#ff642b]/45 disabled:opacity-35"
          >
            <Image src={ASSETS.carouselNext} alt="" width={43} height={43} aria-hidden />
          </button>
        </div>
      </div>
    </LandingSection>
  );
}
