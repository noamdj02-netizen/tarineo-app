import { verifierFeaturePage } from "@/lib/verifierFeaturePage";

export default function LayoutCoffre({ children }: { children: React.ReactNode }) {
  verifierFeaturePage("vault");
  return children;
}
