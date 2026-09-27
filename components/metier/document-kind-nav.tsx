import Link from "next/link";
import { cn } from "@/lib/utils";

export function DocumentKindNav({
  base,
  items,
  active,
}: {
  base: string;
  items: { kind: string | null; label: string }[];
  active: string | null;
}) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Type de pièce">
      {items.map((item) => {
        const href = item.kind ? `${base}?kind=${item.kind}` : base;
        const on = (item.kind ?? null) === active;
        return (
          <Link
            key={item.label}
            href={href}
            className={cn(
              "rounded-full px-3 py-1.5 text-[13px]",
              on ? "bg-ink text-accent-ink" : "border border-line hover:bg-surface-2",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
