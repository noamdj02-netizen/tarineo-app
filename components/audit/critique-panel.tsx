"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { saveAuditCritique } from "@/app/(app)/audit/actions";
import {
  CRITIQUE_AXES,
  critiqueBand,
  critiqueTotal,
  filmLandingBrief,
  normalizeCritique,
  radarGrid,
  radarPoints,
  weakestAxis,
  type CritiqueAxisId,
  type CritiqueState,
} from "@/lib/audit/critique";
import { cn } from "@/lib/utils";

const STEPS = [0, 4, 6, 8, 10];

export function CritiquePanel({
  projectId,
  name,
  site,
  initial,
}: {
  projectId: string;
  name: string;
  site: string;
  initial: CritiqueState;
}) {
  const [c, setC] = useState(() => normalizeCritique(initial));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`navpit:audit-critique:${projectId}`);
      if (raw) setC(normalizeCritique(JSON.parse(raw)));
    } catch {
      /* ignore */
    }
  }, [projectId]);
  const [, start] = useTransition();
  const total = critiqueTotal(c);
  const weak = weakestAxis(c);
  const film = useMemo(() => filmLandingBrief(name, site), [name, site]);

  function persist(next: CritiqueState) {
    setC(next);
    try {
      localStorage.setItem(`navpit:audit-critique:${projectId}`, JSON.stringify(next));
    } catch {
      /* ignore */
    }
    start(() => {
      void saveAuditCritique(projectId, next);
    });
  }

  function setScore(id: CritiqueAxisId, n: number) {
    persist({ ...c, scores: { ...c.scores, [id]: n } });
  }

  return (
    <div className="mx-4 mb-4 rounded-[14px] border border-line bg-surface-2 p-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mono-label">Critique 5 axes</p>
          <p className="mt-1 text-[16px] font-semibold tracking-[-0.02em]">
            {total}/50
            <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">
              plus faible : {weak.n} {c.scores[weak.id]}/10
            </span>
          </p>
        </div>
        <svg viewBox="0 0 100 100" className="size-24 shrink-0" aria-hidden>
          {radarGrid().map((pts) => (
            <polygon
              key={pts}
              points={pts}
              fill="none"
              stroke="currentColor"
              className="text-ink/15"
              strokeWidth="0.8"
            />
          ))}
          <polygon
            points={radarPoints(c)}
            className="fill-ink/15 stroke-ink"
            strokeWidth="1.4"
          />
        </svg>
      </div>

      <ul className="mt-3 flex flex-col gap-2">
        {CRITIQUE_AXES.map((axis) => {
          const score = c.scores[axis.id];
          const band = critiqueBand(score);
          return (
            <li key={axis.id}>
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[14px] font-semibold">{axis.n}</p>
                <span
                  className={cn(
                    "font-mono text-[10px] uppercase",
                    band.tone === "fini" && "text-st-fini-ink",
                    band.tone === "pause" && "text-st-pause-ink",
                    band.tone === "focus" && "text-st-focus-ink",
                  )}
                >
                  {score}/10 · {band.label}
                </span>
              </div>
              <p className="text-[12.5px] text-muted-foreground">{axis.q}</p>
              <div className="mt-1 flex gap-1">
                {STEPS.map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setScore(axis.id, n)}
                    className={cn(
                      "min-h-8 flex-1 rounded-lg border text-[12px] font-mono",
                      score === n
                        ? "border-ink bg-ink text-accent-ink"
                        : "border-line bg-surface text-muted-foreground",
                    )}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-3 grid gap-2">
        {(
          [
            ["keep", "Garder"],
            ["fix", "Corriger"],
            ["win", "Quick-win"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="block">
            <span className="mono-label">{label}</span>
            <input
              value={c[key]}
              onChange={(e) => persist({ ...c, [key]: e.target.value })}
              placeholder={
                key === "keep"
                  ? "Ce qui marche, ne pas toucher"
                  : key === "fix"
                    ? "Le P0 visuel"
                    : "15 min, gros effet"
              }
              className="mt-1 min-h-10 w-full rounded-xl border border-line bg-surface px-3 text-[13.5px] outline-none focus:border-ink/30"
            />
          </label>
        ))}
      </div>

      <button
        type="button"
        className="mt-3 inline-flex min-h-10 items-center rounded-pill border border-line px-3.5 text-[13px]"
        onClick={() => {
          void navigator.clipboard.writeText(film);
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        }}
      >
        {copied ? "Brief film copié" : "Filmer cette landing"}
      </button>
    </div>
  );
}
