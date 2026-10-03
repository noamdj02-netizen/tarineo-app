"use client";

import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

export type ExportFormat = "xlsx" | "csv";

export function ExportFormatSelector({
  format,
  onChange,
  onGenerate,
  disabled,
}: {
  format: ExportFormat;
  onChange: (f: ExportFormat) => void;
  onGenerate?: () => void;
  disabled?: boolean;
}) {
  const options: { id: ExportFormat; title: string; sub: string; mark: string; markClass: string }[] = [
    { id: "xlsx", title: "Excel (.xlsx)", sub: "Exporter en", mark: "X", markClass: "bg-emerald-600 text-white" },
    { id: "csv", title: "CSV (.csv)", sub: "Exporter en", mark: "csv", markClass: "bg-surface-2 text-muted-foreground" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((o) => {
          const on = format === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/30",
                on ? "border-[#FF6B1A] bg-[#FF6B1A]/6" : "border-line bg-surface hover:bg-surface-2",
              )}
            >
              <span className={cn("grid size-10 place-items-center rounded-lg text-[11px] font-bold uppercase", o.markClass)}>
                {o.mark}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[11px] text-muted-foreground">{o.sub}</span>
                <span className="block text-[14px] font-semibold text-ink">{o.title}</span>
              </span>
              <span
                className={cn(
                  "size-4 shrink-0 rounded-full border-2",
                  on ? "border-[#FF6B1A] bg-[#FF6B1A]" : "border-line",
                )}
                aria-hidden
              />
            </button>
          );
        })}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onGenerate}
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B1A] text-[15px] font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-50"
      >
        Générer l&apos;export comptable
        <ArrowRight className="size-4" aria-hidden />
      </button>
    </div>
  );
}
