"use client";

import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

import { METRICS } from "./chart-data";
import type { MetricKey } from "./types";

export function MetricTabs({ value }: { value: MetricKey }) {
  return (
    <div className="w-full overflow-x-auto overscroll-x-contain border-b border-line [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <TabsList
        variant="line"
        className="group-data-horizontal/tabs:h-auto grid h-auto w-full min-w-[36rem] grid-cols-4 gap-0 rounded-none bg-transparent p-0 sm:min-w-0"
        aria-label="Séries de prix exemple"
      >
        {METRICS.map((metric) => {
          const Icon = metric.icon;
          const active = value === metric.key;

          return (
            <TabsTrigger
              key={metric.key}
              value={metric.key}
              className={cn(
                "h-auto min-h-11 min-w-0 flex-col items-start gap-2 rounded-none border-r border-line px-3 py-3.5 text-left last:border-r-0",
                "after:top-auto after:right-auto after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-accent",
                "hover:bg-paper-50 focus-visible:bg-paper-50 data-active:bg-paper-0 data-active:text-ink-900",
                "sm:px-4 sm:py-4",
              )}
            >
              <span className="flex w-full items-center gap-2 text-xs font-medium text-ink-500">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-md border transition-colors",
                    active
                      ? "border-ink-900 bg-ink-900 text-paper-0"
                      : "border-line bg-paper-50 text-ink-400",
                  )}
                >
                  <Icon className="size-3.5" strokeWidth={1.75} aria-hidden />
                </span>
                <span className="truncate">{metric.label}</span>
              </span>
              <span className="flex flex-col items-baseline gap-0.5 pl-0 sm:pl-9">
                <span className="font-mono text-xl font-semibold tracking-tight text-ink-900 nums sm:text-2xl">
                  {metric.summaryValue}
                </span>
                <span className="text-[11px] font-normal text-ink-400 sm:text-xs">
                  <span className="font-mono font-medium text-accent-700">{metric.change}</span>
                  {" "}
                  vs mois préc.
                </span>
              </span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </div>
  );
}
