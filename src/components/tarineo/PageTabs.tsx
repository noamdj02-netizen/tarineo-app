"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageTabs({
  items,
  actif,
}: {
  items: { id: string; label: string; href: string }[];
  actif: string;
}) {
  return (
    <div className="flex gap-5 overflow-x-auto border-b border-[#EEE]">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "shrink-0 border-b-2 px-0 py-2.5 text-sm",
            actif === item.id ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}

export function PillTabs({
  items,
  actif,
}: {
  items: { id: string; label: string; href: string }[];
  actif: string;
}) {
  return (
    <div className="flex gap-5 overflow-x-auto border-b border-[#EEE]">
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={cn(
            "shrink-0 border-b-2 px-0 py-2.5 text-sm",
            actif === item.id ? "border-primary font-medium text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
