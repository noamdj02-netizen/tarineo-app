"use client";

import type { DateRangePreset } from "@/components/tarineo/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

const PRESETS: { id: DateRangePreset; label: string }[] = [
  { id: "month", label: "Ce mois" },
  { id: "quarter", label: "Trimestre" },
  { id: "year", label: "Cette année" },
  { id: "last_year", label: "Année dernière" },
];

export function DateRangePicker({
  preset,
  onPresetChange,
  start,
  end,
  onStartChange,
  onEndChange,
}: {
  preset: DateRangePreset;
  onPresetChange: (p: DateRangePreset) => void;
  start: string;
  end: string;
  onStartChange: (v: string) => void;
  onEndChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-surface-2 px-3 py-3">
          <p className="text-[12px] font-medium text-muted-foreground">Date de début</p>
          <div className="relative mt-2">
            <Input
              type="date"
              value={start}
              onChange={(e) => onStartChange(e.target.value)}
              className="h-11 rounded-xl border-line bg-surface pr-10"
            />
            <Calendar className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="rounded-xl bg-surface-2 px-3 py-3">
          <p className="text-[12px] font-medium text-muted-foreground">Date de fin</p>
          <div className="relative mt-2">
            <Input
              type="date"
              value={end}
              onChange={(e) => onEndChange(e.target.value)}
              className="h-11 rounded-xl border-line bg-surface pr-10"
            />
            <Calendar className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPresetChange(p.id)}
            className={cn(
              "rounded-full bg-surface-2 px-4 py-2 text-[13px] font-medium transition",
              preset === p.id ? "text-ink ring-1 ring-line-strong" : "text-muted-foreground hover:text-ink",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}
