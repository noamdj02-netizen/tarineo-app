import { verifierFeaturePage } from "@/lib/verifierFeaturePage";

export default function LayoutBonsCommande({ children }: { children: React.ReactNode }) {
  verifierFeaturePage("purchaseOrders");
  return children;
}
