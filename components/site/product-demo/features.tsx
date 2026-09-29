"use client";

import {
  Bot,
  FileSpreadsheet,
  FolderKanban,
  HardHat,
  LineChart,
  Receipt,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { ShinySurface } from "@/components/animata";
import { StaggerItem } from "@/components/site/product-demo/motion-card";
import { PRODUCT_MODULES } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

const ICONS: Record<(typeof PRODUCT_MODULES)[number]["id"], LucideIcon> = {
  "devis-ia": Sparkles,
  chantiers: HardHat,
  achats: FolderKanban,
  documents: FileSpreadsheet,
  prix: LineChart,
  facturation: Receipt,
  copilote: Bot,
};

/**
 * Composition éditoriale des modules produit — tailles variables, pas 7 cartes clones.
 */
export function ProductDemoFeatures({ className }: { className?: string }) {
  return (
    <div className={cn("mx-auto w-full max-w-[1080px]", className)}>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 lg:auto-rows-[minmax(140px,auto)]">
        {PRODUCT_MODULES.map((m, i) => {
          const Icon = ICONS[m.id];
          const tall = m.id === "achats";
          return (
            <StaggerItem key={m.id} index={i} className={cn(m.span, tall && "lg:min-h-full")}>
              <ShinySurface className="h-full rounded-[16px]">
                <article
                  className={cn(
                    "flex h-full flex-col p-5 sm:p-6",
                    tall && "lg:justify-between",
                  )}
                >
                  <span className="mb-4 grid size-10 place-items-center rounded-[12px] bg-[rgba(255,107,26,0.12)] text-[#FF6B1A]">
                    <Icon className="size-5" strokeWidth={1.75} aria-hidden />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-[16px] font-semibold tracking-[-0.02em] text-[#0A0A0A] sm:text-[17px]">
                      {m.title}
                    </h3>
                    <p
                      className={cn(
                        "mt-2 text-[14px] leading-[1.5] text-[#6E6E6E]",
                        tall && "sm:text-[15px] sm:leading-[1.55]",
                      )}
                    >
                      {m.text}
                    </p>
                  </div>
                </article>
              </ShinySurface>
            </StaggerItem>
          );
        })}
      </ul>
    </div>
  );
}
