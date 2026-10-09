import type { ReactNode } from "react";

import { LandingChromeDots } from "@/components/site/landing-v2/components/ui/LandingChromeDots";
import { cn } from "@/lib/utils";

/** Mockup produit large (hero, preuve, capture app). */
export function LandingProductFrame({
  title,
  children,
  footer,
  className,
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "landing-product-frame overflow-hidden rounded-xl border border-line bg-paper-0 ring-1 ring-black/[0.04]",
        className,
      )}
    >
      <div className="flex items-center gap-3 border-b border-line bg-paper-50/95 px-4 py-2.5">
        <LandingChromeDots />
        <p className="min-w-0 flex-1 truncate text-center text-xs font-medium text-ink-500">{title}</p>
        <span className="w-12 shrink-0" aria-hidden />
      </div>
      <div className="relative bg-paper-0">{children}</div>
      {footer ? <div className="border-t border-line">{footer}</div> : null}
    </div>
  );
}
