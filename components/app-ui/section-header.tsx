import Link from "next/link";
import { cn } from "@/lib/utils";

export function SectionHeader({
  title,
  description,
  href,
  linkLabel,
  className,
}: {
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-[12px] font-semibold tracking-[0.06em] text-muted-foreground uppercase">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-[13px] text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {href && linkLabel ? (
        <Link
          href={href}
          className="shrink-0 text-[13px] font-medium text-tarineo-orange transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:text-tarineo-orange"
        >
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
