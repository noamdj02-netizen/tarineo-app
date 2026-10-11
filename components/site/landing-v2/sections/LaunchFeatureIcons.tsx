"use client";

import {
  FileText,
  Gauge,
  Lock,
  ScanLine,
  Smartphone,
  Sparkles,
  TrendingUp,
  Workflow,
} from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import {
  LANDING_CARD_SHADOW,
  LANDING_CARD_SHADOW_HOVER,
  LandingSectionHeading,
  LandingSurface,
} from "@/components/site/landing-v2/components/ui/LandingSurface";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";
import { launchFeatureIcons } from "@/lib/site/landing-v2-content";
import { cn } from "@/lib/utils";

const ICONS = [ScanLine, TrendingUp, FileText, Workflow, Gauge, Lock, Smartphone, Sparkles];

/** Grille icônes 2×4 — rendu Parcours / Framer. */
export function LaunchFeatureIcons() {
  const reduce = useReducedMotion();

  return (
    <LandingSection id="preuve">
      <div className="shell">
        <LandingSurface contentClassName="mx-auto flex max-w-[1120px] flex-col items-center gap-12 sm:gap-16">
          <LandingSectionHeading
            badge="Tout inclus"
            title={launchFeatureIcons.title}
            subtitle="Les outils du devis au suivi — sans empiler cinq logiciels."
          />

          <LandingStagger
            className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5"
            stagger={0.07}
          >
            {launchFeatureIcons.items.map((item, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <LandingStaggerItem key={item.title}>
                  <motion.div
                    whileHover={
                      reduce
                        ? undefined
                        : { y: -4, transition: { type: "spring", stiffness: 380, damping: 28 } }
                    }
                    className={cn(
                      "flex h-full flex-col rounded-[22px] border border-black/[0.04] bg-paper-0 p-5 transition-[box-shadow,border-color] duration-300",
                      LANDING_CARD_SHADOW,
                      "hover:border-black/[0.06]",
                      LANDING_CARD_SHADOW_HOVER,
                    )}
                  >
                    <span className="flex size-10 items-center justify-center rounded-2xl bg-[#fff4ee] ring-1 ring-[#f7562c]/15">
                      <Icon className="size-5 text-[#f7562c]" strokeWidth={1.75} aria-hidden />
                    </span>
                    <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-ink-900">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-sm font-medium leading-relaxed text-ink-500">
                      {item.text}
                    </p>
                  </motion.div>
                </LandingStaggerItem>
              );
            })}
          </LandingStagger>
        </LandingSurface>
      </div>
    </LandingSection>
  );
}
