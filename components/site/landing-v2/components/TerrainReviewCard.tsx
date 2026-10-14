"use client";

import Image from "next/image";
import { BadgeCheck, Star } from "lucide-react";

import { cn } from "@/lib/utils";

export type TerrainReview = {
  id: string;
  brand: string;
  quote: string;
  name: string;
  role: string;
  photo: string;
  photoPosition?: string;
  insight?: string;
  stackTools: string[];
  scenarioRating: number;
};

function ScenarioStars({ rating }: { rating: number }) {
  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`Parcours type illustré — ${rating} sur 5 pour la clarté du cas`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            "size-4 shrink-0",
            i < rating ? "fill-[#ff642b] text-[#ff642b]" : "fill-[#e4e7ec] text-[#e4e7ec]",
          )}
        />
      ))}
    </div>
  );
}

export function TerrainReviewCard({
  review,
  className,
}: {
  review: TerrainReview;
  className?: string;
}) {
  return (
    <article
      data-testimonial-card
      className={cn(
        "flex h-full min-h-[320px] w-[calc(100vw-2.5rem)] max-w-[400px] shrink-0 snap-center flex-col rounded-[20px] border border-[#eef2f6] bg-white p-5 sm:min-h-[388px] sm:w-[400px] sm:snap-start sm:p-7",
        "shadow-[0_4px_6px_-2px_rgba(16,24,40,0.03),0_12px_16px_-4px_rgba(16,24,40,0.08)]",
        "outline-none transition-[box-shadow,transform] duration-200 focus-within:ring-2 focus-within:ring-[#ff642b]/40",
        className,
      )}
    >
      <header className="mb-5 flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-col gap-2">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-[#fff4ed] px-2.5 py-1 text-xs font-semibold text-[#c2410c]">
            <BadgeCheck className="size-3.5 shrink-0" aria-hidden />
            Parcours type · {review.brand}
          </span>
          <ScenarioStars rating={review.scenarioRating} />
        </div>
        <p className="max-w-[7.5rem] shrink-0 text-right text-[10px] font-medium leading-snug text-[#697586] sm:max-w-[9rem] sm:text-[11px]">
          Illustration
          <br />
          <span className="font-normal">non certifiée</span>
        </p>
      </header>

      <blockquote className="flex-1 text-base font-medium leading-[1.55] text-[#202939] sm:text-[18px] sm:leading-[28px]">
        «&nbsp;{review.quote}&nbsp;»
      </blockquote>

      {review.insight ? (
        <div className="mt-5 rounded-xl border border-[#f2f4f7] bg-[#f9fafb] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#697586]">
            En pratique
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-[#364152]">{review.insight}</p>
        </div>
      ) : null}

      <footer className="mt-6 flex flex-col gap-4 border-t border-[#f2f4f7] pt-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative size-12 shrink-0 overflow-hidden rounded-full bg-[#eef2f6] ring-2 ring-white">
            <Image
              src={review.photo}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
              style={review.photoPosition ? { objectPosition: review.photoPosition } : undefined}
            />
          </div>
          <div className="min-w-0">
            <p className="truncate text-base font-semibold leading-6 text-[#202939]">{review.name}</p>
            <p className="truncate text-sm leading-5 text-[#697586]">{review.role}</p>
          </div>
        </div>
        {review.stackTools.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5 sm:max-w-[11rem] sm:justify-end sm:pl-0" aria-label="Fournisseurs cités">
            {review.stackTools.map((tool) => (
              <li
                key={tool}
                className="rounded-md border border-[#e4e7ec] bg-white px-2 py-0.5 text-[11px] font-medium text-[#475467]"
              >
                {tool}
              </li>
            ))}
          </ul>
        ) : null}
      </footer>
    </article>
  );
}
