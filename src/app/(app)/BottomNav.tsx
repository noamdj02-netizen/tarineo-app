"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { LayoutGroup, motion, useReducedMotion } from "motion/react";
import {
  IconCards,
  IconClock,
  IconHome,
  IconScanner,
  IconUser,
} from "@/components/tarineo/NavIcons";
import { BoutonImporterNav } from "@/components/tarineo/BoutonImporterNav";
import { useAppNavigation } from "@/components/tarineo/motion/AppNavigationContext";
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
    label: "Devis",
    estActif: (pathname: string, scannerActif: boolean) =>
      (pathname === "/documents" || pathname.startsWith("/documents/")) && !scannerActif,
    icone: IconClock,
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
    icone: IconCards,
  },
  {
    href: "/plus",
    label: "Profil",
    estActif: (pathname: string) =>
      pathname === "/plus" ||
      pathname.startsWith("/devis-clients") ||
      pathname.startsWith("/factures-clients") ||
      pathname.startsWith("/clients") ||
      pathname.startsWith("/facturation-clients") ||
      pathname.startsWith("/analyses") ||
      pathname.startsWith("/parametres") ||
      pathname.startsWith("/chantiers") ||
      pathname.startsWith("/coffre") ||
      pathname.startsWith("/veille") ||
      pathname === "/compte",
    icone: IconUser,
  },
];

const HAUTEUR_BARRE = 56;
const HAUTEUR_LABEL = 18;

export function BottomNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduce = useReducedMotion();
  const { navigateTab, prefetch } = useAppNavigation();
  const scannerActif = pathname.startsWith("/documents") && searchParams.get("scanner") === "1";

  if (pathname.startsWith("/onboarding")) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e5e5ea] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-0.5px_0_rgba(0,0,0,0.06)] lg:hidden"
      aria-label="Navigation principale"
    >
      <LayoutGroup id="bottom-nav">
        <div
          className="relative mx-auto grid max-w-5xl grid-cols-5 items-end px-1"
          style={{ height: HAUTEUR_BARRE }}
        >
          {ONGLETS.map((onglet) => {
            const actif = onglet.estActif(pathname, scannerActif);
            const Icone = onglet.icone;

            if (onglet.prominent) {
              return (
                <div
                  key={onglet.href}
                  className="relative flex h-full flex-col items-center justify-end pb-1"
                >
                  <div
                    className="absolute left-1/2 z-10 -translate-x-1/2"
                    style={{ bottom: HAUTEUR_LABEL }}
                  >
                    <BoutonImporterNav
                      size="icon-lg"
                      aria-label="Scanner un document"
                      className={cn(
                        "size-[56px] shadow-[0_8px_18px_rgba(237,89,33,0.38)] transition-transform duration-150 ease-out motion-reduce:active:scale-100",
                        actif ? "ring-2 ring-primary/25" : undefined,
                      )}
                    />
                  </div>
                  <span
                    className={cn(
                      "relative z-0 text-[10px] leading-none",
                      actif ? "font-semibold text-primary" : "font-medium text-[#8e8e93]",
                    )}
                  >
                    {onglet.label}
                  </span>
                </div>
              );
            }

            function aller(e: React.MouseEvent) {
              e.preventDefault();
              if (actif) return;
              navigateTab(onglet.href, pathname);
            }

            function precharger() {
              prefetch(onglet.href);
            }

            const bouton = (
              <a
                href={onglet.href}
                onClick={aller}
                onPointerDown={precharger}
                onTouchStart={precharger}
                className={cn(
                  "flex h-full flex-col items-center justify-end gap-0.5 pb-1 transition-colors duration-150 ease-out",
                  actif ? "text-primary" : "text-[#8e8e93] hover:text-foreground",
                )}
                aria-current={actif ? "page" : undefined}
              >
                <span className="relative flex size-7 items-center justify-center">
                  <Icone className="size-6" />
                  {actif && !reduce && (
                    <motion.span
                      layoutId="bottom-nav-indicateur"
                      className="absolute -bottom-0.5 h-0.5 w-3 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 420, damping: 32 }}
                    />
                  )}
                </span>
                <span className={cn("text-[10px] leading-none", actif ? "font-semibold" : "font-medium")}>
                  {onglet.label}
                </span>
              </a>
            );

            if (reduce) {
              return <div key={onglet.href}>{bouton}</div>;
            }

            return (
              <motion.div
                key={onglet.href}
                className="h-full"
                whileTap={{ scale: 0.94 }}
                transition={{ type: "spring", stiffness: 500, damping: 28 }}
              >
                {bouton}
              </motion.div>
            );
          })}
        </div>
      </LayoutGroup>
    </nav>
  );
}
