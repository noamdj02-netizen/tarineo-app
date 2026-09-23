import { features } from "@/lib/features";
import { exigerFeature } from "@/lib/featureGating";

export type FeaturePage =
  | "clientBilling"
  | "projects"
  | "expenses"
  | "purchaseOrders"
  | "vault";

export function verifierFeaturePage(nom: FeaturePage): void {
  exigerFeature(features[nom]);
}
