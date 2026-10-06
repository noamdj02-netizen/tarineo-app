"use client";

import Image from "next/image";
import { useState } from "react";

import { Icon } from "@/components/site/landing-v2/components/ui/Icon";
import { brandLogoUrl } from "@/lib/resources/logo";
import type { IconName } from "@/lib/site/landing-v2-content";
import { cn } from "@/lib/utils";

type Props = {
  label: string;
  size?: number;
  /** Domaine logo.dev (outils uniquement — pas de logos distributeurs BTP sur la landing). */
  logoDomain?: string;
  iconFallback?: IconName;
  className?: string;
  rounded?: "sm" | "full";
};

/** Logo d’outil (logo.dev) ou icône Tarinéo — jamais de logo fournisseur sur la landing. */
export function IntegrationBrandLogo({
  label,
  size = 36,
  logoDomain,
  iconFallback = "link",
  className,
  rounded = "sm",
}: Props) {
  const [failed, setFailed] = useState(false);
  const src = logoDomain ? brandLogoUrl(logoDomain, Math.max(size * 2, 72)) : null;
  const radius = rounded === "full" ? "rounded-full" : "rounded-sm";

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center overflow-hidden border border-line bg-paper-50",
        radius,
        className,
      )}
      style={{ width: size, height: size }}
    >
      {src && !failed ? (
        <Image
          src={src}
          alt={`Logo ${label}`}
          width={size}
          height={size}
          unoptimized
          loading="lazy"
          onError={() => setFailed(true)}
          className="size-full object-contain p-[14%]"
        />
      ) : (
        <Icon name={iconFallback} className="h-4 w-4 text-ink-400" />
      )}
    </span>
  );
}
