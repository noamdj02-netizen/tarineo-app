"use client";

import {
  ArrowRightLeft,
  Mail,
  ScanLine,
  TrendingUp,
  Upload,
  type LucideIcon,
} from "lucide-react";

import { journeySteps } from "@/lib/site/landing-v2-content";
import { LandingSection } from "@/components/site/landing-v2/components/layout/LandingSection";
import { LandingFeatureGlyph } from "@/components/site/landing-v2/components/ui/LandingFeatureGlyph";
import { LandingStepPreview } from "@/components/site/landing-v2/components/ui/LandingStepPreview";
import { landingCardClass } from "@/components/site/landing-v2/components/ui/landing-card";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const stepIcons: LucideIcon[] = [Upload, ScanLine, TrendingUp, Mail, ArrowRightLeft];

export function JourneyFiveSteps() {
  return (
    <LandingSection id="parcours">
      <div className="shell">
        <SectionHeading
          label="Parcours"
          title="De la facture fournisseur à la facture client, en 5 étapes."
        />

        <LandingStagger
          role="list"
          className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-5 2xl:gap-3"
          stagger={0.07}
        >
          {journeySteps.map((step, index) => {
            const Icon = stepIcons[index] ?? Upload;
            return (
              <LandingStaggerItem key={step.step} role="listitem" className="h-full min-w-0">
                <Card
                  className={cn(
                    landingCardClass(
                      "landing-step-card group flex h-full flex-col transition-[transform,box-shadow] duration-300 motion-safe:hover:-translate-y-1 motion-safe:hover:shadow-float",
                    ),
                  )}
                >
                  <div className="flex items-start justify-between gap-3 px-5 pt-5">
                    <LandingFeatureGlyph icon={Icon} tone="orange" />
                    <span
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-paper-50 text-xs font-semibold tabular-nums text-ink-500 ring-1 ring-line"
                      aria-hidden
                    >
                      {step.step}
                    </span>
                  </div>

                  <CardContent className="flex flex-1 flex-col pb-5 pt-4">
                    <h3 className="text-[0.9375rem] font-semibold leading-snug tracking-tight text-ink-900">
                      <span className="sr-only">Étape {step.step} — </span>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600 sm:line-clamp-4 2xl:line-clamp-3">
                      {step.detail}
                    </p>
                    <div className="mt-auto pt-4" aria-hidden>
                      <LandingStepPreview step={step.step} />
                    </div>
                  </CardContent>
                </Card>
              </LandingStaggerItem>
            );
          })}
        </LandingStagger>
      </div>
    </LandingSection>
  );
}
