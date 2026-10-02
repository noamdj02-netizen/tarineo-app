"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { SETTINGS_NAV } from "@/lib/settings/nav";
import { canViewSection, type WorkspaceRole } from "@/lib/settings/roles";
import { cn } from "@/lib/utils";

export function SettingsChrome({
  role,
  children,
}: {
  role: WorkspaceRole;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const items = SETTINGS_NAV.filter((i) => canViewSection(role, i.id));
  const isHub = pathname === "/parametres";

  useEffect(() => {
    if (!isHub) return;
    const mq = window.matchMedia("(min-width: 1024px)");
    if (mq.matches) router.replace("/parametres/entreprise");
  }, [isHub, router]);

  return (
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
      {/* Desktop rail */}
      <nav aria-label="Paramètres" className="hidden w-[220px] shrink-0 flex-col gap-0.5 lg:flex">
        <p className="mb-2 px-2.5 text-[10.5px] font-semibold tracking-[0.08em] text-muted-foreground uppercase">
          Configuration
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-[13.5px] transition-colors",
                active
                  ? "bg-tarineo-orange-soft font-medium text-tarineo-orange"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-ink",
              )}
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Mobile hub : liste de catégories */}
      {isHub ? (
        <nav aria-label="Catégories paramètres" className="flex flex-col gap-1.5 lg:hidden">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                className="card-soft flex min-h-14 items-center gap-3 px-4 py-3 transition-colors"
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-medium text-ink">{item.label}</span>
                  <span className="mt-0.5 block text-[12.5px] text-muted-foreground">{item.description}</span>
                </span>
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              </Link>
            );
          })}
        </nav>
      ) : null}

      {/* Contenu section (masqué sur hub mobile) */}
      <div className={cn("min-w-0 flex-1", isHub && "hidden lg:block")}>
        {!isHub ? (
          <Link
            href="/parametres"
            className="mb-4 inline-flex items-center gap-1 text-[13px] font-medium text-muted-foreground hover:text-ink lg:hidden"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Paramètres
          </Link>
        ) : null}
        {children}
      </div>
    </div>
  );
}
