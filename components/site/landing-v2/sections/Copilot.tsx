"use client";

import { copilotRequest, copilotRule, copilotSuggestions } from "@/lib/site/landing-v2-content";
import { CopilotThreadScene } from "@/components/site/landing-v2/components/ui/scenes/CopilotThreadScene";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import { SectionHeading, SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  LandingFloatCard,
  LandingStagger,
  LandingStaggerItem,
} from "@/components/site/landing-v2/lib/landing-motion";

export function Copilot() {
  return (
    <section id="copilote" className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          label="Le Copilote"
          title="Dites-lui ce que vous voulez surveiller."
          subtitle="Pas de formulaire, pas de nœud à relier à la main. Vous écrivez ou vous dictez votre besoin en français ; Tarinéo en fait une règle claire, que vous relisez avant qu'elle ne tourne."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
          <LandingFloatCard className="surface relative overflow-hidden p-6 sm:p-7" delay={0.05}>
            <div className="flex items-start justify-between gap-4">
              <SectionLabel>Votre demande</SectionLabel>
              <Mascot
                name="clin-oeil"
                widthClass="w-[96px] sm:w-[120px]"
                alt="La mascotte Tarinéo, clin d'œil, doigts pointés vers la demande"
                className="-mt-6 -mr-2 shrink-0"
              />
            </div>

            <CopilotThreadScene className="mt-5" userRequest={copilotRequest} />

            <LandingStagger className="mt-5 flex flex-wrap gap-2" stagger={0.05}>
              {copilotSuggestions.map((suggestion) => (
                <LandingStaggerItem
                  key={suggestion}
                  className="rounded-full border border-line bg-paper-0 px-3.5 py-1.5 text-sm text-ink-600"
                >
                  {suggestion}
                </LandingStaggerItem>
              ))}
            </LandingStagger>

            <div className="mt-6 flex items-center justify-between gap-4 border-t border-line pt-5">
              <span className="eyebrow">Haiku 4.5 · Rapide</span>
              <span className="text-sm text-ink-400">Entrée pour envoyer</span>
            </div>
          </LandingFloatCard>

          <LandingFloatCard className="surface p-6 shadow-card sm:p-7" delay={0.12}>
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
              <SectionLabel>Règle créée</SectionLabel>
              <Badge tone="accent" dot>
                Prête en 4 s
              </Badge>
            </div>

            <p className="mt-6 text-heading font-semibold text-ink-900">{copilotRule.name}</p>

            <LandingStagger className="mt-5 flex flex-col" stagger={0.06}>
              {copilotRule.rows.map((row) => (
                <LandingStaggerItem
                  key={row.label}
                  className="flex items-start gap-3.5 border-b border-line py-4 last:border-b-0"
                >
                  <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
                    <Icon name={row.icon} className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="eyebrow">{row.label}</p>
                    <p className="mt-1 text-[0.9375rem] font-medium text-ink-900">{row.value}</p>
                  </div>
                </LandingStaggerItem>
              ))}
            </LandingStagger>

            <div className="mt-6 flex items-start gap-3 border-t border-line pt-5">
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-accent-soft text-accent-700">
                <Icon name="shield" className="h-4 w-4" />
              </span>
              <p className="text-sm text-ink-600">
                Une règle reste modifiable et réversible : elle ne s&apos;exécute qu&apos;après votre relecture.
              </p>
            </div>
          </LandingFloatCard>
        </div>
      </div>
    </section>
  );
}
