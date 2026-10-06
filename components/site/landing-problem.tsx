import { Reveal } from "@/components/motion/reveal";
import { DeltaBadge } from "@/components/site/delta-badge";
import { InView } from "@/components/site/in-view";
import { Badge } from "@/components/ui/badge";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { Separator } from "@/components/ui/separator";
import { DEMO_DOCUMENTS, DEMO_MARK, PROBLEM, euroDelta, variation } from "@/lib/site/tarineo";

/** Lignes réelles de la démo (hausses uniquement) : on montre de petits écarts, pas des chiffres chocs. */
const DRIFT = DEMO_DOCUMENTS.flatMap((d) => d.lines.map((l) => ({ ...l, supplier: d.supplier })))
  .filter((l) => l.after > l.before && l.after < 200)
  .slice(0, 6);

/** Section #probleme : pourquoi les hausses passent inaperçues — bento asymétrique. */
export function LandingProblem() {
  return (
    <LandingSection id="probleme" className="relative">
      <LandingSectionHead
        label="Le problème"
        title={PROBLEM.title}
        tail={PROBLEM.tail}
        text={PROBLEM.text}
        stackedTail
        className="max-w-[38rem]"
      />

      <InView className="mt-2 grid gap-5 lg:grid-cols-12 lg:gap-6" stagger={0.06}>
        <Reveal className="lg:col-span-5">
          <ul className="flex h-full flex-col justify-center gap-0 overflow-hidden rounded-xl border border-black/[0.06] border-l-[3px] border-l-tarineo-orange bg-white/55 backdrop-blur-sm">
            {PROBLEM.points.map((p) => (
              <li
                key={p.title}
                className="px-5 py-5 sm:px-6 sm:py-6 [&+&]:border-t [&+&]:border-black/[0.06]"
              >
                <p className="font-[family-name:var(--font-grotesk)] text-[17px] font-semibold tracking-[-0.03em] text-ink">
                  {p.title}
                </p>
                <p className="mt-2 text-[15px] leading-[1.6] text-landing-ink-muted">{p.text}</p>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal className="lg:col-span-7">
          <div className="overflow-hidden rounded-xl border border-black/[0.06] bg-surface shadow-soft ring-1 ring-black/[0.04] transition-transform duration-300 hover:-translate-y-0.5">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
              <p className="mono-label text-landing-ink-muted">Petits écarts, ligne par ligne</p>
              <Badge
                variant="outline"
                className="h-6 rounded-md px-2 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase"
              >
                {DEMO_MARK}
              </Badge>
            </div>
            <Separator />
            <ul className="grid gap-px bg-line sm:grid-cols-2">
              {DRIFT.map((l) => {
                const pct = variation(l.before, l.after);
                return (
                  <li
                    key={l.ref}
                    className="flex items-center justify-between gap-3 bg-landing-hero/80 px-5 py-4 sm:px-6"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-display text-[15px] font-medium leading-snug tracking-[-0.02em] text-ink">
                        {l.label}
                      </p>
                      <p className="mt-0.5 font-mono text-[12px] leading-tight tabular-nums text-muted-foreground">
                        {l.supplier} · {euroDelta(l.after - l.before)}
                      </p>
                    </div>
                    <DeltaBadge value={pct} className="shrink-0" />
                  </li>
                );
              })}
            </ul>
            <Separator />
            <p className="px-5 py-4 text-[15px] leading-[1.65] tracking-[-0.01em] text-landing-ink-muted sm:px-6 sm:text-base">
              Pris un par un, aucun de ces écarts n’alerte. Répétés sur des centaines de références et des mois
              d’achats, ils finissent par réduire votre marge.
            </p>
          </div>
        </Reveal>
      </InView>
    </LandingSection>
  );
}
