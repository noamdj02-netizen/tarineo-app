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

import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";
import { launchFeatureIcons } from "@/lib/site/landing-v2-content";

const ICONS = [ScanLine, TrendingUp, FileText, Workflow, Gauge, Lock, Smartphone, Sparkles];

/** Grille icônes 2×4 — structure Launch UI “Everything you need”. */
export function LaunchFeatureIcons() {
  return (
    <LandingSection id="preuve" className="border-t border-line/60 py-16 sm:py-20">
      <div className="shell">
        <h2 className="mx-auto max-w-2xl text-center text-title font-semibold tracking-tight text-ink-900">
          {launchFeatureIcons.title}
        </h2>

        <LandingStagger
          className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-x-8 lg:gap-y-10"
          stagger={0.08}
        >
          {launchFeatureIcons.items.map((item, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <LandingStaggerItem key={item.title}>
                <div className="max-w-xs">
                  <Icon className="size-5 text-ink-900" strokeWidth={1.75} aria-hidden />
                  <h3 className="mt-3 text-sm font-semibold tracking-tight text-ink-900">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-500">{item.text}</p>
                </div>
              </LandingStaggerItem>
            );
          })}
        </LandingStagger>
      </div>
    </LandingSection>
  );
}
