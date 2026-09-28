"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ADMIN_NAV } from "@/lib/admin/nav";
import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-dvh bg-bg">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[228px] flex-col bg-side px-3 pt-5 pb-4 text-side-ink lg:flex">
        <Link href="/admin/overview" className="px-2 font-grotesk text-[18px] font-bold tracking-[-0.04em]">
          {BRAND.name}
          <span className="text-side-muted"> / admin</span>
        </Link>
        <nav className="mt-6 min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {ADMIN_NAV.map((section) => (
            <div key={section.id} className="mb-4">
              <p className="mono-label mb-1 px-2 text-[10px] text-side-muted/80">{section.label}</p>
              <ul className="flex flex-col gap-px">
                {section.items.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "block rounded-lg px-2.5 py-1.5 text-[13px] leading-tight",
                          active
                            ? "nav-active"
                            : "text-side-muted hover:bg-side-ink/[.06] hover:text-side-ink",
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <Link href="/accueil" className="px-2 text-[12px] text-side-muted hover:text-side-ink">
          Retour au cockpit
        </Link>
      </aside>
      <div className="lg:ml-[228px]">
        <nav className="flex gap-1 overflow-x-auto border-b border-line bg-surface px-3 py-2 lg:hidden">
          {ADMIN_NAV.flatMap((section) => [...section.items]).map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "shrink-0 rounded-pill px-3 py-1.5 text-[12px]",
                pathname === item.href ? "bg-ink text-white" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mx-auto w-full max-w-[1180px] px-4 pt-5 pb-16 sm:px-6">{children}</div>
      </div>
    </div>
  );
}
