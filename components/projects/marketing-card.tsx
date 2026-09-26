"use client";

import { Megaphone } from "lucide-react";
import { useState, useTransition } from "react";
import { saveProjectMarketing } from "@/app/(app)/projets/actions";
import { openAssistant } from "@/lib/assistant/open";
import {
  MARKET_CHANNELS,
  MARKET_STUDIO,
  marketingPrompt,
  type ProjectMarketing,
} from "@/lib/projects/marketing";

export function MarketingCard({
  projectId,
  name,
  initial,
}: {
  projectId: string;
  name: string;
  initial: ProjectMarketing;
}) {
  const [m, setM] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function patch(next: Partial<ProjectMarketing>) {
    const value = { ...m, ...next };
    setM(value);
    setError(null);
    start(async () => {
      const res = await saveProjectMarketing(projectId, value);
      if (!res.ok) setError(res.error);
    });
  }

  return (
    <section id="marketing" className="card-soft scroll-mt-24 p-4 sm:p-5">
      <h4 className="mb-1 flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
        <Megaphone className="size-4 text-muted-foreground" aria-hidden />
        Marketing
      </h4>
      <p className="mb-3 text-[13px] text-muted-foreground">
        Offre, canal, visuels. Prompts prêts pour ChatGPT / le copilote.
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

      <label className="mb-4 block">
        <span className="mono-label">CTA</span>
        <input
          value={m.cta}
          onChange={(e) => patch({ cta: e.target.value })}
          placeholder="Réserver 15 min"
          className="mt-1.5 min-h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-[14px] outline-none focus:border-ink/30"
        />
      </label>

      <p className="mono-label mb-1.5">Studio</p>
      <div className="mb-3 flex flex-wrap gap-1.5">
        {MARKET_STUDIO.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => openAssistant(s.prompt(name, m.offer))}
            className="rounded-pill border border-line px-3 py-1.5 text-[13px] hover:bg-accent-soft"
          >
            {s.n}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={() => openAssistant(marketingPrompt(name, m))}
        className="btn-dark inline-flex min-h-10 items-center rounded-pill px-4 text-[13.5px] font-medium"
      >
        Écrire le post
      </button>
      {error ? (
        <p role="alert" className="mt-2 text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
    </section>
  );
}
