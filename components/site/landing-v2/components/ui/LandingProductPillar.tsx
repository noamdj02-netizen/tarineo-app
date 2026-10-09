"use client";

import type { PastilleRow } from "@/lib/site/landing-v2-content";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { landingCardClass } from "@/components/site/landing-v2/components/ui/landing-card";
import { cn } from "@/lib/utils";

export function LandingProductPillar({ row }: { row: PastilleRow }) {
  return (
    <article className={cn(landingCardClass("flex h-full flex-col p-5 sm:p-6"))}>
      <div className="flex items-center gap-2.5">
        <span
          className={cn("size-2.5 shrink-0 rounded-full ring-2 ring-paper-0", row.dotClass)}
          aria-hidden
        />
        <h3 className="text-base font-semibold tracking-tight text-ink-900">{row.label}</h3>
      </div>
      <p className="mt-2.5 text-sm leading-relaxed text-ink-500">{row.summary}</p>
      <ul className="mt-5 flex flex-wrap gap-2" aria-label={`Fonctions — ${row.label}`}>
        {row.chips.map((chip) => (
          <li key={chip.label}>
            <span
              className={cn(
                "inline-flex min-h-8 max-w-full items-center gap-1.5 rounded-full border border-line bg-paper-50 px-3 py-1.5 text-xs font-medium text-ink-700",
                chip.soon && "border-dashed text-ink-500",
              )}
            >
              <span className="text-pretty">{chip.label}</span>
              {chip.soon ? (
                <Badge tone="muted" size="sm">bientôt</Badge>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
