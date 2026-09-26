"use client";

import { Check, CircleHelp, ExternalLink, Minus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import { saveAuditFrames } from "@/app/(app)/audit/actions";
import { CritiquePanel } from "@/components/audit/critique-panel";
import { EMPTY_CRITIQUE, normalizeCritique, type CritiqueState } from "@/lib/audit/critique";
import { cycleFrame, nextTip, normalizeFrames, scoreOf, type FrameState } from "@/lib/audit/score";
import { STATES } from "@/lib/design-data/audit";
import { FRAMES } from "@/lib/design-data/frames";
import { cn } from "@/lib/utils";

const STATE_ICON = {
  check: Check,
  minus: Minus,
  x: X,
  "help-circle": CircleHelp,
} as const;

export type SiteCard = {
  id: string;
  slug: string;
  name: string;
  site: string;
  frames: FrameState[];
  critique: CritiqueState;
};

const storageKey = (id: string) => `navpit:audit-frames:${id}`;

export function SitesBoard({ sites }: { sites: SiteCard[] }) {
  if (!sites.length) {
    return (
      <div className="card-soft flex flex-col items-center gap-3 p-8 text-center">
        <p className="text-[16px] font-semibold tracking-[-0.02em]">Aucun site à scorer</p>
        <p className="max-w-[44ch] text-[14.5px] leading-relaxed text-muted-foreground">
          Ajoute l’URL de ta landing sur la fiche projet. Ensuite tu notes les 12 frames
          et tu vises 12/12.
        </p>
        <Link
          href="/projets"
          className="btn-dark inline-flex min-h-11 items-center rounded-pill px-5 text-[14px] font-medium"
        >
          Ouvrir les projets
        </Link>
      </div>
    );
  }

  return (
    <div className="sites">
      {sites.map((s) => (
        <SiteScore key={s.id} site={s} />
      ))}
    </div>
  );
}

function SiteScore({ site }: { site: SiteCard }) {
  const [frames, setFrames] = useState(() => normalizeFrames(site.frames));
  const critique = useMemo(
    () => normalizeCritique(site.critique ?? EMPTY_CRITIQUE),
    [site.critique],
  );
  const [open, setOpen] = useState<number | null>(null);
  const [, start] = useTransition();
  const tip = useMemo(() => nextTip(frames), [frames]);
  const ok = scoreOf(frames);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(site.id));
      if (raw) setFrames(normalizeFrames(JSON.parse(raw)));
    } catch {}
  }, [site.id]);

  function mark(i: number) {
    setFrames((cur) => {
      const next = [...cur];
      next[i] = cycleFrame(cur[i] ?? "unk");
      try {
        localStorage.setItem(storageKey(site.id), JSON.stringify(next));
      } catch {}
      start(() => {
        void saveAuditFrames(site.id, next);
      });
      return next;
    });
    setOpen(i);
  }

  return (
    <article className="site">
      <div className="site-h">
        <div>
          <h3>
            <Link href={`/projets/${site.slug}`} className="hover:underline">
              {site.name}
            </Link>
          </h3>
          <a href={site.site} target="_blank" rel="noopener noreferrer">
            {site.site.replace(/^https?:\/\//, "")}
          </a>
        </div>
        <div className="score">
          {ok}
          <small>/ 12 frames OK</small>
        </div>
      </div>

      <CritiquePanel
        projectId={site.id}
        name={site.name}
        site={site.site}
        initial={critique}
      />

      {tip ? (
        <div className="mx-4 mb-4 rounded-[14px] border border-line bg-surface-2 p-4">
          <p className="mono-label">Prochain gain de score</p>
          <p className="mt-1 text-[16px] font-semibold tracking-[-0.02em]">
            {String(tip.index + 1).padStart(2, "0")} {tip.name}
          </p>
          <p className="mt-1 text-[14px] leading-relaxed text-ink/80">{tip.rule}</p>
          <p className="mt-2 text-[13.5px] text-muted-foreground">
            À éviter : {tip.err}
          </p>
          <p className="mt-1 text-[13.5px] text-ink/75">Exemple : {tip.ex}</p>
          <button
            type="button"
            onClick={() => mark(tip.index)}
            className="btn-dark mt-3 inline-flex min-h-10 items-center rounded-pill px-3.5 text-[13.5px] font-semibold"
          >
            Marquer cette frame
          </button>
        </div>
      ) : (
        <div className="mx-4 mb-4 rounded-[14px] border border-line bg-st-focus-soft px-4 py-3 text-[14px] font-medium text-st-focus-ink">
          12/12. Garde les chiffres vrais et revérifie après chaque mise en ligne.
        </div>
      )}

      <div className="site-b">
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Les 12 frames · clique pour scorer
          </div>
          {FRAMES.map((f, i) => {
            const state = frames[i] ?? "unk";
            const [bg, color, icon, label] = STATES[state];
            const active = open === i;
            return (
              <div key={f.n}>
                <button
                  type="button"
                  onClick={() => mark(i)}
                  className={cn(
                    "st w-full text-left",
                    active && "rounded-lg bg-accent-soft",
                  )}
                >
                  <span className="dot" style={{ background: bg, color }}>
                    {(() => {
                      const Dot = STATE_ICON[icon as keyof typeof STATE_ICON] ?? CircleHelp;
                      return <Dot className="size-3.5" aria-hidden />;
                    })()}
                  </span>
                  {String(i + 1).padStart(2, "0")} {f.n}
                  <span style={{ marginLeft: "auto", color, font: "500 12px var(--f-mono)" }}>
                    {label}
                  </span>
                </button>
                {active ? (
                  <div className="mb-2 ml-8 border-l border-line pl-3 text-[13px] leading-relaxed text-muted-foreground">
                    <p className="text-ink/80">{f.role}</p>
                    <p className="mt-1">{f.rule}</p>
                    <p className="mt-1">À éviter : {f.err}</p>
                    <p className="mt-1">Exemple : {f.ex}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        <div>
          <div className="eyebrow" style={{ marginBottom: 6 }}>
            Checklist avant mise en ligne
          </div>
          {FRAMES.filter((_, i) => frames[i] !== "ok")
            .slice(0, 4)
            .map((f, i) => (
              <div key={f.n} className="fix">
                <span className="n">{i + 1}</span>
                <span>{f.rule}</span>
              </div>
            ))}
          {ok === 12 ? (
            <p className="text-[13.5px] text-muted-foreground">
              Plus rien de bloquant. Recocher après le prochain deploy.
            </p>
          ) : null}
          <a
            href={site.site}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-[13.5px] font-medium"
          >
            <ExternalLink className="size-3.5" aria-hidden />
            Ouvrir le site
          </a>
        </div>
      </div>
    </article>
  );
}
