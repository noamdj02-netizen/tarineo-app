"use client";

import Link from "next/link";
import type { CopilotAction } from "@/lib/assistant/actions-markup";

export function ActionPills({ actions }: { actions: CopilotAction[] }) {
  if (!actions.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5">
      {actions.map((a, i) => (
        <li key={`${a.kind}-${i}`}>
          <Link
            href={a.href}
            className="inline-flex min-h-8 items-center rounded-pill border border-ink/15 bg-accent-soft px-2.5 font-mono text-[11px] tracking-[0.04em] text-ink hover:border-ink/35"
          >
            {a.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
