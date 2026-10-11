"use client";

import { Play } from "lucide-react";
import type { RefObject } from "react";

import { cn } from "@/lib/utils";

type LaunchFilmProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  concealed?: boolean;
  playing: boolean;
  needsSound: boolean;
  onPlay: () => void;
  onUnmute: () => void;
  onPlayback: (playing: boolean) => void;
  /** Mise en avant landing (ombre chaude, play orange). */
  featured?: boolean;
  className?: string;
};

/** Film de lancement. Le bouton couvre le cadre : sur mobile la barre native est trop petite pour démarrer. */
export function LaunchFilm({
  videoRef,
  concealed = false,
  playing,
  needsSound,
  onPlay,
  onUnmute,
  onPlayback,
  featured = false,
  className,
}: LaunchFilmProps) {
  if (concealed) return null;

  return (
    <div
      className={cn(
        "relative w-full min-w-0 max-w-full overflow-hidden bg-ink",
        featured
          ? "rounded-[24px] border border-black/[0.06] shadow-[0_4px_8px_rgba(97,44,0,0.06),0_16px_28px_rgba(97,44,0,0.1),0_40px_64px_rgba(97,44,0,0.12)] sm:rounded-[32px]"
          : "rounded-[20px] border border-line shadow-lift sm:rounded-[28px]",
        className,
      )}
    >
      <video
        ref={videoRef}
        className={cn(
          "block aspect-video h-auto w-full max-w-full bg-ink object-contain",
          featured
            ? "max-h-[min(78dvh,820px)] rounded-[23px] sm:rounded-[31px]"
            : "max-h-[70dvh] rounded-[19px] sm:rounded-[27px]",
        )}
        width={1280}
        height={720}
        src="/videos/motion-tarineo-3.mp4"
        poster="/videos/motion-tarineo-3-poster.jpg"
        controls
        playsInline
        preload="metadata"
        aria-label="Film de présentation TARINEO"
        onPlay={() => onPlayback(true)}
        onPause={() => onPlayback(false)}
        onEnded={() => onPlayback(false)}
      />
      {!playing ? (
        <button
          type="button"
          onClick={onPlay}
          aria-label="Lire le film"
          className="absolute inset-0 flex items-center justify-center touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#f7562c]/50 focus-visible:ring-offset-2"
        >
          <span
            className={cn(
              "grid place-items-center rounded-full text-ink transition-transform duration-200 hover:scale-105 active:scale-95",
              featured
                ? "size-[4.5rem] bg-white shadow-[0_8px_28px_rgba(247,86,44,0.35),0_4px_12px_rgba(0,0,0,0.12)] ring-4 ring-[#f7562c]/25 sm:size-20"
                : "size-16 bg-white shadow-lift sm:size-[4.5rem]",
            )}
          >
            <Play
              className={cn(
                "ml-1 fill-current",
                featured ? "size-8 text-[#f7562c] sm:size-9" : "size-7",
              )}
              aria-hidden
            />
          </span>
        </button>
      ) : null}
      {playing && needsSound ? (
        <button
          type="button"
          onClick={onUnmute}
          className="absolute bottom-14 left-3 z-10 min-h-11 rounded-full bg-white px-4 text-[13px] font-medium text-ink shadow-lift touch-manipulation"
        >
          Activer le son
        </button>
      ) : null}
    </div>
  );
}
