"use client";

import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { StaggerItem } from "@/components/site/product-demo/motion-card";
import { PRODUCT_MODULES } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

/** Ancres des sections démo sur la home. */
const MODULE_HREF: Record<string, string> = {
  "devis-ia": "/#fonctionnalites",
  chantiers: "/#fonctionnalites",
  achats: "/#fonctionnalites",
  documents: "/#fonctionnalites",
  prix: "/#fonctionnalites",
  facturation: "/#relances",
  copilote: "/#fonctionnalites",
};

/** Index modules — grille bento, liens vers les démos au-dessus. */
export function ProductDemoFeatures({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "mx-auto grid w-full max-w-[1080px] gap-x-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10",
        className,
      )}
    >
      {PRODUCT_MODULES.map((m, i) => {
        const href = MODULE_HREF[m.id] ?? "#fonctionnalites";
        return (
          <StaggerItem key={m.id} index={i}>
            <Link
              href={href}
              className={cn(
                "group flex h-full flex-col gap-2.5 border-t border-line py-7 transition-colors duration-300 hover:bg-wash-neutral/80 sm:py-8",
                m.span,
              )}
            >
              <span
                aria-hidden
                className="font-display text-[12px] font-semibold tabular-nums tracking-[0.12em] text-tarineo-orange"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="flex items-start justify-between gap-3">
                <h3 className="text-[17px] font-semibold tracking-[-0.022em] text-ink">
                  {m.title}
                </h3>
                <ArrowUpRight
                  aria-hidden
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-tarineo-orange"
                  strokeWidth={1.75}
                />
              </span>
              <p className="max-w-prose text-[15px] leading-[1.55] text-landing-ink-muted">
                {m.text}
              </p>
              <span className="mt-auto pt-1 text-[12px] font-medium text-muted-foreground group-hover:text-ink">
                Voir la démo
              </span>
            </Link>
          </StaggerItem>
        );
      })}
    </div>
  );
}
