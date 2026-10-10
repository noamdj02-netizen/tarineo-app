"use client";
import { useRef } from "react";

import { automationFlow } from "@/lib/site/landing-v2-content";
import { useWorkflowReveal } from "@/components/site/landing-v2/lib/useWorkflowReveal";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import { SectionHeading, SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import { Workflow } from "@/components/site/landing-v2/components/ui/Workflow";
import {
  LandingFeatureCard,
  LandingFloatCard,
  LandingReveal,
  LandingStagger,
} from "@/components/site/landing-v2/lib/landing-motion";

const guarantees = [
  { icon: "mail", title: "Le déclencheur", detail: "Un email, un document, une période." },
  { icon: "spark", title: "Ce que Tarinéo fait", detail: "Il lit, calcule et prépare." },
  { icon: "check", title: "Ce que vous gardez", detail: "L'envoi et les décisions sensibles." },
] as const;

export function Automations() {
  const flow = useRef<HTMLDivElement>(null);
  useWorkflowReveal(flow);

  return (
    <section id="automatisations" className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          label="Automatisations"
          title={
            <>
              Ne configurez pas votre IA.
              <span className="mt-2 block text-ink-400">Montrez-lui votre façon de travailler.</span>
            </>
          }
          subtitle="Tarinéo transforme vos habitudes et vos règles métier en automatisations. Vous décrivez ce que vous faites ; il le refait, tous les jours, sans se tromper."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
          <LandingFloatCard className="surface p-6 shadow-card sm:p-8">
            <div ref={flow}>
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
                <div>
                  <SectionLabel>Analyse des devis fournisseurs</SectionLabel>
                  <p className="mt-2 text-[0.9375rem] font-medium text-ink-900">
                    Automatisation quotidienne · 8 h
                  </p>
                </div>
                <Badge tone="success" dot>
                  Active
                </Badge>
              </div>

              <Workflow nodes={automationFlow} className="mt-7" />

              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-line pt-5 text-sm text-ink-400">
                <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
                  <Icon name="history" className="h-3.5 w-3.5" />
                  1 passage par jour
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5">
                  <Icon name="shield" className="h-3.5 w-3.5" />
                  Validation obligatoire
                </span>
              </div>
            </div>
          </LandingFloatCard>

          <div className="flex flex-col gap-6">
            <LandingStagger className="flex flex-col gap-3" stagger={0.1}>
              {guarantees.map((item) => (
                <LandingFeatureCard key={item.title} className="surface-flat flex items-start gap-3.5 p-4">
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
                    <Icon name={item.icon} className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{item.title}</p>
                    <p className="mt-0.5 text-sm text-ink-400">{item.detail}</p>
                  </div>
                </LandingFeatureCard>
              ))}
            </LandingStagger>

            <LandingReveal className="surface-flat flex items-center gap-5 overflow-hidden p-5">
              <div>
                <p className="text-[0.9375rem] font-medium text-ink-900">
                  Vous ajoutez une règle, il l&apos;applique partout.
                </p>
                <p className="mt-1 text-sm text-ink-400">
                  « Marge minimale 25 % » devient un contrôle sur chaque devis.
                </p>
              </div>
              <Mascot
                name="bras-croises"
                size={132}
                alt="La mascotte Tarinéo, bras croisés, qui surveille l'automatisation"
                className="ml-auto hidden shrink-0 sm:block"
              />
            </LandingReveal>
          </div>
        </div>
      </div>
    </section>
  );
}
