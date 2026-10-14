"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect } from "react";

import { PhotoFooter } from "@/components/site/landing-v2/components/layout/PhotoFooter";
import { enableMotion } from "@/components/site/landing-v2/lib/motion";
import { FilmSection } from "@/components/site/landing-v2/sections/FilmSection";
import { Hero } from "@/components/site/landing-v2/sections/Hero";
import { LandingContact } from "@/components/site/landing-v2/sections/LandingContact";

const LaunchFeatureIcons = dynamic(
  () =>
    import("@/components/site/landing-v2/sections/LaunchFeatureIcons").then(
      (m) => m.LaunchFeatureIcons,
    ),
  { loading: () => null },
);
const LaunchFeaturesSwitch = dynamic(
  () =>
    import("@/components/site/landing-v2/sections/LaunchFeaturesSwitch").then(
      (m) => m.LaunchFeaturesSwitch,
    ),
  { loading: () => null },
);
const Relances = dynamic(
  () => import("@/components/site/landing-v2/sections/Relances").then((m) => m.Relances),
  { loading: () => null },
);
const LaunchTestimonials = dynamic(
  () =>
    import("@/components/site/landing-v2/sections/LaunchTestimonials").then(
      (m) => m.LaunchTestimonials,
    ),
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

/** Landing marketing unique (Figma Hero Designs) — entrée `app/(site)/page.tsx`. */
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
    <div className="landing-v2 theme-light isolate min-h-dvh bg-[#f0f0f0] text-ink-900">
      <main id="contenu-landing">
        <Hero />
        <FilmSection />
        <LaunchFeaturesSwitch />
        <LaunchFeatureIcons />
        <Relances />
        <LaunchTestimonials />
        <Pricing />
        <FaqFinal />
        <LandingContact />
      </main>
      <PhotoFooter />
    </div>
  );
}
