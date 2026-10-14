import Image from "next/image";
import type { ReactNode } from "react";

import { LandingTitleCircuit } from "@/components/site/landing-v2/components/ui/LandingTitleCircuit";
import { cn } from "@/lib/utils";

const DEFAULT_BADGE_ICON = "/landing/figma/preuve/badge-doc.svg";

/** En-tête sections landing — pilule + icône + barre orange sous le titre (Figma fonctionnalités). */
export function LandingFigmaSectionHeader({
  badge,
  badgeIcon = DEFAULT_BADGE_ICON,
  title,
  subtitle,
  align = "left",
  titleId,
  className,
  children,
}: {
  badge: string;
  badgeIcon?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  titleId?: string;
  className?: string;
  children?: ReactNode;
}) {
  const centered = align === "center";

  return (
    <header
      className={cn(
        "flex max-w-[32rem] flex-col gap-3",
        centered && "mx-auto max-w-[760px] items-center text-center",
        className,
      )}
    >
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full bg-white py-1 pl-1 pr-[13px]",
          "shadow-[0_3px_3px_rgba(0,0,0,0.05),0_1px_1px_rgba(0,0,0,0.15)]",
          centered && "mx-auto",
        )}
      >
        <Image src={badgeIcon} alt="" width={37} height={26} className="h-[26px] w-[37px]" />
        <span className="text-base font-medium leading-6 text-[#0d0d0d]">{badge}</span>
      </span>

      <div className={cn("flex flex-col gap-2", centered && "items-center")}>
        <h2
          id={titleId}
          className={cn(
            "text-balance text-[clamp(1.75rem,3.2vw,2.5rem)] font-semibold leading-[1.2] tracking-[-0.04em] text-[#141414]",
            centered && "text-center",
          )}
        >
          {title}
        </h2>
        <LandingTitleCircuit align={centered ? "center" : "left"} />
      </div>

      {subtitle ? (
        <p
          className={cn(
            "text-sm font-medium leading-[21px] text-[#95959d]",
            centered && "max-w-[36rem] text-center",
          )}
        >
          {subtitle}
        </p>
      ) : null}

      {children}
    </header>
  );
}
