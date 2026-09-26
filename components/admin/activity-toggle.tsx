"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const MODES = [
  { key: "dau", label: "DAU" },
  { key: "wau", label: "WAU" },
  { key: "mau", label: "MAU" },
] as const;

export function ActivityToggle() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const current = params.get("activity") ?? "dau";
  return (
    <div className="flex gap-1">
      {MODES.map((mode) => (
        <button
          key={mode.key}
          type="button"
          onClick={() => {
            const next = new URLSearchParams(params.toString());
            next.set("activity", mode.key);
            router.replace(`${pathname}?${next.toString()}`);
          }}
          className={cn(
            "min-h-8 rounded-pill px-3 font-mono text-[11px]",
            current === mode.key ? "bg-ink text-white" : "border border-line text-muted-foreground",
          )}
        >
          {mode.label}
        </button>
      ))}
    </div>
  );
}
