import { FileText, ChevronRight } from "lucide-react";

import { LandingAppChrome } from "@/components/site/landing-v2/components/ui/LandingAppChrome";
import { cn } from "@/lib/utils";

export function LandingStepPreview({ step }: { step: number }) {
  if (step === 1) {
    return (
      <LandingAppChrome>
        <div className="flex min-h-[4.25rem] flex-col justify-center gap-2">
          <div className="flex items-center gap-2 rounded-md border border-dashed border-line bg-paper-0 px-2 py-1.5">
            <FileText className="size-3.5 shrink-0 text-accent" strokeWidth={1.75} />
            <span className="text-[10px] font-medium text-ink-600">Historique · déposer des PDF</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {["Facture_2024.pdf", "Devis_Rexel.pdf"].map((f) => (
              <span
                key={f}
                className="inline-flex max-w-full items-center gap-1 rounded-md bg-paper-0 px-1.5 py-0.5 text-[10px] text-ink-600 ring-1 ring-line/90"
              >
                <span className="size-1 shrink-0 rounded-full bg-accent" />
                <span className="truncate">{f}</span>
              </span>
            ))}
          </div>
        </div>
      </LandingAppChrome>
    );
  }

  if (step === 2) {
    return (
      <LandingAppChrome>
        <div className="flex min-h-[4.25rem] flex-col justify-center gap-1.5">
          {[
            { w: "w-[72%]", hot: false },
            { w: "w-[88%]", hot: true },
            { w: "w-[56%]", hot: false },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="w-6 shrink-0 font-mono text-[9px] text-ink-300">L{i + 1}</span>
              <div
                className={cn(
                  "h-1 rounded-full",
                  row.hot ? "bg-accent/80" : "bg-paper-200",
                  row.w,
                )}
              />
            </div>
          ))}
          <p className="pt-0.5 text-[9px] text-ink-400">Lecture IA · 24 lignes extraites</p>
        </div>
      </LandingAppChrome>
    );
  }

  if (step === 3) {
    return (
      <LandingAppChrome>
        <div className="flex min-h-[4.25rem] flex-col justify-end gap-1">
          <div className="flex items-end justify-between gap-1">
            {["PVC", "U1000", "DISJ", "ICTA"].map((label, i) => {
              const heights = [18, 26, 22, 34];
              const hot = i === 3;
              return (
                <div key={label} className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
                  <span
                    className={cn(
                      "w-full max-w-[1.125rem] rounded-[3px]",
                      hot ? "bg-accent" : "bg-paper-200",
                    )}
                    style={{ height: `${heights[i]}px` }}
                  />
                  <span className="truncate text-[8px] text-ink-400">{label}</span>
                </div>
              );
            })}
          </div>
          <p className="text-right text-[10px] font-medium text-accent-700 nums">+9,8 % · 3 hausses</p>
        </div>
      </LandingAppChrome>
    );
  }

  if (step === 4) {
    return (
      <LandingAppChrome>
        <div className="flex min-h-[4.25rem] flex-col justify-center gap-1">
          <div className="rounded-md bg-paper-0 px-2 py-1 ring-1 ring-line/80">
            <p className="text-[9px] text-ink-400">À · Commercial Point P</p>
          </div>
          <div className="rounded-md bg-paper-0 px-2 py-1 ring-1 ring-line/80">
            <p className="truncate text-[10px] text-ink-800">
              <span className="font-medium text-ink-900">Objet ·</span> Revoir tube PVC (+9,8 %)
            </p>
          </div>
        </div>
      </LandingAppChrome>
    );
  }

  if (step === 5) {
    return (
      <LandingAppChrome>
        <div className="flex min-h-[4.25rem] flex-col items-center justify-center gap-1.5">
          <div className="flex w-full flex-wrap items-center justify-center gap-0.5 text-[9px] font-medium text-ink-600">
            <span className="rounded-md bg-accent-soft px-1.5 py-0.5 text-accent-700">Devis client</span>
            <ChevronRight className="size-3 text-ink-300" strokeWidth={2} />
            <span className="rounded-md bg-paper-0 px-1.5 py-0.5 ring-1 ring-line">Commande</span>
            <ChevronRight className="size-3 text-ink-300" strokeWidth={2} />
            <span className="rounded-md bg-paper-0 px-1.5 py-0.5 ring-1 ring-line">Facture</span>
          </div>
          <p className="text-[9px] text-ink-400">Marge · logo · mentions légales</p>
        </div>
      </LandingAppChrome>
    );
  }

  return null;
}
