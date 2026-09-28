"use client";

import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function ErrorState({
  title = "Impossible de charger cette page",
  text = "Une erreur est survenue. Réessayez.",
  onRetry,
  retryLabel = "Réessayer",
  className,
}: {
  title?: string;
  text?: string;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
}) {
  return (
    <div
      role="alert"
      className={cn(
        "rounded-card border border-line bg-surface px-6 py-12 text-center shadow-soft",
        className,
      )}
    >
      <span className="mx-auto grid size-9 place-items-center rounded-[10px] border border-line bg-surface-2 text-muted-foreground">
        <AlertCircle className="size-4" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="mt-4 font-display text-[16px] font-semibold tracking-[-0.02em] text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-[40ch] text-[14px] leading-relaxed text-muted-foreground">{text}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="btn-orange mt-5 inline-flex h-9 items-center px-4 text-[13.5px] font-medium"
        >
          {retryLabel}
        </button>
      ) : null}
    </div>
  );
}
