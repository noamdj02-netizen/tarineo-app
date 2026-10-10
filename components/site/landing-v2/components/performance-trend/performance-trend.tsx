"use client";

import { useReducedMotion } from "framer-motion";
import { Info } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { LandingPanelFooter } from "@/components/site/landing-v2/components/ui/LandingPanelFooter";
import { LandingProductFrame } from "@/components/site/landing-v2/components/ui/LandingProductFrame";
import { Tabs } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { DEMO_MARK } from "@/lib/site/tarineo";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { Button } from "@/components/site/landing-v2/components/ui/Button";

import { EXAMPLE_PRODUCT, getMetric } from "./chart-data";
import { MetricTabs } from "./metric-tabs";
import { PerformanceChart } from "./performance-chart";
import type { MetricKey } from "./types";

/** Tendance prix — exemple produit (landing), dans le chrome produit Tarineo. */
export function PerformanceTrend() {
  const [metric, setMetric] = useState<MetricKey>("unit-price");
  const reduce = useReducedMotion();
  const active = getMetric(metric);

  return (
    <TooltipProvider delay={200}>
      <Tabs
        value={metric}
        onValueChange={(value) => setMetric(value as MetricKey)}
        className="w-full"
      >
        <LandingProductFrame
          title={`Suivi prix · ${EXAMPLE_PRODUCT.name}`}
          className="shadow-float"
          footer={
            <div className="flex flex-col">
              <MetricTabs value={metric} />
              <LandingPanelFooter>
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-wide text-ink-400">
                    {active.label} · {DEMO_MARK}
                  </p>
                  <p className="mt-1 text-lg font-semibold tracking-tight text-ink-900 nums">
                    {active.summaryValue}
                    <span className="ml-2 text-sm font-medium text-accent-700">
                      {active.change}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    href={LANDING_SIGNUP}
                    variant="secondary"
                    size="sm"
                    className="min-h-11"
                  >
                    Ignorer
                    <span className="sr-only"> — exemple, créer un compte</span>
                  </Button>
                  <Button href={LANDING_SIGNUP} size="sm" className="min-h-11">
                    Renégocier
                    <span className="sr-only"> — exemple, créer un compte</span>
                  </Button>
                </div>
              </LandingPanelFooter>
            </div>
          }
        >
          <div className="border-b border-line bg-paper-50/60 px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="accent" size="sm">
                {DEMO_MARK}
              </Badge>
              <p className="text-sm font-medium text-ink-900">{EXAMPLE_PRODUCT.name}</p>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <button
                      type="button"
                      className="grid size-11 place-items-center rounded-full text-ink-400 outline-none transition-colors hover:bg-paper-100 hover:text-ink-900 focus-visible:ring-2 focus-visible:ring-accent/40 sm:size-8"
                      aria-label="À propos de cet exemple"
                    />
                  }
                >
                  <Info className="size-3.5" aria-hidden />
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  Historique fictif d’une référence fournisseur sur 2026 — données d’exemple.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="mt-1 text-sm text-ink-500">
              {EXAMPLE_PRODUCT.supplier}
              <span className="text-ink-300"> · </span>
              <span className="font-mono text-xs tracking-tight">{EXAMPLE_PRODUCT.ref}</span>
            </p>
          </div>

          <div className="overflow-hidden px-3 pb-11 pt-5 sm:px-5 sm:pt-6">
            <PerformanceChart metricKey={metric} reducedMotion={!!reduce} />
          </div>
        </LandingProductFrame>
      </Tabs>
    </TooltipProvider>
  );
}
