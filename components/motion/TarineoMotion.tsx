"use client";

import { Player } from "@remotion/player";
import { useEffect, useState } from "react";
import { TarineoLogo } from "@/components/brand/tarineo-logo";
import { cn } from "@/lib/utils";
import {
  COMPOSITION,
  DURATION_IN_FRAMES,
  FPS,
} from "@/remotion/constants";
import { CLOSE } from "@/remotion/data";
import { TarineoExplainer } from "@/remotion/TarineoExplainer";

export type TarineoMotionProps = {
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  /** 16:9 par défaut ; 9:16 pour Reels / Stories. */
  aspect?: "landscape" | "portrait";
  className?: string;
  controls?: boolean;
};

/**
 * Lecteur landing de la vidéo motion Tarinéo.
 * Autoplay / muted / loop ; poster statique si prefers-reduced-motion.
 */
export function TarineoMotion({
  autoplay = true,
  loop = true,
  muted = true,
  aspect = "landscape",
  className,
  controls = false,
}: TarineoMotionProps) {
  const [reduce, setReduce] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduce(mq.matches);
    setReady(true);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const meta =
    aspect === "portrait" ? COMPOSITION.portrait : COMPOSITION.landscape;
  const ratio =
    aspect === "portrait"
      ? "aspect-[9/16] mx-auto w-full max-w-[420px]"
      : "aspect-video w-full";

  if (!ready) {
    return (
      <div
        className={cn(
          "animate-pulse rounded-2xl border border-line bg-[#F5F5F3] shadow-soft",
          ratio,
          className,
        )}
        aria-hidden
      />
    );
  }

  if (reduce) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center gap-5 overflow-hidden rounded-2xl border border-line bg-[#F5F5F3] px-6 py-12 text-center shadow-soft sm:gap-6 sm:px-10 sm:py-16",
          ratio,
          className,
        )}
        role="img"
        aria-label={`${CLOSE.brand} — ${CLOSE.tagline}`}
      >
        <TarineoLogo variant="light" size={56} decorative />
        <div className="space-y-2">
          <p className="font-display text-[clamp(28px,5vw,42px)] font-semibold tracking-tightest text-ink">
            {CLOSE.brand}
          </p>
          <p className="mx-auto max-w-[36ch] text-[15px] font-medium text-muted sm:text-[16px]">
            {CLOSE.tagline}
          </p>
        </div>
        <span className="inline-flex items-center rounded-[12px] bg-[#EC5821] px-5 py-3 text-[14px] font-semibold tracking-tight text-white">
          {CLOSE.cta}
        </span>
        {muted ? <span className="sr-only">Vidéo sans son</span> : null}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-[#F5F5F3] shadow-soft",
        ratio,
        className,
      )}
    >
      <Player
        component={TarineoExplainer}
        durationInFrames={DURATION_IN_FRAMES}
        compositionWidth={meta.width}
        compositionHeight={meta.height}
        fps={FPS}
        autoPlay={autoplay}
        loop={loop}
        controls={controls}
        style={{ width: "100%", height: "100%" }}
        className="h-full w-full"
        clickToPlay={false}
        doubleClickToFullscreen={false}
        spaceKeyToPlayOrPause={false}
      />
      {muted ? <span className="sr-only">Vidéo sans son</span> : null}
    </div>
  );
}
