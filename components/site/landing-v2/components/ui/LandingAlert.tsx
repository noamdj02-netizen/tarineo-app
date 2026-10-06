"use client";

import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

/** Alertes landing — structure daisyUI `alert` + tokens Tarinéo (sans plugin daisyUI). */
const alertVariants = cva(
  "landing-alert flex flex-col gap-1 rounded-lg border px-4 py-3 text-sm sm:flex-row sm:items-start sm:gap-3",
  {
    variants: {
      variant: {
        info: "landing-alert-info border-line bg-paper-50 text-ink-600",
        success: "landing-alert-success border-accent/30 bg-accent-soft/50 text-ink-700",
        warning: "landing-alert-warning border-warning/25 bg-warning-soft text-ink-700",
        error: "landing-alert-error border-red-200/80 bg-red-50 text-red-800",
      },
    },
    defaultVariants: {
      variant: "info",
    },
  },
);

type LandingAlertProps = VariantProps<typeof alertVariants> & {
  title?: ReactNode;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
};

export function LandingAlert({ variant, title, children, className, actions }: LandingAlertProps) {
  return (
    <div role="alert" className={cn(alertVariants({ variant }), className)}>
      <div className="min-w-0 flex-1">
        {title ? <p className="font-medium text-ink-900">{title}</p> : null}
        <div className={cn(title && "mt-1")}>{children}</div>
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2 sm:pt-0.5">{actions}</div> : null}
    </div>
  );
}

export { alertVariants };
