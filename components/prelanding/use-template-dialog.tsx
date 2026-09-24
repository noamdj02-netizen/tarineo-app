"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
import { applyPreLanding, type ApplyResult } from "@/app/(app)/themes/actions";
import { Illustration } from "@/components/illustration";
import { EASE } from "@/components/motion/reveal";
import type { PreLandingTemplate } from "@/lib/prelanding/templates";
import { useScrollLock } from "./use-scroll-lock";

export type ProjectOption = { id: string; name: string; focus: boolean };

export function UseTemplateDialog({
  template,
  projects,
  onClose,
}: {
  template: PreLandingTemplate;
  projects: ProjectOption[];
  onClose: () => void;
}) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const [projectId, setProjectId] = useState(
    () => (projects.find((p) => p.focus) ?? projects[0])?.id ?? "",
  );
  const [result, setResult] = useState<ApplyResult | null>(null);
  const [pending, start] = useTransition();

  useScrollLock();
  useEffect(() => {
    panelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const confirm = () =>
    start(async () => {
      setResult(await applyPreLanding(template.id, projectId));
    });

  const done = result?.ok ? result : null;

  return (
    <motion.div
      className="fixed inset-0 z-[60] grid place-items-center bg-ink/30 p-4 backdrop-blur-[3px]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      onMouseDown={(e) => e.target === e.currentTarget && !pending && onClose()}
    >
      <motion.div
        ref={panelRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="use-template-title"
        initial={reduce ? { opacity: 0 } : { y: 12, scale: 0.98, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={reduce ? { opacity: 0 } : { y: 8, opacity: 0 }}
        transition={{ duration: 0.25, ease: EASE }}
        className="w-full max-w-[440px] rounded-[22px] border border-line bg-surface p-6 shadow-lift outline-none"
      >
        {done ? (
          <>
            <Illustration name="feedback-succes" className="-mt-1 -ml-1 size-20" />
            <h2 id="use-template-title" className="mt-4 text-[22px] leading-tight font-semibold tracking-[-0.035em]">
              {template.name} added to {done.projectName}
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              {done.sections} section tasks were added after your existing ones, plus a journal entry.
              Nothing else changed.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-4 text-[14px] font-medium hover:bg-accent-soft"
              >
                Close
              </button>
              <Link
                href={`/projets/${done.projectSlug}`}
                className="btn-dark inline-flex min-h-11 items-center gap-1.5 rounded-pill px-4 text-[14px] font-semibold"
              >
                Open project <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          </>
        ) : (
          <>
            <Illustration name="feedback-upload" className="float-right -mt-2 -mr-2 ml-3 size-16" />
            <p className="mono-label">/ {template.name} · {template.sections.length} sections</p>
            <h2 id="use-template-title" className="mt-2 text-[24px] leading-tight font-semibold tracking-[-0.035em]">
              Use this pre-landing?
            </h2>
            <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
              This will create a landing structure in your project. You can customize every section
              afterwards.
            </p>

            {projects.length ? (
              <label className="mt-5 block">
                <span className="mono-label">Project</span>
                <span className="relative mt-1.5 block">
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={pending}
                    className="min-h-12 w-full appearance-none rounded-xl border border-line bg-surface-2 pr-10 pl-3.5 text-[15px] font-medium outline-none focus:border-ink/30"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                        {p.focus ? " · focus" : ""}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                </span>
              </label>
            ) : (
              <p className="mt-5 rounded-xl border border-line bg-surface-2 px-3.5 py-3 text-[14px] text-muted-foreground">
                No project yet.{" "}
                <Link href="/projets" className="font-medium text-ink underline underline-offset-2">
                  Create one first
                </Link>
                .
              </p>
            )}

            {result && !result.ok ? (
              <p role="alert" className="mt-3 text-[14px] font-medium text-[#b42318]">
                {result.error}
              </p>
            ) : null}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={pending}
                className="inline-flex min-h-11 items-center rounded-pill border border-line bg-surface px-4 text-[14px] font-medium hover:bg-accent-soft disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirm}
                disabled={pending || !projectId}
                className="btn-dark inline-flex min-h-11 items-center gap-1.5 rounded-pill px-4 text-[14px] font-semibold disabled:translate-y-0 disabled:opacity-50"
              >
                {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : null}
                Use template
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  );
}
