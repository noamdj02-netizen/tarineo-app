"use client";

import { GripVertical, X } from "lucide-react";
import type { WidgetKey } from "@/lib/home/dashboard-prefs";
import { WIDGET_LABELS } from "@/lib/home/dashboard-prefs";
import { cn } from "@/lib/utils";

export function DashboardWidget({
  id,
  column,
  editMode,
  ring,
  children,
  onDragStart,
  onDragOver,
  onDrop,
  onRemove,
}: {
  id: WidgetKey;
  column: "left" | "right";
  editMode: boolean;
  ring?: boolean;
  children: React.ReactNode;
  onDragStart: (key: WidgetKey, column: "left" | "right") => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (key: WidgetKey, column: "left" | "right") => void;
  onRemove?: () => void;
}) {
  return (
    <div
      data-widget={id}
      data-column={column}
      draggable={editMode}
      onDragStart={(e) => {
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("application/x-navpit-widget", id);
        e.dataTransfer.setData("application/x-navpit-column", column);
        onDragStart(id, column);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        onDragOver(e);
      }}
      onDrop={(e) => {
        e.preventDefault();
        const dragged = e.dataTransfer.getData("application/x-navpit-widget") as WidgetKey;
        const fromCol = e.dataTransfer.getData("application/x-navpit-column") as "left" | "right";
        if (dragged) onDrop(dragged, fromCol);
      }}
      className={cn(
        "relative transition-[box-shadow] duration-150 ease-out",
        ring && "rounded-card ring-2 ring-ink/12 ring-offset-2 ring-offset-bg",
        editMode && "rounded-card ring-1 ring-dashed ring-ink/15",
      )}
    >
      {editMode ? (
        <div className="mb-1.5 flex items-center gap-1 px-1 text-[11px] text-muted-foreground">
          <div className="flex min-w-0 flex-1 cursor-grab items-center gap-1 active:cursor-grabbing">
            <GripVertical className="size-3.5 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="truncate">{WIDGET_LABELS[id]}</span>
          </div>
          {onRemove ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="inline-flex h-7 shrink-0 items-center gap-1 rounded-md px-2 text-[12px] font-medium text-ink transition-[background-color,transform] duration-150 ease-out hover:bg-surface-2 active:scale-[0.96] [-webkit-tap-highlight-color:transparent]"
              aria-label={`Retirer ${WIDGET_LABELS[id]}`}
            >
              <X className="size-3.5" strokeWidth={2} aria-hidden />
              Retirer
            </button>
          ) : null}
        </div>
      ) : null}
      {children}
    </div>
  );
}
