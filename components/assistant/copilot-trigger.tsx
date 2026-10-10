"use client";

import { openAssistant } from "@/lib/assistant/open";
import { cn } from "@/lib/utils";
import { TarineoCopilotAvatar } from "./copilot-face";

const FAB =
  "inline-flex h-11 min-w-[112px] items-center justify-center gap-1.5 rounded-full border border-line bg-surface py-0 pr-3 pl-1.5 text-[13px] font-medium text-ink shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-[background-color,border-color,transform,box-shadow] duration-150 ease-out hover:border-tarineo-orange/35 hover:bg-wash-orange hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange-ring motion-reduce:transition-none motion-reduce:active:scale-100 [-webkit-tap-highlight-color:transparent]";

const COMPACT =
  "grid size-11 place-items-center rounded-full border border-line bg-surface shadow-[0_2px_12px_rgba(0,0,0,0.06)] backdrop-blur-xl transition-[background-color,border-color,transform,box-shadow] duration-150 ease-out hover:border-tarineo-orange/35 hover:bg-wash-orange active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange-ring motion-reduce:transition-none motion-reduce:active:scale-100 [-webkit-tap-highlight-color:transparent]";

export function CopilotTrigger({
  variant = "inline",
  onClick,
  className,
}: {
  variant?: "floating" | "inline" | "compact";
  onClick?: () => void;
  className?: string;
}) {
  const handle = onClick ?? (() => openAssistant());

  if (variant === "compact") {
    return (
      <button
        type="button"
        onClick={handle}
        aria-label="Ouvrir le Copilote TARINEO (⌘J)"
        className={cn(COMPACT, className)}
      >
        <TarineoCopilotAvatar variant="fab" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handle}
      aria-label="Ouvrir le Copilote TARINEO (⌘J)"
      className={cn(
        FAB,
        variant === "floating" &&
          "fixed right-4 z-[45] bottom-[calc(112px+env(safe-area-inset-bottom,0px))] lg:right-6 lg:bottom-6",
        className,
      )}
    >
      <TarineoCopilotAvatar variant="fab" />
      <span>Copilote</span>
      <kbd className="hidden rounded-md border border-line/80 bg-surface-2 px-1.5 py-0.5 font-mono text-[10.5px] text-muted-foreground lg:inline">
        ⌘J
      </kbd>
    </button>
  );
}
