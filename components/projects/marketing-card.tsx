"use client";

import { Bot, Megaphone } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { saveProjectMarketing } from "@/app/(app)/projets/actions";
import { openAssistant } from "@/lib/assistant/open";
import {
  MARKET_CHANNELS,
  marketingIdeasPrompt,
  marketingPrompt,
  type ProjectMarketing,
} from "@/lib/projects/marketing";
import { producePrompt, STUDIO_TARGETS } from "@/lib/projects/studio";

export function MarketingCard({
  projectId,
  name,
  pitch,
  target,
  problem,
  site,
  figma,
  initial,
}: {
  projectId: string;
  name: string;
  pitch: string;
  target: string;
  problem: string;
  site: string;
  figma: string;
  initial: ProjectMarketing;
}) {
  const [m, setM] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    setM(initial);
  }, [initial]);

  function patch(next: Partial<ProjectMarketing>) {
    const value = { ...m, ...next };
    setM(value);
    setError(null);
    start(async () => {
      const res = await saveProjectMarketing(projectId, value);
      if (!res.ok) setError(res.error);
    });
  }

  const ctx = { id: projectId, name, offer: m.offer, post: m.post, figma };

  return (
    <section id="marketing" className="card-soft scroll-mt-24 p-4 sm:p-5">
      <h4 className="mb-1 flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
        <Megaphone className="size-4 text-muted-foreground" aria-hidden />
        Marketing
      </h4>
      <p className="mb-3 text-[13px] text-muted-foreground">
        L’IA rédige le post et l’enregistre. Ensuite seulement Canva, schéma ou Figma.
      </p>

      <label className="mb-3 block">
        <span className="mono-label">Offre en une phrase</span>
        <input
          value={m.offer}
          onChange={(e) => patch({ offer: e.target.value })}
          placeholder="On compare les outils de flotte pour les gestionnaires."
          className="mt-1.5 min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-[14px] outline-none focus:border-ink/30"
        />
      </label>

      <p className="mono-label mb-1.5">Canal</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {MARKET_CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => patch({ channel: c.id })}
            className={
              m.channel === c.id
                ? "rounded-pill bg-ink px-3 py-1.5 text-[13px] text-accent-ink"
                : "rounded-pill border border-line px-3 py-1.5 text-[13px]"
            }
          >
            {c.n}
          </button>
        ))}
      </div>

      <label className="mb-3 block">
        <span className="mono-label">Hook / premier post</span>
        <textarea
          value={m.hook}
          onChange={(e) => patch({ hook: e.target.value })}
          rows={3}
          placeholder="Les gestionnaires jonglent entre 4 outils. On en fait un."
          className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-[14px] outline-none focus:border-ink/30"
        />
      </label>

      <label className="mb-3 block">
        <span className="mono-label">CTA</span>
        <input
          value={m.cta}
          onChange={(e) => patch({ cta: e.target.value })}
          placeholder="Réserver 15 min"
          className="mt-1.5 min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-[14px] outline-none focus:border-ink/30"
        />
      </label>

      <label className="mb-4 block">
        <span className="mono-label">Post rédigé</span>
        <textarea
          value={m.post}
          onChange={(e) => patch({ post: e.target.value })}
          rows={m.post ? 5 : 3}
          placeholder="L’agent le rédige et l’enregistre ici. Canva ne s’ouvre pas sans ce texte."
          className="mt-1.5 w-full rounded-xl border border-line bg-surface-2 px-3 py-2 text-[14px] outline-none focus:border-ink/30"
        />
      </label>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            openAssistant(
              marketingIdeasPrompt({
                id: projectId,
                name,
                pitch,
                target,
                problem,
                site,
                current: m,
              }),
            )
          }
          className="btn-dark inline-flex min-h-10 items-center gap-1.5 rounded-pill px-4 text-[13.5px] font-medium"
        >
          <Bot className="size-3.5" aria-hidden />
          Préremplir
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => openAssistant(marketingPrompt({ id: projectId, name, current: m }))}
          className="inline-flex min-h-10 items-center rounded-pill border border-line px-4 text-[13.5px] font-medium hover:bg-accent-soft"
        >
          Écrire le post
        </button>
      </div>

      <p className="mono-label mb-1.5">Ensuite le visuel</p>
      <p className="mb-2 text-[13px] text-muted-foreground">
        Canva : le post est écrit d’abord, puis le brief s’ouvre.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {STUDIO_TARGETS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => openAssistant(producePrompt({ ...ctx, target: s.id }))}
            className="rounded-pill border border-line px-3 py-1.5 text-[13px] hover:bg-accent-soft"
          >
            {s.n}
          </button>
        ))}
      </div>
      {error ? (
        <p role="alert" className="mt-2 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
