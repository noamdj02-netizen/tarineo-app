"use client";

import { useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Poignée entre deux colonnes du dashboard (30–70 %). */
export function ColumnResizer({
  onChange,
  className,
}: {
  onChange: (splitPercent: number) => void;
  className?: string;
}) {
  const dragging = useRef(false);

  const onMove = useCallback(
    (clientX: number, container: HTMLElement) => {
      const rect = container.getBoundingClientRect();
      const pct = ((clientX - rect.left) / rect.width) * 100;
      onChange(Math.round(Math.min(70, Math.max(30, pct))));
    },
    [onChange],
  );

  useEffect(() => {
    const onUp = () => {
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const container = document.getElementById("home-dashboard-columns");
      if (container) onMove(e.clientX, container);
    };
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [onMove]);

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Redimensionner les colonnes"
      className={cn(
        "group relative z-10 hidden w-2 shrink-0 cursor-col-resize xl:block",
        className,
      )}
      onMouseDown={(e) => {
        e.preventDefault();
        dragging.current = true;
        document.body.style.cursor = "col-resize";
        document.body.style.userSelect = "none";
      }}
    >
      <span
        className="absolute inset-y-4 left-1/2 w-1 -translate-x-1/2 rounded-full bg-line transition-colors group-hover:bg-ink/25 group-active:bg-ink/40"
        aria-hidden
      />
    </div>
  );
}
