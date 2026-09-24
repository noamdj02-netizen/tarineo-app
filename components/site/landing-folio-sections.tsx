import { ArrowRight } from "lucide-react";
import { Illustration } from "@/components/illustration";
import { Reveal } from "@/components/motion/reveal";
import { LandingButton } from "@/components/site/landing-button";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { InView } from "@/components/site/in-view";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AUTOMATION_SUGGESTIONS,
  COMPARE_COLUMNS,
  HOW_WORKS_ROWS,
} from "@/lib/site/content";
import { cn } from "@/lib/utils";

export function LandingCtaBand() {
  return (
    <section className="border-y border-line bg-surface px-5 py-14 sm:px-8">
      <InView className="mx-auto flex max-w-[1080px] flex-col items-center gap-5 text-center sm:flex-row sm:justify-between sm:text-left">
        <Reveal>
          <h2 className="font-display text-[clamp(24px,3.6vw,34px)] font-semibold tracking-tightest text-balance">
            Arrête de jongler entre dix onglets.
          </h2>
          <p className="mt-2 max-w-[42ch] text-[15px] leading-relaxed text-muted-foreground">
            Choisis ton Focus, pose une question au copilote et avance avant la fin de la journée.
          </p>
        </Reveal>
        <Reveal>
          <LandingButton href="/inscription" icon={<ArrowRight aria-hidden />}>
            Commencer gratuitement
          </LandingButton>
        </Reveal>
      </InView>
    </section>
  );
}

function MockActivityFeed() {
  return (
    <ul className="flex flex-col gap-2 p-4">
      {[
        { who: "Studio Devis", what: "Prochaine action mise à jour", when: "8 min" },
        { who: "Copilote", what: "Mail de relance généré", when: "1 h" },
        { who: "Menu QR", what: "Passé en pause", when: "Hier" },
      ].map((e) => (
        <li key={e.what} className="rounded-xl border border-line bg-surface px-3 py-2.5">
          <p className="text-[13px] font-medium">{e.what}</p>
          <p className="mt-0.5 text-[12px] text-muted-foreground">
            {e.who} · {e.when}
          </p>
        </li>
      ))}
    </ul>
  );
}

function MockIntegrations() {
  const tools = ["Notion", "Figma", "Slack", "Agenda iCal"];
  return (
    <ul className="grid gap-2 p-4 sm:grid-cols-2">
      {tools.map((t) => (
        <li
          key={t}
          className="flex items-center justify-between rounded-xl border border-line bg-surface px-3 py-3"
        >
          <span className="text-[13px] font-medium">{t}</span>
          <Badge variant="secondary" className="rounded-pill font-mono text-[10px] uppercase">
            Lié
          </Badge>
        </li>
      ))}
    </ul>
  );
}

function MockAiDraft() {
  return (
    <div className="flex flex-col gap-3 p-4">
      <p className="rounded-xl bg-surface-2 px-3 py-2 text-[12px] text-muted-foreground">
        Rédige un mail de relance pour Studio Devis…
      </p>
      <div className="rounded-xl border border-line bg-surface p-3 text-[13px] leading-relaxed">
        <p className="font-medium">Objet : Suite à notre échange</p>
        <p className="mt-2 text-muted-foreground">
          Bonjour Marcus, merci pour le temps hier. Voici la prochaine étape pour la bêta…
        </p>
      </div>
      <span className="self-start rounded-pill bg-ink px-3 py-1 font-mono text-[10px] text-accent-ink uppercase">
        Suggestion copilote
      </span>
    </div>
  );
}

const MOCK_PANELS = [MockActivityFeed, MockIntegrations, MockAiDraft];

export function LandingHowItWorks() {
  return (
    <LandingSection id="solution" tone="muted" className="bg-bg">
      <LandingSectionHead
        className="mb-14 max-w-[640px]"
        label="Comment ça marche"
        title="Tout autour de tes projets,"
        tail="dans un seul cockpit."
      />
      <div className="mx-auto flex max-w-[1080px] flex-col gap-16">
        {HOW_WORKS_ROWS.map((row, i) => {
          const Mock = MOCK_PANELS[i] ?? MockActivityFeed;
          const flip = i % 2 === 1;
          return (
            <InView
              key={row.title}
              className={cn(
                "grid items-center gap-8 lg:grid-cols-2 lg:gap-12",
                flip && "lg:[&>div:first-child]:order-2",
              )}
            >
              <Reveal className="flex flex-col gap-3">
                <Illustration name={row.art} className="size-16" label={row.title} />
                <h3 className="font-display text-[22px] font-semibold tracking-tightest">{row.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted-foreground">{row.description}</p>
              </Reveal>
              <Reveal>
                <div className="overflow-hidden rounded-[22px] border border-line bg-surface-2 shadow-soft">
                  <Mock />
                </div>
              </Reveal>
            </InView>
          );
        })}
      </div>
    </LandingSection>
  );
}

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
          <Reveal className="card-soft flex flex-col gap-2 p-4">
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
          </Reveal>
        </InView>

        <InView className="card-soft overflow-hidden p-4 sm:p-5">
          <Reveal>
            <p className="mono-label mb-3 text-[10px]">{"/ Pipeline exemple ///"}</p>
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
        </InView>
      </div>

      <InView className="mx-auto mt-14 grid max-w-[1080px] gap-4 md:grid-cols-3" stagger={0.06}>
        {COMPARE_COLUMNS.map((col) => (
          <Reveal key={col.title}>
            <Card
              className={cn(
                "h-full gap-4 rounded-[22px] py-6 ring-0",
                col.highlight ? "border-ink/15 bg-card shadow-lift" : "border-border bg-muted/40",
              )}
            >
              <CardHeader className="gap-1 px-6">
                <CardTitle className="text-[17px] font-semibold tracking-tight">{col.title}</CardTitle>
                <CardDescription className="text-[13px]">{col.subtitle}</CardDescription>
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
