"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setChantierStatusAction } from "@/app/(app)/metier/actions";
import type { ChantierStatus } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

const STATUSES: {
  id: ChantierStatus;
  label: string;
  active: string;
  idle: string;
  dot: string;
}[] = [
  {
    id: "focus",
    label: "En cours",
    active: "border-st-focus/20 bg-st-focus-soft text-st-focus-ink",
    idle: "border-line bg-surface text-muted-foreground hover:bg-st-focus-soft/70",
    dot: "bg-[#16A34A]",
  },
  {
    id: "pause",
    label: "Pause",
    active: "border-st-pause/25 bg-st-pause-soft text-st-pause-ink",
    idle: "border-line bg-surface text-muted-foreground hover:bg-st-pause-soft/80",
    dot: "bg-[#F59E0B]",
  },
  {
    id: "fini",
    label: "Fini",
    active: "border-st-fini/25 bg-st-fini-soft text-st-fini-ink",
    idle: "border-line bg-surface text-muted-foreground hover:bg-st-fini-soft",
    dot: "bg-[#6B7280]",
  },
];

export function ChantierStatusToggle({ id, status }: { id: string; status: ChantierStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex w-full overflow-x-auto rounded-[12px] border border-line bg-surface p-1 max-md:min-h-11 md:inline-flex md:w-auto md:flex-wrap md:gap-2 md:overflow-visible md:border-0 md:bg-transparent md:p-0" role="group" aria-label="Statut du chantier">
      {STATUSES.map((s) => {
        const on = status === s.id;
        return (
          <button
            key={s.id}
            type="button"
            disabled={pending}
            aria-pressed={on}
            onClick={() =>
              start(async () => {
                await setChantierStatusAction(id, s.id);
                router.refresh();
              })
            }
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-[10px] border px-3 text-[13px] whitespace-nowrap transition-[background-color,color,border-color] duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/35 disabled:opacity-60 md:h-9 md:min-h-9 md:flex-none",
              on ? s.active : s.idle,
            )}
          >
            <span aria-hidden className={cn("size-1.5 rounded-full", s.dot)} />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}
