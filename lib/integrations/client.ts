import type { IntegrationId } from "@/lib/settings/integrations-catalog";
import { isIntegrationId } from "@/lib/settings/integrations-catalog";

/** Intégrations avec test de santé côté serveur — safe pour composants client. */
export const TESTABLE_INTEGRATION_IDS: IntegrationId[] = [
  "tarineo_email",
  "stripe_billing",
  "google",
  "calendar_ical",
  "api_tarineo",
];

export function integrationSupportsConnectionTest(id: string): boolean {
  return isIntegrationId(id) && TESTABLE_INTEGRATION_IDS.includes(id);
}
