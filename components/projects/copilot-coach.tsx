"use client";

import { Bot, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { pauseProjects, updateProject } from "@/app/(app)/projets/actions";
import { Illustration } from "@/components/illustration";
import { openAssistant } from "@/lib/assistant/open";
import type { CoachBrief, CoachMove, CoachTone } from "@/lib/projects/coach";
import { cn } from "@/lib/utils";

const SHELL: Record<CoachTone, string> = {
  alert: "border-st-fini/30 bg-st-fini-soft",
  ok: "border-st-focus/30 bg-st-focus-soft",
  warn: "border-st-pause/35 bg-st-pause-soft",
};

const BADGE: Record<CoachTone, string> = {
  alert: "bg-st-fini text-accent-ink",
  ok: "bg-st-focus text-accent-ink",
  warn: "bg-st-pause text-st-pause-ink",
};

const BADGE_LABEL: Record<CoachTone, string> = {
  alert: "À trancher",
  ok: "En ligne",
  warn: "À poser",
};

const ART: Record<CoachTone, "feedback-surcharge" | "feedback-succes" | "feedback-question"> = {
  alert: "feedback-surcharge",
  ok: "feedback-succes",
  warn: "feedback-question",
};

const PILL: Record<CoachMove["tone"], string> = {
  ok: "bg-st-focus text-accent-ink hover:brightness-95",
  alert: "bg-st-fini text-accent-ink hover:brightness-95",
  ask: "border border-ink/15 bg-surface text-ink hover:bg-accent-soft",
};

export function CopilotCoach({ brief }: { brief: CoachBrief }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  function run(move: CoachMove) {
    if (move.kind === "ask") {
      openAssistant(move.prompt);
      return;
    }
    if (move.kind === "link") return;
    setError(null);
    setBusy(move.id);
    start(async () => {
      const res =
        move.kind === "focus"
          ? await updateProject(move.projectId, { status: "focus" })
          : await pauseProjects(move.projectIds);
      setBusy(null);
      if (!res.ok) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <aside
      role="status"
      className={cn("rounded-card border p-4 sm:p-5", SHELL[brief.tone])}
    >
      <div className="flex items-start gap-3">
        <Illustration name={ART[brief.tone]} className="-my-1 size-14 flex-none" />
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10.5px] font-medium tracking-[0.12em] text-ink/70 uppercase">
              <Bot className="size-3.5" aria-hidden />
              {brief.kicker}
            </span>
            <span
              className={cn(
                "rounded-pill px-2 py-0.5 font-mono text-[10px] font-medium tracking-[0.08em] uppercase",
                BADGE[brief.tone],
              )}
            >
              {BADGE_LABEL[brief.tone]}
            </span>
          </div>
          <p className="text-[16px] leading-snug font-semibold tracking-[-0.03em]">{brief.title}</p>
          <p className="mt-1 text-[14px] leading-snug text-ink/80">{brief.body}</p>
        </div>
      </div>

      {brief.moves.length ? (
        <ul className="mt-3.5 flex flex-wrap gap-2">
          {brief.moves.map((move) => (
            <li key={move.id}>
              {move.kind === "link" ? (
                <Link
                  href={move.href}
                  prefetch={false}
                  className={cn(
                    "inline-flex min-h-9 items-center rounded-pill px-3 text-[13px] font-semibold",
                    PILL[move.tone],
                  )}
                >
                  {move.label}
                </Link>
              ) : (
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(move)}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-1.5 rounded-pill px-3 text-[13px] font-semibold disabled:opacity-60",
                    PILL[move.tone],
                  )}
                >
                  {busy === move.id ? (
                    <Loader2 className="size-3.5 animate-spin" aria-hidden />
                  ) : null}
                  {move.label}
                </button>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      {error ? (
        <p role="alert" className="mt-2 text-[13px] text-st-fini-ink">
          {error}
        </p>
      ) : null}
    </aside>
  );
}
