"use client";

import Link from "next/link";
import type { Automation } from "@/lib/home/automations";
import { AUTOMATIONS, DASHBOARD_AUTOMATION_LIMIT } from "@/lib/home/automations";
import { cn } from "@/lib/utils";

export function AutomationChips({
  items = AUTOMATIONS,
  limit = DASHBOARD_AUTOMATION_LIMIT,
  activeIndex = -1,
  onPick,
  showMoreLink = false,
  className,
}: {
  items?: readonly Automation[];
  limit?: number;
  activeIndex?: number;
  onPick: (automation: Automation) => void;
  showMoreLink?: boolean;
  className?: string;
}) {
  const visible = items.slice(0, limit);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-wrap items-center justify-between gap-2 px-0.5">
        <p className="mono-label text-[10px]">{"/ Automatisations ///"}</p>
        {showMoreLink ? (
          <Link
            href="/automatisations"
            className="text-[12px] font-medium text-muted-foreground underline-offset-2 hover:text-ink hover:underline"
          >
            Tout voir
          </Link>
        ) : null}
      </div>
      <ul className="flex flex-wrap gap-2" aria-label="Automatisations">
        {visible.map((a, i) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => onPick(a)}
              className={cn(
                "pressable min-h-9 rounded-pill bg-surface px-3.5 text-[13px] text-ink/80 shadow-soft ring-1 ring-transparent hover:text-ink hover:shadow-lift",
                i === activeIndex && "text-ink shadow-lift ring-ink/10",
              )}
            >
              {a.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
