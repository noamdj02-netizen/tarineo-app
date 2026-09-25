"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { flushSync } from "react-dom";
import { LaunchFilm } from "@/components/site/launch-film";
import { ProductPreviewWelcome } from "@/components/site/product-preview-welcome";

const ProductPreviewStage = dynamic(
  () => import("@/components/site/product-preview-stage").then((m) => m.ProductPreviewStage),
  {
    loading: () => (
      <div
        className="min-h-[148px] animate-pulse rounded-[28px] border border-line bg-surface-2/80"
        aria-hidden
      />
    ),
  },
);

/** Aperçu marketing : intro chat légère, film puis étapes du copilote. */
export function ProductPreview() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [intro, setIntro] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [needsSound, setNeedsSound] = useState(false);

  function start() {
    flushSync(() => setIntro(false));
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
    <div className="flex w-full min-w-0 flex-col gap-4">
      <LaunchFilm
        videoRef={videoRef}
        concealed={intro}
        playing={playing}
        needsSound={needsSound}
        onPlay={start}
        onUnmute={unmute}
        onPlayback={setPlaying}
      />
      {intro ? (
        <ProductPreviewWelcome onStart={start} />
      ) : (
        <ProductPreviewStage hold={playing} />
      )}
    </div>
  );
}
