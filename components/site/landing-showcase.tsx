"use client";

import type { ReactNode } from "react";
import { SectionEnter } from "@/components/motion/reveal";
import { LandingBezel } from "@/components/site/landing-bezel";

/** Bloc démo produit — entrée viewport + double cadre. */
export function LandingShowcase({ children }: { children: ReactNode }) {
  return (
    <SectionEnter className="relative transition-transform duration-300 ease-out hover:-translate-y-0.5 motion-reduce:transform-none">
      <LandingBezel tone="demo" className="landing-showcase-bezel">
        {children}
      </LandingBezel>
    </SectionEnter>
  );
}
