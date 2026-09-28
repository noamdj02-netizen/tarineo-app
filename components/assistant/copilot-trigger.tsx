"use client";

import { openAssistant } from "@/lib/assistant/open";
import { cn } from "@/lib/utils";
import { TarineoCopilotAvatar } from "./copilot-face";

const FAB =
  "inline-flex h-11 min-w-[112px] items-center justify-center gap-1.5 rounded-full bg-[#FF6B1A] py-0 pr-3 pl-1.5 text-[13px] font-medium text-white shadow-[0_2px_8px_rgba(0,0,0,0.08)] transition-[filter,transform,background-color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:brightness-[0.96] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B1A]/40 motion-reduce:transition-none";

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
        className={cn(
          "grid size-11 place-items-center rounded-full bg-[#FF6B1A] transition-[filter,transform] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:brightness-[0.96] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B1A]/40",
          className,
        )}
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
      <kbd className="hidden rounded-md bg-white/15 px-1.5 py-0.5 font-mono text-[10.5px] text-white lg:inline">
        ⌘J
      </kbd>
    </button>
  );
}
