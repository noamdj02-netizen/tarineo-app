"use client";

import Link from "next/link";
import { AnimatedBarFill } from "./motion/AnimatedBarFill";

export type BarreDistributeur = {
  norm: string;
  label: string;
  count: number;
  href?: string;
};

export function MiniBarChart({ items, maxVisible = 5 }: { items: BarreDistributeur[]; maxVisible?: number }) {
  if (items.length === 0) return null;

  const visibles = items.slice(0, maxVisible);
  const max = Math.max(...visibles.map((d) => d.count), 1);

  return (
    <div className="flex flex-col gap-2">
      {visibles.map((d, i) => {
        const widthPct = (d.count / max) * 100;
        const contenu = (
          <>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="truncate text-foreground">{d.label}</span>
              <span className="shrink-0 tabular-nums text-muted-foreground">{d.count}</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
              <AnimatedBarFill widthPct={widthPct} delay={i * 0.06} />
            </div>
          </>
        );

        if (d.href) {
          return (
            <Link key={d.norm} href={d.href} className="group block rounded-lg px-1 py-0.5 hover:bg-secondary/60">
              <span className="group-hover:text-primary">{contenu}</span>
            </Link>
          );
        }

        return <div key={d.norm}>{contenu}</div>;
      })}
    </div>
  );
}
