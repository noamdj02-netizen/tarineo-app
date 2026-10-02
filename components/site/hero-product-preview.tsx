"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { DeltaBadge, PriceMove } from "@/components/site/delta-badge";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { ProductDemoShell, ProductDemoSurface } from "@/components/site/product-demo/shell";
import { PRODUCT_DEMO } from "@/lib/site/product-demo";
import { euroInt } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const EASE = [0.32, 0.72, 0, 1] as const;

/** Accueil compact pour le hero — données réelles de la démo marketing. */
export function HeroProductPreview({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { chantier, hausse, kpis, actions } = PRODUCT_DEMO;
  const focusKpis = kpis.slice(0, 2);
  const alert = actions[1]!;

  return (
    <motion.div
      className={cn("w-full", className)}
      initial={reduce ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE, delay: 0.12 }}
    >
      <ProductDemoShell title="Accueil" bodyClassName="space-y-3 !p-3 sm:!p-4">
        <div className="grid grid-cols-2 gap-2">
          {focusKpis.map((k) => (
            <ProductDemoSurface key={k.label} className="px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.04em] text-[#6E6E6E] uppercase">
                <span
                  aria-hidden
                  className="size-[5px] rounded-full"
                  style={{ background: k.accent }}
                />
                {k.label}
              </p>
              <p className="mt-1 font-display text-[22px] font-semibold tracking-[-0.03em] text-[#0A0A0A] tabular-nums">
                {k.value}
              </p>
              <p className="text-[11px] text-[#6E6E6E]">{k.hint}</p>
            </ProductDemoSurface>
          ))}
        </div>

        <ProductDemoSurface className="overflow-hidden border-l-[3px] border-l-[#FF6B1A] p-3.5 sm:p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <SupplierLogo name="Cedeo" size={32} className="rounded-[8px]" />
              <div className="min-w-0">
                <p className="truncate text-[14px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
                  {hausse.product}
                </p>
                <p className="truncate text-[12px] text-[#6E6E6E]">{hausse.supplier}</p>
              </div>
            </div>
            <DeltaBadge value={hausse.pct} className="shrink-0" />
          </div>
          <PriceMove
            before={hausse.before}
            after={hausse.after}
            align="start"
            className="mt-3"
          />
          <p className="mt-2.5 text-[12px] leading-snug text-[#6E6E6E]">
            Lié à {chantier.name} · comparé à votre historique
          </p>
        </ProductDemoSurface>

        <ProductDemoSurface className="flex items-center justify-between gap-3 px-3.5 py-3">
          <div className="min-w-0">
            <p className="truncate text-[13px] font-medium text-[#0A0A0A]">{alert.title}</p>
            <p className="truncate text-[11px] text-[#6E6E6E]">{alert.hint}</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-[#FF6B1A]">
            {alert.cta}
            <ArrowRight className="size-3.5" strokeWidth={2.2} aria-hidden />
          </span>
        </ProductDemoSurface>

        <div className="flex items-center justify-between gap-3 rounded-[12px] bg-[#FFFFFF] px-3.5 py-2.5 ring-1 ring-[rgba(10,10,10,0.06)]">
          <div className="min-w-0">
            <p className="truncate text-[12px] font-medium text-[#0A0A0A]">{chantier.name}</p>
            <p className="text-[11px] text-[#6E6E6E]">
              Marge {euroInt(chantier.marge)} · {chantier.margePct.toLocaleString("fr-FR")} %
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-[rgba(22,163,74,0.12)] px-2.5 py-1 text-[11px] font-medium text-[#16A34A]">
            {chantier.status}
          </span>
        </div>
      </ProductDemoShell>
    </motion.div>
  );
}
