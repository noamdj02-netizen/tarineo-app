"use client";

import { AnimatedVerticalBar } from "@/components/tarineo/motion/AnimatedBarFill";

const TRACK_H = 182;

export function GraphiqueEconomiesSemaineMotion({
  donnees,
}: {
  donnees: { jour: string; montant: number }[];
}) {
  const max = Math.max(...donnees.map((d) => d.montant), 1);
  const maxIndex = donnees.reduce((best, d, i, arr) => (d.montant > arr[best].montant ? i : best), 0);
  const yLabels = ["2k", "1.5k", "1k", "0.5k", "0k"];

  return (
    <div className="flex items-end gap-[23px]" role="img" aria-label="Économies détectées par jour cette semaine">
      <div className="flex h-[206px] flex-col justify-between pb-5 text-sm font-normal text-muted-foreground">
        {yLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div className="grid min-w-0 flex-1 grid-cols-7 gap-1.5 sm:gap-3 xl:gap-[27px]">
        {donnees.map((d, i) => {
          const fillH = d.montant > 0 ? Math.max(12, Math.round((d.montant / max) * TRACK_H)) : 0;
          const actif = i === maxIndex && d.montant > 0;
          return (
            <div key={d.jour} className="flex min-w-0 flex-col items-center gap-[9px]">
              <div
                className="relative w-full max-w-12 overflow-hidden rounded-[10px] bg-[var(--app-chart-track)]"
                style={{ height: TRACK_H }}
              >
                {fillH > 0 && (
                  <AnimatedVerticalBar
                    heightPx={fillH}
                    className={`absolute inset-x-0 bottom-0 rounded-[10px] ${actif ? "bg-[var(--accent)]" : "bg-[var(--app-chart-fill)]"}`}
                    delay={i * 0.05}
                  />
                )}
              </div>
              <span className="text-sm font-normal text-muted-foreground">{d.jour}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
