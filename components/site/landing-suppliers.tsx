"use client";

import { motion, useReducedMotion } from "framer-motion";
import { EASE, SectionEnter } from "@/components/motion/reveal";
import { DeltaBadge } from "@/components/site/delta-badge";
import { LandingFrame } from "@/components/site/landing-frame";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DEMO_MARK, DEMO_NOTE, euroInt, SUPPLIERS, SUPPLIERS_DISCLAIMER } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

/** Vue par fournisseur : montant, documents, hausse moyenne. */
export function LandingSuppliers() {
  const reduce = useReducedMotion();
  const total = SUPPLIERS.reduce((n, s) => n + s.spent, 0);

  return (
    <SectionEnter className="mx-auto max-w-[1080px]">
      <LandingFrame>
        <div className="flex flex-wrap items-end justify-between gap-3 px-5 py-4 sm:px-6">
          <div>
            <p className="text-[16px] font-semibold">Achats par fournisseur</p>
            <p className="text-[13px] text-muted-foreground">
              {euroInt(total)} sur 12 mois ·{" "}
              {SUPPLIERS.reduce((n, s) => n + s.docs, 0)} documents
            </p>
          </div>
          <Badge variant="outline" className="uppercase">
            {DEMO_MARK}
          </Badge>
        </div>

        <Separator />
        <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_88px_120px] gap-4 bg-surface-2 px-6 py-2.5 text-[12px] text-muted-foreground md:grid">
          <span>Fournisseur</span>
          <span className="text-right">Achats</span>
          <span className="text-right">Docs</span>
          <span className="text-right">Hausse</span>
        </div>

        <ul>
          {SUPPLIERS.map((s, i) => (
            <motion.li
              key={s.name}
              initial={reduce ? false : { opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
              className={cn(
                "grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 border-b border-border px-5 py-4 last:border-b-0 md:grid-cols-[minmax(0,1.4fr)_minmax(0,0.8fr)_88px_120px] md:px-6",
                i === 0 && "bg-alert-wash",
              )}
            >
              <p className="flex items-center gap-3">
                <SupplierLogo name={s.name} size={36} />
                <span className="font-display text-[17px] font-semibold tracking-tight">
                  {s.name}
                </span>
              </p>
              <p className="order-last col-span-2 font-display text-[20px] font-semibold tabular-nums md:order-none md:col-span-1 md:text-right">
                {euroInt(s.spent)}
              </p>
              <span className="hidden text-right text-[14px] text-white/60 tabular-nums md:block">
                {s.docs}
              </span>
              <DeltaBadge value={s.change} className="justify-self-end" />
            </motion.li>
          ))}
        </ul>
      </LandingFrame>
      <p className="mt-4 text-center text-[15px] text-muted-foreground sm:text-base">
        {DEMO_NOTE} {SUPPLIERS_DISCLAIMER}
      </p>
    </SectionEnter>
  );
}
