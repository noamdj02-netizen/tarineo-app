"use client";

import { ArrowRight } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { TarineoCopilotAvatar } from "@/components/assistant/copilot-face";
import { MotionCard } from "@/components/site/product-demo/motion-card";
import { ProductDemoShell, ProductDemoSurface } from "@/components/site/product-demo/shell";
import { PRODUCT_DEMO, PRODUCT_SPRING, PRODUCT_SPRING_FAST } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

export function ProductDemoCopilote({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  const { hausse } = PRODUCT_DEMO;

  return (
    <div className={cn("mx-auto w-full max-w-[640px]", className)}>
      <ProductDemoShell title="Copilote" bodyClassName="space-y-3.5">
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={PRODUCT_SPRING_FAST}
          className="ml-auto max-w-[90%] rounded-[20px] rounded-br-[6px] bg-[#0A0A0A] px-4 py-3 text-[14px] leading-relaxed tracking-[-0.01em] text-white sm:max-w-[82%]"
        >
          Quelles hausses dois-je regarder ?
        </motion.div>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ ...PRODUCT_SPRING, delay: reduce ? 0 : 0.12 }}
          className="flex max-w-[96%] gap-2.5 sm:max-w-[92%]"
        >
          <TarineoCopilotAvatar variant="message" className="mt-0.5 shrink-0" />
          <MotionCard className="flex-1 px-4 py-3.5" delay={0}>
            <p className="text-[14px] leading-relaxed tracking-[-0.01em] text-[#0A0A0A]">
              J’ai trouvé une hausse à vérifier.
            </p>
            <ProductDemoSurface className="mt-3.5 border-0 bg-[#F5F5F3] px-3.5 py-3 shadow-none">
              <p className="text-[14px] font-semibold tracking-[-0.015em] text-[#0A0A0A]">
                {hausse.product}
              </p>
              <p className="text-[12px] text-[#6E6E6E]">{hausse.supplier}</p>
              <p className="mt-2 font-display text-[24px] font-semibold tracking-[-0.03em] text-[#FF6B1A] tabular-nums">
                +{hausse.pct.toLocaleString("fr-FR")} %
              </p>
            </ProductDemoSurface>
            <span className="mt-3.5 inline-flex items-center gap-1 text-[13px] font-medium text-[#FF6B1A]">
              Voir le document
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </MotionCard>
        </motion.div>

        <div className="pt-1">
          <span className="inline-flex items-center gap-2 rounded-[10px] bg-[#FF6B1A] px-3.5 py-2 text-[13px] font-semibold text-white">
            <TarineoCopilotAvatar variant="fab" />
            Copilote
            <kbd className="rounded-md bg-black/15 px-1.5 py-0.5 font-mono text-[10px] font-medium">
              ⌘J
            </kbd>
          </span>
        </div>
      </ProductDemoShell>
    </div>
  );
}
