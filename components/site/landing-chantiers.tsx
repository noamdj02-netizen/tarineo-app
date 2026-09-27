import { BellRing, MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { GrowBar } from "@/components/site/grow-bar";
import { InView } from "@/components/site/in-view";
import { LandingFrame } from "@/components/site/landing-frame";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CHANTIER_DEMO, DEMO_MARK, euroInt } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Section « Chantiers » : une fiche chantier + les documents qui y sont rattachés. */
export function LandingChantiers() {
  const c = CHANTIER_DEMO;
  const margin = Math.round(((c.sales - c.purchases) / c.sales) * 100);
  const step = c.steps[c.current - 1];

  return (
    <InView className="mx-auto max-w-[1080px]">
      <Reveal>
        <LandingFrame>
          <CardHeader className="flex-row flex-wrap items-start justify-between gap-4 border-b px-5 py-5 sm:px-6">
            <div>
              <CardTitle className="font-display text-[22px] font-semibold tracking-tight sm:text-[26px]">
                {c.client}
              </CardTitle>
              <CardDescription className="mt-1 flex flex-wrap items-center gap-x-2 text-[15px]">
                {c.kind}
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="size-3.5" aria-hidden />
                  {c.city}
                </span>
              </CardDescription>
            </div>
            <Badge variant="outline" className="uppercase">
              {DEMO_MARK}
            </Badge>
          </CardHeader>

          <div className="grid lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)]">
            <div className="flex flex-col gap-5 border-b border-border px-5 py-5 sm:px-6 lg:border-r lg:border-b-0">
              <div>
                <p className="text-[15px] font-semibold">
                  Étape {c.current}/{c.steps.length} :{" "}
                  <span className="text-brand-orange-light">{step}</span>
                </p>
                <ol
                  className="mt-3 grid grid-cols-5 gap-1.5"
                  aria-label="Étapes du chantier"
                >
                  {c.steps.map((s, i) => (
                    <li key={s} className="flex flex-col gap-1.5">
                      <span className="h-1.5 overflow-hidden rounded-full bg-white/10">
                        {i < c.current ? (
                          <GrowBar
                            className={cn(
                              "h-full rounded-full",
                              i === c.current - 1
                                ? "bg-brand-orange"
                                : "bg-white/70",
                            )}
                            delay={0.15 + i * 0.1}
                          />
                        ) : null}
                      </span>
                      <span
                        className={cn(
                          "hidden text-[11px] leading-tight sm:block",
                          i < c.current ? "text-foreground" : "text-white/40",
                        )}
                      >
                        {s}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              <Alert className="border-brand-orange/35 bg-brand-orange/10">
                <BellRing aria-hidden />
                <AlertTitle>Prochaine action</AlertTitle>
                <AlertDescription>{c.nextAction}</AlertDescription>
              </Alert>

              <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-xl bg-border">
                {[
                  { label: "Achats", value: euroInt(c.purchases) },
                  { label: "Ventes", value: euroInt(c.sales) },
                  { label: "Marge", value: `${margin} %`, accent: true },
                ].map((k) => (
                  <div
                    key={k.label}
                    className="bg-surface-2 px-3 py-3.5 sm:px-4"
                  >
                    <dt className="text-[12px] text-white/50">{k.label}</dt>
                    <dd
                      className={cn(
                        "mt-1 font-display text-[20px] leading-none font-semibold tabular-nums sm:text-[24px]",
                        k.accent && "text-brand-orange-light",
                      )}
                    >
                      {k.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <ol className="flex flex-col" aria-label="Documents du chantier">
              {c.docs.map((d, i) => (
                <li
                  key={d.id}
                  className={cn(
                    "flex items-center gap-4 px-5 py-4 sm:px-6",
                    i < c.docs.length - 1 && "border-b border-border",
                    i === 1 && "bg-surface-2",
                  )}
                >
                  <span className="font-display text-[13px] font-semibold text-white/35 tabular-nums">
                    0{i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[16px] font-semibold">{d.label}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {d.detail}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="font-display text-[18px] font-semibold tabular-nums">
                      {euroInt(d.amount)}
                    </span>
                    <span
                      className={cn(
                        "text-[12px]",
                        d.state === "Analysé" && "text-brand-orange-light",
                        d.state === "En attente" && "text-foreground",
                        d.state === "Ensuite" && "text-white/40",
                      )}
                    >
                      {d.state}
                    </span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </LandingFrame>
      </Reveal>
    </InView>
  );
}
