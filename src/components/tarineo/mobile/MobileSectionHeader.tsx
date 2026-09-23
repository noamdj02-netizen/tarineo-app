import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function MobileSectionHeader({
  title,
  href,
  linkLabel = "Voir tout →",
  icon,
  className,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h2 className="flex min-w-0 items-center gap-2 text-[17px] font-bold tracking-[-0.2px] text-[#0f1c28]">
        {icon && <span className="shrink-0 text-primary">{icon}</span>}
        <span className="truncate">{title}</span>
      </h2>
      {href && (
        <Link href={href} className="shrink-0 text-[13px] font-semibold text-primary">
          {linkLabel}
        </Link>
      )}
    </div>
  );
}
