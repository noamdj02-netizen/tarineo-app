"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Hover goutte — wash orange qui monte (clip-path), lift discret.
 * CSS only : pas de blob Framer.
 */
export function GoutteFillButton({
  active,
  children,
  className,
  contentClassName,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  children: ReactNode;
  contentClassName?: string;
}) {
  return (
    <button
      type="button"
      {...props}
      data-active={active ? "true" : undefined}
      className={cn(
        "group relative isolate overflow-hidden rounded-[14px] border border-line bg-surface text-left",
        "transition-[border-color,transform,box-shadow] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        "hover:-translate-y-px hover:border-[color-mix(in_oklab,var(--tarineo-orange)_28%,var(--color-line))]",
        "hover:shadow-[0_10px_28px_-16px_rgba(0,0,0,0.14)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange-ring",
        "active:translate-y-0 active:scale-[0.995]",
        "data-[active=true]:border-[color-mix(in_oklab,var(--tarineo-orange)_40%,var(--color-line))]",
        "data-[active=true]:shadow-[0_10px_28px_-16px_rgba(255,107,26,0.2)]",
        "motion-reduce:transition-colors motion-reduce:hover:translate-y-0",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 bg-wash-orange",
          "transition-[clip-path] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "[clip-path:inset(100%_0_0_0)]",
          "group-hover:[clip-path:inset(0_0_0_0)]",
          "group-data-[active=true]:[clip-path:inset(0_0_0_0)]",
          "motion-reduce:transition-none",
          "motion-reduce:group-hover:bg-wash-orange motion-reduce:group-hover:[clip-path:inset(0)]",
        )}
      />
      {/* Ligne de niveau — lecture « liquide » sans blob */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-3 h-px bg-[color-mix(in_oklab,var(--tarineo-orange)_35%,transparent)]",
          "bottom-0 opacity-0 transition-[bottom,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "group-hover:bottom-[calc(100%-1px)] group-hover:opacity-100",
          "group-data-[active=true]:bottom-[calc(100%-1px)] group-data-[active=true]:opacity-0",
          "motion-reduce:hidden",
        )}
      />
      <span className={cn("relative z-10", contentClassName)}>{children}</span>
    </button>
  );
}
