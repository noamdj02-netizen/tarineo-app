import { Reveal } from "@/components/motion/reveal";
import { DeltaBadge } from "@/components/site/delta-badge";
import { InView } from "@/components/site/in-view";
import { Badge } from "@/components/ui/badge";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { DEMO_DOCUMENTS, DEMO_MARK, PROBLEM, euroDelta, variation } from "@/lib/site/tarineo";

/** Lignes réelles de la démo (hausses uniquement) : on montre de petits écarts, pas des chiffres chocs. */
const DRIFT = DEMO_DOCUMENTS.flatMap((d) => d.lines.map((l) => ({ ...l, supplier: d.supplier })))
  .filter((l) => l.after > l.before && l.after < 200)
  .slice(0, 6);

/** Section #probleme : pourquoi les hausses passent inaperçues. */
export function LandingProblem() {
  return (
    <LandingSection id="probleme" className="relative">
      <LandingSectionHead label="Le problème" title={PROBLEM.title} tail={PROBLEM.tail} text={PROBLEM.text} />

      <InView className="mx-auto grid max-w-[1080px] gap-4 md:grid-cols-3" stagger={0.08}>
        {PROBLEM.points.map((p, i) => (
          <Reveal key={p.title}>
            <Card className="card-lift h-full gap-0 rounded-2xl py-0 shadow-soft">
              <CardHeader className="gap-3 px-5 pt-6 sm:px-6">
                <span className="grid size-8 place-items-center rounded-lg border bg-muted font-mono text-[11px] text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <CardTitle className="text-[1.125rem] font-semibold tracking-tight">{p.title}</CardTitle>
              </CardHeader>
              <CardContent className="px-5 pt-2 pb-6 sm:px-6">
                <CardDescription className="text-[15px] sm:text-base leading-relaxed">{p.text}</CardDescription>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </InView>

      <InView className="mx-auto mt-4 max-w-[1080px]" stagger={0.05} delay={0.12}>
        <Reveal>
          <Card className="gap-0 overflow-hidden rounded-2xl py-0 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-4 sm:px-6">
              <p className="mono-label">/ Petits écarts, ligne par ligne ///</p>
              <Badge
                variant="outline"
                className="h-6 rounded-md px-2 font-mono text-[10px] tracking-[0.1em] text-muted-foreground uppercase"
              >
                {DEMO_MARK}
              </Badge>
            </div>
            <Separator />
            <ul className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-3">
              {DRIFT.map((l) => {
                const pct = variation(l.before, l.after);
                return (
                  <li key={l.ref} className="flex items-center justify-between gap-3 bg-surface px-5 py-3.5 sm:px-6">
                    <div className="min-w-0">
                      <p className="truncate text-[14px] text-ink">{l.label}</p>
                      <p className="font-mono text-[11px] text-muted-foreground">
                        {l.supplier} · {euroDelta(l.after - l.before)}
                      </p>
                    </div>
                    <DeltaBadge value={pct} className="shrink-0" />
                  </li>
                );
              })}
            </ul>
            <Separator />
            <p className="px-5 py-4 text-[15px] leading-relaxed text-muted-foreground sm:px-6 sm:text-base">
              Pris un par un, aucun de ces écarts n’alerte. Répétés sur des centaines de références et des mois
              d’achats, ils finissent par réduire votre marge.
            </p>
          </Card>
        </Reveal>
      </InView>
    </LandingSection>
  );
}
