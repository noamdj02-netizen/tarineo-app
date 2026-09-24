import { PageEnter } from "@/components/motion/page-enter";

export default function OnboardTemplate({ children }: { children: React.ReactNode }) {
  return <PageEnter variant="onboard">{children}</PageEnter>;
}
