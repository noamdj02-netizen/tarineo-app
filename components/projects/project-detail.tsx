"use client";

import {
  Bot,
  Code,
  Euro,
  History,
  Layers,
  ListChecks,
  NotebookPen,
  Plus,
  Target,
  TriangleAlert,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useOptimistic, useRef, useState, useTransition } from "react";
import {
  addFeature,
  addLog,
  addTask,
  deleteFeature,
  deleteTask,
  setFeatureStatus,
  toggleTask,
  updateProject,
} from "@/app/(app)/projets/actions";
import { Illustration } from "@/components/illustration";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import type { IllustrationName } from "@/lib/illustrations";
import {
  FEATURE_LABELS,
  FEATURE_ORDER,
  formatFrDate,
  nextFeatureStatus,
  type Feature,
  type FeatureStatus,
  type LogEntry,
  type ProjectFull,
  type Task,
} from "@/lib/projects/types";
import { cn } from "@/lib/utils";
import { NextAction } from "./next-action";
import { ProjectLinks } from "./project-links";
import { StageBar } from "./stage-bar";

type Change =
  | { type: "feature-status"; id: string; status: FeatureStatus }
  | { type: "feature-add"; feature: Feature }
  | { type: "feature-del"; id: string }
  | { type: "task-toggle"; id: string; done: boolean }
  | { type: "task-add"; task: Task }
  | { type: "task-del"; id: string }
  | { type: "log-add"; entry: LogEntry };

function reduce(p: ProjectFull, c: Change): ProjectFull {
  switch (c.type) {
    case "feature-status":
      return {
        ...p,
        features: p.features.map((f) => (f.id === c.id ? { ...f, status: c.status } : f)),
      };
    case "feature-add":
      return { ...p, features: [...p.features, c.feature] };
    case "feature-del":
      return { ...p, features: p.features.filter((f) => f.id !== c.id) };
    case "task-toggle":
      return { ...p, tasks: p.tasks.map((t) => (t.id === c.id ? { ...t, done: c.done } : t)) };
    case "task-add":
      return { ...p, tasks: [...p.tasks, c.task] };
    case "task-del":
      return { ...p, tasks: p.tasks.filter((t) => t.id !== c.id) };
    case "log-add":
      return { ...p, log: [c.entry, ...p.log] };
  }
}

/** Nuances de gris des statuts (Mono Lead) */
const STATUS_STYLE: Record<FeatureStatus, string> = {
  fait: "bg-ink text-accent-ink",
  encours: "bg-accent-2 text-accent-ink",
  verif: "border border-dashed border-ink/50 text-ink bg-surface",
  afaire: "border border-line text-muted bg-surface",
};
const STATUS_BAR: Record<FeatureStatus, string> = {
  fait: "bg-ink",
  encours: "bg-accent-2",
  verif: "bg-ink/25",
  afaire: "bg-line",
};

export function bilanPrompt(name: string) {
  return `Fais-moi le bilan complet du projet ${name} : où j’en suis, ce qui bloque, et les 3 actions prioritaires cette semaine pour avancer vers la première vente.`;
}

function todayIso() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function ProjectDetail({ project }: { project: ProjectFull }) {
  const [p, apply] = useOptimistic(project, reduce);
  const [, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  /** Change l'écran tout de suite, puis enregistre. En cas d'échec, React remet l'état serveur. */
  function mutate(change: Change, save: () => Promise<{ ok: boolean }>) {
    setError(null);
    startTransition(async () => {
      apply(change);
      const res = await save();
      if (!res.ok) setError("Pas enregistré. Vérifie ta connexion et réessaie.");
    });
  }

  const F = p.features;
  const T = p.tasks;
  const count = (s: FeatureStatus) => F.filter((f) => f.status === s).length;
  const pct = F.length ? Math.round((count("fait") / F.length) * 100) : 0;
  const business = Object.entries(p.business ?? {});

  return (
    <RevealGroup stagger={0.05} className="flex flex-col gap-3">
      <Reveal>
        <Box>
          <p className="mb-4 text-[15.5px] leading-relaxed">{p.pitch || p.description}</p>
          <StageBar stage={p.stage} theme={p.theme} />
          <div className="mt-4 flex flex-col gap-3">
            {p.next ? (
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <NextAction text={p.next} />
                </div>
                <Illustration name="dashboard-deadline" className="hidden size-14 sm:block" />
              </div>
            ) : (
              <ArtNote art="empty-pause-cafe">
                Pas de prochaine action. Demande un bilan IA pour la choisir.
              </ArtNote>
            )}
            <div className="flex flex-wrap items-center gap-1.5">
              <ProjectLinks site={p.site} github={p.github} figma={p.figma} notion={p.notion} />
              <Link
                href={`/assistant?${new URLSearchParams({ q: bilanPrompt(p.name) })}`}
                className="btn-dark inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] font-medium"
              >
                <Bot className="size-3.5" aria-hidden />
                Bilan IA
              </Link>
            </div>
          </div>
        </Box>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2">
        <Reveal>
          <Box icon={Target} title="Pour qui, quel problème" className="h-full">
            <KV rows={[["Cible", p.target || "—"]]} />
            {p.problem ? <p className="mt-2 text-[14px] leading-relaxed">{p.problem}</p> : null}
          </Box>
        </Reveal>
        <Reveal>
          <Box icon={Euro} title="Business" className="h-full">
            {business.length ? (
              <KV rows={business} />
            ) : (
              <p className="text-[13.5px] text-muted">À compléter</p>
            )}
          </Box>
        </Reveal>
      </div>

      <Reveal>
        <Box icon={Layers} title={`Ce qu’il y a dans l’app · ${pct} % fait`}>
          <div
            className="flex h-2.5 overflow-hidden rounded-pill bg-line"
            role="img"
            aria-label={`${count("fait")} faites, ${count("encours")} en cours, ${count("verif")} à vérifier, ${count("afaire")} à faire`}
          >
            {(["fait", "encours", "verif"] as const).map((s) => (
              <i
                key={s}
                className={cn(
                  "block h-full transition-[width] duration-500 ease-out-soft",
                  STATUS_BAR[s],
                )}
                style={{ width: `${F.length ? (count(s) / F.length) * 100 : 0}%` }}
              />
            ))}
          </div>
          <div className="mt-2.5 flex flex-wrap gap-3 font-mono text-[11px] text-muted">
            {FEATURE_ORDER.map((s) => (
              <span key={s} className="inline-flex items-center gap-1.5">
                <b className={cn("inline-block size-2.5 rounded-[3px]", STATUS_BAR[s])} />
                {FEATURE_LABELS[s]} · {count(s)}
              </span>
            ))}
          </div>
          <p className="mt-3 mb-2.5 text-[13px] text-muted">
            Touche un statut pour le changer (À faire → En cours → Fait → À vérifier).
          </p>
          <ul className="flex flex-col gap-1.5">
            {F.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-2 rounded-xl bg-surface-2 py-1.5 pr-1.5 pl-3 text-[14px]"
              >
                <span className="min-w-0 flex-1">{f.title}</span>
                <button
                  type="button"
                  onClick={() => {
                    const status = nextFeatureStatus(f.status);
                    mutate({ type: "feature-status", id: f.id, status }, () =>
                      setFeatureStatus(p.id, f.id, status),
                    );
                  }}
                  aria-label={`${f.title} : ${FEATURE_LABELS[f.status]}. Changer le statut`}
                  className={cn(
                    "min-h-9 min-w-[92px] rounded-pill px-3 font-mono text-[10.5px] font-medium tracking-[0.06em] whitespace-nowrap uppercase transition-colors duration-300",
                    STATUS_STYLE[f.status],
                  )}
                >
                  {FEATURE_LABELS[f.status]}
                </button>
                <ConfirmDelete
                  label={`Supprimer ${f.title}`}
                  onConfirm={() =>
                    mutate({ type: "feature-del", id: f.id }, () => deleteFeature(p.id, f.id))
                  }
                />
              </li>
            ))}
          </ul>
          <AddRow
            placeholder="Ajouter une fonctionnalité"
            onAdd={(title) => {
              const feature: Feature = {
                id: crypto.randomUUID(),
                title,
                status: "afaire",
                position: F.length,
              };
              mutate({ type: "feature-add", feature }, () => addFeature(p.id, title, feature.id));
            }}
          />
        </Box>
      </Reveal>

      <Reveal>
        <Box icon={ListChecks} title={`Tâches · ${T.filter((t) => t.done).length}/${T.length}`}>
          <ul>
            {T.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-3 border-b border-dashed border-line py-1 last:border-b-0"
              >
                <label className="flex min-h-11 flex-1 cursor-pointer items-center gap-3 text-[14px]">
                  <input
                    type="checkbox"
                    checked={t.done}
                    onChange={(e) => {
                      const done = e.target.checked;
                      mutate({ type: "task-toggle", id: t.id, done }, () =>
                        toggleTask(p.id, t.id, done),
                      );
                    }}
                    className="size-[18px] flex-none accent-ink"
                  />
                  <span className={cn(t.done && "text-muted line-through")}>{t.title}</span>
                </label>
                <ConfirmDelete
                  label={`Supprimer ${t.title}`}
                  onConfirm={() =>
                    mutate({ type: "task-del", id: t.id }, () => deleteTask(p.id, t.id))
                  }
                />
              </li>
            ))}
          </ul>
          {T.length === 0 ? (
            <ArtNote art="empty-rien-ici">Aucune tâche pour l’instant.</ArtNote>
          ) : T.every((t) => t.done) ? (
            <ArtNote art="dashboard-tache-validee">Tout est fait. Ajoute la suite.</ArtNote>
          ) : null}
          <AddRow
            placeholder="Nouvelle tâche"
            onAdd={(title) => {
              const task: Task = {
                id: crypto.randomUUID(),
                title,
                done: false,
                position: T.length,
              };
              mutate({ type: "task-add", task }, () => addTask(p.id, title, task.id));
            }}
          />
        </Box>
      </Reveal>

      <div className="grid gap-3 sm:grid-cols-2">
        <Reveal>
          <Box icon={Code} title="Tech" className="h-full">
            <div className="flex flex-wrap gap-1.5">
              {(p.stack.length ? p.stack : ["À compléter"]).map((x) => (
                <span
                  key={x}
                  className="rounded-lg border border-line bg-surface-2 px-2.5 py-1 font-mono text-[11.5px]"
                >
                  {x}
                </span>
              ))}
            </div>
          </Box>
        </Reveal>
        <Reveal>
          <Box icon={Users} title="Équipe" className="h-full">
            {p.team.length ? (
              <Bullets items={p.team} />
            ) : (
              <p className="text-[13.5px] text-muted">À compléter</p>
            )}
          </Box>
        </Reveal>
      </div>

      <Reveal>
        <Box icon={TriangleAlert} title="Points d’attention">
          {p.risks.length ? (
            <Bullets items={p.risks} />
          ) : (
            <ArtNote art="empty-tout-est-calme">Rien de noté</ArtNote>
          )}
        </Box>
      </Reveal>

      <Reveal>
        <Box icon={NotebookPen} title="Notes">
          <Notes projectId={p.id} initial={project.notes} />
        </Box>
      </Reveal>

      <Reveal>
        <Box icon={History} title="Journal">
          {p.log.length ? (
            <ul className="flex flex-col gap-2.5">
              {p.log.map((l) => (
                <li key={l.id} className="grid grid-cols-[88px_1fr] gap-2 text-[13.5px]">
                  <time dateTime={l.date} className="pt-px font-mono text-[11.5px] text-muted">
                    {formatFrDate(l.date)}
                  </time>
                  <span>{l.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <ArtNote art="onboarding-premier-pas">Aucune entrée. Note ce qui a avancé.</ArtNote>
          )}
          <AddRow
            placeholder="Ce qui a avancé aujourd’hui"
            onAdd={(text) => {
              const entry: LogEntry = {
                id: crypto.randomUUID(),
                date: todayIso(),
                text,
                created_at: new Date().toISOString(),
              };
              mutate({ type: "log-add", entry }, () => addLog(p.id, text, entry.date, entry.id));
            }}
          />
        </Box>
      </Reveal>

      <p aria-live="polite" className={cn("text-[13px] text-destructive", !error && "sr-only")}>
        {error}
      </p>
    </RevealGroup>
  );
}

// ─── Petites briques ────────────────────────────────────────────────────────

function Box({
  icon: Icon,
  title,
  className,
  children,
}: {
  icon?: LucideIcon;
  title?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("card-soft p-4 sm:p-5", className)}>
      {title ? (
        <h4 className="mb-3 flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
          {Icon ? <Icon className="size-4 text-muted" aria-hidden /> : null}
          {title}
        </h4>
      ) : null}
      {children}
    </section>
  );
}

function ArtNote({ art, children }: { art: IllustrationName; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 text-[13.5px] text-muted">
      <Illustration name={art} className="size-12" />
      <p>{children}</p>
    </div>
  );
}

function KV({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="flex flex-col text-[14px]">
      {rows.map(([k, v]) => (
        <div
          key={k}
          className="flex justify-between gap-3 border-b border-dashed border-line py-1.5 last:border-b-0"
        >
          <dt className="text-muted">{k}</dt>
          <dd className="text-right font-semibold">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="flex list-disc flex-col gap-1.5 pl-5 text-[14px] marker:text-accent-2">
      {items.map((x) => (
        <li key={x}>{x}</li>
      ))}
    </ul>
  );
}

function AddRow({ placeholder, onAdd }: { placeholder: string; onAdd: (text: string) => void }) {
  const [v, setV] = useState("");
  return (
    <form
      className="mt-3 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const t = v.trim();
        if (!t) return;
        onAdd(t);
        setV("");
      }}
    >
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        maxLength={300}
        className="min-h-11 min-w-0 flex-1 rounded-xl border border-line bg-surface-2 px-3 text-[14px] outline-none focus:border-ink/40 focus:bg-surface"
      />
      <button
        type="submit"
        aria-label="Ajouter"
        className="grid size-11 flex-none place-items-center rounded-xl border border-line bg-surface hover:bg-accent-soft"
      >
        <Plus className="size-4" aria-hidden />
      </button>
    </form>
  );
}

/** Suppression en 2 temps, comme l'original : 1er clic = « Supprimer ? », 2e clic = supprime. */
function ConfirmDelete({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      aria-label={armed ? `Confirmer : ${label}` : label}
      className={cn(
        "grid min-h-9 min-w-9 flex-none place-items-center rounded-lg px-1.5 font-mono text-[10.5px] transition-colors",
        armed ? "bg-destructive text-accent-ink" : "text-muted hover:bg-accent-soft hover:text-ink",
      )}
    >
      {armed ? "Supprimer ?" : <X className="size-3.5" aria-hidden />}
    </button>
  );
}

/** Notes sauvegardées automatiquement 900 ms après la dernière frappe. */
function Notes({ projectId, initial }: { projectId: string; initial: string }) {
  const [, startTransition] = useTransition();
  const [value, setValue] = useState(initial);
  const [status, setStatus] = useState<"idle" | "typing" | "saved" | "error">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latest = useRef({ value, dirty: false });

  function save() {
    if (!latest.current.dirty) return;
    latest.current.dirty = false;
    const notes = latest.current.value;
    // dans une transition, comme les autres modifications
    startTransition(async () => {
      const res = await updateProject(projectId, { notes });
      setStatus(res.ok ? "saved" : "error");
    });
  }

  // enregistre ce qui reste si on ferme la fiche pendant la frappe
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
      save();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  return (
    <>
      <textarea
        value={value}
        rows={4}
        placeholder="Idées, retours clients, décisions…"
        aria-label="Notes"
        onChange={(e) => {
          setValue(e.target.value);
          latest.current = { value: e.target.value, dirty: true };
          setStatus("typing");
          if (timer.current) clearTimeout(timer.current);
          timer.current = setTimeout(save, 900);
        }}
        onBlur={() => {
          if (timer.current) clearTimeout(timer.current);
          save();
        }}
        className="w-full resize-y rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-[14px] leading-relaxed outline-none focus:border-ink/40 focus:bg-surface"
      />
      <p className="mt-1.5 font-mono text-[11px] text-muted" aria-live="polite">
        {status === "typing"
          ? "…"
          : status === "saved"
            ? "Sauvegardé"
            : status === "error"
              ? "Échec de la sauvegarde"
              : "Sauvegarde automatique"}
      </p>
    </>
  );
}
