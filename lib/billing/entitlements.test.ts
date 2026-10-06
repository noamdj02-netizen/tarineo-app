import assert from "node:assert/strict";
import test from "node:test";
import type { PlanInfo } from "@/lib/billing/plan";
import { LIMITS } from "@/lib/billing/plans";
import { canUseFeature, getEntitlements, hasProEntitlements } from "@/lib/billing/entitlements-core";

function plan(planId: PlanInfo["plan"], extra?: Partial<PlanInfo>): PlanInfo {
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
    ...extra,
  };
}

test("hasProEntitlements: pro, founder, trial", () => {
  assert.equal(hasProEntitlements(plan("pro")), true);
  assert.equal(hasProEntitlements(plan("founder")), true);
  assert.equal(hasProEntitlements(plan("pro", { isFreeTrial: true })), true);
});

test("hasProEntitlements: starter and free", () => {
  assert.equal(hasProEntitlements(plan("starter")), false);
  assert.equal(hasProEntitlements(plan("free")), false);
});

test("canUseFeature: core on starter", () => {
  const p = plan("starter");
  assert.equal(canUseFeature(p, "documents_core"), true);
  assert.equal(canUseFeature(p, "quote_followup_manual"), true);
  assert.equal(canUseFeature(p, "margin_alert"), true);
});

test("canUseFeature: pro-only blocked on starter", () => {
  const p = plan("starter");
  assert.equal(canUseFeature(p, "quote_followup_auto"), false);
  assert.equal(canUseFeature(p, "accounting_export_auto"), false);
  assert.equal(canUseFeature(p, "api_access"), false);
});

test("canUseFeature: pro plan", () => {
  const p = plan("pro");
  assert.equal(canUseFeature(p, "quote_followup_auto"), true);
  assert.equal(canUseFeature(p, "api_access"), true);
});

test("getEntitlements map", () => {
  const map = getEntitlements(plan("starter"));
  assert.equal(map.quote_followup_manual, true);
  assert.equal(map.quote_followup_auto, false);
});
