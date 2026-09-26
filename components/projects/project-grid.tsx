"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Loader2, Plus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { createProject } from "@/app/(app)/projets/actions";
import { EASE } from "@/components/motion/reveal";
import { boardCoach } from "@/lib/projects/coach";
import type { ProjectSummary } from "@/lib/projects/types";
import { ProjectCard } from "./project-card";

export function ProjectGrid({ projects }: { projects: ProjectSummary[] }) {
  const signals = boardCoach(projects).signals;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(310px,1fr))]">
        {projects.map((p, i) => (
          <ProjectCard key={p.id} project={p} index={i} signal={signals[p.id]} />
        ))}
        <NewProject index={projects.length} />
      </div>
    </div>
  );
}

function NewProject({ index }: { index: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  // ouverte par le raccourci « Nouveau projet » de la barre mobile (/projets#nouveau)
  useEffect(() => {
    const show = () => {
      setOpen(true);
      ref.current?.scrollIntoView({ block: "center" });
    };
    if (window.location.hash === "#nouveau") {
      show();
      history.replaceState(null, "", window.location.pathname);
    }
    window.addEventListener("navpit:new-project", show);
    return () => window.removeEventListener("navpit:new-project", show);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createProject(name);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setName("");
      setOpen(false);
      router.push(`/projets/${res.slug}`);
    });
  }

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 14, filter: "blur(6px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: EASE, delay: index * 0.06 }}
      className="flex min-h-[180px] flex-col rounded-card border border-dashed border-ink/15"
    >
      <AnimatePresence mode="wait" initial={false}>
        {open ? (
          <motion.form
            key="form"
            onSubmit={submit}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="flex flex-1 flex-col justify-center gap-3 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="mono-label">/ Nouveau projet</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Annuler"
                className="grid size-9 place-items-center rounded-pill text-muted-foreground hover:bg-accent-soft"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nom du projet"
              aria-label="Nom du projet"
              maxLength={80}
              className="min-h-11 rounded-xl border border-line bg-surface px-3 text-[15px] outline-none focus:border-ink/40"
            />
            {error ? (
              <p role="alert" className="text-[13px] text-destructive">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={pending || !name.trim()}
              className="btn-dark inline-flex min-h-10 w-fit items-center gap-2 rounded-xl px-3.5 text-[13.5px] font-semibold disabled:opacity-50"
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="size-4" aria-hidden />
              )}
              Créer
            </button>
          </motion.form>
        ) : (
          <motion.button
            key="cta"
            type="button"
            onClick={() => setOpen(true)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-1 flex-col items-center justify-center gap-2 rounded-card p-5 text-muted-foreground transition-colors hover:bg-surface-2 hover:text-ink"
          >
            <span className="grid size-11 place-items-center rounded-pill border border-line bg-surface">
              <Plus className="size-5" aria-hidden />
            </span>
            <span className="font-mono text-[11px] font-medium tracking-[0.12em] uppercase">
              Nouveau projet
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
