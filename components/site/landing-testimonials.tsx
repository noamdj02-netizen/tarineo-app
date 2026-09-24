"use client";

import type { CSSProperties } from "react";
import Image from "next/image";

import { InView } from "@/components/site/in-view";
import { Card, CardContent } from "@/components/ui/card";
import { brandLogoUrl } from "@/lib/resources/logo";
import { LANDING_TESTIMONIALS, type LandingTestimonial, type StackToolRef } from "@/lib/site/content";
import { cn } from "@/lib/utils";

function TestimonialStackLogos({ tools }: { tools: readonly StackToolRef[] }) {
  return (
    <ul className="flex shrink-0 items-center gap-1.5" aria-label="Outils utilisés dans Navpit">
      {tools.map((tool) => {
        const logo = brandLogoUrl(tool.domain, 64);
        return (
          <li key={tool.domain}>
            <span
              className="grid size-8 place-items-center rounded-lg border border-line bg-surface-2"
              title={tool.label}
            >
              {logo ? (
                <Image
                  src={logo}
                  alt=""
                  width={22}
                  height={22}
                  className="size-[22px] object-contain"
                  unoptimized
                />
              ) : (
                <span className="font-mono text-[10px] font-bold text-muted-foreground" aria-hidden>
                  {tool.label.charAt(0)}
                </span>
              )}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function TestimonialMedia({ t }: { t: LandingTestimonial }) {
  const graphic = t.photoVariant === "graphic";

  return (
    <div className="px-4 pt-4 pb-0">
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-[20px] ring-1 ring-line/80 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]",
          graphic ? "aspect-square" : "aspect-[5/4]",
          !t.photoBg && (graphic ? "bg-surface-2" : "bg-muted"),
        )}
        style={t.photoBg ? { backgroundColor: t.photoBg } : undefined}
      >
        {!graphic ? (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-[1] bg-[linear-gradient(180deg,transparent_55%,rgba(0,0,0,0.22)_100%)]"
          />
        ) : null}
        <div
          className="absolute inset-0"
          style={{
            transform: t.photoScale ? `scale(${t.photoScale})` : undefined,
          }}
        >
          <Image
            src={t.photo}
            alt={t.photoSource ? `Portrait — photo ${t.photoSource.author} (Unsplash)` : `Portrait ${t.name}`}
            fill
            sizes="(max-width: 640px) 88vw, 320px"
            className={cn(
              "object-cover transition-transform duration-500 ease-out-soft",
              "group-hover/card:scale-[1.04]",
            )}
            style={{ objectPosition: t.photoPosition ?? "center" }}
          />
        </div>
      </div>
    </div>
  );
}

function TestimonialCard({ t }: { t: LandingTestimonial }) {
  return (
    <figure className="h-full">
      <Card
        className={cn(
          "group/card flex h-full min-h-0 flex-col gap-0 rounded-[24px] border-line py-0 shadow-soft ring-1 ring-line",
          "transition-[box-shadow,transform] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift",
        )}
      >
        <TestimonialMedia t={t} />
        <CardContent className="flex flex-1 flex-col px-6 pt-5 pb-6">
          <p className="mono-label">{`/ ${t.brand} ///`}</p>
          <blockquote className="mt-4 flex-1 font-serif text-[1.0625rem] leading-[1.45] text-balance text-foreground">
            <span className="text-accent-2 not-italic" aria-hidden="true">«</span>
            <span className="italic"> {t.quote} </span>
            <span className="text-accent-2 not-italic" aria-hidden="true">»</span>
          </blockquote>
          <figcaption className="mt-6 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className="text-[15px] font-semibold tracking-tight text-foreground">{t.name}</p>
              <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">{t.role}</p>
            </div>
            <TestimonialStackLogos tools={t.stackTools} />
          </figcaption>
        </CardContent>
      </Card>
    </figure>
  );
}

const MARQUEE_DURATION_SEC = 72;

/** Témoignages en bandeau défilant (pause au survol). */
export function LandingTestimonials() {
  const lane = [...LANDING_TESTIMONIALS, ...LANDING_TESTIMONIALS];

  return (
    <InView className="mx-auto w-full max-w-[1080px]">
      <div
        className={cn(
          "group/testimonials relative left-1/2 w-[100vw] max-w-[100vw] -translate-x-1/2 overflow-hidden",
          "[mask-image:linear-gradient(90deg,transparent,black_6%,black_94%,transparent)]",
        )}
        aria-label="Témoignages fondateurs"
      >
        <div
          className={cn(
            "flex w-max items-stretch gap-5 px-5 will-change-transform motion-reduce:animate-none animate-marquee sm:gap-5 sm:px-8",
            "group-hover/testimonials:[animation-play-state:paused]",
          )}
          style={{ "--marquee-duration": `${MARQUEE_DURATION_SEC}s` } as CSSProperties}
        >
          {lane.map((t, i) => (
            <div key={`${t.id}-${i}`} className="w-[min(88vw,300px)] shrink-0 sm:w-[300px]">
              <TestimonialCard t={t} />
            </div>
          ))}
        </div>
      </div>
    </InView>
  );
}
