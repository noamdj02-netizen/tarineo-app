import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { href?: string; label: string };

export function PageHeader({
  crumbs,
  title,
  description,
  action,
  className,
  dense,
}: {
  crumbs?: Crumb[];
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  dense?: boolean;
}) {
  return (
    <header className={cn("mb-8 flex flex-col", dense ? "mb-0 gap-3" : "gap-4", className)}>
      {crumbs?.length ? (
        <nav aria-label="Fil d’Ariane" className="flex flex-wrap items-center gap-1.5 text-[12px] text-[#8A8A8A]">
          {crumbs.map((c, i) => (
            <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
              {i > 0 ? <span aria-hidden className="text-ink/20">/</span> : null}
              {c.href && i < crumbs.length - 1 ? (
                <Link href={c.href} className="transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:text-ink">
                  {c.label}
                </Link>
              ) : (
                <span className={i === crumbs.length - 1 ? "text-[#6E6E6E]" : undefined}>{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : null}
      <div className={cn("flex flex-col sm:flex-row sm:items-end sm:justify-between", dense ? "gap-3" : "gap-4")}>
        <div className="min-w-0 max-w-[62ch]">
          <h1
            className={cn(
              "font-display font-semibold tracking-[-0.03em] text-ink",
              dense
                ? "text-[28px] leading-[1.15] md:text-[32px] md:leading-[1.12] md:tracking-[-0.035em]"
                : "text-[28px] leading-[1.15] md:text-[32px] md:leading-[1.12]",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p className={cn("mt-2 text-[14px] leading-relaxed", dense ? "text-[#6E6E6E]" : "text-muted-foreground")}>
              {description}
            </p>
          ) : null}
        </div>
        {action ? (
          <div className="flex w-full shrink-0 flex-wrap gap-2 md:w-auto [&_a]:max-md:min-h-11 [&_button]:max-md:min-h-11">
            {action}
          </div>
        ) : null}
      </div>
    </header>
  );
}
