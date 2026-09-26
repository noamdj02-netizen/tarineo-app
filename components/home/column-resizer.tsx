"use client";

import { useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

const MIN = 30;
const MAX = 70;

function rubberband(overshoot: number, dimension = 40, constant = 0.55) {
  return (overshoot * dimension * constant) / (dimension + constant * Math.abs(overshoot));
}

function liveSplit(raw: number) {
  if (raw < MIN) return MIN - rubberband(MIN - raw);
  if (raw > MAX) return MAX + rubberband(raw - MAX);
  return raw;
}

/** Poignée entre deux colonnes : 1:1 au doigt, résistance au-delà de 30–70. */
export function ColumnResizer({
  onChange,
  onCommit,
  className,
}: {
  onChange: (splitPercent: number) => void;
  onCommit?: (splitPercent: number) => void;
  className?: string;
}) {
  const last = useRef(50);

  const measure = useCallback((clientX: number) => {
    const container = document.getElementById("home-dashboard-columns");
    if (!container) return last.current;
    const rect = container.getBoundingClientRect();
    const raw = ((clientX - rect.left) / rect.width) * 100;
    last.current = liveSplit(raw);
    return last.current;
  }, []);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Redimensionner les colonnes"
      className={cn(
        "group relative z-10 hidden w-3 shrink-0 cursor-col-resize touch-none xl:block",
        className,
      )}
      onPointerDown={(e) => {
        e.preventDefault();
        e.currentTarget.setPointerCapture(e.pointerId);
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
        onChange(measure(e.clientX));
      }}
      onPointerMove={(e) => {
        if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
        onChange(measure(e.clientX));
      }}
      onPointerUp={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
        const snapped = Math.min(MAX, Math.max(MIN, last.current));
        last.current = snapped;
        (onCommit ?? onChange)(Math.round(snapped));
      }}
    >
      <span
        className="absolute inset-y-6 left-1/2 w-1 -translate-x-1/2 rounded-full bg-line transition-colors group-hover:bg-ink/30 group-active:bg-ink/50"
        aria-hidden
      />
    </div>
  );
}
