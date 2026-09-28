import { Camera, FileText, UploadCloud } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { DeltaBadge } from "@/components/site/delta-badge";
import { GrowBar } from "@/components/site/grow-bar";
import { InView } from "@/components/site/in-view";
import { LandingSection, LandingSectionHead } from "@/components/site/landing-section";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HERO_SAMPLE, HOW_STEPS, euro, variation, type HowStepId } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Section #comment : importer → analyser → comparer, chaque étape avec son mini-écran. */
export function LandingHow() {
  return (
    <LandingSection id="comment" className="border-t border-line">
      <LandingSectionHead
        label="Comment ça marche"
        title="Trois étapes."
        tail="Vous déposez, TARINEO lit et compare."
        text="Vous déposez le document. TARINEO fait la lecture et la comparaison. Vous vérifiez, vous corrigez si besoin."
      />

      <InView className="relative mx-auto max-w-[1080px]">
        <div
          aria-hidden
          className="pointer-events-none absolute top-[118px] right-[calc(16.666%+24px)] left-[calc(16.666%+24px)] hidden h-px bg-[linear-gradient(90deg,var(--color-line)_50%,transparent_50%)] bg-[length:12px_1px] bg-repeat-x md:block"
        />
        <ol className="grid list-none gap-4 md:grid-cols-3">
          {HOW_STEPS.map((s, i) => (
            <li key={s.id} className="relative">
              <Reveal className="h-full">
                <Card className="card-lift group/step h-full gap-0 overflow-hidden rounded-2xl py-0 shadow-soft">
                  <div className="relative h-[236px] overflow-hidden border-b border-line bg-[linear-gradient(180deg,#111_0%,#0a0a0a_100%)]">
                    <div
                      aria-hidden
                      className="absolute inset-0 bg-[linear-gradient(var(--color-line)_1px,transparent_1px),linear-gradient(90deg,var(--color-line)_1px,transparent_1px)] bg-[size:28px_28px] opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
                    />
                    <StepVisual id={s.id} />
                  </div>
                  <CardHeader className="gap-3 px-5 pt-5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <span className="grid size-8 place-items-center rounded-lg border bg-muted font-mono text-[11.5px] font-semibold">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <p className="font-mono text-[11px] font-medium tracking-[0.16em] text-brand-orange uppercase">
                        {s.label}
                      </p>
                    </div>
                    <CardTitle className="text-[1.125rem] leading-snug font-semibold tracking-tight">{s.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="px-5 pt-2 pb-6 sm:px-6">
                    <CardDescription className="text-[15px] sm:text-base leading-relaxed">{s.text}</CardDescription>
                  </CardContent>
                </Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </InView>
    </LandingSection>
  );
}

function StepVisual({ id }: { id: HowStepId }) {
  if (id === "import") {
    return (
      <div className="absolute inset-0 grid place-items-center p-6">
        <div className="flex w-full max-w-[250px] flex-col items-center gap-3 rounded-[18px] border border-dashed border-white/20 bg-white/[0.02] px-4 py-6 transition-colors duration-500 group-hover/step:border-brand-orange/50">
          <UploadCloud className="size-7 text-white/60 transition-transform duration-500 ease-out-soft group-hover/step:-translate-y-1" aria-hidden />
          <p className="text-[13px] text-white/70">Déposez vos documents</p>
          <div className="flex gap-2">
            <FileChip icon={<FileText className="size-3" aria-hidden />} label="devis.pdf" />
            <FileChip icon={<Camera className="size-3" aria-hidden />} label="photo.jpg" />
          </div>
        </div>
      </div>
    );
  }

  if (id === "analyse") {
    return (
      <div className="absolute inset-0 grid place-items-center p-6">
        <div className="relative w-full max-w-[250px] overflow-hidden rounded-[12px] bg-white px-4 py-4 shadow-lift">
          <div className="mb-3 h-2 w-16 rounded-full bg-black/80" />
          {[0.9, 0.7, 0.8, 0.6, 0.75].map((w, i) => (
            <div key={i} className="flex items-center justify-between gap-3 border-t border-black/6 py-[7px]">
              <div className="h-1.5 rounded-full bg-black/20" style={{ width: `${w * 60}%` }} />
              <div className={cn("h-1.5 w-8 rounded-full", i === 0 || i === 3 ? "bg-brand-orange" : "bg-black/25")} />
            </div>
          ))}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-8 animate-[doc-scan_3.2s_ease-in-out_infinite] bg-[linear-gradient(180deg,transparent,rgba(236,88,33,0.22),transparent)] [--scan-distance:150px] motion-reduce:hidden"
          >
            <div className="absolute inset-x-0 top-1/2 h-px bg-brand-orange/70" />
          </div>
        </div>
      </div>
    );
  }

  const pct = variation(HERO_SAMPLE.before, HERO_SAMPLE.after);
  return (
    <div className="absolute inset-0 grid place-items-center p-6">
      <div className="flex w-full max-w-[250px] flex-col gap-3 rounded-[16px] border border-white/10 bg-black/40 p-4">
        <p className="text-[13px] text-white/80">{HERO_SAMPLE.product}</p>
        <PriceBar label="Avant" value={euro(HERO_SAMPLE.before)} width={78} />
        <PriceBar label="Aujourd’hui" value={euro(HERO_SAMPLE.after)} width={90} accent />
        <DeltaBadge value={pct} className="self-start" />
      </div>
    </div>
  );
}

function FileChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10.5px] text-white/65">
      {icon}
      {label}
    </span>
  );
}

function PriceBar({ label, value, width, accent }: { label: string; value: string; width: number; accent?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between font-mono text-[10.5px] text-white/50">
        <span>{label}</span>
        <span className={cn("tabular-nums", accent && "text-white")}>{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/8">
        <GrowBar
          className={cn("h-full rounded-full", accent ? "bg-brand-orange" : "bg-white/35")}
          style={{ width: `${width}%` }}
          delay={accent ? 0.25 : 0}
        />
      </div>
    </div>
  );
}
