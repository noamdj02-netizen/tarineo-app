import type { IntegrationSnapshot, IntegrationStatus } from "@/lib/settings/integrations-catalog";
import type { ConnectionTestOutcome, ConnectionTestResult } from "./types";

/** P0 : le statut « Connecté » exige un test `ok`. */
export function applyHealthCheck(
  snapshot: IntegrationSnapshot,
  result: ConnectionTestResult,
): IntegrationSnapshot {
  const prior = snapshot.status;
  if (prior === "coming_soon" || prior === "disabled") return snapshot;

  const patch = {
    lastHealthAt: result.checkedAt,
    healthMessage: result.message,
  };

  const nextStatus = mapOutcomeToStatus(snapshot.id, prior, result.outcome);
  return {
    ...snapshot,
    ...patch,
    status: nextStatus,
    errorMessage: nextStatus === "connected" ? null : result.message,
  };
}

function mapOutcomeToStatus(
  id: IntegrationSnapshot["id"],
  prior: IntegrationStatus,
  outcome: ConnectionTestOutcome,
): IntegrationStatus {
  if (outcome === "ok") {
    if (prior === "coming_soon" || prior === "disabled") return prior;
    return "connected";
  }
  if (outcome === "not_connected") {
    if (id === "stripe_billing") return "available";
    if (prior === "available") return prior;
    return "available";
  }
  if (outcome === "misconfigured") return "requires_setup";
  if (outcome === "reconnection_required") return "reconnection_required";
  if (prior === "connected" || prior === "reconnection_required") return "error";
  if (prior === "available") return prior;
  return "error";
}

export function shouldRunHealthCheck(snapshot: IntegrationSnapshot): boolean {
  if (snapshot.status === "coming_soon" || snapshot.status === "disabled") return false;
  switch (snapshot.id) {
    case "tarineo_email":
    case "stripe_billing":
      return true; // toujours vérifier (jamais « Connecté » sans test)
    case "google":
      return snapshot.status === "connected" || snapshot.status === "reconnection_required";
    case "calendar_ical":
      return snapshot.status === "connected";
    case "api_tarineo":
      return snapshot.status === "connected";
    default:
      return false;
  }
}
