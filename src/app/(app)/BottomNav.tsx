"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconDocument,
  IconFournisseurs,
  IconHome,
  IconMore,
  IconScanner,
} from "@/components/tarineo/NavIcons";
import { BoutonImporterNav } from "@/components/tarineo/BoutonImporterNav";
import { cn } from "@/lib/utils";

const ONGLETS = [
  {
    href: "/accueil",
    label: "Accueil",
    estActif: (pathname: string) => pathname === "/accueil",
    icone: IconHome,
  },
  {
    href: "/documents",
    label: "Documents",
    estActif: (pathname: string, scannerActif: boolean) =>
      (pathname === "/documents" || pathname.startsWith("/documents/")) && !scannerActif,
    icone: IconDocument,
  },
  {
    href: "/documents?scanner=1",
    label: "Scanner",
    prominent: true,
    estActif: (_pathname: string, scannerActif: boolean) => scannerActif,
    icone: IconScanner,
  },
  {
    href: "/fournisseurs",
    label: "Fournisseurs",
    estActif: (pathname: string) => pathname.startsWith("/fournisseurs"),
    icone: IconFournisseurs,
  },
  {
    href: "/plus",
    label: "Plus",
    estActif: (pathname: string) =>
      pathname === "/plus" ||
      pathname.startsWith("/devis-clients") ||
      pathname.startsWith("/factures-clients") ||
      pathname.startsWith("/clients") ||
      pathname.startsWith("/facturation-clients") ||
      pathname.startsWith("/analyses") ||
      pathname.startsWith("/parametres") ||
      pathname.startsWith("/chantiers"),
    icone: IconMore,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scannerActif = pathname.startsWith("/documents") && searchParams.get("scanner") === "1";

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e5e5ea] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-0.5px_0_rgba(0,0,0,0.06)] lg:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-5xl items-end justify-center px-1 pt-1">
        {ONGLETS.map((onglet) => {
          const actif = onglet.estActif(pathname, scannerActif);
          const Icone = onglet.icone;

          if (onglet.prominent) {
            return (
              <div key={onglet.href} className="flex flex-1 flex-col items-center gap-0.5 pb-0.5">
                <BoutonImporterNav
                  size="icon-lg"
                  aria-label="Scanner un document"
                  className={cn(
                    "size-[52px] shadow-[0_6px_14px_rgba(237,89,33,0.35)] transition-transform duration-150 ease-out motion-reduce:active:scale-100",
                    actif ? "ring-2 ring-primary/20" : undefined,
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium",
                    actif ? "font-semibold text-primary" : "text-[#8e8e93]",
                  )}
                >
                  {onglet.label}
                </span>
              </div>
            );
          }

          return (
            <Link
              key={onglet.href}
              href={onglet.href}
              prefetch={false}
              className={cn(
                "flex flex-1 flex-col items-center gap-[3px] px-0.5 pb-0.5 pt-1.5 transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100",
                actif ? "text-primary" : "text-[#8e8e93] hover:text-foreground",
              )}
              aria-current={actif ? "page" : undefined}
            >
              <Icone className="size-6" />
              <span className={cn("text-[10px]", actif ? "font-semibold" : "font-medium")}>{onglet.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
