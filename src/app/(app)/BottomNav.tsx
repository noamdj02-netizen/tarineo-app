"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  IconDocument,
  IconFournisseurs,
  IconHome,
  IconInvoice,
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
    label: "Importer",
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
    href: "/devis-clients",
    label: "Devis",
    estActif: (pathname: string) =>
      pathname.startsWith("/devis-clients") ||
      pathname.startsWith("/factures-clients") ||
      pathname.startsWith("/clients") ||
      pathname.startsWith("/facturation-clients"),
    icone: IconInvoice,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scannerActif = pathname.startsWith("/documents") && searchParams.get("scanner") === "1";

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-card/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_32px_rgba(0,0,0,0.06)] backdrop-blur-md lg:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-5xl items-end justify-around px-1">
        {ONGLETS.map((onglet) => {
          const actif = onglet.estActif(pathname, scannerActif);
          const Icone = onglet.icone;

          if (onglet.prominent) {
            return (
              <div key={onglet.href} className="-mt-5 flex flex-1 flex-col items-center gap-1">
                <BoutonImporterNav
                  size="icon-lg"
                  className={cn(
                    "transition-transform duration-150 ease-out motion-reduce:active:scale-100",
                    actif ? "shadow-primary/40 ring-2 ring-primary/20" : undefined,
                  )}
                />
                <span className="text-[11px] font-semibold text-primary">{onglet.label}</span>
              </div>
            );
          }

          return (
            <Link
              key={onglet.href}
              href={onglet.href}
              prefetch={false}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-1 py-2.5 text-sm font-medium transition-[color,transform] duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100",
                actif ? "text-primary" : "text-muted-foreground hover:text-foreground",
              )}
              aria-current={actif ? "page" : undefined}
            >
              <Icone className={cn("size-6 transition-transform duration-200", actif && "scale-110")} />
              <span>{onglet.label}</span>
              {actif && <span className="absolute top-1 size-1 rounded-full bg-primary" aria-hidden="true" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
