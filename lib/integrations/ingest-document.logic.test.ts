import assert from "node:assert/strict";
import test from "node:test";
import { canUseFeature } from "@/lib/billing/entitlements-core";
import type { PlanInfo } from "@/lib/billing/plan";
import { LIMITS } from "@/lib/billing/plans";
import { integrationErrorStatus } from "@/lib/integrations/api-errors";
import { parseIntegrationDocumentKind } from "@/lib/integrations/document-kind";
import { hasApiScope } from "@/lib/integrations/api-key-scopes";
import type { Scope } from "@/lib/mcp/types";
import { validateIngestFile, INGEST_MAX_BYTES } from "@/lib/integrations/validate-ingest-file";

function plan(planId: PlanInfo["plan"]): PlanInfo {
  return {
    plan: planId,
    limits: LIMITS[planId],
    status: "active",
    interval: "month",
    tier: 0,
    periodEnd: null,
    cancelAtPeriodEnd: false,
    hasCustomer: true,
    hasPaidSubscription: planId !== "free",
    isFreeTrial: false,
  };
}

test("Starter cannot use mcp_business ingest", () => {
  assert.equal(canUseFeature(plan("starter"), "mcp_business"), false);
});

test("Pro can use mcp_business ingest", () => {
  assert.equal(canUseFeature(plan("pro"), "mcp_business"), true);
});

test("integration error status codes", () => {
  assert.equal(integrationErrorStatus("unauthorized"), 401);
  assert.equal(integrationErrorStatus("feature_requires_pro"), 403);
  assert.equal(integrationErrorStatus("invalid_file"), 400);
  assert.equal(integrationErrorStatus("file_too_large"), 413);
  assert.equal(integrationErrorStatus("idempotency_conflict"), 409);
  assert.equal(integrationErrorStatus("extraction_failed"), 422);
  assert.equal(integrationErrorStatus("rate_limited"), 429);
});

test("parseIntegrationDocumentKind", () => {
  assert.equal(parseIntegrationDocumentKind("supplier_quote"), "supplier_quote");
  assert.equal(parseIntegrationDocumentKind("customer_invoice"), "customer_invoice");
  assert.equal(parseIntegrationDocumentKind("bogus"), null);
});

test("validateIngestFile rejects empty and oversized", () => {
  const empty = validateIngestFile("x.pdf", "application/pdf", Buffer.alloc(0));
  assert.equal(empty.ok, false);
  if (!empty.ok) assert.equal(empty.code, "invalid_file");

  const big = validateIngestFile("x.pdf", "application/pdf", Buffer.alloc(INGEST_MAX_BYTES + 1));
  assert.equal(big.ok, false);
  if (!big.ok) assert.equal(big.code, "file_too_large");
});

test("validateIngestFile accepts minimal PDF magic", () => {
  const buf = Buffer.concat([Buffer.from("%PDF-1.4\n"), Buffer.alloc(100)]);
  const res = validateIngestFile("devis.pdf", "application/pdf", buf);
  assert.equal(res.ok, true);
});

test("API key scope write required for ingest", () => {
  const readOnly: Scope[] = ["read"];
  const withWrite: Scope[] = ["read", "write"];
  assert.equal(hasApiScope(readOnly, "write"), false);
  assert.equal(hasApiScope(withWrite, "write"), true);
});
