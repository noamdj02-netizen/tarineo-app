"use client";

import { cn } from "@/lib/utils";

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
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2">
        {(["csv", "xlsx"] as ExportFormat[]).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => onChange(f)}
            className={cn(
              "rounded-full border px-4 py-2 text-[13px] font-medium uppercase",
              format === f
                ? "border-[#FF6B1A] bg-[#FF6B1A] text-white"
                : "border-line bg-surface text-ink hover:bg-surface-2",
            )}
          >
            {f === "csv" ? "CSV" : "Excel"}
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={onGenerate}
        className="btn-orange inline-flex h-11 items-center justify-center rounded-full px-6 text-[14px] font-medium disabled:opacity-50"
      >
        Générer l’export comptable
      </button>
    </div>
  );
}
