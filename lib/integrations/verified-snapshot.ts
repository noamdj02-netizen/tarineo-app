import "server-only";
import {
  loadIntegrationsSnapshot,
  type LoadIntegrationsOpts,
} from "@/lib/settings/integrations-store";
import type { IntegrationSnapshot } from "@/lib/settings/integrations-catalog";
import { applyHealthCheck, shouldRunHealthCheck } from "./status-from-health";
import { testIntegrationConnection } from "./test-connection";

/** Snapshot intégrations avec tests de santé (hub production). */
export async function loadVerifiedIntegrationsSnapshot(
  opts?: LoadIntegrationsOpts,
): Promise<IntegrationSnapshot[]> {
  const base = await loadIntegrationsSnapshot(opts);
  return Promise.all(
    base.map(async (item) => {
      if (!shouldRunHealthCheck(item)) return item;
      const result = await testIntegrationConnection(item.id);
      return applyHealthCheck(item, result);
    }),
  );
}
