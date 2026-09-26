import { Mascot } from "@/components/mascot";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { ProjectDetail } from "@/components/projects/project-detail";
import { STATUS_TITLE } from "@/components/projects/status-badge";
import { LandingSchemaPreview } from "@/components/site/landing-schema-preview";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { InView } from "@/components/site/in-view";
import { DeferredMount } from "@/components/ui/deferred-mount";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { COMPARE_COLUMNS } from "@/lib/site/content";
import { DEMO_PROJECT, DEMO_PROJECT_CARD } from "@/lib/site/demo-project";
import { cn } from "@/lib/utils";

export function LandingWorkspaceDepth() {
  return (
    <LandingSection>
      <LandingSectionHead
        className="mb-12 max-w-[720px]"
        label="Produit"
        title="Chaque angle de ton lancement,"
        tail="sans reconfigurer."
        text="La carte, la fiche et le parcours — comme dans le cockpit. Ici Relais, un SaaS de création de contenu."
      />

      <DeferredMount minHeight="720px" className="mx-auto max-w-[1080px]">
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)] lg:gap-10">
        <div className="flex flex-col gap-8">
          <InView>
            <ProjectCard project={DEMO_PROJECT_CARD} index={0} preview />
          </InView>
          <InView>
            <LandingSchemaPreview />
          </InView>
        </div>
        <InView>
          <div className="overflow-hidden rounded-[22px] border border-line bg-bg shadow-lift">
            <div className="border-b border-line bg-surface px-5 py-4">
              <p className="mono-label">{`/ ${STATUS_TITLE[DEMO_PROJECT.status]} ///`}</p>
              <h3 className="text-[26px] leading-tight font-semibold tracking-[-0.035em]">
                {DEMO_PROJECT.name}
              </h3>
            </div>
            <div className="px-4 pt-4 pb-5 sm:px-5">
              <ProjectDetail project={DEMO_PROJECT} preview />
            </div>
          </div>
        </InView>
      </div>
      </DeferredMount>

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
