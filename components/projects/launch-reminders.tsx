"use client";

import { Bot, ChevronDown, ListChecks } from "lucide-react";
import { useMemo, useState, useTransition } from "react";
import { saveProjectLaunch } from "@/app/(app)/projets/actions";
import { openAssistant } from "@/lib/assistant/open";
import {
  LAUNCH_CHECKS,
  checksByGroup,
  liveTips,
  pickAdvice,
  type LaunchState,
} from "@/lib/projects/launch-checks";
import { cn } from "@/lib/utils";

export function LaunchReminders({
  projectId,
  name,
  site,
  gaId,
  gsc,
  stripe,
  initial,
}: {
  projectId: string;
  name: string;
  site: string;
  gaId: string;
  gsc: string;
  stripe: boolean;
  initial: LaunchState;
}) {
  const [done, setDone] = useState(initial.done);
  const [, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const groups = useMemo(() => checksByGroup(), []);
  const firstOpen = groups.find((g) => g.items.some((c) => !done.includes(c.id)))?.id ?? groups[0]?.id;
  const [open, setOpen] = useState<string | null>(firstOpen ?? null);
  const tips = useMemo(
    () => liveTips({ name, site, gaId, gsc, stripe }),
    [name, site, gaId, gsc, stripe],
  );
  const advice = pickAdvice(name, done, tips);
  const n = done.length;
  const total = LAUNCH_CHECKS.length;

  function persist(next: string[]) {
    setDone(next);
    setError(null);
    start(async () => {
      const res = await saveProjectLaunch(projectId, next);
      if (!res.ok) setError(res.error);
    });
  }

  function toggle(id: string) {
    persist(done.includes(id) ? done.filter((x) => x !== id) : [...done, id]);
  }

  return (
    <section id="lancer" className="card-soft scroll-mt-24 p-4 sm:p-5">
      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.02em]">
            <ListChecks className="size-4 text-muted-foreground" aria-hidden />
            À ne pas oublier
          </h4>
          <p className="mt-1 text-[13px] text-muted-foreground">
            {total} points, du DNS au checkout. Un clic envoie le prompt.
          </p>
        </div>
        <p className="font-mono text-[12px] tabular-nums text-muted-foreground">
          {n}/{total}
        </p>
      </div>

      <div
        className="mb-3 h-1.5 overflow-hidden rounded-pill bg-line"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={n}
        aria-label="Points validés"
      >
        <i
          className="block h-full rounded-pill bg-st-focus transition-[width] duration-500"
          style={{ width: `${(n / total) * 100}%` }}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface-2 px-3.5 py-2.5">
        <p className="min-w-0 text-[13.5px] leading-snug">{advice.hint}</p>
        <button
          type="button"
          onClick={() => openAssistant(advice.prompt)}
          className="btn-dark inline-flex min-h-9 flex-none items-center gap-1.5 rounded-pill px-3 text-[13px] font-semibold"
        >
          <Bot className="size-3.5" aria-hidden />
          Demander
        </button>
      </div>

      <div className="flex flex-col gap-1.5">
        {groups.map((g) => {
          const got = g.items.filter((c) => done.includes(c.id)).length;
          const shown = open === g.id;
          return (
            <div key={g.id} className="rounded-xl border border-line">
              <button
                type="button"
                onClick={() => setOpen(shown ? null : g.id)}
                className="flex min-h-11 w-full items-center justify-between gap-3 px-3 text-left"
              >
                <span className="text-[14px] font-semibold">
                  {g.n}
                  <span className="ml-2 font-mono text-[11px] font-normal text-muted-foreground">
                    {got}/{g.items.length}
                  </span>
                </span>
                <ChevronDown
                  className={cn("size-4 text-muted-foreground transition-transform", shown && "rotate-180")}
                  aria-hidden
                />
              </button>
              {shown ? (
                <ul className="grid gap-0.5 border-t border-line px-1.5 py-1 sm:grid-cols-2">
                  {g.items.map((c) => {
                    const on = done.includes(c.id);
                    return (
                      <li key={c.id} className="flex min-h-10 items-center gap-2 rounded-lg px-1.5 hover:bg-accent-soft">
                        <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 text-[13.5px]">
                          <input
                            type="checkbox"
                            checked={on}
                            onChange={() => toggle(c.id)}
                            className="size-4 flex-none accent-ink"
                          />
                          <span className={cn(on && "text-muted-foreground line-through")}>{c.n}</span>
                        </label>
                        <button
                          type="button"
                          aria-label={`Demander : ${c.n}`}
                          onClick={() => openAssistant(c.prompt(name))}
                          className="grid size-8 flex-none place-items-center rounded-lg text-muted-foreground hover:bg-surface hover:text-ink"
                        >
                          <Bot className="size-3.5" aria-hidden />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      {error ? (
        <p role="alert" className="mt-3 text-[13px] text-st-fini-ink">
          {error}
        </p>
      ) : null}
    </section>
  );
}
