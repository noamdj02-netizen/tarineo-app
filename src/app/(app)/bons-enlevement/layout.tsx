import { verifierFeaturePage } from "@/lib/verifierFeaturePage";

export default function LayoutBonsEnlevement({ children }: { children: React.ReactNode }) {
  verifierFeaturePage("purchaseOrders");
  return children;
}
