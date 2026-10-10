"use client";

import dynamic from "next/dynamic";
import { useEffect, useLayoutEffect } from "react";

import { Footer } from "@/components/site/landing-v2/components/layout/Footer";
import { Header } from "@/components/site/landing-v2/components/layout/Header";
import { enableMotion } from "@/components/site/landing-v2/lib/motion";
import { Hero } from "@/components/site/landing-v2/sections/Hero";
import { LaunchLogoCloud } from "@/components/site/landing-v2/sections/LaunchLogoCloud";

const LaunchFeatureBento = dynamic(
  () =>
    import("@/components/site/landing-v2/sections/LaunchFeatureBento").then(
      (m) => m.LaunchFeatureBento,
    ),
  { loading: () => null },
);
const LaunchFeatureIcons = dynamic(
  () =>
    import("@/components/site/landing-v2/sections/LaunchFeatureIcons").then(
      (m) => m.LaunchFeatureIcons,
    ),
  { loading: () => null },
);
const PriceTrend = dynamic(
  () => import("@/components/site/landing-v2/sections/PriceTrend").then((m) => m.PriceTrend),
  { loading: () => null },
);
const Notifications = dynamic(
  () =>
    import("@/components/site/landing-v2/sections/Notifications").then((m) => m.Notifications),
  { loading: () => null },
);
const Relances = dynamic(
  () => import("@/components/site/landing-v2/sections/Relances").then((m) => m.Relances),
  { loading: () => null },
);
const LaunchSpotlight = dynamic(
  () =>
    import("@/components/site/landing-v2/sections/LaunchSpotlight").then(
      (m) => m.LaunchSpotlight,
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

/** Landing Launch UI (Figma) adaptée Tarineo — structure + tokens métier. */
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
        <LaunchLogoCloud />
        <LaunchFeatureBento />
        <LaunchFeatureIcons />
        <PriceTrend />
        <Notifications />
        <Relances />
        <LaunchSpotlight />
        <Pricing />
        <FaqFinal />
      </main>
      <Footer />
    </div>
  );
}
