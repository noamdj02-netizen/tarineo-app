import type { ReactNode } from "react";

import { LandingProductFrame } from "@/components/site/landing-v2/components/ui/LandingProductFrame";
import { cn } from "@/lib/utils";

/** @deprecated Préférer `LandingProductFrame`. */
export function LandingWindowChrome({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <LandingProductFrame title={title} className={cn("shadow-sm", className)}>
      {children}
    </LandingProductFrame>
  );
}
