"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { emitEvent } from "@/lib/analytics/client";
import { defaultValues, landingBrief, promptForTool } from "@/lib/heroes/apply";
import {
  COPY_TOOLS,
  HERO_CATEGORY_LABELS,
  HERO_LEVEL_LABELS,
  type CopyTool,
  type HeroCard,
} from "@/lib/heroes/types";
import { AttachToProject, type AttachTarget } from "@/components/kit/attach-to-project";
import { HeroFrame } from "./hero-capture";
import { HeroPreview } from "./previews";

export function HeroStudio({
  hero,
  canUnlock,
  projects,
}: {
  hero: HeroCard;
  canUnlock: boolean;
  projects: AttachTarget[];
}) {
  const [values, setValues] = useState(() => defaultValues(hero));
  const [tool, setTool] = useState<CopyTool>("Cursor");
  const [copied, setCopied] = useState(false);
  const locked = hero.acces === "pro" && !canUnlock;

  const brief = useMemo(() => landingBrief(hero, values), [hero, values]);
  const finalPrompt = useMemo(() => promptForTool(tool, brief), [tool, brief]);

  async function copy() {
    if (locked) return;
    try {
      await navigator.clipboard.writeText(finalPrompt);
      setCopied(true);
      emitEvent("hero_prompt_copied", {
        feature: "heros",
        properties: { hero_id: hero.id, outil: tool },
      });
      setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      <HeroFrame values={values}>
        <HeroPreview slug={hero.slug} values={values} />
      </HeroFrame>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <form className="flex flex-col gap-3">
          <p className="font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
            Variables
          </p>
          {hero.variables.map((v) => (
            <label key={v.key} className="flex flex-col gap-1 text-[13px]">
              <span className="font-mono text-[11px] text-muted-foreground">{v.label}</span>
              {v.type === "couleur" ? (
                <span className="flex items-center gap-2">
                  <input
                    type="color"
                    value={values[v.key] || "#111111"}
                    onChange={(e) => setValues((s) => ({ ...s, [v.key]: e.target.value }))}
                    className="size-10 rounded-lg border border-line"
                  />
                  <input
                    value={values[v.key] ?? ""}
                    onChange={(e) => setValues((s) => ({ ...s, [v.key]: e.target.value }))}
                    className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3"
                  />
                </span>
              ) : (
                <input
                  type={v.type === "nombre" ? "text" : v.type === "url" ? "url" : "text"}
                  value={values[v.key] ?? ""}
                  onChange={(e) => setValues((s) => ({ ...s, [v.key]: e.target.value }))}
                  className="min-h-11 rounded-xl border border-line bg-surface-2 px-3"
                />
              )}
            </label>
          ))}
        </form>

        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {locked ? (
              <Link href="/abonnement" className="btn-dark inline-flex min-h-10 items-center rounded-pill px-3.5 text-[13px]">
                Débloquer cette landing
              </Link>
            ) : (
              <AttachToProject
                name={hero.nom}
                landingSlug={hero.slug}
                landingValues={values}
                projects={projects}
                variant="primary"
              />
            )}
            <p className="text-[13px] text-muted-foreground">
              Puis envoie le projet à Cursor, Claude ou au copilote.
            </p>
          </div>
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {COPY_TOOLS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTool(t)}
                className={
                  tool === t
                    ? "rounded-pill bg-ink px-3 py-1.5 text-[13px] text-accent-ink"
                    : "rounded-pill border border-line px-3 py-1.5 text-[13px]"
                }
              >
                {t}
              </button>
            ))}
            <button
              type="button"
              onClick={copy}
              disabled={locked}
              className="ml-auto min-h-10 rounded-pill border border-line px-4 text-[13px] disabled:opacity-40"
            >
              {copied ? "Copié" : "Copier le prompt"}
            </button>
          </div>
          <p className="mb-2 font-mono text-[11px] text-muted-foreground">
            {hero.id} · {HERO_CATEGORY_LABELS[hero.categorie]} · {HERO_LEVEL_LABELS[hero.niveau]} ·{" "}
            {hero.poids}
          </p>
          <div className="relative">
            <pre className="max-h-[28rem] overflow-auto rounded-card border border-line bg-surface-2 p-4 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap">
              {finalPrompt}
            </pre>
            {locked ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-card bg-surface/70 backdrop-blur-sm">
                <p className="text-[15px] font-semibold">Hero Pro</p>
                <p className="max-w-[36ch] text-center text-[13.5px] text-muted-foreground">
                  Le prompt se débloque avec un abonnement.
                </p>
                <Link href="/abonnement" className="btn-dark min-h-11 rounded-pill px-4 text-[14px]">
                  Voir les plans
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
