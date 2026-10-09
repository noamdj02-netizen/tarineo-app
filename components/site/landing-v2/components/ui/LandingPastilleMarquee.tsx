"use client";

import type { PastilleChip } from "@/lib/site/landing-v2-content";
import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { cn } from "@/lib/utils";

export function LandingPastilleMarquee({
  label,
  dotClass,
  chips,
  reverse,
}: {
  label: string;
  dotClass: string;
  chips: PastilleChip[];
  reverse?: boolean;
}) {
  const track = [...chips, ...chips];

  return (
    <div className="landing-pastille-band overflow-hidden rounded-xl border border-line bg-paper-0 shadow-sm">
      <div className="flex items-center gap-2 border-b border-line/80 px-4 py-2.5">
        <span className={cn("size-2 shrink-0 rounded-full", dotClass)} aria-hidden />
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-ink-500">{label}</p>
      </div>

      <div className="landing-pastille-mask relative h-12 overflow-hidden">
        <ul
          className={cn(
            "landing-pastille-row flex w-max items-center gap-2 py-2.5 pl-4",
            reverse && "landing-pastille-row-reverse",
          )}
          aria-hidden
        >
          {track.map((chip, i) => (
            <li
              key={`${chip.label}-${i}`}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-paper-50 px-3 py-1.5 text-[13px] text-ink-700"
            >
              {chip.label}
              {chip.soon ? (
                <Badge tone="muted" size="sm">bientôt</Badge>
              ) : null}
            </li>
          ))}
        </ul>
      </div>

      <ul className="sr-only">
        {chips.map((chip) => (
          <li key={chip.label}>
            {chip.label}
            {chip.soon ? " (bientôt)" : ""}
          </li>
        ))}
      </ul>
    </div>
  );
}
