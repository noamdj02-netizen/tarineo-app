"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, PenLine, Plus, Sparkles, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { createSchema, deleteSchema } from "@/app/(app)/schemas/actions";
import { Illustration } from "@/components/illustration";
import { EASE } from "@/components/motion/reveal";
import { formatFrDate } from "@/lib/projects/types";
import { SCHEMA_AGENTS, SCHEMA_KIND_LABELS } from "@/lib/schemas/agents";
import type { SchemaKind } from "@/lib/supabase/types";
import { cn } from "@/lib/utils";

export type SchemaCard = {
  id: string;
  title: string;
  kind: SchemaKind;
  project_id: string | null;
  updated_at: string;
};

type ProjectOption = { id: string; name: string; focus: boolean };

export function SchemaLibrary({
  schemas,
  projects,
}: {
  schemas: SchemaCard[];
  projects: ProjectOption[];
}) {
  const [filter, setFilter] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const names = useMemo(
    () => new Map(projects.map((p) => [p.id, p.name])),
    [projects],
  );
  const shown =
    filter === "all"
      ? schemas
      : schemas.filter((s) => (s.project_id ?? "none") === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-1.5 overflow-x-auto [scrollbar-width:none]">
          {[
            { id: "all", name: "Tous" },
            ...projects,
            { id: "none", name: "Sans projet" },
          ].map((p) => (
            <button
              key={p.id}
              type="button"
              aria-pressed={filter === p.id}
              onClick={() => setFilter(p.id)}
              className={cn(
                "min-h-10 flex-none rounded-pill border px-3.5 text-[13.5px] transition-colors",
                filter === p.id
                  ? "border-ink bg-ink text-accent-ink"
                  : "border-line bg-surface text-ink/80 hover:bg-accent-soft",
              )}
            >
              {p.name}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="btn-dark inline-flex min-h-11 items-center gap-2 rounded-pill px-4 text-[14px] font-semibold"
        >
          <Plus className="size-4" aria-hidden />
          Nouveau schéma
        </button>
      </div>

      {shown.length ? (
        <ul className="grid gap-3 sm:grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
          {shown.map((s) => (
            <SchemaItem
              key={s.id}
              schema={s}
              project={s.project_id ? names.get(s.project_id) : undefined}
            />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-line px-6 py-12 text-center">
          <Illustration name="onboarding-premier-pas" className="size-24" />
          <p className="text-[16px] font-semibold tracking-[-0.02em]">
            Aucun schéma ici
          </p>
          <p className="max-w-[40ch] text-[14px] text-muted">
            Crée un schéma vide ou laisse un agent dessiner celui d’un projet.
          </p>
        </div>
      )}

      <AnimatePresence>
        {open ? (
          <NewSchemaDialog
            projects={projects}
            initialProject={
              filter !== "all" && filter !== "none" ? filter : undefined
            }
            onClose={() => setOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SchemaItem({
  schema: s,
  project,
}: {
  schema: SchemaCard;
  project?: string;
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);

  return (
    <li className="card-soft relative flex flex-col gap-2 p-4 transition-[transform,box-shadow] duration-300 ease-out-soft hover:-translate-y-0.5 hover:shadow-lift">
      <p className="mono-label">
        {`/ ${SCHEMA_KIND_LABELS[s.kind]}`}
        {project ? ` · ${project}` : ""}
      </p>
      <Link
        href={`/schemas/${s.id}`}
        className="text-[16px] font-semibold tracking-[-0.02em] after:absolute after:inset-0"
      >
        {s.title}
      </Link>
      <p className="font-mono text-[11.5px] text-muted">
        Modifié le {formatFrDate(s.updated_at.slice(0, 10))}
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          armed
            ? startTransition(async () => {
                await deleteSchema(s.id);
                router.refresh();
              })
            : setArmed(true)
        }
        aria-label={
          armed ? `Confirmer : supprimer ${s.title}` : `Supprimer ${s.title}`
        }
        className={cn(
          "absolute top-3 right-3 z-10 grid min-h-9 min-w-9 place-items-center rounded-lg px-1.5 font-mono text-[10.5px] transition-colors",
          armed
            ? "bg-destructive text-accent-ink"
            : "text-muted hover:bg-accent-soft hover:text-ink",
        )}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" aria-hidden />
        ) : armed ? (
          "Supprimer ?"
        ) : (
          <X className="size-3.5" aria-hidden />
        )}
      </button>
    </li>
  );
}

function NewSchemaDialog({
  projects,
  initialProject,
  onClose,
}: {
  projects: ProjectOption[];
  initialProject?: string;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"agent" | "blank">(
    projects.length ? "agent" : "blank",
  );
  const [projectId, setProjectId] = useState(
    initialProject ??
      projects.find((p) => p.focus)?.id ??
      projects[0]?.id ??
      "",
  );
  const [kind, setKind] = useState(SCHEMA_AGENTS[0].kind);
  const [extra, setExtra] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const agent = SCHEMA_AGENTS.find((a) => a.kind === kind)!;
      const projectName = projects.find((p) => p.id === projectId)?.name;
      const res = await createSchema(
        mode === "agent"
          ? { title: `${agent.label} · ${projectName ?? ""}`, projectId, kind }
          : { title, projectId: projectId || null, kind: "libre" },
      );
      if (!res.ok) {
        setError(res.error);
        return;
      }
      const q =
        mode === "agent"
          ? `?${new URLSearchParams({ agent: kind, ...(extra ? { extra } : {}) })}`
          : "";
      router.push(`/schemas/${res.id}${q}`);
    });
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-end bg-ink/30 p-3 backdrop-blur-[2px] sm:place-items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.form
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-schema-title"
        onSubmit={submit}
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 8, opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="max-h-[88dvh] w-full max-w-[480px] overflow-y-auto rounded-[22px] border border-line bg-surface p-5 shadow-lift sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2
            id="new-schema-title"
            className="text-[22px] leading-tight font-semibold tracking-[-0.035em]"
          >
            Nouveau schéma
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            className="grid size-10 place-items-center rounded-pill hover:bg-accent-soft"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div
          className="mt-4 grid grid-cols-2 gap-1 rounded-pill bg-surface-2 p-1"
          role="radiogroup"
          aria-label="Type"
        >
          {(
            [
              ["agent", "Généré par un agent", Sparkles],
              ["blank", "Vide", PenLine],
            ] as const
          ).map(([id, label, Icon]) => (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={mode === id}
              disabled={id === "agent" && !projects.length}
              onClick={() => setMode(id)}
              className={cn(
                "inline-flex min-h-10 items-center justify-center gap-1.5 rounded-pill text-[13.5px] font-medium transition-colors disabled:opacity-40",
                mode === id ? "bg-surface shadow-soft" : "text-muted",
              )}
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </button>
          ))}
        </div>

        {projects.length ? (
          <label className="mt-4 block">
            <span className="mono-label">Projet</span>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-surface-2 px-3 text-[15px] outline-none focus:border-ink/30"
            >
              {mode === "blank" ? <option value="">Aucun projet</option> : null}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                  {p.focus ? " · focus" : ""}
                </option>
              ))}
            </select>
          </label>
        ) : null}

        {mode === "agent" ? (
          <>
            <fieldset className="mt-4">
              <legend className="mono-label">Agent</legend>
              <div className="mt-1.5 flex flex-col gap-1.5">
                {SCHEMA_AGENTS.map((a) => (
                  <label
                    key={a.kind}
                    className={cn(
                      "flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border px-3 py-2 transition-colors",
                      kind === a.kind
                        ? "border-ink bg-accent-soft"
                        : "border-line hover:bg-accent-soft",
                    )}
                  >
                    <input
                      type="radio"
                      name="agent"
                      value={a.kind}
                      checked={kind === a.kind}
                      onChange={() => setKind(a.kind)}
                      className="accent-ink"
                    />
                    <span>
                      <b className="block text-[14.5px] font-semibold">
                        {a.label}
                      </b>
                      <small className="block text-[12.5px] text-muted">
                        {a.hint}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="mt-4 block">
              <span className="mono-label">Précision (optionnel)</span>
              <input
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                maxLength={300}
                placeholder="Ex : ajoute Stripe et les webhooks"
                className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-surface-2 px-3 text-[15px] outline-none focus:border-ink/30"
              />
            </label>
          </>
        ) : (
          <label className="mt-4 block">
            <span className="mono-label">Titre</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="Sans titre"
              className="mt-1.5 min-h-12 w-full rounded-xl border border-line bg-surface-2 px-3 text-[15px] outline-none focus:border-ink/30"
            />
          </label>
        )}

        <p
          aria-live="polite"
          className={cn(
            "mt-3 text-[13px] text-destructive",
            !error && "sr-only",
          )}
        >
          {error}
        </p>

        <button
          type="submit"
          disabled={pending || (mode === "agent" && !projectId)}
          className="btn-dark mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-pill text-[15px] font-semibold disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : null}
          {mode === "agent" ? "Générer le schéma" : "Créer et dessiner"}
        </button>
      </motion.form>
    </motion.div>
  );
}
