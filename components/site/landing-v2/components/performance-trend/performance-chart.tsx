"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  memo,
  useEffect,
  useId,
  useState,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
} from "react";

import { cn } from "@/lib/utils";

import {
  CHART_DATA,
  COLUMN_COUNT,
  DEFAULT_COLUMN,
  MONTH_LABELS,
  ROW_COUNT,
  clampChartValue,
  formatDate,
  formatMetricValue,
  formatShortDate,
  getMetric,
} from "./chart-data";
import type { ChartColumn, MetricKey } from "./types";

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { delayChildren: 0.03, staggerChildren: 0.011 },
  },
  exit: { opacity: 0, transition: { duration: 0.1 } },
};

const columnVariants = {
  hidden: { opacity: 0, y: 6, scaleY: 0.82 },
  visible: {
    opacity: 1,
    y: 0,
    scaleY: 1,
    transition: { duration: 0.16, ease: "easeOut" as const },
  },
};

const ChartGrid = memo(function ChartGrid({
  columns,
  reducedMotion,
}: {
  columns: ChartColumn[];
  reducedMotion: boolean;
}) {
  if (reducedMotion) {
    return (
      <div className="grid h-full grid-cols-[repeat(60,minmax(0,1fr))] gap-[clamp(2px,0.22vw,4px)]">
        {columns.map((column, columnIndex) => (
          <div
            className="grid min-w-0 grid-rows-[repeat(14,minmax(0,1fr))] gap-[clamp(2px,0.22vw,4px)]"
            key={columnIndex}
          >
            {Array.from({ length: ROW_COUNT }, (_, rowIndex) => {
              const active = rowIndex >= ROW_COUNT - column.height;
              const secondary = rowIndex >= ROW_COUNT - column.secondaryHeight;
              return (
                <div
                  className={cn(
                    "min-h-0 rounded-[2px]",
                    active ? "bg-accent" : secondary ? "bg-accent/25" : "bg-paper-200",
                  )}
                  key={rowIndex}
                />
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  return (
    <motion.div
      className="grid h-full grid-cols-[repeat(60,minmax(0,1fr))] gap-[clamp(2px,0.22vw,4px)]"
      variants={gridVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {columns.map((column, columnIndex) => (
        <motion.div
          className="grid min-w-0 grid-rows-[repeat(14,minmax(0,1fr))] gap-[clamp(2px,0.22vw,4px)]"
          key={columnIndex}
          variants={columnVariants}
          style={{ transformOrigin: "bottom" }}
        >
          {Array.from({ length: ROW_COUNT }, (_, rowIndex) => {
            const active = rowIndex >= ROW_COUNT - column.height;
            const secondary = rowIndex >= ROW_COUNT - column.secondaryHeight;
            return (
              <div
                className={cn(
                  "min-h-0 rounded-[2px]",
                  active ? "bg-accent" : secondary ? "bg-accent/25" : "bg-paper-200",
                )}
                key={rowIndex}
              />
            );
          })}
        </motion.div>
      ))}
    </motion.div>
  );
});

export function PerformanceChart({
  metricKey,
  reducedMotion = false,
}: {
  metricKey: MetricKey;
  reducedMotion?: boolean;
}) {
  const metric = getMetric(metricKey);
  const columns = CHART_DATA[metricKey];
  const [activeColumn, setActiveColumn] = useState(DEFAULT_COLUMN);
  const labelId = useId();
  const selected = columns[activeColumn] ?? columns[DEFAULT_COLUMN];
  const selectedX = ((activeColumn + 0.5) / COLUMN_COUNT) * 100;
  const selectedY = ((ROW_COUNT - selected.height + 0.5) / ROW_COUNT) * 100;
  const tooltipY = clampChartValue(selectedY - 10, 14, 51);
  const spring = reducedMotion
    ? { duration: 0 }
    : { type: "spring" as const, stiffness: 480, damping: 42 };

  useEffect(() => {
    setActiveColumn(DEFAULT_COLUMN);
  }, [metricKey]);

  function setFromClientX(clientX: number, target: HTMLElement) {
    const bounds = target.getBoundingClientRect();
    const pointerX = clampChartValue(clientX - bounds.left, 0, bounds.width - 1);
    const nextColumn = Math.floor((pointerX / bounds.width) * COLUMN_COUNT);
    setActiveColumn((current) => (current === nextColumn ? current : nextColumn));
  }

  function handlePointerMove(event: PointerEvent<HTMLDivElement> | MouseEvent<HTMLDivElement>) {
    setFromClientX(event.clientX, event.currentTarget);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      setActiveColumn((c) => Math.max(0, c - 1));
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      setActiveColumn((c) => Math.min(COLUMN_COUNT - 1, c + 1));
    } else if (event.key === "Home") {
      event.preventDefault();
      setActiveColumn(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActiveColumn(COLUMN_COUNT - 1);
    } else if (event.key === "Escape") {
      setActiveColumn(DEFAULT_COLUMN);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <p id={labelId} className="sr-only">
        Courbe exemple {metric.label.toLowerCase()}. Utilisez les flèches gauche et droite pour
        inspecter les dates.
      </p>

      <div className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-2 sm:grid-cols-[2.75rem_minmax(0,1fr)] sm:gap-3">
        <div
          className="flex h-[clamp(10.5rem,22vw,15rem)] flex-col justify-between py-0.5 text-right font-mono text-[10px] text-ink-400 nums sm:text-xs"
          aria-hidden
        >
          {metric.ticks.map((tick) => (
            <span key={tick}>{tick}</span>
          ))}
        </div>

        <div
          className="relative h-[clamp(10.5rem,22vw,15rem)] cursor-crosshair touch-none outline-none focus-visible:ring-2 focus-visible:ring-accent/35 focus-visible:ring-offset-2 focus-visible:ring-offset-paper-0"
          onMouseMove={handlePointerMove}
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerMove}
          onMouseLeave={() => setActiveColumn(DEFAULT_COLUMN)}
          onKeyDown={handleKeyDown}
          role="slider"
          tabIndex={0}
          aria-labelledby={labelId}
          aria-valuemin={0}
          aria-valuemax={COLUMN_COUNT - 1}
          aria-valuenow={activeColumn}
          aria-valuetext={`${formatDate(activeColumn)} : ${formatMetricValue(metric, selected.value)}`}
        >
          <AnimatePresence mode="wait">
            <ChartGrid
              key={metricKey}
              columns={columns}
              reducedMotion={reducedMotion}
            />
          </AnimatePresence>

          <motion.div
            className="pointer-events-none absolute inset-y-0 border-l border-dashed border-ink-900/55"
            animate={{ left: `${selectedX}%` }}
            transition={spring}
          />

          <motion.div
            className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-paper-0 shadow-sm"
            animate={{ left: `${selectedX}%`, top: `${selectedY}%` }}
            transition={spring}
          />

          <motion.div
            className={cn(
              "pointer-events-none absolute z-10 w-[9.5rem]",
              activeColumn > COLUMN_COUNT - 12
                ? "-translate-x-[calc(100%+0.5rem)]"
                : "translate-x-2",
            )}
            animate={{ left: `${selectedX}%`, top: `${tooltipY}%` }}
            transition={spring}
          >
            <div className="rounded-lg border border-line bg-paper-0 px-3 py-2 shadow-card ring-1 ring-ink-900/5">
              <p className="text-[11px] text-ink-400">{formatDate(activeColumn)}</p>
              <p className="mt-0.5 font-mono text-base font-semibold tracking-tight text-ink-900 nums">
                {formatMetricValue(metric, selected.value)}
              </p>
            </div>
          </motion.div>

          <motion.div
            className="pointer-events-none absolute -bottom-9 -translate-x-1/2 rounded-md bg-ink-900 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-paper-0 shadow-sm"
            animate={{ left: `${selectedX}%` }}
            transition={spring}
          >
            {formatShortDate(activeColumn)}
          </motion.div>
        </div>
      </div>

      <div className="ml-[2.75rem] grid grid-cols-12 pt-5 sm:ml-[3.5rem]" aria-hidden>
        {MONTH_LABELS.map((month) => (
          <span className="text-center text-[10px] text-ink-400 sm:text-[11px]" key={month}>
            {month}
          </span>
        ))}
      </div>
    </div>
  );
}
