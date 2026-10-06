"use client";

import { securityItems } from "@/lib/site/landing-v2-content";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { SectionHeading } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  LandingFeatureCard,
  LandingReveal,
  LandingStagger,
} from "@/components/site/landing-v2/lib/landing-motion";

export function Security() {
  return (
    <section id="securite" className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          label="Sécurité et contrôle"
          title="Vos données restent les vôtres."
          subtitle="Tarinéo lit beaucoup, mais ne décide rien à votre place et ne garde rien hors de votre compte."
        />

        <LandingStagger className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
          {securityItems.map((item) => (
            <LandingFeatureCard key={item.title} className="surface flex flex-col p-5 sm:p-6">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
                <Icon name={item.icon} className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-[0.9375rem] font-semibold text-ink-900">{item.title}</h3>
              <p className="mt-2 text-sm text-ink-400">{item.detail}</p>
            </LandingFeatureCard>
          ))}
        </LandingStagger>

        <LandingReveal className="mt-6 text-sm text-ink-400">
          Tarinéo n&apos;annonce ici que des mécanismes réellement utilisés dans le produit : connexion
          OAuth aux outils que vous autorisez, permissions explicites, journal des actions et
          validation humaine sur les envois.
        </LandingReveal>
      </div>
    </section>
  );
}
