"use client";

import Image from "next/image";
import { ArrowRight, Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingFigmaSectionHeader } from "@/components/site/landing-v2/components/ui/LandingFigmaSectionHeader";
import { landingButtonVariants } from "@/components/site/landing-button";
import { landingFilm } from "@/lib/site/landing-v2-content";
import { cn } from "@/lib/utils";

/** Figma `235:34129` — section-film, vidéo Motion V2 Paysage. */
export function FilmSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playingLoud, setPlayingLoud] = useState(false);
  const [portraitVideo, setPortraitVideo] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setPortraitVideo(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const videoSrc = portraitVideo ? landingFilm.videoMobile : landingFilm.video;
  const posterSrc = portraitVideo ? landingFilm.posterMobile : landingFilm.poster;

  function playWithSound() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    video.loop = false;
    video.controls = true;
    void video.play().then(() => setPlayingLoud(true)).catch(() => {
      video.muted = true;
      void video.play();
    });
  }

  return (
    <LandingSection id="film" className="bg-[#f0f0f0]">
      <div
        data-node-id="235:34129"
        data-name="section-film"
        className="shell flex flex-col items-center gap-10"
      >
        <LandingFigmaSectionHeader
          align="center"
          badge={landingFilm.badge}
          title={landingFilm.title}
          subtitle={landingFilm.subtitle}
        />

        <div
          data-node-id="235:34135"
          className="flex w-full max-w-[1198px] flex-col items-center gap-12 lg:flex-row lg:items-center lg:justify-between lg:gap-[117px]"
        >
          <div
            data-node-id="235:34136"
            className="flex w-full max-w-[401px] flex-col gap-[23px]"
          >
            <div data-node-id="235:34137" className="flex flex-col gap-3">
              <h3
                data-node-id="235:34138"
                className="text-[27px] font-bold leading-[1.2] text-[#111827]"
              >
                {landingFilm.blockTitle}
              </h3>
              <p
                data-node-id="235:34139"
                className="text-[15px] leading-normal text-[#4d4d4d]"
              >
                {landingFilm.blockText}
              </p>
            </div>

            <ol
              data-node-id="235:34140"
              className="flex flex-col gap-[15px]"
            >
              {landingFilm.steps.map((step, index) => (
                <li
                  key={step}
                  data-node-id={
                    index === 0
                      ? "235:34141"
                      : index === 1
                        ? "235:34145"
                        : "235:34149"
                  }
                  className="flex items-center gap-3"
                >
                  <span
                    className="flex size-[27px] shrink-0 items-center justify-center rounded-[13px] bg-[#111827] text-[13px] font-semibold text-white"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <span className="text-[15px] font-semibold text-[#111827]">
                    {step}
                  </span>
                </li>
              ))}
            </ol>

            <div
              data-node-id="235:34153"
              className="flex flex-wrap items-center gap-3"
            >
              <button
                type="button"
                onClick={playWithSound}
                className={cn(
                  landingButtonVariants({ variant: "orange" }),
                  "min-h-11 rounded-xl bg-[#ff6b1a] px-5 text-[15px] font-semibold shadow-[inset_0_-4px_4px_0_#ff9880]",
                )}
              >
                {landingFilm.cta}
              </button>
              <button
                type="button"
                data-node-id="235:34155"
                onClick={playWithSound}
                className="inline-flex items-center gap-2 text-[15px] font-semibold text-[#111827] outline-none hover:text-[#ff6b1a] focus-visible:ring-2 focus-visible:ring-[#ff6b1a]/45"
              >
                {landingFilm.staticHint}
                <ArrowRight className="size-6 text-[#ff6b1a]" aria-hidden />
              </button>
            </div>
          </div>

          <div
            id={landingFilm.videoSectionId}
            data-node-id="235:34158"
            className={cn(
              "relative w-full shrink-0 overflow-hidden rounded-[23px] border border-[#e5e7eb] bg-[#111] shadow-[0_11px_27px_rgba(0,0,0,0.07)]",
              portraitVideo
                ? "mx-auto aspect-[9/16] max-h-[min(72dvh,640px)] max-w-[min(100%,360px)]"
                : "h-[428px] max-w-[760px]",
            )}
          >
            {reduce ? (
              <Image
                src={posterSrc}
                alt="Film Tarineo — aperçu du parcours devis, alertes et validation"
                width={portraitVideo ? 720 : 760}
                height={portraitVideo ? 1280 : 428}
                className="size-full object-cover object-center"
                sizes={portraitVideo ? "(max-width: 1023px) 90vw, 360px" : "(max-width: 1024px) 100vw, 760px"}
              />
            ) : (
              <video
                key={videoSrc}
                ref={videoRef}
                className="size-full object-cover object-center"
                src={videoSrc}
                poster={posterSrc}
                width={portraitVideo ? 720 : 760}
                height={portraitVideo ? 1280 : 428}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={
                  portraitVideo
                    ? "Film Tarineo — version mobile portrait"
                    : "Film Tarineo — Motion V2 paysage"
                }
                onPlay={() => {
                  if (videoRef.current && !videoRef.current.muted) setPlayingLoud(true);
                }}
                onPause={() => setPlayingLoud(false)}
                onEnded={() => setPlayingLoud(false)}
              />
            )}
            {!reduce && !playingLoud ? (
              <button
                type="button"
                onClick={playWithSound}
                aria-label="Lire le film avec le son"
                className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors hover:bg-black/10"
              >
                <span className="grid size-16 place-items-center rounded-full bg-white shadow-[0_8px_28px_rgba(247,86,44,0.35)] ring-4 ring-[#ff6b1a]/25 sm:size-[4.5rem]">
                  <Play className="ml-1 size-7 fill-current text-[#ff6b1a] sm:size-8" aria-hidden />
                </span>
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </LandingSection>
  );
}
