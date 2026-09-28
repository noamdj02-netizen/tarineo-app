import { filterPillClass } from "@/components/app-ui/filter-pills";
import Link from "next/link";

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
            className={filterPillClass(on)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
