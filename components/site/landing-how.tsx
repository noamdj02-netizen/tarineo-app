import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { InView } from "@/components/site/in-view";
import { LandingButton } from "@/components/site/landing-button";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { CTA_TRIAL, DEMO_DOCUMENTS, DEMO_MARK, FILM, HOW_STEPS } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Section film : étapes à gauche, stack documents isométrique à droite. */
export function LandingHow() {
  return (
    <LandingSection id="comment">
      <LandingSectionHead label={FILM.badge} title={FILM.title} text={FILM.text} />

      <InView className="mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-16">
        <Reveal className="flex flex-col gap-5">
          <h3 className="font-display text-[22px] font-semibold tracking-tight sm:text-[26px]">{FILM.heading}</h3>
          <p className="text-[15px] leading-relaxed text-muted-foreground sm:text-base">{FILM.body}</p>
          <ol className="flex flex-col gap-3">
            {HOW_STEPS.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3 text-[15px]">
                <span className="grid size-7 place-items-center rounded-full bg-ink text-[12px] font-semibold text-white">
                  {i + 1}
                </span>
                {s.title}
              </li>
            ))}
          </ol>
          <div className="mt-2 flex flex-wrap items-center gap-4">
            <LandingButton href="/inscription" variant="orange">
              {CTA_TRIAL.long}
            </LandingButton>
            <a href="/#fonctionnalites" className="inline-flex items-center gap-1.5 text-[14px] font-medium text-ink">
              {FILM.preview}
              <ArrowRight className="size-4" aria-hidden />
            </a>
          </div>
        </Reveal>

        <Reveal>
          <div
            className="relative min-h-[280px] overflow-hidden rounded-[28px] bg-surface-2 p-6 sm:min-h-[360px] sm:p-10"
            style={{ perspective: "900px" }}
          >
            <p className="mb-4 text-right font-mono text-[11px] tracking-[0.12em] text-muted-foreground uppercase">
              {DEMO_MARK}
            </p>
            <ul
              className="mx-auto w-full max-w-[420px] origin-top space-y-2 [transform-style:preserve-3d]"
              style={{ transform: "rotateX(18deg) rotateZ(-8deg)" }}
            >
              {DEMO_DOCUMENTS.slice(0, 5).map((d, i) => (
                <li
                  key={d.number}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-2.5 shadow-soft",
                    i === 2 && "ring-1 ring-brand-orange/30",
                  )}
                >
                  <span className="grid size-8 place-items-center rounded-full bg-surface-2 text-[12px] font-semibold">
                    {d.supplier.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="truncate text-[13px] font-semibold">
                      {d.kind} {d.supplier}
                    </p>
                    <p className="truncate text-[12px] text-muted-foreground">
                      {d.number} · {d.date}
                    </p>
                  </div>
                  <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[10px] uppercase">PDF</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </InView>
    </LandingSection>
  );
}
