import { verifierFeaturePage } from "@/lib/verifierFeaturePage";

export default function LayoutDevisClients({ children }: { children: React.ReactNode }) {
  verifierFeaturePage("clientBilling");
  return children;
}
