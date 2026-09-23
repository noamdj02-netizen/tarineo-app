import { verifierFeaturePage } from "@/lib/verifierFeaturePage";

export default function LayoutChantiers({ children }: { children: React.ReactNode }) {
  verifierFeaturePage("projects");
  return children;
}
