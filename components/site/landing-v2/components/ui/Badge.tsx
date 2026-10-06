import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Badge landing — équivalent daisyUI `badge` / `badge-soft` (tokens `.landing-v2`). */
const badgeVariants = cva(
  "landing-badge inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium nums",
  {
    variants: {
      tone: {
        accent: "bg-accent-soft text-accent-700",
        muted: "border border-line bg-paper-50 text-ink-400",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        dark: "bg-ink-900 text-white",
        outline: "badge-outline border border-line bg-transparent text-ink-600",
      },
      size: {
        md: "text-xs",
        sm: "!py-0 text-[10px]",
      },
    },
    defaultVariants: {
      tone: "muted",
      size: "md",
    },
  },
);

const dotColors: Record<NonNullable<VariantProps<typeof badgeVariants>["tone"]>, string> = {
  accent: "bg-accent",
  muted: "bg-ink-300",
  success: "bg-success",
  warning: "bg-warning",
  dark: "bg-white",
  outline: "bg-ink-300",
};

export function Badge({
  children,
  tone = "muted",
  size = "md",
  dot = false,
  className = "",
}: VariantProps<typeof badgeVariants> & {
  children: ReactNode;
  dot?: boolean;
  className?: string;
}) {
  return (
    <span className={cn(badgeVariants({ tone, size }), className)}>
      {dot ? (
        <span
          className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColors[tone ?? "muted"])}
          aria-hidden="true"
        />
      ) : null}
      {children}
    </span>
  );
}

export { badgeVariants };
