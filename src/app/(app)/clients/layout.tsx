import { verifierFeaturePage } from "@/lib/verifierFeaturePage";

export default function LayoutClients({ children }: { children: React.ReactNode }) {
  verifierFeaturePage("clientBilling");
  return children;
}
