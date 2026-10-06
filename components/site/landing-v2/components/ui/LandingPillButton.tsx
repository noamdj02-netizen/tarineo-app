"use client";

import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Filtres / choix — équivalent daisyUI `filter` + `btn` (tokens landing). */
const pillVariants = cva("landing-filter-btn disabled:cursor-not-allowed disabled:opacity-40", {
  variants: {
    tone: {
      default: "",
      compact: "min-h-9 px-3 py-1.5 text-xs sm:text-sm",
      regular: "px-4 py-2 text-sm",
    },
    selected: {
      true: "landing-filter-btn-active",
      false: "landing-filter-btn-inactive",
    },
  },
  defaultVariants: {
    tone: "regular",
    selected: false,
  },
});

type LandingPillButtonProps = VariantProps<typeof pillVariants> & {
  children: ReactNode;
  className?: string;
  disabled?: boolean;
  onClick: () => void;
  "aria-pressed"?: boolean;
};

export function LandingPillButton({
  children,
  className,
  disabled,
  onClick,
  selected,
  tone,
  "aria-pressed": ariaPressed,
}: LandingPillButtonProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      aria-pressed={ariaPressed ?? selected ?? false}
      className={cn(pillVariants({ tone, selected }), className)}
    >
      {children}
    </button>
  );
}
