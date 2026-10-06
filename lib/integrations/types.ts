import type { IntegrationId } from "@/lib/settings/integrations-catalog";

export type ConnectionTestOutcome =
  | "ok"
  | "not_connected"
  | "misconfigured"
  | "reconnection_required"
  | "error";

export type ConnectionTestResult = {
  integrationId: IntegrationId;
  outcome: ConnectionTestOutcome;
  /** Message court, compréhensible pour l’artisan */
  message: string;
  checkedAt: string;
};
