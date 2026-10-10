"use client";

import { controlLevels } from "@/lib/site/landing-v2-content";
import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { Mascot } from "@/components/site/landing-v2/components/ui/Mascot";
import { SectionHeading, SectionLabel } from "@/components/site/landing-v2/components/ui/SectionLabel";
import {
  LandingFeatureCard,
  LandingReveal,
  LandingStagger,
} from "@/components/site/landing-v2/lib/landing-motion";

const levelTone = [
  { tile: "bg-accent text-white", badge: "Automatique" },
  { tile: "bg-accent-soft text-accent-700", badge: "Validation" },
  { tile: "border border-line bg-paper-50 text-ink-900", badge: "Vous décidez" },
];

export function HumanLoop() {
  return (
    <section id="controle" className="py-20 sm:py-28">
      <div className="shell">
        <SectionHeading
          label="Human in the loop"
          title={
            <>
              Tarinéo automatise.
              <span className="mt-2 block text-ink-400">Vous gardez le contrôle.</span>
            </>
          }
          subtitle="Trois niveaux, toujours les mêmes. Vous savez exactement ce qui se fait sans vous, ce qui attend votre accord et ce qui ne partira jamais tout seul."
        />

        <LandingStagger className="mt-14 grid gap-4 lg:grid-cols-3" stagger={0.1}>
          {controlLevels.map((level, index) => (
            <LandingFeatureCard key={level.title} className="surface flex flex-col p-6 sm:p-7">
              <span
                className={`inline-flex h-11 w-11 items-center justify-center rounded-md ${levelTone[index].tile}`}
              >
                <Icon
                  name={index === 0 ? "spark" : index === 1 ? "check" : "shield"}
                  className="h-5 w-5"
                />
              </span>

              <p className="eyebrow mt-5">{levelTone[index].badge}</p>
              <h3 className="mt-2.5 text-heading font-semibold text-ink-900">{level.title}</h3>
              <p className="mt-2 text-sm text-ink-400">{level.caption}</p>

              <ul className="mt-5 flex flex-wrap gap-2 border-t border-line pt-5">
                {level.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-line bg-paper-50 px-3 py-1.5 text-sm text-ink-600"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </LandingFeatureCard>
          ))}
        </LandingStagger>

        <LandingReveal className="surface-flat mt-6 flex items-center gap-5 overflow-hidden p-5 sm:p-6">
          <div>
            <SectionLabel>La règle</SectionLabel>
            <p className="mt-2 max-w-xl text-[0.9375rem] text-ink-600">
              Tout ce qui sort de votre entreprise — un devis, un email, une facture — passe par vous.
              Le reste, Tarinéo le fait en silence.
            </p>
          </div>
          <Mascot
            name="pancarte"
            size={140}
            alt="La mascotte Tarinéo tenant une pancarte « À vos côtés sur le terrain »"
            className="ml-auto hidden shrink-0 sm:block"
          />
        </LandingReveal>
      </div>
    </section>
  );
}
