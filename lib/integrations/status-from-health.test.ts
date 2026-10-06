import assert from "node:assert/strict";
import { test } from "node:test";
import type { IntegrationSnapshot } from "../settings/integrations-catalog";
import { applyHealthCheck, shouldRunHealthCheck } from "./status-from-health";

function snap(partial: Partial<IntegrationSnapshot> & { id: IntegrationSnapshot["id"]; status: IntegrationSnapshot["status"] }): IntegrationSnapshot {
  return {
    category: "messagerie",
    name: partial.id,
    subtitle: "",
    description: "",
    capability: "platform",
    ...partial,
  } as IntegrationSnapshot;
}

test("applyHealthCheck — ok promote to connected", () => {
  const base = snap({ id: "tarineo_email", status: "available" });
  const next = applyHealthCheck(base, {
    integrationId: "tarineo_email",
    outcome: "ok",
    message: "OK",
    checkedAt: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(next.status, "connected");
  assert.equal(next.errorMessage, null);
});

test("applyHealthCheck — never connected without ok", () => {
  const base = snap({ id: "calendar_ical", status: "connected" });
  const next = applyHealthCheck(base, {
    integrationId: "calendar_ical",
    outcome: "error",
    message: "Flux invalide",
    checkedAt: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(next.status, "error");
});

test("applyHealthCheck — stripe free stays available", () => {
  const base = snap({
    id: "stripe_billing",
    status: "available",
    category: "billing",
    capability: "billing_status",
  });
  const next = applyHealthCheck(base, {
    integrationId: "stripe_billing",
    outcome: "not_connected",
    message: "Pas d’abonnement",
    checkedAt: "2026-01-01T00:00:00.000Z",
  });
  assert.equal(next.status, "available");
});

test("shouldRunHealthCheck — tarineo always", () => {
  assert.equal(
    shouldRunHealthCheck(snap({ id: "tarineo_email", status: "requires_setup" })),
    true,
  );
  assert.equal(shouldRunHealthCheck(snap({ id: "microsoft", status: "coming_soon" })), false);
});
