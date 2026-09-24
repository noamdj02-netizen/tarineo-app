import { PageEnter } from "@/components/motion/page-enter";

export default function SiteTemplate({ children }: { children: React.ReactNode }) {
  return <PageEnter variant="site">{children}</PageEnter>;
}
