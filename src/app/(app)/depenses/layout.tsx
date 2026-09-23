import { verifierFeaturePage } from "@/lib/verifierFeaturePage";

export default function LayoutDepenses({ children }: { children: React.ReactNode }) {
  verifierFeaturePage("expenses");
  return children;
}
