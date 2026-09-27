import type { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * Cadre produit (double-bezel Figma) : coque + Card shadcn.
 * `className` = layout seulement.
 */
export function LandingFrame({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[28px] bg-foreground/[0.04] p-1.5 ring-1 ring-foreground/10",
        className,
      )}
    >
      <Card
        className={cn(
          "gap-0 overflow-hidden rounded-[22px] py-0 shadow-lift ring-foreground/8",
          innerClassName,
        )}
      >
        {children}
      </Card>
    </div>
  );
}
