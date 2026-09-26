"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { RangeKey } from "@/lib/admin/range";
import { cn } from "@/lib/utils";

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "today", label: "Aujourd'hui" },
  { key: "7d", label: "7 jours" },
  { key: "30d", label: "30 jours" },
  { key: "90d", label: "90 jours" },
];

export function RangeBar({ extra }: { extra?: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = (params.get("range") as RangeKey) || "30d";

  function setRange(key: RangeKey) {
    const next = new URLSearchParams(params.toString());
    next.set("range", key);
    next.delete("from");
    next.delete("to");
    router.replace(`${pathname}?${next.toString()}`);
  }

  return (
    <header className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p className="mono-label">/ Admin ///</p>
        <p className="mt-1 font-display text-[22px] font-semibold tracking-tightest">
          {new Intl.DateTimeFormat("fr-FR", {
            day: "numeric",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
            .format(new Date())
            .replace(",", " —")}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {extra}
        {RANGES.map((range) => (
          <button
            key={range.key}
            type="button"
            onClick={() => setRange(range.key)}
            className={cn(
              "min-h-8 rounded-pill px-3 text-[12.5px]",
              current === range.key ? "bg-ink text-white" : "border border-line bg-surface text-ink hover:bg-surface-2",
            )}
          >
            {range.label}
          </button>
        ))}
      </div>
    </header>
  );
}
