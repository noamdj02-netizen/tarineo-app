"use client";

import type { ReactNode } from "react";
import { TarineoMark } from "@/components/site/tarineo-mark";
import { PRODUCT_DEMO } from "@/lib/site/product-demo";
import { cn } from "@/lib/utils";

/** Chrome produit — surface blanche, bordure subtile, profondeur légère. */
export function ProductDemoShell({
  title,
  children,
  className,
  bodyClassName,
}: {
  title: string;
  children: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-[16px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF]",
        "shadow-[0_1px_2px_rgba(10,10,10,0.04),0_8px_24px_rgba(10,10,10,0.04)]",
        className,
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-[rgba(10,10,10,0.08)] bg-[#FFFFFF] px-4 py-2.5 sm:px-4">
        <TarineoMark className="size-6" priority={false} />
        <p className="min-w-0 truncate text-[13px] font-semibold tracking-[-0.01em] text-[#0A0A0A]">
          {title}
        </p>
        <span className="ml-auto shrink-0 text-[11px] text-[#6E6E6E]">{PRODUCT_DEMO.mark}</span>
      </div>
      <div className={cn("bg-[#F5F5F3] p-3.5 sm:p-5", bodyClassName)}>{children}</div>
    </div>
  );
}

export function ProductDemoSurface({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[12px] border border-[rgba(10,10,10,0.08)] bg-[#FFFFFF]",
        className,
      )}
    >
      {children}
    </div>
  );
}
