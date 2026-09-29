"use client";

import { motion, useReducedMotion } from "framer-motion";
import { StatusBadge } from "@/components/tarineo/status-badge";
import { ActionBar, MotionCard, StaggerItem } from "@/components/site/product-demo/motion-card";
import { ProductDemoShell } from "@/components/site/product-demo/shell";
import { PRODUCT_DEMO, PRODUCT_SPRING_FAST } from "@/lib/site/product-demo";
import { euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const TABS = ["Vue d'ensemble", "Documents", "Achats", "Relances", "Activité"] as const;

export function ProductDemoChantier({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { chantier } = PRODUCT_DEMO;

  const stats = [
    { label: "Devis", value: euro(chantier.devis), accent: "#FF6B1A" },
    { label: "Achats", value: euro(chantier.achats), accent: "#9A9A9A" },
    {
      label: "Marge",
      value: euro(chantier.marge),
      sub: `${chantier.margePct.toLocaleString("fr-FR")} %`,
      accent: "#16A34A",
      bar: chantier.margePct,
    },
    {
      label: "Documents",
      value: String(chantier.documents),
      accent: "#9A9A9A",
      small: true,
    },
  ] as const;

  return (
    <div className={cn("mx-auto w-full max-w-[1080px]", className)}>
      <ProductDemoShell title={chantier.name}>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-[11px] text-[#6E6E6E]">
              Accueil / Chantiers / {chantier.name}
            </p>
            <h3 className="mt-1.5 text-[22px] font-semibold tracking-[-0.03em] text-[#0A0A0A] sm:text-[28px]">
              {chantier.name}
            </h3>
            <p className="mt-1 text-[13px] text-[#6E6E6E]">{chantier.address}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <StatusBadge label="En cours" tone="focus" />
            <StatusBadge label="Pause" tone="pause" />
            <StatusBadge label="Fini" tone="fini" />
          </div>
        </div>

        <ul className="mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
          {stats.map((s, i) => (
            <StaggerItem key={s.label} index={i}>
              <MotionCard className="h-full px-4 py-4">
                <p className="flex items-center gap-1.5 text-[12px] text-[#6E6E6E]">
                  <span aria-hidden className="size-1.5 rounded-full" style={{ background: s.accent }} />
                  {s.label}
                </p>
                <p
                  className={cn(
                    "mt-2 font-display font-semibold tracking-[-0.03em] text-[#0A0A0A] tabular-nums",
                    "small" in s && s.small
                      ? "text-[16px] tracking-[-0.02em]"
                      : "text-[22px] leading-none sm:text-[26px]",
                  )}
                >
                  {s.value}
                </p>
                {"sub" in s && s.sub ? (
                  <p className="mt-1.5 text-[13px] font-semibold text-[#16A34A]">{s.sub}</p>
                ) : null}
                {"bar" in s && typeof s.bar === "number" ? (
                  <ActionBar value={s.bar} className="mt-3" delay={0.15} />
                ) : null}
              </MotionCard>
            </StaggerItem>
          ))}
        </ul>

        <div className="flex gap-1 overflow-x-auto border-b border-[rgba(10,10,10,0.06)] pb-px [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TABS.map((tab, i) => (
            <span
              key={tab}
              className={cn(
                "relative shrink-0 px-3.5 py-2.5 text-[13px] font-medium tracking-[-0.01em] whitespace-nowrap",
                i === 0 ? "text-[#FF6B1A]" : "text-[#6E6E6E]",
              )}
            >
              {tab}
              {i === 0 ? (
                <motion.span
                  layoutId="chantier-tab"
                  className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#FF6B1A]"
                  transition={PRODUCT_SPRING_FAST}
                />
              ) : null}
            </span>
          ))}
        </div>

        <MotionCard className="mt-4 px-4 py-4" delay={0.12}>
          <p className="mb-1.5 text-[11px] font-medium tracking-[0.06em] text-[#6E6E6E] uppercase">
            À traiter
          </p>
          <p className="text-[14px] font-medium tracking-[-0.01em] text-[#0A0A0A]">
            <motion.span
              initial={reduce ? false : { scale: 0.9, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={PRODUCT_SPRING_FAST}
              className="mr-2 inline-flex rounded-full bg-[rgba(255,107,26,0.12)] px-2 py-0.5 text-[11px] font-semibold text-[#FF6B1A]"
            >
              Action
            </motion.span>
            {PRODUCT_DEMO.hausse.product} chez Cedeo
          </p>
          <p className="mt-1 text-[12px] text-[#6E6E6E]">
            Hausse +{PRODUCT_DEMO.hausse.pct.toLocaleString("fr-FR")} %
          </p>
        </MotionCard>
      </ProductDemoShell>
    </div>
  );
}
