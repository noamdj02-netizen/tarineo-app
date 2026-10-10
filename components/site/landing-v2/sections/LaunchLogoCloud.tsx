"use client";

import { useRef, useState } from "react";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LaunchFilm } from "@/components/site/launch-film";

/** Emplacement logo-cloud → film de lancement Tarineo. */
export function LaunchLogoCloud() {
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
    <LandingSection className="border-t border-line/60 py-12 sm:py-16 lg:py-20">
      <div className="shell">
        <LaunchFilm
          videoRef={videoRef}
          playing={playing}
          needsSound={needsSound}
          onPlay={play}
          onUnmute={unmute}
          onPlayback={setPlaying}
        />
      </div>
    </LandingSection>
  );
}
