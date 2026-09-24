import { Mascot } from "@/components/mascot";
import { Reveal } from "@/components/motion/reveal";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { InView } from "@/components/site/in-view";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AUTOMATION_SUGGESTIONS, COMPARE_COLUMNS } from "@/lib/site/content";
import { cn } from "@/lib/utils";

export function LandingWorkspaceDepth() {
  return (
    <LandingSection>
      <LandingSectionHead
        className="mb-12 max-w-[720px]"
        label="Produit"
        title="Chaque angle de ton lancement,"
        tail="sans reconfigurer."
        text="Automatisations, comparaison honnête et raccourcis — comme sur une landing produit moderne."
      />

      <div className="mx-auto grid max-w-[1080px] gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
        <InView className="flex flex-col gap-4">
          <Reveal>
            <h3 className="text-[18px] font-semibold tracking-[-0.02em]">Automatisations suggérées</h3>
            <p className="mt-1 text-[14px] text-muted-foreground">
              Un clic envoie la consigne au copilote avec le contexte de ton Focus.
            </p>
          </Reveal>
          <Reveal>
            <Card className="gap-0 rounded-[24px] border-line py-0 shadow-soft ring-1 ring-line">
              <CardHeader className="border-b border-line px-5 py-4">
                <CardTitle className="text-[15px] font-semibold">Raccourcis copilote</CardTitle>
                <CardDescription className="text-[13px]">Contexte du Focus inclus</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 p-4">
            {AUTOMATION_SUGGESTIONS.map((label, i) => (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-2 rounded-xl border border-line px-3 py-2.5 text-[13px]",
                  i === 0 ? "bg-accent-soft font-medium" : "bg-surface",
                )}
              >
                <span className="font-mono text-[10px] text-muted-foreground">workflow</span>
                {label}
              </div>
            ))}
              </CardContent>
            </Card>
          </Reveal>
        </InView>

        <InView>
          <Card className="h-full gap-0 overflow-hidden rounded-[24px] border-line py-0 shadow-soft ring-1 ring-line">
            <CardHeader className="border-b border-line px-5 py-4">
              <CardTitle className="mono-label text-[10px] font-normal">{"/ Pipeline exemple ///"}</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
          <Reveal>
            <ol className="flex flex-col gap-2">
              {[
                { s: "Complété", t: "Question sur le Focus" },
                { s: "Complété", t: "Contexte projets injecté" },
                { s: "En cours", t: "Réponse + prochaine action" },
              ].map((step) => (
                <li
                  key={step.t}
                  className="flex items-center gap-3 rounded-xl border border-line bg-surface px-3 py-2.5"
                >
                  <Badge
                    variant="secondary"
                    className={cn(
                      "rounded-pill font-mono text-[9px] uppercase",
                      step.s === "En cours" ? "bg-st-pause-soft text-st-pause-ink" : "bg-st-focus-soft text-st-focus-ink",
                    )}
                  >
                    {step.s}
                  </Badge>
                  <span className="text-[13px]">{step.t}</span>
                </li>
              ))}
            </ol>
          </Reveal>
            </CardContent>
          </Card>
        </InView>
      </div>

      <InView className="mx-auto mt-14 grid max-w-[1080px] gap-4 md:grid-cols-3" stagger={0.06}>
        {COMPARE_COLUMNS.map((col) => (
          <Reveal key={col.title}>
            <Card
              className={cn(
                "h-full gap-0 rounded-[24px] py-0 ring-1",
                col.highlight
                  ? "border-ink/15 bg-card shadow-lift ring-ink/10"
                  : "border-line bg-muted/40 ring-line",
              )}
            >
              <CardHeader className="gap-1 border-b border-line px-6 py-5">
                <CardTitle className="pr-14 text-[17px] font-semibold tracking-tight">{col.title}</CardTitle>
                <CardDescription className="text-[13px]">{col.subtitle}</CardDescription>
                {col.mascot ? (
                  <CardAction className="flex items-end justify-end">
                    <Mascot
                      name={col.mascot}
                      label={col.title}
                      className={cn(
                        "h-14 w-[6rem]",
                        col.highlight && "h-[4.25rem] w-[7.25rem]",
                      )}
                    />
                  </CardAction>
                ) : null}
              </CardHeader>
              <CardContent className="px-6">
                <ul className="flex flex-col gap-2 text-sm leading-snug">
                  {col.points.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span className="text-muted-foreground">·</span>
                      <span className={col.muted ? "text-muted-foreground" : undefined}>{p}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </InView>
    </LandingSection>
  );
}
