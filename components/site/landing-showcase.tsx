"use client";

import type { ReactNode } from "react";
import { SectionEnter } from "@/components/motion/reveal";
import { LandingBezel } from "@/components/site/landing-bezel";

/** Bloc démo produit — entrée viewport + double cadre. */
export function LandingShowcase({ children }: { children: ReactNode }) {
  return (
    <SectionEnter className="relative">
      <LandingBezel tone="demo">{children}</LandingBezel>
    </SectionEnter>
  );
}
