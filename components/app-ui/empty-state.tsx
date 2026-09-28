import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function EmptyState({
  title,
  text,
  actionHref,
  actionLabel,
  action,
  icon: Icon = FolderOpen,
  className,
}: {
  title: string;
  text: string;
  actionHref?: string;
  actionLabel?: string;
  action?: React.ReactNode;
  icon?: LucideIcon;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-card border border-dashed border-line bg-surface px-6 py-12 text-center shadow-soft",
        className,
      )}
    >
      <span className="mx-auto grid size-9 place-items-center rounded-[10px] border border-line bg-surface-2 text-muted-foreground">
        <Icon className="size-4" strokeWidth={1.75} aria-hidden />
      </span>
      <p className="mt-4 font-display text-[16px] font-semibold tracking-[-0.02em] text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-[40ch] text-[14px] leading-relaxed text-muted-foreground">{text}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
      {!action && actionHref && actionLabel ? (
        <Link
          href={actionHref}
          className="btn-orange mt-5 inline-flex h-9 items-center px-4 text-[13.5px] font-medium"
        >
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function StatCards({
  items,
}: {
  items: { label: string; value: string }[];
}) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <li key={item.label} className="rounded-card border border-line bg-surface px-5 py-4">
          <p className="text-[12px] text-muted-foreground">{item.label}</p>
          <p className="mt-1 font-display text-[22px] font-semibold tabular-nums tracking-[-0.02em]">{item.value}</p>
        </li>
      ))}
    </ul>
  );
}
