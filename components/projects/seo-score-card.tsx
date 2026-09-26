"use client";

import { ChevronDown, ExternalLink, Gauge, Loader2, RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveProjectSeo, updateProject } from "@/app/(app)/projets/actions";
import { openAssistant } from "@/lib/assistant/open";
import {
  seoPrompt,
  seoTone,
  type ProjectSeo,
  type SeoSnapshot,
} from "@/lib/projects/seo";
import { cn } from "@/lib/utils";

const TONE = {
  ok: "text-st-focus-ink",
  warn: "text-st-pause-ink",
  alert: "text-st-fini-ink",
} as const;

const BAR = {
  ok: "bg-st-focus",
  warn: "bg-st-pause",
  alert: "bg-st-fini",
} as const;

function Pill({ n, v }: { n: string; v: number }) {
  const tone = seoTone(v);
  return (
    <span className={cn("font-mono text-[11px] tabular-nums", TONE[tone])}>
      {n} {v}
    </span>
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
  const snap = seo.snapshot;

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
      setSeo((cur) => ({ ...cur, snapshot: json.snapshot ?? null }));
      router.refresh();
    } catch {
      setError("Réseau coupé. Réessaie.");
    } finally {
      setScoring(false);
    }
  }

  return (
    <section id="seo" className="card-soft scroll-mt-24 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <h4 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
          <Gauge className="size-4 text-muted-foreground" aria-hidden />
          SEO
        </h4>
        {snap ? (
          <span className="flex flex-wrap gap-2.5">
            <Pill n="SEO" v={snap.seo} />
            <Pill n="Vit." v={snap.performance} />
            <Pill n="A11y" v={snap.accessibility} />
            <Pill n="BP" v={snap.practices} />
          </span>
        ) : (
          <span className="text-[13px] text-muted-foreground">Pas encore scorée.</span>
        )}
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
