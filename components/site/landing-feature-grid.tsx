import { Check } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { CHANTIER_DOSSIERS, DEMO_MARK, FEATURE_PILLS, INCLUDED, SUIVI } from "@/lib/site/tarineo";

export function LandingFeatureGrid() {
  return (
    <LandingSection id="fonctionnalites">
      <LandingSectionHead
        label="Fonctionnalités"
        title="Travaillez plus vite sur ce qui protège la marge"
        text={FEATURE_PILLS[0].text}
      />
      <InView className="mx-auto grid max-w-[1180px] gap-4 md:grid-cols-3" stagger={0.06}>
        {FEATURE_PILLS.map((f) => (
          <Reveal key={f.title} className="h-full">
            <article className="flex h-full flex-col gap-4 rounded-[28px] border border-line bg-white p-6 shadow-soft">
              <span className="grid size-12 place-items-center rounded-2xl bg-alert-wash text-brand-orange">
                <Check className="size-6" aria-hidden />
              </span>
              <h3 className="font-display text-[22px] font-semibold">{f.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{f.text}</p>
              <ul className="mt-auto flex flex-col gap-2 pt-2">
                {f.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[14px]">
                    <Check className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </InView>
    </LandingSection>
  );
}

export function LandingIncluded() {
  return (
    <LandingSection>
      <LandingSectionHead label={INCLUDED.badge} title={INCLUDED.title} text={INCLUDED.text} />
      <InView className="mx-auto grid max-w-[1180px] gap-4 md:grid-cols-3" stagger={0.06}>
        {INCLUDED.cards.map((c) => (
          <Reveal key={c.title} className="h-full">
            <article className="flex h-full flex-col gap-4 rounded-[28px] border border-line bg-white p-6 shadow-soft">
              <h3 className="font-display text-[22px] font-semibold">{c.title}</h3>
              <p className="text-[15px] leading-relaxed text-muted-foreground">{c.text}</p>
              <ul className="mt-auto flex flex-col gap-2 pt-2">
                {c.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-[14px]">
                    <Check className="mt-0.5 size-4 shrink-0 text-ink" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </article>
          </Reveal>
        ))}
      </InView>
    </LandingSection>
  );
}

export function LandingSuivi() {
  return (
    <LandingSection>
      <LandingSectionHead label={SUIVI.badge} title={SUIVI.title} text={SUIVI.text} />
      <InView className="mx-auto max-w-[1180px] rounded-[28px] border border-line bg-white p-5 shadow-soft sm:p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="font-display text-[20px] font-semibold">{SUIVI.examples}</p>
          <span className="rounded-pill bg-surface-2 px-3 py-1 text-[12px] font-medium uppercase">{DEMO_MARK}</span>
        </div>
        <ul className="grid gap-3 md:grid-cols-3">
          {CHANTIER_DOSSIERS.map((d, i) => (
            <li key={d.name} className="rounded-2xl border border-line bg-bg p-4">
              <div className="flex items-start gap-3">
                <span className="grid size-10 place-items-center rounded-xl bg-white text-[14px] font-semibold shadow-soft">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{d.name}</p>
                  <p className="text-[13px] text-muted-foreground">
                    {d.place.split("·")[1]?.trim()} · {d.trade}/{d.supplier}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-pill bg-white px-2.5 py-1 text-[12px]">{d.docs}</span>
                <span className="rounded-pill bg-white px-2.5 py-1 text-[12px]">{d.tag}</span>
              </div>
            </li>
          ))}
        </ul>
      </InView>
    </LandingSection>
  );
}
