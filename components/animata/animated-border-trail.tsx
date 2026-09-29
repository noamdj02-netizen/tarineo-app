"use client";

import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import "./animated-border-trail.css";

const sizes = { sm: 5, md: 10, lg: 20 } as const;

type AnimatedBorderTrailProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  duration?: string;
  contentClassName?: string;
  /** Default: Tarineo orange */
  trailColor?: string;
  trailSize?: keyof typeof sizes;
};

/**
 * Bordure animée (Animata) — tokens Tarineo, reduced-motion off.
 * Source: https://github.com/codse/animata (MIT)
 */
export function AnimatedBorderTrail({
  children,
  className,
  duration = "10s",
  trailColor = "#FF6B1A",
  trailSize = "md",
  contentClassName,
  ...props
}: AnimatedBorderTrailProps) {
  return (
    <div
      {...props}
      className={cn(
        "relative h-fit w-full overflow-hidden rounded-[16px] bg-[rgba(10,10,10,0.08)] p-px",
        className,
      )}
    >
      <div
        aria-hidden
        className="animata-border-trail-spin absolute inset-0 size-full motion-reduce:hidden"
        style={{
          animation: `border-trail ${duration} linear infinite`,
          background: `conic-gradient(from var(--border-trail-angle) at 50% 50%, transparent ${100 - sizes[trailSize]}%, ${trailColor})`,
        }}
      />
      <div
        className={cn(
          "relative size-full overflow-hidden rounded-[15px] bg-[#FFFFFF]",
          contentClassName,
        )}
      >
        {children}
      </div>
    </div>
  );
}
