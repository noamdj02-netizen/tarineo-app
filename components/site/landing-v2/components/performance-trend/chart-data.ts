import {
  BadgeAlert,
  CircleDollarSign,
  Percent,
  TrendingUp,
} from "lucide-react";

import type { ChartColumn, MetricConfig, MetricKey } from "./types";

export const COLUMN_COUNT = 60;
export const ROW_COUNT = 14;
export const DEFAULT_COLUMN = 20;

/** Produit d’exemple suivi sur la landing. */
export const EXAMPLE_PRODUCT = {
  name: "Chauffe-eau 200 L",
  supplier: "Cedeo",
  ref: "CE-200-STD",
} as const;

export const MONTH_LABELS = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Aoû",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];

export const METRICS: MetricConfig[] = [
  {
    key: "unit-price",
    label: "Prix unitaire",
    selectLabel: "Prix unitaire",
    summaryValue: "861 €",
    change: "+12 %",
    icon: CircleDollarSign,
    seed: 0,
    scale: 1,
    ticks: [900, 800, 700, 600],
    precision: 0,
    suffix: " €",
    selectedValue: 861,
  },
  {
    key: "price-rise",
    label: "Hausse vs habituel",
    selectLabel: "Hausse",
    summaryValue: "+12 %",
    change: "+3,2 pts",
    icon: TrendingUp,
    seed: 1.45,
    scale: 0.74,
    ticks: [20, 15, 10, 5],
    precision: 1,
    suffix: " %",
    selectedValue: 12,
  },
  {
    key: "overcost",
    label: "Écart détecté",
    selectLabel: "Écart",
    summaryValue: "+92 €",
    change: "+18 €",
    icon: Percent,
    seed: 2.6,
    scale: 0.65,
    ticks: [120, 90, 60, 30],
    precision: 0,
    suffix: " €",
    selectedValue: 92,
  },
  {
    key: "alerts",
    label: "Alertes prix",
    selectLabel: "Alertes",
    summaryValue: "3",
    change: "+1",
    icon: BadgeAlert,
    seed: 3.85,
    scale: 0.88,
    ticks: [8, 6, 4, 2],
    precision: 0,
    suffix: "",
    selectedValue: 3,
  },
];

export const METRIC_ITEMS = METRICS.map((metric) => ({
  label: metric.selectLabel,
  value: metric.key,
}));

const metricMap = new Map(METRICS.map((metric) => [metric.key, metric]));

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function createColumns(metric: MetricConfig): ChartColumn[] {
  const peaks = [4, 11, 17, 24, 30, 36, 41, 47, 53, 58];

  return Array.from({ length: COLUMN_COUNT }, (_, index) => {
    const baseline =
      2.2 +
      Math.sin(index * 0.58 + metric.seed) * 0.68 +
      Math.sin(index * 1.24 + metric.seed * 0.75) * 0.44;
    const peakHeight = peaks.reduce((total, peak, peakIndex) => {
      const width = 1.05 + ((peakIndex + Math.round(metric.seed)) % 3) * 0.22;
      const amplitude = 3.2 + ((peakIndex * 3 + Math.round(metric.seed * 3)) % 4);
      return total + amplitude * Math.exp(-((index - peak) ** 2) / (2 * width ** 2));
    }, 0);
    const height = clamp(Math.round((baseline + peakHeight) * metric.scale), 2, 10);
    const secondaryHeight = clamp(
      height + 2 + Math.round((Math.sin(index * 0.37 + metric.seed) + 1) * 1.5),
      height + 1,
      ROW_COUNT,
    );
    const wave = Math.sin(index * 0.41 + metric.seed);

    let value: number;
    if (metric.key === "unit-price") value = 720 + height * 18 + wave * 8;
    else if (metric.key === "price-rise") value = 2 + height * 1.4 + wave * 0.6;
    else if (metric.key === "overcost") value = 20 + height * 9 + wave * 4;
    else value = 0.5 + height * 0.55 + wave * 0.3;

    return {
      height,
      secondaryHeight,
      value:
        index === DEFAULT_COLUMN
          ? metric.selectedValue
          : Number(value.toFixed(metric.precision)),
    };
  });
}

export const CHART_DATA = Object.fromEntries(
  METRICS.map((metric) => [metric.key, createColumns(metric)]),
) as Record<MetricKey, ChartColumn[]>;

export function getMetric(key: MetricKey) {
  return metricMap.get(key) ?? METRICS[0];
}

export function formatMetricValue(metric: MetricConfig, value: number) {
  if (metric.key === "unit-price" || metric.key === "overcost") {
    const sign = metric.key === "overcost" && value > 0 ? "+" : "";
    return `${sign}${Math.round(value).toLocaleString("fr-FR")}${metric.suffix}`;
  }
  if (metric.key === "price-rise") {
    const sign = value > 0 ? "+" : "";
    return `${sign}${value.toFixed(metric.precision)}${metric.suffix}`;
  }
  return `${value.toFixed(metric.precision)}${metric.suffix}`;
}

const longDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const shortDateFormatter = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
});

function getColumnDate(index: number) {
  if (index === DEFAULT_COLUMN) return new Date(2026, 3, 30);
  const date = new Date(2026, 0, 1);
  date.setDate(1 + Math.round((index / (COLUMN_COUNT - 1)) * 364));
  return date;
}

export function formatDate(index: number) {
  return longDateFormatter.format(getColumnDate(index));
}

export function formatShortDate(index: number) {
  return shortDateFormatter.format(getColumnDate(index));
}

export function clampChartValue(value: number, min: number, max: number) {
  return clamp(value, min, max);
}
