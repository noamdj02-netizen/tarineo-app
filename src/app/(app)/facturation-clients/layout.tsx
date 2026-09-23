import { verifierFeaturePage } from "@/lib/verifierFeaturePage";

export default function LayoutFacturationClients({ children }: { children: React.ReactNode }) {
  verifierFeaturePage("clientBilling");
  return children;
}
