"use client";

import { ArrowRight, HelpCircle } from "lucide-react";
import { useState } from "react";
import {
  formatEstimatedMinutes,
  formatNextDue,
  isNextOverdue,
  NEXT_PRIORITY_LABELS,
  type NextPriority,
} from "@/lib/projects/next-meta";
import { cn } from "@/lib/utils";

/** Zone principale « Prochaine action » — hiérarchie visuelle #1 de la carte. */
export function NextAction({
  text,
  dueDate,
  priority,
  estimatedMinutes,
  why,
  onAskWhy,
  menu,
}: {
  text: string;
  dueDate?: string | null;
  priority?: NextPriority | null;
  estimatedMinutes?: number | null;
  why?: string;
  onAskWhy?: () => void;
  menu?: React.ReactNode;
}) {
  const [openWhy, setOpenWhy] = useState(false);
  const dueLabel = formatNextDue(dueDate);
  const overdue = isNextOverdue(dueDate);
  const duration = formatEstimatedMinutes(estimatedMinutes);
  const priorityLabel = priority ? NEXT_PRIORITY_LABELS[priority] : null;

  const meta = [
    dueLabel ?? (text ? "Pas de deadline" : null),
    duration,
    priorityLabel,
  ].filter(Boolean) as string[];

  if (!text) {
    return (
      <div className="rounded-2xl border border-dashed border-line bg-surface-2/60 px-4 py-3.5">
        <div className="flex items-start justify-between gap-2">
          <p className="font-mono text-[10.5px] tracking-[0.12em] text-muted-foreground uppercase">
            Prochaine action
          </p>
          {menu ? <div className="relative z-20 shrink-0">{menu}</div> : null}
        </div>
        <p className="mt-1.5 text-[14px] text-muted-foreground">Aucune action définie.</p>
      </div>
    );
  }

  return (
    <div className="relative rounded-2xl border border-line/80 bg-accent-soft/80 px-4 py-3.5">
      <div className="flex items-start justify-between gap-2">
        <p className="font-mono text-[10.5px] tracking-[0.12em] text-muted-foreground uppercase">
          Prochaine action
        </p>
        <div className="relative z-20 flex shrink-0 items-center gap-0.5">
          {why || onAskWhy ? (
            <button
              type="button"
              onClick={() => {
                if (onAskWhy) onAskWhy();
                else setOpenWhy((v) => !v);
              }}
              className="inline-flex items-center gap-1 rounded-lg px-1.5 py-1 text-[11.5px] font-medium text-muted-foreground transition-colors duration-200 hover:bg-surface/70 hover:text-ink"
              aria-expanded={openWhy}
            >
              <HelpCircle className="size-3.5" aria-hidden />
              Pourquoi ?
            </button>
          ) : null}
          {menu}
        </div>
      </div>

      <p className="mt-2 flex items-start gap-2 text-[16px] leading-snug font-semibold tracking-[-0.02em] text-ink sm:text-[17px]">
        <ArrowRight className="mt-0.5 size-4 shrink-0 text-ink/70" aria-hidden />
        <span>{text}</span>
      </p>

      {meta.length ? (
        <p
          className={cn(
            "mt-2 pl-6 text-[12.5px] leading-snug",
            overdue ? "font-medium text-st-fini" : "text-muted-foreground",
          )}
        >
          {meta.join(" · ")}
        </p>
      ) : null}

      {openWhy && why ? (
        <div
          role="dialog"
          aria-label="Pourquoi cette action"
          className="absolute top-10 right-3 z-30 max-w-[min(100%,280px)] rounded-xl border border-line bg-surface p-3 text-[13px] leading-snug text-ink shadow-lift"
        >
          {why}
          <button
            type="button"
            className="mt-2 block text-[12px] font-medium text-muted-foreground underline-offset-2 hover:underline"
            onClick={() => setOpenWhy(false)}
          >
            Fermer
          </button>
        </div>
      ) : null}
    </div>
  );
}
