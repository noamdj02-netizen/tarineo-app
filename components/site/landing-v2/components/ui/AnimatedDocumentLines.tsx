"use client";

import { LandingStagger, LandingStaggerItem } from "@/components/site/landing-v2/lib/landing-motion";

type Line = { ref: string; label: string; qty: string; price: string };

/** Lignes de document qui s’empilent au scroll (construction progressive). */
export function AnimatedDocumentLines({
  lines,
  className = "",
}: {
  lines: Line[];
  className?: string;
}) {
  return (
    <LandingStagger
      className={`border-t border-line pt-3 ${className}`}
      stagger={0.08}
    >
      <ul className="flex flex-col gap-2">
        {lines.map((line) => (
          <LandingStaggerItem key={line.ref}>
            <li className="flex items-baseline justify-between gap-3 text-xs">
              <span className="truncate text-ink-600">{line.label}</span>
              <span className="shrink-0 text-ink-400 nums">
                {line.qty} × {line.price}
              </span>
            </li>
          </LandingStaggerItem>
        ))}
      </ul>
    </LandingStagger>
  );
}
