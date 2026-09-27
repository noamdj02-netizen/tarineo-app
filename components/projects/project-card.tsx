"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Bot,
  Check,
  Loader2,
  Maximize2,
  MoreHorizontal,
  Pencil,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useOptimistic, useState, useTransition } from "react";
import { updateProject } from "@/app/(app)/projets/actions";
import { EASE } from "@/components/motion/reveal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { STAGES } from "@/lib/design-data/resources";
import { openAssistant } from "@/lib/assistant/open";
import type { CardSignal } from "@/lib/projects/coach";
import { NEXT_PRIORITY_LABELS, type NextPriority } from "@/lib/projects/next-meta";
import type { ProjectPatch, ProjectSummary } from "@/lib/projects/types";
import { whyNextAction } from "@/lib/projects/why-next";
import { cn } from "@/lib/utils";
import { NextAction } from "./next-action";
import { ProjectLinks } from "./project-links";
import { ProjectProgress } from "./project-progress";
import { StageBar } from "./stage-bar";
import { StatusBadge, toStatus } from "./status-badge";

export function askNextActionPrompt(p: ProjectSummary) {
  const stage = STAGES[Math.min(6, Math.max(1, p.stage)) - 1];
  const block = p.blocked
    ? `Blocage : ${p.blockerReason?.trim() || "oui"}.`
    : "Aucun blocage déclaré.";
  return [
    `Contexte projet « ${p.name} » (étape ${p.stage}/6 · ${stage}).`,
    p.description ? `Description : ${p.description}` : null,
    `Prochaine action : ${p.next || "(vide)"}.`,
    `Progression : ${p.featuresDone}/${p.featuresTotal} fonctions, ${p.tasksDone}/${p.tasksTotal} tâches.`,
    block,
    "",
    "Que dois-je faire ensuite pour avancer concrètement ? Si je suis bloqué, aide-moi à débloquer. Réponse courte, étapes actionnables.",
  ]
    .filter(Boolean)
    .join("\n");
}

const RAIL: Record<CardSignal, string> = {
  ok: "shadow-[inset_4px_0_0_var(--color-st-focus),inset_-4px_0_0_var(--color-st-focus)]",
  alert: "shadow-[inset_4px_0_0_var(--color-st-fini),inset_-4px_0_0_var(--color-st-fini)]",
  warn: "shadow-[inset_4px_0_0_var(--color-st-pause),inset_-4px_0_0_var(--color-st-pause)]",
  mute: "",
};

export function ProjectCard({
  project,
  index,
  preview = false,
  signal = "mute",
}: {
  project: ProjectSummary;
  index: number;
  /** Landing : même carte, sans édition ni lien vers l’app. */
  preview?: boolean;
  signal?: CardSignal;
}) {
  const reduce = useReducedMotion();
  const [editing, setEditing] = useState(false);
  const [quickEdit, setQuickEdit] = useState<"next" | "meta" | "block" | null>(null);
  const [pending, startTransition] = useTransition();
  const [p, applyPatch] = useOptimistic(project, (cur, patch: ProjectPatch) => ({
    ...cur,
    ...patch,
  }));

  function patch(partial: ProjectPatch) {
    startTransition(async () => {
      applyPatch(partial);
      await updateProject(p.id, partial);
    });
  }

  const why = whyNextAction(p);

  return (
    <motion.article
      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
      whileHover={editing || reduce ? undefined : { y: -3 }}
      className={cn(
        "card-soft group relative flex flex-col gap-4 p-5 transition-shadow duration-300 ease-out-soft hover:shadow-lift",
        RAIL[signal],
      )}
    >
      {editing ? (
        <EditForm project={p} onDone={() => setEditing(false)} applyPatch={applyPatch} />
      ) : (
        <>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-[22px] leading-tight font-semibold tracking-[-0.03em]">
                <Link
                  href={preview ? "/inscription" : `/projets/${p.slug}`}
                  prefetch={false}
                  className="outline-none after:absolute after:inset-0 after:rounded-card focus-visible:after:outline-2 focus-visible:after:outline-offset-2 focus-visible:after:outline-ink"
                >
                  {p.name}
                </Link>
              </h3>
              {p.description ? (
                <p className="mt-1 text-[13.5px] leading-snug text-muted-foreground">{p.description}</p>
              ) : null}
            </div>
            <StatusBadge status={p.status} />
          </div>

          <StageBar stage={p.stage} theme={p.theme} />

          <NextAction
            text={p.next}
            dueDate={p.nextDueDate}
            priority={p.nextPriority}
            estimatedMinutes={p.nextEstimatedMinutes}
            why={why}
            menu={
              preview ? null : (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    className="relative z-20 inline-flex size-7 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-surface/80 hover:text-ink"
                    aria-label="Actions sur la prochaine action"
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="min-w-[200px]">
                    <DropdownMenuItem onClick={() => setQuickEdit("next")}>
                      {p.next ? "Modifier la prochaine action" : "Définir la prochaine action"}
                    </DropdownMenuItem>
                    {p.next ? (
                      <DropdownMenuItem
                        onClick={() =>
                          patch({
                            next: "",
                            nextDueDate: null,
                            nextPriority: null,
                            nextEstimatedMinutes: null,
                          })
                        }
                      >
                        <Check className="size-3.5" aria-hidden />
                        Marquer comme terminée
                      </DropdownMenuItem>
                    ) : null}
                    <DropdownMenuItem onClick={() => setQuickEdit("meta")}>
                      Deadline / durée / priorité
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setQuickEdit("block")}>
                      {p.blocked ? "Modifier le blocage" : "Ajouter un blocage"}
                    </DropdownMenuItem>
                    {p.blocked ? (
                      <DropdownMenuItem onClick={() => patch({ blocked: false, blockerReason: "" })}>
                        Supprimer le blocage
                      </DropdownMenuItem>
                    ) : null}
                  </DropdownMenuContent>
                </DropdownMenu>
              )
            }
          />

          {quickEdit && !preview ? (
            <QuickEdit
              mode={quickEdit}
              project={p}
              pending={pending}
              onClose={() => setQuickEdit(null)}
              onSave={(partial) => {
                patch(partial);
                setQuickEdit(null);
              }}
            />
          ) : null}

          <ProjectProgress
            featuresDone={p.featuresDone}
            featuresTotal={p.featuresTotal}
            tasksDone={p.tasksDone}
            tasksTotal={p.tasksTotal}
          />

          <ProjectLinks site={p.site} github={p.github} figma={p.figma} notion={p.notion} />

          <p
            className={cn(
              "relative z-10 flex items-start gap-2 text-[13px] leading-snug transition-colors duration-200",
              p.blocked ? "font-medium text-st-pause" : "text-muted-foreground",
            )}
          >
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {p.blocked
              ? `Bloqué · ${p.blockerReason?.trim() || "Raison non précisée"}`
              : "Aucun blocage"}
          </p>

          <div className="relative z-10 mt-auto flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <Link
              href={preview ? "/inscription" : `/projets/${p.slug}`}
              prefetch={false}
              className="btn-dark inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl px-3.5 text-[13.5px] font-semibold sm:w-auto"
            >
              <Maximize2 className="size-4" aria-hidden />
              Ouvrir la page
            </Link>
            {preview ? null : (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[13.5px] font-semibold hover:bg-accent-soft sm:w-auto"
              >
                <Pencil className="size-4" aria-hidden />
                Modifier
              </button>
            )}
            {preview ? (
              <Link
                href="/inscription"
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[13.5px] font-semibold hover:bg-accent-soft sm:w-auto"
              >
                <Bot className="size-4" aria-hidden />
                Demander à l’IA
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => openAssistant(askNextActionPrompt(p), undefined, p.id)}
                className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-[13.5px] font-semibold hover:bg-accent-soft sm:w-auto"
              >
                <Bot className="size-4" aria-hidden />
                Demander à l’IA
              </button>
            )}
          </div>
        </>
      )}
    </motion.article>
  );
}

function QuickEdit({
  mode,
  project: p,
  pending,
  onClose,
  onSave,
}: {
  mode: "next" | "meta" | "block";
  project: ProjectSummary;
  pending: boolean;
  onClose: () => void;
  onSave: (patch: ProjectPatch) => void;
}) {
  return (
    <form
      className="relative z-20 space-y-3 rounded-2xl border border-line bg-surface p-3 shadow-soft"
      onSubmit={(e) => {
        e.preventDefault();
        const f = new FormData(e.currentTarget);
        if (mode === "next") {
          onSave({ next: String(f.get("next") ?? "") });
          return;
        }
        if (mode === "block") {
          const reason = String(f.get("blockerReason") ?? "").trim();
          onSave({ blocked: true, blockerReason: reason });
          return;
        }
        const due = String(f.get("nextDueDate") ?? "").trim();
        const pri = String(f.get("nextPriority") ?? "");
        const minsRaw = String(f.get("nextEstimatedMinutes") ?? "").trim();
        onSave({
          nextDueDate: due || null,
          nextPriority: (pri || null) as NextPriority | null,
          nextEstimatedMinutes: minsRaw ? Number(minsRaw) : null,
        });
      }}
    >
      {mode === "next" ? (
        <label className={labelCls}>
          Prochaine action
          <textarea name="next" rows={2} defaultValue={p.next} className={field} autoFocus />
        </label>
      ) : null}
      {mode === "meta" ? (
        <div className="grid gap-3 sm:grid-cols-3">
          <label className={labelCls}>
            Deadline
            <input name="nextDueDate" type="date" defaultValue={p.nextDueDate ?? ""} className={field} />
          </label>
          <label className={labelCls}>
            Durée (min)
            <input
              name="nextEstimatedMinutes"
              type="number"
              min={5}
              max={1440}
              step={5}
              defaultValue={p.nextEstimatedMinutes ?? ""}
              placeholder="30"
              className={field}
            />
          </label>
          <label className={labelCls}>
            Priorité
            <select name="nextPriority" defaultValue={p.nextPriority ?? ""} className={field}>
              <option value="">—</option>
              {(Object.keys(NEXT_PRIORITY_LABELS) as NextPriority[]).map((k) => (
                <option key={k} value={k}>
                  {NEXT_PRIORITY_LABELS[k].replace("Priorité ", "")}
                </option>
              ))}
            </select>
          </label>
        </div>
      ) : null}
      {mode === "block" ? (
        <label className={labelCls}>
          Raison du blocage
          <input
            name="blockerReason"
            defaultValue={p.blockerReason}
            placeholder="En attente du retour client"
            className={field}
            autoFocus
          />
        </label>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="btn-dark inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-[13px] font-semibold disabled:opacity-60"
        >
          {pending ? <Loader2 className="size-3.5 animate-spin" /> : null}
          Enregistrer
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-9 items-center rounded-xl border border-line px-3 text-[13px] font-semibold hover:bg-accent-soft"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

const field =
  "w-full rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-[14px] text-ink outline-none focus:border-ink/40 focus:bg-surface";
const labelCls =
  "flex flex-col gap-1.5 font-mono text-[10.5px] tracking-[0.1em] text-muted-foreground uppercase";

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
    const due = String(f.get("nextDueDate") ?? "").trim();
    const pri = String(f.get("nextPriority") ?? "");
    const minsRaw = String(f.get("nextEstimatedMinutes") ?? "").trim();
    const blocked = f.get("blocked") === "on";
    const patch: ProjectPatch = {
      stage: Number(f.get("stage")),
      status: toStatus(f.get("status")),
      next: String(f.get("next") ?? ""),
      nextDueDate: due || null,
      nextPriority: (pri || null) as NextPriority | null,
      nextEstimatedMinutes: minsRaw ? Number(minsRaw) : null,
      blocked,
      blockerReason: blocked ? String(f.get("blockerReason") ?? "") : "",
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
            <option value="fini">Fini</option>
          </select>
        </label>
      </div>
      <label className={labelCls}>
        Prochaine action
        <textarea name="next" rows={2} defaultValue={p.next} className={field} />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className={labelCls}>
          Deadline
          <input name="nextDueDate" type="date" defaultValue={p.nextDueDate ?? ""} className={field} />
        </label>
        <label className={labelCls}>
          Durée (min)
          <input
            name="nextEstimatedMinutes"
            type="number"
            min={5}
            max={1440}
            step={5}
            defaultValue={p.nextEstimatedMinutes ?? ""}
            className={field}
          />
        </label>
        <label className={labelCls}>
          Priorité
          <select name="nextPriority" defaultValue={p.nextPriority ?? ""} className={field}>
            <option value="">—</option>
            {(Object.keys(NEXT_PRIORITY_LABELS) as NextPriority[]).map((k) => (
              <option key={k} value={k}>
                {NEXT_PRIORITY_LABELS[k].replace("Priorité ", "")}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="flex items-center gap-2 text-[13.5px] text-ink">
        <input name="blocked" type="checkbox" defaultChecked={p.blocked} className="size-4 rounded border-line" />
        Projet bloqué
      </label>
      <label className={labelCls}>
        Raison du blocage
        <input name="blockerReason" defaultValue={p.blockerReason} className={field} />
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
