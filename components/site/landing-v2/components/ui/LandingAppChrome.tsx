import type { ReactNode } from "react";

import { LandingChromeDots } from "@/components/site/landing-v2/components/ui/LandingChromeDots";
import { cn } from "@/lib/utils";

/** Mini-fenêtre app (cartes parcours, scènes imbriquées). */
export function LandingAppChrome({
  title = "app",
  children,
  className,
  bodyClassName,
}: {
  title?: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[10px] border border-line bg-paper-0 ring-1 ring-black/[0.04]",
        className,
      )}
    >
      <div className="flex items-center gap-1 border-b border-line/90 bg-paper-50 px-2 py-1">
        <LandingChromeDots size="sm" />
        <span className="ml-auto font-mono text-[9px] tracking-wide text-ink-300">{title}</span>
      </div>
      <div className={cn("bg-paper-50/90 p-2.5", bodyClassName)}>{children}</div>
    </div>
  );
}
