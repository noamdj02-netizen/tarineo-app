import "server-only";
import { computeDocumentMarginPct } from "@/lib/automation/margin-calc";
import { marginConfigFromDefinition, getAutomationDefinition } from "@/lib/automation/queries";
import { recordAutomationExecutionForSession } from "@/lib/automation/executions";
import { marginBelowKey } from "@/lib/automation/types";
import { effectiveMarginFloorPct } from "@/lib/automation/margin-floor";
import { ensureAutomationDefinitions } from "@/lib/automation/definitions";
import { getEntrepriseConfig } from "@/lib/settings/entreprise-config";
import { getDocument } from "@/lib/metier/queries";
import { notifyMarginBelowTarget } from "@/lib/notifications/emitters";

export { computeDocumentMarginPct } from "@/lib/automation/margin-calc";
export type { DocumentMargin } from "@/lib/automation/margin-calc";

function dayBucketUtc(now = new Date()) {
  return now.toISOString().slice(0, 10);
}

export async function evaluateMarginBelowTarget(documentId: string): Promise<void> {
  const doc = await getDocument(documentId);
  if (!doc) return;

  await ensureAutomationDefinitions();
  const def = await getAutomationDefinition("margin_below_target");
  if (!def?.enabled) return;
  const config = marginConfigFromDefinition(def);
  if (!config.enabled) return;

  const margin = computeDocumentMarginPct(doc);
  const minLines = config.minLinesWithCost ?? 1;
  if (!margin || margin.linesWithCost < minLines) return;

  const entreprise = await getEntrepriseConfig();
  const floorPct = effectiveMarginFloorPct({
    configFloor: config.floorMarginPct,
    settings: entreprise.settings,
    profile: entreprise.profile,
  });

  if (margin.marginPct >= floorPct) return;

  const bucket = dayBucketUtc();
  const idempotencyKey = marginBelowKey(documentId, floorPct, bucket);
  const claimed = await recordAutomationExecutionForSession({
    definitionId: def?.id ?? null,
    slug: "margin_below_target",
    phase: "notify",
    status: "completed",
    idempotencyKey,
    entityType: "document",
    entityId: documentId,
    metadata: { marginPct: margin.marginPct, floorPct, sellHt: margin.sellHt, costHt: margin.costHt },
  });
  if (!claimed) return;

  if (config.notifyInApp) {
    await notifyMarginBelowTarget({
      documentId: doc.id,
      chantierId: doc.chantier_id,
      marginPct: margin.marginPct,
      floorPct,
      sellHt: margin.sellHt,
      costHt: margin.costHt,
      idempotencyKey,
    });
  }
}
