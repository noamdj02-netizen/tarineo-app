import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getDb } from "@/lib/db";
import { isMissingAutomationTable, isUniqueViolation } from "@/lib/automation/db";
import type {
  AutomationExecutionStatus,
  AutomationPhase,
  AutomationSlug,
} from "@/lib/automation/types";

export type RecordExecutionInput = {
  userId: string;
  definitionId?: string | null;
  slug: AutomationSlug;
  phase: AutomationPhase;
  status: AutomationExecutionStatus;
  idempotencyKey: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
  error?: string | null;
};

/** Insert idempotent — `true` si nouvelle ligne, `false` si déjà traité. */
export async function tryInsertAutomationExecution(
  client: SupabaseClient,
  input: RecordExecutionInput,
): Promise<boolean> {
  const now = new Date().toISOString();
  const { error } = await client.from("automation_executions").insert({
    user_id: input.userId,
    definition_id: input.definitionId ?? null,
    slug: input.slug,
    status: input.status,
    phase: input.phase,
    idempotency_key: input.idempotencyKey,
    entity_type: input.entityType,
    entity_id: input.entityId,
    error: input.error ?? null,
    metadata: input.metadata ?? {},
    started_at: now,
    completed_at: input.status === "started" ? null : now,
  });
  if (!error) return true;
  if (isUniqueViolation(error)) return false;
  if (isMissingAutomationTable(error)) return true;
  console.error("[automation] tryInsertExecution", error);
  return false;
}

export async function recordAutomationExecutionForSession(
  input: Omit<RecordExecutionInput, "userId"> & { userId?: string },
): Promise<boolean> {
  const db = await getDb();
  const userId = input.userId ?? db?.user.id;
  if (!userId || !db) return false;
  return tryInsertAutomationExecution(db.supabase, { ...input, userId });
}
