"use client";

import { useReducedMotion } from "framer-motion";

import { HeroMarker } from "@/components/site/hero/hero-headline";
import { cn } from "@/lib/utils";

/** Titre section landing — lead + ligne italique marquée (échelle sous le hero). */
export function LandingStackHeadline({
  lead,
  tail,
  className,
}: {
  lead: string;
  tail: string;
  className?: string;
}) {
  const reduce = useReducedMotion();

  return (
    <h2 className={cn("text-ink", className)}>
      <span className="landing-stack-headline-lead block text-balance">{lead}</span>
      <span className="mt-2 block sm:mt-3">
        <span className="landing-stack-headline-tail-wrap">
          <span className="landing-stack-headline-tail-text">
            <HeroMarker reduce={reduce} />
            {tail}
          </span>
        </span>
      </span>
    </h2>
  );
}
