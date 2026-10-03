import Link from "next/link";
import { cn } from "@/lib/utils";

export function TarineoPanelCard({
  title,
  action,
  href,
  hrefLabel = "Voir tout",
  className,
  bodyClassName,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  href?: string;
  hrefLabel?: string;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  const link =
    href ? (
      <Link
        href={href}
        className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-ink"
      >
        {hrefLabel} →
      </Link>
    ) : null;

  return (
    <div className={cn("card-soft flex flex-col overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="font-display text-[16px] font-semibold tracking-tight text-ink">{title}</h2>
        {action ?? link}
      </div>
      <div className={cn("min-w-0", bodyClassName)}>{children}</div>
    </div>
  );
}
