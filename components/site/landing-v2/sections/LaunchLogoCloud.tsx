"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, useState } from "react";

import { LANDING_SECTION_PAD } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingSectionHeading } from "@/components/site/landing-v2/components/ui/LandingSurface";
import { LaunchFilm } from "@/components/site/launch-film";
import { cn } from "@/lib/utils";

/** Film — pic ouvert entre hero et panneaux blancs. */
export function LaunchLogoCloud() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [playing, setPlaying] = useState(false);
  const [needsSound, setNeedsSound] = useState(false);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  const scale = useTransform(scrollYProgress, [0, 1], reduce ? [1, 1] : [0.92, 1]);
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [48, 0]);
  const opacity = useTransform(scrollYProgress, [0, 0.35, 1], reduce ? [1, 1, 1] : [0.35, 0.9, 1]);

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
    <section
      ref={sectionRef}
      id="film"
      aria-label="Film de présentation Tarineo"
      className={cn("relative overflow-x-clip", LANDING_SECTION_PAD)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_55%_at_50%_45%,rgba(247,86,44,0.1),transparent_70%)]"
      />

      <div className="shell relative z-[1]">
        <div className="mb-8 sm:mb-10">
          <LandingSectionHeading
            badge="Film"
            title="Voir Tarineo en action"
            subtitle="Un aperçu du parcours devis → alertes → validation — sans tableur."
          />
        </div>

        <motion.div
          style={{ scale, y, opacity }}
          className="relative mx-auto max-w-[1120px] origin-center will-change-transform"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-4 rounded-[40px] bg-[radial-gradient(ellipse_at_50%_60%,rgba(247,86,44,0.16),transparent_68%)] blur-2xl sm:-inset-6"
          />
          <div className="relative">
            <LaunchFilm
              featured
              videoRef={videoRef}
              playing={playing}
              needsSound={needsSound}
              onPlay={play}
              onUnmute={unmute}
              onPlayback={setPlaying}
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
