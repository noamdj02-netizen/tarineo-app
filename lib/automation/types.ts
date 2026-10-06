/** Contrats du moteur d’automatisations — voir docs/adr/001-automation-engine.md */

export const AUTOMATION_SLUGS = ["quote_followup", "margin_below_target"] as const;
export type AutomationSlug = (typeof AUTOMATION_SLUGS)[number];

export type AutomationExecutionStatus = "started" | "completed" | "failed" | "skipped";
export type AutomationPhase = "schedule" | "send" | "notify" | "evaluate" | "execute";

export type QuoteFollowupConfig = {
  autoScheduleEnabled?: boolean;
  firstDelayDays?: number;
  betweenSequencesDays?: number;
  maxSequences?: number;
  scheduleHourLocal?: number;
  audience?: "client";
  requireValidClientEmail?: boolean;
};

export type MarginBelowTargetConfig = {
  enabled?: boolean;
  floorMarginPct?: number | null;
  minLinesWithCost?: number;
  notifyInApp?: boolean;
  notifyEmail?: boolean;
  cooldownHours?: number;
};

export type AutomationDefinitionRow = {
  id: string;
  user_id: string;
  slug: AutomationSlug;
  enabled: boolean;
  config: QuoteFollowupConfig | MarginBelowTargetConfig | Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

export type AutomationExecutionRow = {
  id: string;
  user_id: string;
  definition_id: string | null;
  slug: AutomationSlug;
  status: AutomationExecutionStatus;
  phase: AutomationPhase;
  idempotency_key: string;
  entity_type: string;
  entity_id: string;
  error: string | null;
  metadata: Record<string, unknown>;
  started_at: string;
  completed_at: string | null;
};

/** Idempotence relance devis — docs/automation/quote-followup-due-to-scheduled.md */
export function quoteFollowupScheduleKey(documentId: string, sequence: number) {
  return `quote_followup:schedule:${documentId}:${sequence}`;
}

export function quoteFollowupSendKey(documentId: string, sequence: number) {
  return `quote_followup:send:${documentId}:${sequence}`;
}

/** Idempotence marge — docs/automation/margin-below-threshold.md */
export function marginBelowKey(documentId: string, floorPct: number, dayBucket: string) {
  const floorKey = floorPct.toFixed(1);
  return `margin_below:document:${documentId}:${floorKey}:${dayBucket}`;
}
