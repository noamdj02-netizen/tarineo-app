"use client";

import { GripVertical } from "lucide-react";
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
}: {
  id: WidgetKey;
  column: "left" | "right";
  editMode: boolean;
  ring?: boolean;
  children: React.ReactNode;
  onDragStart: (key: WidgetKey, column: "left" | "right") => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (key: WidgetKey, column: "left" | "right") => void;
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
        "relative transition-shadow",
        ring && "rounded-card ring-2 ring-ink/12 ring-offset-2 ring-offset-bg",
        editMode && "rounded-card ring-1 ring-dashed ring-ink/15",
      )}
    >
      {editMode ? (
        <div
          className="mb-1.5 flex cursor-grab items-center gap-1 px-1 text-[11px] text-muted-foreground active:cursor-grabbing"
          aria-hidden
        >
          <GripVertical className="size-3.5" />
          {WIDGET_LABELS[id]}
        </div>
      ) : null}
      {children}
    </div>
  );
}
