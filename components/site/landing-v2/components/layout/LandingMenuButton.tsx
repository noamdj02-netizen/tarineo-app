"use client";

import { cn } from "@/lib/utils";

type Props = {
  onClick: () => void;
  open: boolean;
  className?: string;
};

/** Déclencheur du tiroir — discret sur desktop, plus visible sur mobile. */
export function LandingMenuButton({ onClick, open, className }: Props) {
  return (
    <button
      type="button"
      aria-expanded={open}
      aria-haspopup="dialog"
      aria-label={open ? "Fermer le menu" : "Ouvrir le menu de navigation"}
      onClick={onClick}
      className={cn(
        "inline-flex shrink-0 touch-manipulation items-center justify-center rounded-full text-ink-600 outline-none transition-colors duration-200",
        "hover:bg-paper-0 hover:text-ink-900",
        "focus-visible:ring-2 focus-visible:ring-accent/45 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-100",
        "h-11 w-11 min-h-11 min-w-11",
        "border border-line bg-paper-0 shadow-sm",
        "text-ink-700",
        className,
      )}
    >
      <svg
        viewBox="0 0 20 20"
        className="h-[1.125rem] w-[1.125rem]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.65}
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M4 6h12M4 10h12M4 14h8" />
      </svg>
    </button>
  );
}
