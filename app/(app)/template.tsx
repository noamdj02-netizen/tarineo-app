import { PageEnter } from "@/components/motion/page-enter";

export default function AppTemplate({ children }: { children: React.ReactNode }) {
  return <PageEnter variant="app">{children}</PageEnter>;
}
