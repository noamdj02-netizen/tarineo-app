"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  IconDocument,
  IconFournisseurs,
  IconHome,
  IconMore,
  IconScanner,
} from "@/components/tarineo/NavIcons";
import { cn } from "@/lib/utils";

const ONGLETS = [
  {
    href: "/accueil",
    label: "Accueil",
    icone: IconHome,
  },
  {
    href: "/documents",
    label: "Documents",
    estActif: (pathname: string) => pathname.startsWith("/documents") && !pathname.includes("scanner"),
    icone: IconDocument,
  },
  {
    href: "/documents?scanner=1",
    label: "Scanner",
    estActif: () => false,
    prominent: true,
    icone: IconScanner,
  },
  {
    href: "/fournisseurs",
    label: "Fournisseurs",
    estActif: (pathname: string) => pathname.startsWith("/fournisseurs"),
    icone: IconFournisseurs,
  },
  {
    href: "/parametres",
    label: "Plus",
    estActif: (pathname: string) =>
      pathname.startsWith("/parametres") ||
      pathname.startsWith("/compte") ||
      pathname.startsWith("/devis-clients") ||
      pathname.startsWith("/entreprise"),
    icone: IconMore,
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] lg:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-5xl items-end justify-around px-1">
        {ONGLETS.map((onglet) => {
          const actif = onglet.estActif
            ? onglet.estActif(pathname)
            : pathname === onglet.href || pathname.startsWith(`${onglet.href}/`);
          const Icone = onglet.icone;

          if (onglet.prominent) {
            return (
              <Link
                key={onglet.href}
                href={onglet.href}
                prefetch={false}
                className="-mt-5 flex flex-1 flex-col items-center gap-1"
              >
                <span className="flex size-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/30">
                  <Icone className="size-[26px]" />
                </span>
                <span className="text-[11px] font-semibold text-primary">{onglet.label}</span>
              </Link>
            );
          }

          return (
            <Link
              key={onglet.href}
              href={onglet.href}
              prefetch={false}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors",
                actif ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={actif ? "page" : undefined}
            >
              <Icone className="size-6" />
              {onglet.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
