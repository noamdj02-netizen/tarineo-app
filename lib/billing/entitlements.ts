import "server-only";

import type { PlanInfo } from "@/lib/billing/plan";
import { planForUserId } from "@/lib/billing/plan";
import type { Db } from "@/lib/db";
import {
  canUseFeature,
  featureDeniedMessage,
  getEntitlements,
  hasProEntitlements,
  type TarineoFeature,
} from "@/lib/billing/entitlements-core";

export type { TarineoFeature };
export { canUseFeature, featureDeniedMessage, getEntitlements, hasProEntitlements };

export class FeatureNotAllowedError extends Error {
  feature: TarineoFeature;
  constructor(feature: TarineoFeature) {
    super(featureDeniedMessage(feature));
    this.name = "FeatureNotAllowedError";
    this.feature = feature;
  }
}

export async function requireFeature(db: Db, feature: TarineoFeature): Promise<PlanInfo> {
  const { planFor } = await import("@/lib/billing/plan");
  const plan = await planFor(db);
  if (!canUseFeature(plan, feature)) throw new FeatureNotAllowedError(feature);
  return plan;
}

export async function requireFeatureForUserId(
  userId: string,
  feature: TarineoFeature,
): Promise<PlanInfo> {
  const plan = await planForUserId(userId);
  if (!plan || !canUseFeature(plan, feature)) throw new FeatureNotAllowedError(feature);
  return plan;
}
