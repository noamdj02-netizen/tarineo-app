"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";

/** Film produit (iPhone) — section dédiée, indépendante du film de lancement. */
export function LandingProductFilm() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [needsSound, setNeedsSound] = useState(false);

  function play() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    void video
      .play()
      .then(() => {
        setPlaying(true);
        setNeedsSound(false);
      })
      .catch(async () => {
        try {
          video.muted = true;
          await video.play();
          setPlaying(true);
          setNeedsSound(true);
        } catch {
          setPlaying(false);
        }
      });
  }

  function unmute() {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setNeedsSound(false);
    void video.play().catch(() => setNeedsSound(true));
  }

  return (
    <div className="relative w-full min-w-0 max-w-full overflow-hidden rounded-[20px] border border-line bg-white shadow-lift sm:rounded-[28px]">
      <video
        ref={videoRef}
        className="block h-auto max-h-[70dvh] w-full max-w-full bg-white object-contain"
        width={1280}
        height={684}
        src="/videos/product.mp4"
        poster="/videos/product-poster.jpg"
        controls
        playsInline
        preload="metadata"
        aria-label="TARINEO sur iPhone"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {!playing ? (
        <button
          type="button"
          onClick={play}
          aria-label="Lire le film"
          className="absolute inset-0 flex items-center justify-center touch-manipulation"
        >
          <span className="grid size-16 place-items-center rounded-full bg-ink text-white shadow-lift sm:size-[4.5rem]">
            <Play className="ml-1 size-7 fill-current" aria-hidden />
          </span>
        </button>
      ) : null}
      {playing && needsSound ? (
        <button
          type="button"
          onClick={unmute}
          className="absolute bottom-14 left-3 z-10 min-h-11 rounded-full bg-ink px-4 text-[13px] font-medium text-white shadow-lift touch-manipulation"
        >
          Activer le son
        </button>
      ) : null}
    </div>
  );
}
