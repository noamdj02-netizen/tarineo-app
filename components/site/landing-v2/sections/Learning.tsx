"use client";

import { detectedRules, detectedSuppliers } from "@/lib/site/landing-v2-content";
import { HowItWorksPipeline } from "@/components/site/landing-v2/components/ui/HowItWorksPipeline";
import { LearningAnalysisPanel } from "@/components/site/landing-v2/components/ui/LearningAnalysisPanel";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { SectionHeading, SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  LandingFloatCard,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";

export function Learning() {
  return (
    <section id="apprentissage" className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          label="Apprentissage"
          title="Tarinéo apprend comment fonctionne votre entreprise."
          subtitle="Rien à configurer. Tarinéo lit vos pièces existantes et en tire vos règles métier, vos fournisseurs et vos prix habituels."
        />

        <HowItWorksPipeline />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <LandingFloatCard delay={0.06} className="!p-0">
            <LearningAnalysisPanel />
          </LandingFloatCard>

          <LandingStagger className="flex flex-col gap-6" stagger={0.1}>
            <LandingStaggerItem className="surface p-6 sm:p-7">
              <SectionLabel>Fournisseurs détectés</SectionLabel>
              <p className="mt-2 text-sm text-ink-400">
                Reconnus automatiquement dans vos PDF et emails.
              </p>
              <ul className="mt-5 flex flex-col">
                {detectedSuppliers.map((supplier) => (
                  <li
                    key={supplier}
                    className="flex items-center gap-3 border-b border-line py-3.5 last:border-b-0"
                  >
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-sm border border-line bg-paper-50 text-[0.6875rem] font-semibold tracking-wide text-accent-700">
                      {supplier.slice(0, 1)}
                    </span>
                    <span className="text-[0.9375rem] font-medium text-ink-900">{supplier}</span>
                    <span className="ml-auto text-sm text-ink-400">Profil de lecture</span>
                  </li>
                ))}
              </ul>
            </LandingStaggerItem>

            <LandingStaggerItem className="surface p-6 sm:p-7">
              <SectionLabel>Règles détectées</SectionLabel>
              <ul className="mt-5 flex flex-col gap-3">
                {detectedRules.map((rule) => (
                  <li
                    key={rule.label}
                    className="flex items-center justify-between gap-4 rounded-md bg-accent-soft px-4 py-3.5"
                  >
                    <span className="inline-flex items-center gap-2 text-sm text-ink-600">
                      <Icon name="check" className="h-3.5 w-3.5 text-accent-700" strokeWidth={2} />
                      {rule.label}
                    </span>
                    <span className="text-[0.9375rem] font-semibold text-accent-700 nums">
                      {rule.value}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-ink-400">
                Modifiable à tout moment. Tarinéo propose, vous décidez.
              </p>
            </LandingStaggerItem>
          </LandingStagger>
        </div>
      </div>
    </section>
  );
}
