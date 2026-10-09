"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect } from "react";

import { Footer } from "@/components/site/landing-v2/components/layout/Footer";
import { Header } from "@/components/site/landing-v2/components/layout/Header";
import { enableMotion } from "@/components/site/landing-v2/lib/motion";
import { Hero } from "@/components/site/landing-v2/sections/Hero";

const JourneyFiveSteps = dynamic(
  () => import("@/components/site/landing-v2/sections/JourneyFiveSteps").then((m) => m.JourneyFiveSteps),
  { loading: () => null },
);
const ProofTable = dynamic(
  () => import("@/components/site/landing-v2/sections/ProofTable").then((m) => m.ProofTable),
  { loading: () => null },
);
const TerrainStories = dynamic(
  () => import("@/components/site/landing-v2/sections/TerrainStories").then((m) => m.TerrainStories),
  { loading: () => null },
);
const NegotiationTransform = dynamic(
  () =>
    import("@/components/site/landing-v2/sections/NegotiationTransform").then((m) => m.NegotiationTransform),
  { loading: () => null },
);
const AppCapturePastilles = dynamic(
  () => import("@/components/site/landing-v2/sections/AppCapturePastilles").then((m) => m.AppCapturePastilles),
  { loading: () => null },
);
const Pricing = dynamic(
  () => import("@/components/site/landing-v2/sections/Pricing").then((m) => m.Pricing),
  { loading: () => null },
);
const FaqFinal = dynamic(
  () => import("@/components/site/landing-v2/sections/FaqFinal").then((m) => m.FaqFinal),
  { loading: () => null },
);

/** Landing marketing — 6 écrans (brief conversion). */
export function LandingV2Page() {
  useLayoutEffect(() => {
    enableMotion();
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("js-motion");

    const id = window.location.hash.slice(1);
    if (!id) return;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "auto" });
    });
  }, []);

  return (
    <div className="landing-v2 min-h-dvh bg-paper-100 text-ink-600">
      <Header />
      <main id="contenu-landing">
        <Hero />
        <JourneyFiveSteps />
        <ProofTable />
        <TerrainStories />
        <NegotiationTransform />
        <AppCapturePastilles />
        <Pricing />
        <FaqFinal />
      </main>
      <Footer />
    </div>
  );
}
