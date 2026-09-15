import { BrandLogo } from "@/components/BrandLogo";

interface Props {
  href?: string;
  showWordmark?: boolean;
  className?: string;
}

export function LandingLogo({ href = "/", showWordmark = true, className = "" }: Props) {
  return (
    <BrandLogo
      href={href}
      showWordmark={showWordmark}
      wordmarkStyle="landing"
      className={className}
      priority
    />
  );
}
