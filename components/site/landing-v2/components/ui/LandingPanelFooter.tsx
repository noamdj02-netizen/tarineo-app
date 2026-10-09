import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function LandingPanelFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 bg-gradient-to-r from-accent-soft via-paper-0 to-paper-0 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6",
        className,
      )}
    >
      {children}
    </div>
  );
}
