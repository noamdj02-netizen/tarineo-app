import type { MarginBelowTargetConfig, QuoteFollowupConfig } from "@/lib/automation/types";

export const DEFAULT_QUOTE_FOLLOWUP_CONFIG: QuoteFollowupConfig = {
  autoScheduleEnabled: false,
  firstDelayDays: 3,
  betweenSequencesDays: 7,
  maxSequences: 2,
  scheduleHourLocal: 9,
  audience: "client",
  requireValidClientEmail: true,
};

export const DEFAULT_MARGIN_CONFIG: MarginBelowTargetConfig = {
  enabled: true,
  floorMarginPct: null,
  minLinesWithCost: 1,
  notifyInApp: true,
  notifyEmail: false,
  cooldownHours: 24,
};

export function mergeQuoteFollowupConfig(raw: unknown): QuoteFollowupConfig {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const d = DEFAULT_QUOTE_FOLLOWUP_CONFIG;
  return {
    autoScheduleEnabled: typeof o.autoScheduleEnabled === "boolean" ? o.autoScheduleEnabled : d.autoScheduleEnabled,
    firstDelayDays: num(o.firstDelayDays, d.firstDelayDays!),
    betweenSequencesDays: num(o.betweenSequencesDays, d.betweenSequencesDays!),
    maxSequences: num(o.maxSequences, d.maxSequences!),
    scheduleHourLocal: num(o.scheduleHourLocal, d.scheduleHourLocal!),
    audience: o.audience === "client" ? "client" : d.audience,
    requireValidClientEmail:
      typeof o.requireValidClientEmail === "boolean" ? o.requireValidClientEmail : d.requireValidClientEmail,
  };
}

export function mergeMarginConfig(raw: unknown): MarginBelowTargetConfig {
  const o = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const d = DEFAULT_MARGIN_CONFIG;
  return {
    enabled: typeof o.enabled === "boolean" ? o.enabled : d.enabled,
    floorMarginPct:
      o.floorMarginPct === null || o.floorMarginPct === undefined
        ? d.floorMarginPct
        : Number.isFinite(Number(o.floorMarginPct))
          ? Number(o.floorMarginPct)
          : d.floorMarginPct,
    minLinesWithCost: num(o.minLinesWithCost, d.minLinesWithCost!),
    notifyInApp: typeof o.notifyInApp === "boolean" ? o.notifyInApp : d.notifyInApp,
    notifyEmail: typeof o.notifyEmail === "boolean" ? o.notifyEmail : d.notifyEmail,
    cooldownHours: num(o.cooldownHours, d.cooldownHours!),
  };
}

function num(v: unknown, fallback: number) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}
