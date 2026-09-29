"use client";

import { useCallback, useRef, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";
import { useMousePosition } from "@/hooks/use-mouse-position";
import { cn } from "@/lib/utils";

/**
 * Surface shine au survol (Animata github-card-shiny) — thème clair Tarineo.
 * Source: https://github.com/codse/animata (MIT)
 */
export function ShinySurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const update = useCallback(({ x, y }: { x: number; y: number }) => {
    if (!overlayRef.current) return;
    const { width, height } = overlayRef.current.getBoundingClientRect();
    overlayRef.current.style.setProperty("--x", `${x - width / 2}px`);
    overlayRef.current.style.setProperty("--y", `${y - height / 2}px`);
  }, []);

  useMousePosition(containerRef, reduce ? undefined : update);

  return (
    <div
      ref={containerRef}
      className={cn(
        "group/shiny relative overflow-hidden rounded-[14px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF]",
        "shadow-[0_1px_2px_rgba(10,10,10,0.04)]",
        className,
      )}
    >
      {!reduce ? (
        <div
          ref={overlayRef}
          aria-hidden
          className="pointer-events-none absolute z-0 size-40 rounded-full bg-[#FF6B1A] opacity-0 blur-3xl transition-opacity duration-200 group-hover/shiny:opacity-[0.14] motion-reduce:hidden"
          style={{ transform: "translate(var(--x, -999px), var(--y, -999px))" }}
        />
      ) : null}
      <div className="relative z-[1]">{children}</div>
    </div>
  );
}
