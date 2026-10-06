import "server-only";
import type { IntegrationId } from "@/lib/settings/integrations-catalog";
import type { ConnectionTestResult } from "./types";
import { testApiTarineoConnection } from "./providers/api-tarineo";
import { testGoogleConnection } from "./providers/google";
import { testIcalConnection } from "./providers/ical";
import { testStripeBillingConnection } from "./providers/stripe-billing";
import { testTarineoEmailConnection } from "./providers/tarineo-email";

export async function testIntegrationConnection(
  id: IntegrationId,
): Promise<ConnectionTestResult> {
  switch (id) {
    case "tarineo_email":
      return testTarineoEmailConnection();
    case "stripe_billing":
      return testStripeBillingConnection();
    case "google":
      return testGoogleConnection();
    case "calendar_ical":
      return testIcalConnection();
    case "api_tarineo":
      return testApiTarineoConnection();
    default:
      return {
        integrationId: id,
        outcome: "error",
        message: "Cette intégration ne peut pas être testée pour le moment.",
        checkedAt: new Date().toISOString(),
      };
  }
}
