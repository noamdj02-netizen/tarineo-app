"use client";

import { TarineoLogo } from "@/components/brand/tarineo-logo";
import { useTheme } from "@/components/theme/theme-provider";

export function ThemedLogo({
  size = "md",
  className,
  priority,
  decorative,
}: {
  size?: "sm" | "md" | "lg" | number;
  className?: string;
  priority?: boolean;
  decorative?: boolean;
}) {
  const { resolved } = useTheme();
  return (
    <TarineoLogo variant={resolved} size={size} className={className} priority={priority} decorative={decorative} />
  );
}
