"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { History, Home, Scan, User } from "lucide-react";
import { IconCardSend } from "@/components/tarineo/NavIcons";
import { BoutonImporterNav } from "@/components/tarineo/BoutonImporterNav";
import { MOBILE_GRADIENT_ACCENT, MOBILE_GRADIENT_HERO, MOBILE_NAV_SHADOW, MOBILE_TEXT_MUTED } from "@/components/tarineo/mobile/mobileTokens";
import { cn } from "@/lib/utils";

// Ventes clients et réglages avancés : hub /plus (pas un 6e onglet). Compte = profil uniquement.
const ONGLETS = [
  {
    href: "/accueil",
    label: "Accueil",
    estActif: (pathname: string) => pathname === "/accueil" || pathname === "/analyses",
    icone: Home,
  },
  {
    href: "/documents",
    label: "Documents",
    estActif: (pathname: string, scannerActif: boolean) => {
      if (scannerActif) return false;
      return (
        pathname === "/documents" ||
        pathname.startsWith("/documents/") ||
        pathname === "/coffre" ||
        pathname.startsWith("/bons-de-commande") ||
        pathname.startsWith("/bons-enlevement")
      );
    },
    icone: History,
  },
  {
    href: "/documents?scanner=1",
    label: "Scanner",
    prominent: true,
    estActif: (_pathname: string, scannerActif: boolean) => scannerActif,
    icone: Scan,
  },
  {
    href: "/fournisseurs",
    label: "Fournisseurs",
    estActif: (pathname: string) => pathname.startsWith("/fournisseurs"),
    icone: IconCardSend,
  },
  {
    href: "/plus",
    label: "Menu",
    estActif: (pathname: string) =>
      pathname === "/plus" ||
      pathname === "/compte" ||
      pathname.startsWith("/parametres") ||
      pathname.startsWith("/devis-clients") ||
      pathname.startsWith("/factures-clients") ||
      pathname.startsWith("/clients"),
    icone: User,
  },
];

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const scannerActif = pathname.startsWith("/documents") && searchParams.get("scanner") === "1";

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 bg-white pb-[max(28px,env(safe-area-inset-bottom))] pt-4 lg:hidden"
      style={{ boxShadow: MOBILE_NAV_SHADOW }}
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between px-6">
        {ONGLETS.map((onglet) => {
          const actif = onglet.estActif(pathname, scannerActif);
          const Icone = onglet.icone;

          if (onglet.prominent) {
            return (
              <div key={onglet.href} className="-mt-7 flex flex-1 flex-col items-center gap-2.5">
                <BoutonImporterNav
                  size="icon-lg"
                  aria-label="Scanner un document"
                  icone={<Scan className="size-[30px] text-white" strokeWidth={2} />}
                  className="size-[58px] !bg-transparent border-[3px] border-white text-white shadow-[0_8px_20px_rgba(230,59,11,0.4)] hover:!opacity-95"
                  style={{ backgroundImage: MOBILE_GRADIENT_HERO }}
                />
                <span className="text-[11px] font-medium" style={{ color: MOBILE_TEXT_MUTED }}>
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
              className="flex flex-1 flex-col items-center gap-2.5 transition-transform duration-200 active:scale-95"
              aria-current={actif ? "page" : undefined}
            >
              <Icone
                className={cn("size-[30px]", actif ? "text-[#ff6b16]" : "text-[#8e8e93]")}
                strokeWidth={actif ? 2.25 : 1.75}
                fill={actif && onglet.href === "/accueil" ? "currentColor" : "none"}
              />
              <span
                className={cn(
                  "text-[11px] leading-none",
                  actif ? "bg-clip-text font-semibold text-transparent" : "font-medium text-[#8e8e93]",
                )}
                style={actif ? { backgroundImage: MOBILE_GRADIENT_ACCENT } : undefined}
              >
                {onglet.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
