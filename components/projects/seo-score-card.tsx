"use client";

import { ChevronDown, ExternalLink, Gauge, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { saveProjectSeo, updateProject } from "@/app/(app)/projets/actions";
import { openAssistant } from "@/lib/assistant/open";
import {
  appendSeoHistory,
  seoPrompt,
  seoTone,
  type ProjectSeo,
  type SeoPoint,
  type SeoSnapshot,
} from "@/lib/projects/seo";
import { cn } from "@/lib/utils";

const TONE = {
  ok: "text-st-focus-ink",
  warn: "text-st-pause-ink",
  alert: "text-st-fini-ink",
} as const;

const RING = {
  ok: "text-st-focus",
  warn: "text-st-pause",
  alert: "text-st-fini",
} as const;

const BAR = {
  ok: "bg-st-focus",
  warn: "bg-st-pause",
  alert: "bg-st-fini",
} as const;

const R = 62;
const C = 2 * Math.PI * R;

function Ring({ score }: { score: number }) {
  const tone = seoTone(score);
  const offset = C * (1 - Math.max(0, Math.min(100, score)) / 100);
  return (
    <div className="relative grid size-[148px] place-items-center">
      <svg viewBox="0 0 148 148" className="size-[148px] -rotate-90" aria-hidden>
        <circle
          cx="74"
          cy="74"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-line"
        />
        <circle
          cx="74"
          cy="74"
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          className={cn("transition-[stroke-dashoffset] duration-700", RING[tone])}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <p className={cn("font-mono text-[15px] font-semibold tabular-nums", TONE[tone])}>
          {score} SEO / 100
        </p>
      </div>
    </div>
  );
}

function ScoreBars({ snap }: { snap: SeoSnapshot }) {
  const rows = [
    { n: "SEO", v: snap.seo },
    { n: "Vit.", v: snap.performance },
    { n: "A11y", v: snap.accessibility },
    { n: "BP", v: snap.practices },
  ];
  return (
    <div className="grid h-[148px] grid-cols-4 items-end gap-3 px-1 pb-1">
      {rows.map((row) => {
        const tone = seoTone(row.v);
        return (
          <div key={row.n} className="flex h-full min-w-0 flex-col items-center justify-end gap-1.5">
            <span className={cn("font-mono text-[11px] tabular-nums", TONE[tone])}>{row.v}</span>
            <div className="flex w-full flex-1 items-end rounded-t-lg bg-surface-2">
              <i
                className={cn("block w-full rounded-t-lg transition-[height] duration-500", BAR[tone])}
                style={{ height: `${Math.max(6, row.v)}%` }}
              />
            </div>
            <span className="font-mono text-[10px] tracking-[0.08em] text-muted-foreground uppercase">
              {row.n}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function ScoreArea({ points }: { points: SeoPoint[] }) {
  const w = 320;
  const h = 148;
  const pad = { t: 16, r: 8, b: 22, l: 8 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const xs = points.map((_, i) => pad.l + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW));
  const y = (v: number) => pad.t + innerH * (1 - v / 100);
  const line = (key: "seo" | "performance") =>
    points.map((p, i) => `${i === 0 ? "M" : "L"} ${xs[i]!.toFixed(1)} ${y(p[key]).toFixed(1)}`).join(" ");
  const area = `${line("seo")} L ${xs[xs.length - 1]!.toFixed(1)} ${(pad.t + innerH).toFixed(1)} L ${xs[0]!.toFixed(1)} ${(pad.t + innerH).toFixed(1)} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[148px] w-full" role="img" aria-label="SEO et vitesse dans le temps">
      <defs>
        <linearGradient id="seo-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.14" />
          <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[25, 50, 75].map((g) => (
        <line
          key={g}
          x1={pad.l}
          x2={w - pad.r}
          y1={y(g)}
          y2={y(g)}
          stroke="var(--color-line)"
          strokeWidth="1"
        />
      ))}
      <path d={area} fill="url(#seo-area)" />
      <path d={line("seo")} fill="none" stroke="var(--color-ink)" strokeWidth="2" strokeLinejoin="round" />
      <path
        d={line("performance")}
        fill="none"
        stroke="var(--color-st-focus)"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <text x={pad.l} y={h - 6} className="fill-muted-foreground" fontSize="10" fontFamily="ui-monospace, monospace">
        SEO
      </text>
      <text
        x={w - pad.r}
        y={h - 6}
        textAnchor="end"
        className="fill-st-focus-ink"
        fontSize="10"
        fontFamily="ui-monospace, monospace"
      >
        Vitesse
      </text>
    </svg>
  );
}

function Bar({ n, v }: { n: string; v: number }) {
  const tone = seoTone(v);
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <span className="font-mono text-[10.5px] tracking-[0.1em] text-muted-foreground uppercase">
          {n}
        </span>
        <span className={cn("font-mono text-[12px] font-medium", TONE[tone])}>{v}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-pill bg-line">
        <i
          className={cn("block h-full rounded-pill transition-[width] duration-500", BAR[tone])}
          style={{ width: `${v}%` }}
        />
      </div>
    </div>
  );
}

export function SeoScoreCard({
  projectId,
  name,
  site,
  initial,
}: {
  projectId: string;
  name: string;
  site: string;
  initial: ProjectSeo;
}) {
  const router = useRouter();
  const [seo, setSeo] = useState(initial);
  const [siteUrl, setSiteUrl] = useState(site);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const [scoring, setScoring] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setSeo(initial);
  }, [initial]);

  const snap = seo.snapshot;
  const series = snap ? appendSeoHistory(seo.history, snap) : seo.history;

  function commit(next: Partial<ProjectSeo>) {
    const value = { ...seo, ...next };
    setSeo(value);
    setError(null);
    start(async () => {
      const res = await saveProjectSeo(projectId, value);
      if (!res.ok) setError(res.error);
    });
  }

  async function refreshScore() {
    setScoring(true);
    setError(null);
    try {
      const next = siteUrl.trim();
      if (next && next !== site) {
        const saved = await updateProject(projectId, { site: next });
        if (!saved.ok) {
          setError(saved.error ?? "URL non enregistrée.");
          setScoring(false);
          return;
        }
      }
      const res = await fetch("/api/projects/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      const json = (await res.json()) as { ok: boolean; error?: string; snapshot?: SeoSnapshot };
      if (!json.ok || !json.snapshot) {
        setError(json.error ?? "Score impossible.");
        return;
      }
      setSeo((cur) => ({
        ...cur,
        snapshot: json.snapshot ?? null,
        history: appendSeoHistory(cur.history, cur.snapshot),
      }));
      router.refresh();
    } catch {
      setError("Réseau coupé. Réessaie.");
    } finally {
      setScoring(false);
    }
  }

  return (
    <section id="seo" className="card-soft scroll-mt-24 p-4">
      <div className="mb-3 flex flex-wrap items-center gap-3">
        <h4 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
          <Gauge className="size-4 text-muted-foreground" aria-hidden />
          SEO
        </h4>
        <div className="ml-auto flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            disabled={scoring || !siteUrl.trim()}
            onClick={() => void refreshScore()}
            className="btn-dark inline-flex min-h-9 items-center gap-1.5 rounded-pill px-3 text-[13px] font-semibold disabled:opacity-50"
          >
            {scoring ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <RefreshCw className="size-3.5" aria-hidden />}
            {snap ? "Rescorer" : "Scorer"}
          </button>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex min-h-9 items-center gap-1 rounded-pill border border-line px-2.5 text-[13px]"
            aria-expanded={open}
          >
            Détail
            <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
          </button>
        </div>
      </div>

      <div className="grid items-center gap-6 sm:grid-cols-[148px_minmax(0,1fr)]">
        <Ring score={snap?.seo ?? 0} />
        <div className="min-w-0">
          {snap && series.length >= 2 ? (
            <ScoreArea points={series} />
          ) : snap ? (
            <ScoreBars snap={snap} />
          ) : (
            <p className="text-[13.5px] text-muted-foreground">
              Scorer le site. Google met ~20 secondes. Deux graphiques, pas plus.
            </p>
          )}
        </div>
      </div>

      {!siteUrl.trim() && !snap ? (
        <input
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          onBlur={() => {
            const next = siteUrl.trim();
            if (!next || next === site) return;
            start(async () => {
              const res = await updateProject(projectId, { site: next });
              if (!res.ok) setError(res.error ?? "URL non enregistrée.");
              else router.refresh();
            });
          }}
          placeholder="https://www.tonsite.com"
          aria-label="URL du site"
          className="mt-3 min-h-10 w-full rounded-xl border border-line bg-surface-2 px-3 text-[14px] outline-none focus:border-ink/30"
        />
      ) : null}

      {open ? (
        <div className="mt-4 border-t border-dashed border-line pt-4">
          {!siteUrl.trim() && !snap ? (
            <label className="mb-3 block">
              <span className="mono-label">URL du site</span>
              <input
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                onBlur={() => {
                  const next = siteUrl.trim();
                  if (!next || next === site) return;
                  start(async () => {
                    const res = await updateProject(projectId, { site: next });
                    if (!res.ok) setError(res.error ?? "URL non enregistrée.");
                    else router.refresh();
                  });
                }}
                placeholder="https://www.tonsite.com"
                className="mt-1.5 min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-[14px] outline-none focus:border-ink/30"
              />
            </label>
          ) : null}

          {snap ? (
            <div className="mb-4 grid gap-2 sm:grid-cols-2">
              <Bar n="SEO" v={snap.seo} />
              <Bar n="Vitesse" v={snap.performance} />
              <Bar n="Accessibilité" v={snap.accessibility} />
              <Bar n="Bonnes pratiques" v={snap.practices} />
            </div>
          ) : (
            <p className="mb-3 text-[13.5px] text-muted-foreground">Google met ~20 secondes.</p>
          )}

          {snap?.checks.length ? (
            <ul className="mb-4 grid gap-1 sm:grid-cols-2">
              {snap.checks.map((c) => (
                <li key={c.id} className="flex items-center gap-2 font-mono text-[11.5px]">
                  <span className={cn("size-1.5 rounded-full", c.ok ? "bg-st-focus" : "bg-st-fini")} aria-hidden />
                  <span className={c.ok ? "text-st-focus-ink" : "text-st-fini-ink"}>{c.label}</span>
                </li>
              ))}
            </ul>
          ) : null}

          <div className="grid gap-2 sm:grid-cols-2">
            <input
              value={seo.gaId}
              onChange={(e) => setSeo((cur) => ({ ...cur, gaId: e.target.value }))}
              onBlur={() => commit({ gaId: seo.gaId })}
              placeholder="G-XXXXXXXX"
              aria-label="ID GA4"
              className="min-h-10 rounded-xl border border-line bg-surface-2 px-3 text-[14px] outline-none focus:border-ink/30"
            />
            <input
              value={seo.gsc}
              onChange={(e) => setSeo((cur) => ({ ...cur, gsc: e.target.value }))}
              onBlur={() => commit({ gsc: seo.gsc })}
              placeholder="sc-domain:tonsite.com"
              aria-label="Search Console"
              className="min-h-10 rounded-xl border border-line bg-surface-2 px-3 text-[14px] outline-none focus:border-ink/30"
            />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 items-center gap-1.5 rounded-pill border border-line px-2.5 text-[12.5px] font-semibold hover:bg-accent-soft"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              GA4
            </a>
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-8 items-center gap-1.5 rounded-pill border border-line px-2.5 text-[12.5px] font-semibold hover:bg-accent-soft"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              GSC
            </a>
            <button
              type="button"
              disabled={pending}
              onClick={() => openAssistant(seoPrompt(name, seo))}
              className="inline-flex min-h-8 items-center rounded-pill border border-line px-2.5 text-[12.5px] font-semibold hover:bg-accent-soft"
            >
              Corriger
            </button>
          </div>
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="mt-3 text-[13px] text-st-fini-ink">
          {error}
        </p>
      ) : null}
    </section>
  );
}
