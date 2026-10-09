"use client";

import { Play } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { useRef, useState } from "react";
import { LANDING_PRIMARY_CTA_LABEL, LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { captureSection, pastilleRows } from "@/lib/site/landing-v2-content";
import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingProductFrame } from "@/components/site/landing-v2/components/ui/LandingProductFrame";
import { LandingProductPillar } from "@/components/site/landing-v2/components/ui/LandingProductPillar";
import { ArrowRight, Button } from "@/components/site/landing-v2/components/ui/Button";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";

const PRODUIT_DEMO_SRC = "/landing/produit-demo.mp4";
const PRODUIT_DEMO_POSTER = "/landing/produit-demo-poster.jpg";

function ProduitDemoVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [playing, setPlaying] = useState(false);

  function play() {
    const video = videoRef.current;
    if (!video) return;
    void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
  }

  return (
    <div className="relative aspect-video w-full bg-paper-100">
      <video
        ref={videoRef}
        className="block h-full w-full object-cover"
        width={1920}
        height={1080}
        src={PRODUIT_DEMO_SRC}
        poster={PRODUIT_DEMO_POSTER}
        controls={playing || Boolean(reduce)}
        playsInline
        preload="metadata"
        aria-label="Démonstration Tarineo — parcours produit"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
      {!playing && !reduce ? (
        <button
          type="button"
          onClick={play}
          aria-label="Lire la démonstration"
          className="absolute inset-0 flex items-center justify-center touch-manipulation bg-ink-900/10 transition hover:bg-ink-900/15"
        >
          <span className="grid size-16 place-items-center rounded-full bg-ink-900 text-paper-0 shadow-float sm:size-[4.5rem]">
            <Play className="ml-1 size-7 fill-current" aria-hidden />
          </span>
        </button>
      ) : null}
    </div>
  );
}

export function AppCapturePastilles() {
  return (
    <LandingSection id="produit">
      <div className="shell">
        <SectionHeading
          label="Produit"
          title={
            <>
              {captureSection.title}
              <span className="mt-2 block text-ink-400">{captureSection.titleMuted}</span>
            </>
          }
          subtitle={captureSection.subtitle}
        />

        <div className="mt-12 lg:mt-14">
          <LandingProductFrame
            title="Tarineo · Démonstration produit"
            className="shadow-float ring-1 ring-line"
            footer={
              <p className="px-4 py-3 text-center text-xs text-ink-400">
                Film de démonstration · Parcours réel dans l’app Tarineo
              </p>
            }
          >
            <ProduitDemoVideo />
          </LandingProductFrame>
        </div>

        <div className="mt-10 border-t border-line pt-10 sm:mt-12 sm:pt-12">
          <p className="text-center text-sm font-medium text-ink-900 sm:text-left">
            Trois volets, un seul outil
          </p>
          <p className="mt-1 max-w-2xl text-center text-sm text-ink-500 sm:text-left">
            Pas besoin de tout explorer d’un coup : commencez par vos achats fournisseurs, puis
            rattachez vos chantiers.
          </p>

          <LandingStagger
            className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5"
            stagger={0.06}
          >
            {pastilleRows.map((row) => (
              <LandingStaggerItem key={row.id} className="h-full">
                <LandingProductPillar row={row} />
              </LandingStaggerItem>
            ))}
          </LandingStagger>
        </div>

        <div className="mt-12 flex flex-col items-center gap-3 sm:mt-14">
          <Button href={LANDING_SIGNUP} size="lg" className="landing-cta-glow min-h-12 w-full sm:w-auto">
            {LANDING_PRIMARY_CTA_LABEL}
            <ArrowRight />
          </Button>
          <p className="text-center text-xs text-ink-400">
            Essai sur un vrai devis ou une facture fournisseur — vous gardez la main sur chaque envoi.
          </p>
        </div>
      </div>
    </LandingSection>
  );
}
