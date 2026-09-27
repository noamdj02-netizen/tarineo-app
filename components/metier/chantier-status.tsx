"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setChantierStatusAction } from "@/app/(app)/metier/actions";
import type { ChantierStatus } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

const STATUSES: { id: ChantierStatus; label: string }[] = [
  { id: "focus", label: "En cours" },
  { id: "pause", label: "Pause" },
  { id: "fini", label: "Fini" },
];

export function ChantierStatusToggle({ id, status }: { id: string; status: ChantierStatus }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div className="flex flex-wrap gap-2">
      {STATUSES.map((s) => (
        <button
          key={s.id}
          type="button"
          disabled={pending}
          onClick={() =>
            start(async () => {
              await setChantierStatusAction(id, s.id);
              router.refresh();
            })
          }
          className={cn(
            "rounded-full px-3 py-1.5 text-[13px]",
            status === s.id ? "bg-ink text-accent-ink" : "border border-line hover:bg-surface-2",
          )}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
