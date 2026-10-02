"use client";

import dynamic from "next/dynamic";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";

const TarineoMotion = dynamic(
  () => import("@/components/motion/TarineoMotion").then((m) => m.TarineoMotion),
  {
    ssr: false,
    loading: () => (
      <div
        className="aspect-video w-full animate-pulse rounded-2xl border border-line bg-[#F5F5F3] shadow-soft"
        aria-hidden
      />
    ),
  },
);

/** Section landing : film motion Document → Analyse → Hausse → Marge. */
export function LandingMotionFilm() {
  return (
    <LandingSection id="film" className="border-t border-line">
      <LandingSectionHead
        label="En 15 secondes"
        title="Du document fournisseur"
        tail="à la marge protégée."
        text="TARINEO lit le devis, détecte les hausses et montre l’impact sur votre marge — sans son, en un coup d’œil."
      />
      <div className="mx-auto w-full max-w-[1080px]">
        <TarineoMotion autoplay loop muted />
      </div>
    </LandingSection>
  );
}
