"use client";

import { ArrowRight, Plus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { ShinySurface } from "@/components/animata";
import { StatusBadge } from "@/components/tarineo/status-badge";
import { ActionBar, StaggerItem } from "@/components/site/product-demo/motion-card";
import { ProductDemoShell } from "@/components/site/product-demo/shell";
import { PRODUCT_DEMO, PRODUCT_EASE } from "@/lib/site/product-demo";
import { euroInt } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const SURFACE =
  "rounded-[14px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF] shadow-[0_1px_2px_rgba(10,10,10,0.04)]";

/** Accueil marketing compact — lisible sous le hero, pas un scroll géant. */
export function ProductDemoDashboard({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { kpis, actions, chantiers, alertes } = PRODUCT_DEMO;
  const chantier = chantiers[0]!;
  const topActions = actions.slice(0, 2);
  const topAlertes = alertes.slice(0, 2);

  return (
    <div className={cn("mx-auto w-full max-w-[1120px]", className)}>
      <ProductDemoShell title="Accueil" bodyClassName="!bg-[#F5F5F3] !p-3 sm:!p-4">
        <div className="mb-3.5 flex items-end justify-between gap-3 sm:mb-4">
          <div className="min-w-0">
            <h2 className="font-display text-[20px] font-semibold tracking-[-0.03em] text-[#0A0A0A] sm:text-[22px]">
              Bonjour, Noam
            </h2>
            <p className="mt-0.5 text-[13px] text-[#6E6E6E]">
              Voici ce qui mérite votre attention.
            </p>
          </div>
          <span className="hidden h-9 shrink-0 items-center rounded-[10px] bg-[#FF6B1A] px-3 text-[12px] font-medium text-white sm:inline-flex">
            <Plus className="mr-1 size-3.5" strokeWidth={2.2} aria-hidden />
            Nouveau devis
          </span>
        </div>

        <ul className="mb-3.5 grid grid-cols-2 gap-2 sm:mb-4 sm:gap-2.5 lg:grid-cols-5">
          {kpis.map((k, i) => (
            <StaggerItem
              key={k.label}
              index={i}
              className={cn(k.label === "Achats du mois" && "col-span-2 lg:col-span-1")}
            >
              <ShinySurface className="h-full rounded-[14px]">
                <div className="h-full px-3 py-2.5 sm:px-3.5 sm:py-3">
                  <p className="flex items-center gap-1.5 text-[10px] font-medium tracking-[0.04em] text-[#6E6E6E] uppercase">
                    <span
                      aria-hidden
                      className="size-[5px] rounded-full"
                      style={{ background: k.accent }}
                    />
                    {k.label}
                  </p>
                  <p className="mt-1 font-display text-[20px] font-semibold tracking-[-0.025em] text-[#0A0A0A] tabular-nums sm:text-[22px]">
                    {k.value}
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#6E6E6E]">{k.hint}</p>
                </div>
              </ShinySurface>
            </StaggerItem>
          ))}
        </ul>

        <motion.section
          initial={reduce ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.22, ease: PRODUCT_EASE, delay: 0.06 }}
          className={cn(SURFACE, "mb-3.5 px-3.5 py-3 sm:mb-4 sm:px-4 sm:py-3.5")}
        >
          <p className="mb-2 text-[11px] font-semibold tracking-[0.06em] text-[#6E6E6E] uppercase">
            À traiter
          </p>
          <ul className="grid gap-0.5">
            {topActions.map((item) => (
              <li
                key={item.title}
                className="grid min-h-[44px] grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-[8px] px-1.5 py-1.5 sm:px-2"
              >
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className={cn(
                        "size-[5px] shrink-0 rounded-full",
                        item.tone === "amber" ? "bg-[#F59E0B]" : "bg-[#FF6B1A]",
                      )}
                    />
                    <span className="truncate text-[13px] font-medium tracking-[-0.01em] text-[#0A0A0A]">
                      {item.title}
                    </span>
                  </span>
                  <span className="mt-0.5 block truncate pl-3 text-[11px] text-[#6E6E6E]">
                    {item.hint}
                  </span>
                </span>
                <span className="inline-flex shrink-0 items-center gap-1 text-[12px] font-medium text-[#FF6B1A]">
                  {item.cta}
                  <ArrowRight className="size-3" aria-hidden />
                </span>
              </li>
            ))}
          </ul>
        </motion.section>

        <div className="grid items-start gap-3 lg:grid-cols-[1.15fr_0.85fr]">
          <div
            className={cn(
              SURFACE,
              "flex flex-col gap-1.5 border-l-2 border-l-[#16A34A] p-3.5 sm:p-4",
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <p className="min-w-0 font-display text-[15px] font-semibold tracking-[-0.02em] text-[#0A0A0A]">
                {chantier.name}
              </p>
              <StatusBadge label={chantier.status} tone="focus" className="w-fit shrink-0" />
            </div>
            <p className="truncate text-[12px] text-[#6E6E6E]">
              {chantier.client} · {chantier.address}
            </p>
            <p className="text-[11px] text-[#8A8A8A]">
              {chantier.docs} docs · {euroInt(chantier.devis)} devis · {euroInt(chantier.achats)}{" "}
              achats
            </p>
            <ActionBar value={chantier.margePct} color="#16A34A" className="mt-1" delay={0.1} />
          </div>

          <div className={cn(SURFACE, "px-3.5 py-3 sm:px-4 sm:py-3.5")}>
            <p className="mb-2 text-[11px] font-semibold tracking-[0.06em] text-[#6E6E6E] uppercase">
              Hausses
            </p>
            <ul>
              {topAlertes.map((a, i) => (
                <li
                  key={a.label}
                  className={cn(
                    "flex items-center justify-between gap-3 py-2",
                    i > 0 && "border-t border-[rgba(10,10,10,0.08)]",
                  )}
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-[#0A0A0A]">
                      {a.label}
                    </span>
                    <span className="block truncate text-[11px] text-[#6E6E6E]">{a.party}</span>
                  </span>
                  <span className="shrink-0 text-[12px] font-medium tabular-nums text-[#FF6B1A]">
                    +{a.pct.toLocaleString("fr-FR")} %
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </ProductDemoShell>
    </div>
  );
}
