"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type DeferredMountProps = {
  children: ReactNode;
  /** Réserve l’espace avant hydratation (évite le layout shift). */
  minHeight?: string;
  rootMargin?: string;
  className?: string;
};

/** Monte les enfants quand la section entre (presque) dans le viewport. */
export function DeferredMount({
  children,
  minHeight = "12rem",
  rootMargin = "320px 0px",
  className,
}: DeferredMountProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || mounted) return;

    if (typeof IntersectionObserver === "undefined") {
      setMounted(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setMounted(true);
          io.disconnect();
        }
      },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [mounted, rootMargin]);

  return (
    <div ref={ref} className={className} style={!mounted ? { minHeight } : undefined}>
      {mounted ? children : null}
    </div>
  );
}
