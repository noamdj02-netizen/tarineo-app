"use client";

import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";

const steps = [
  { label: "PDF reçu", icon: "doc" as const, detail: "Devis fournisseur importé" },
  { label: "Analyse", icon: "spark" as const, detail: "Lecture ligne par ligne" },
  { label: "Détection", icon: "loupe" as const, detail: "Écarts vs vos prix" },
  { label: "Décision", icon: "check" as const, detail: "Vous validez ou ajustez" },
  { label: "Marge protégée", icon: "shield" as const, detail: "Surcoût évité" },
];

/** Fil narratif « comment ça marche » — une micro-animation par étape réelle. */
export function HowItWorksPipeline() {
  return (
    <LandingStagger
      className="mt-10 grid gap-3 sm:grid-cols-5"
      stagger={0.09}
      delay={0.05}
    >
      {steps.map((step, index) => (
        <LandingStaggerItem key={step.label}>
          <div className="landing-product-surface surface-flat flex h-full flex-col p-4 sm:p-5">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
              <Icon name={step.icon} className="h-4 w-4" />
            </span>
            <p className="mt-3 text-sm font-medium text-ink-900">{step.label}</p>
            <p className="mt-1 text-xs text-ink-400">{step.detail}</p>
            {index < steps.length - 1 ? (
              <span
                aria-hidden
                className="mt-3 hidden text-accent sm:inline eyebrow"
              >
                →
              </span>
            ) : null}
          </div>
        </LandingStaggerItem>
      ))}
    </LandingStagger>
  );
}
