import { verifierFeaturePage } from "@/lib/verifierFeaturePage";

export default function LayoutFacturesClients({ children }: { children: React.ReactNode }) {
  verifierFeaturePage("clientBilling");
  return children;
}
