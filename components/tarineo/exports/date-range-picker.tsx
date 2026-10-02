"use client";

import type { DateRangePreset } from "@/components/tarineo/types";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => onPresetChange(p.id)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-[13px] transition",
              preset === p.id
                ? "border-[#FF6B1A] bg-[#FF6B1A]/10 text-ink"
                : "border-line bg-surface text-muted-foreground hover:bg-surface-2",
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-[13px] text-muted-foreground">
          Date début
          <Input type="date" value={start} onChange={(e) => onStartChange(e.target.value)} className="mt-1 h-11 rounded-xl" />
        </label>
        <label className="text-[13px] text-muted-foreground">
          Date fin
          <Input type="date" value={end} onChange={(e) => onEndChange(e.target.value)} className="mt-1 h-11 rounded-xl" />
        </label>
      </div>
    </div>
  );
}
