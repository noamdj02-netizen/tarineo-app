"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Bot, Layers, ListChecks, Loader2, Maximize2, Pencil, Save } from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { updateProject } from "@/app/(app)/projets/actions";
import { EASE } from "@/components/motion/reveal";
import { STAGES } from "@/lib/design-data/resources";
import type { ProjectPatch, ProjectSummary } from "@/lib/projects/types";
import { NextAction } from "./next-action";
import { ProjectLinks } from "./project-links";
import { StageBar } from "./stage-bar";
import { StatusBadge } from "./status-badge";

export function askNextActionPrompt(name: string) {
  return `Pour ${name} : quelle est la meilleure prochaine action cette semaine, et pourquoi ? Donne 3 étapes concrètes.`;
}

export function ProjectCard({ project, index }: { project: ProjectSummary; index: number }) {
  const reduce = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [p, applyPatch] = useOptimistic(project, (cur, patch: ProjectPatch) => ({
    ...cur,
    ...patch,
  }));

  return (
    <motion.article
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
      whileHover={editing || reduce ? undefined : { y: -3 }}
      className="card-soft group relative flex flex-col gap-4 p-5 transition-shadow duration-300 ease-out-soft hover:shadow-lift"
    >
      {editing ? (
        <EditForm project={p} onDone={() => setEditing(false)} applyPatch={applyPatch} />
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[22px] leading-tight font-semibold tracking-[-0.03em]">
                {/* lien étiré : toute la carte ouvre la fiche */}
                <Link
                  href={`/projets/${p.slug}`}
                  className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ink"
                >
                  {p.name}
                </Link>
              </h3>
              {p.description ? (
                <p className="mt-1 text-[13.5px] leading-snug text-muted">{p.description}</p>
              ) : null}
            </div>
            <StatusBadge status={p.status} />
          </div>

          <StageBar stage={p.stage} theme={p.theme} />
          <NextAction text={p.next} />
          <ProjectLinks site={p.site} github={p.github} figma={p.figma} notion={p.notion} />

          {p.featuresTotal || p.tasksTotal ? (
            <div className="flex flex-wrap gap-4 font-mono text-[11px] text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Layers className="size-3.5" aria-hidden />
                {p.featuresDone}/{p.featuresTotal} fonctions faites
              </span>
              <span className="inline-flex items-center gap-1.5">
                <ListChecks className="size-3.5" aria-hidden />
                {p.tasksDone}/{p.tasksTotal} tâches
              </span>
            </div>
          ) : null}

          <div className="relative z-10 mt-auto flex flex-wrap gap-2">
            <Link
              href={`/projets/${p.slug}`}
              className="btn-dark inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-[13.5px] font-semibold"
            >
              <Maximize2 className="size-4" aria-hidden />
              Voir le détail
            </Link>
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[13.5px] font-semibold hover:bg-accent-soft"
            >
              <Pencil className="size-4" aria-hidden />
              Modifier
            </button>
            <Link
              href={`/assistant?${new URLSearchParams({ q: askNextActionPrompt(p.name) })}`}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[13.5px] font-semibold hover:bg-accent-soft"
            >
              <Bot className="size-4" aria-hidden />
              Demander à l’IA
            </Link>
          </div>
        </>
      )}
    </motion.article>
  );
}

const field =
  "w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-[14px] text-ink outline-none focus:border-ink/40 focus:bg-surface";
const labelCls =
  "flex flex-col gap-1.5 font-mono text-[10.5px] tracking-[0.1em] text-muted uppercase";

function EditForm({
  project: p,
  onDone,
  applyPatch,
}: {
  project: ProjectSummary;
  onDone: () => void;
  applyPatch: (patch: ProjectPatch) => void;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const patch: ProjectPatch = {
      stage: Number(f.get("stage")),
      status: f.get("status") === "focus" ? "focus" : "pause",
      next: String(f.get("next") ?? ""),
      site: String(f.get("site") ?? ""),
      github: String(f.get("github") ?? ""),
      figma: String(f.get("figma") ?? ""),
      notion: String(f.get("notion") ?? ""),
    };
    setError(null);
    startTransition(async () => {
      applyPatch(patch);
      const res = await updateProject(p.id, patch);
      if (res.ok) onDone();
      else setError("Échec, réessaie.");
    });
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <h3 className="text-[22px] leading-tight font-semibold tracking-[-0.03em]">{p.name}</h3>
      <div className="grid grid-cols-2 gap-3">
        <label className={labelCls}>
          Étape
          <select name="stage" defaultValue={p.stage} className={field}>
            {STAGES.map((s, i) => (
              <option key={s} value={i + 1}>
                {i + 1}. {s}
              </option>
            ))}
          </select>
        </label>
        <label className={labelCls}>
          Statut
          <select name="status" defaultValue={p.status} className={field}>
            <option value="focus">Focus</option>
            <option value="pause">En pause</option>
          </select>
        </label>
      </div>
      <label className={labelCls}>
        Prochaine action
        <textarea name="next" rows={2} defaultValue={p.next} className={field} />
      </label>
      <label className={labelCls}>
        Site
        <input name="site" type="url" defaultValue={p.site} className={field} />
      </label>
      <label className={labelCls}>
        GitHub
        <input name="github" type="url" defaultValue={p.github} className={field} />
      </label>
      <label className={labelCls}>
        Figma
        <input
          name="figma"
          type="url"
          defaultValue={p.figma}
          placeholder="Colle le lien du fichier Figma"
          className={field}
        />
      </label>
      <label className={labelCls}>
        Notion
        <input name="notion" type="url" defaultValue={p.notion} className={field} />
      </label>
      {error ? (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-dark inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 text-[13.5px] font-semibold disabled:opacity-60"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Save className="size-4" aria-hidden />
          )}
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onDone}
          className="inline-flex min-h-10 items-center rounded-xl border border-line bg-surface px-3.5 text-[13.5px] font-semibold hover:bg-accent-soft"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}
