"use client";

import { useEffect, useLayoutEffect } from "react";

import { Footer } from "@/components/site/landing-v2/components/layout/Footer";
import { Header } from "@/components/site/landing-v2/components/layout/Header";
import { enableMotion } from "@/components/site/landing-v2/lib/motion";
import { Automations } from "@/components/site/landing-v2/sections/Automations";
import { Connect } from "@/components/site/landing-v2/sections/Connect";
import { Copilot } from "@/components/site/landing-v2/sections/Copilot";
import { Dashboard } from "@/components/site/landing-v2/sections/Dashboard";
import { FinalCta } from "@/components/site/landing-v2/sections/FinalCta";
import { Hero } from "@/components/site/landing-v2/sections/Hero";
import { HumanLoop } from "@/components/site/landing-v2/sections/HumanLoop";
import { Learning } from "@/components/site/landing-v2/sections/Learning";
import { Pricing } from "@/components/site/landing-v2/sections/Pricing";
import { Problem } from "@/components/site/landing-v2/sections/Problem";
import { QuoteAnalysis } from "@/components/site/landing-v2/sections/QuoteAnalysis";
import { QuoteToInvoice } from "@/components/site/landing-v2/sections/QuoteToInvoice";
import { Security } from "@/components/site/landing-v2/sections/Security";

/** Landing marketing v2 — synchronisée depuis l’export Vite (`~/Downloads/tarineo`). */
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
        <Problem />
        <QuoteAnalysis />
        <QuoteToInvoice />
        <Connect />
        <Learning />
        <Automations />
        <Copilot />
        <Dashboard />
        <HumanLoop />
        <Security />
        <Pricing />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
