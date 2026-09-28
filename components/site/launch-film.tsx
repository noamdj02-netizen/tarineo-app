"use client";

import { Play } from "lucide-react";
import type { RefObject } from "react";

type LaunchFilmProps = {
  videoRef: RefObject<HTMLVideoElement | null>;
  concealed?: boolean;
  playing: boolean;
  needsSound: boolean;
  onPlay: () => void;
  onUnmute: () => void;
  onPlayback: (playing: boolean) => void;
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
}: LaunchFilmProps) {
  return (
    <div
      className={
        concealed
          ? "hidden"
          : "relative w-full min-w-0 max-w-full rounded-[20px] border border-line bg-ink shadow-lift sm:rounded-[28px]"
      }
    >
      <video
        ref={videoRef}
        className="block aspect-video h-auto max-h-[70dvh] w-full max-w-full rounded-[19px] bg-ink object-contain sm:rounded-[27px]"
        width={1280}
        height={720}
        src="/videos/launch.mp4"
        poster="/videos/launch-poster.jpg"
        controls
        playsInline
        preload={concealed ? "none" : "metadata"}
        aria-label="Film de présentation TARINEO"
        onPlay={() => onPlayback(true)}
        onPause={() => onPlayback(false)}
        onEnded={() => onPlayback(false)}
      />
      {!concealed && !playing ? (
        <button
          type="button"
          onClick={onPlay}
          aria-label="Lire le film"
          className="absolute inset-0 flex items-center justify-center touch-manipulation"
        >
          <span className="grid size-16 place-items-center rounded-full bg-white text-ink shadow-lift sm:size-[4.5rem]">
            <Play className="ml-1 size-7 fill-current" aria-hidden />
          </span>
        </button>
      ) : null}
      {!concealed && playing && needsSound ? (
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
