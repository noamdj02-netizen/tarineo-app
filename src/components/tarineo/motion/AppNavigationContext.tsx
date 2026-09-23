"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type TransitionNavigation = "default" | "import" | "tab-left" | "tab-right";

/** Ordre des onglets bottom nav (hors FAB scanner). */
export const ONGLETS_MOBILE = ["/accueil", "/documents", "/fournisseurs", "/plus"] as const;

export function indexOnglet(pathname: string): number {
  if (pathname === "/accueil") return 0;
  if (pathname === "/documents" || pathname.startsWith("/documents/")) return 1;
  if (pathname.startsWith("/fournisseurs")) return 2;
  if (
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
    pathname === "/compte"
  ) {
    return 3;
  }
  return -1;
}

type Contexte = {
  transition: TransitionNavigation;
  navigate: (href: string, type?: TransitionNavigation) => void;
  navigateTab: (href: string, depuisPathname: string) => void;
  prefetch: (href: string) => void;
  consommerTransition: () => TransitionNavigation;
};

const AppNavigationContext = createContext<Contexte | null>(null);

export function AppNavigationProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [transition, setTransition] = useState<TransitionNavigation>("default");

  const navigate = useCallback(
    (href: string, type: TransitionNavigation = "default") => {
      setTransition(type);
      router.push(href);
    },
    [router],
  );

  const navigateTab = useCallback(
    (href: string, depuisPathname: string) => {
      const from = indexOnglet(depuisPathname);
      const to = indexOnglet(href);
      let type: TransitionNavigation = "default";
      if (from >= 0 && to >= 0 && from !== to) {
        type = to > from ? "tab-right" : "tab-left";
      }
      setTransition(type);
      router.push(href);
    },
    [router],
  );

  const prefetch = useCallback(
    (href: string) => {
      router.prefetch(href);
    },
    [router],
  );

  const consommerTransition = useCallback(() => {
    const courante = transition;
    if (courante !== "default") {
      setTransition("default");
    }
    return courante;
  }, [transition]);

  const valeur = useMemo(
    () => ({ transition, navigate, navigateTab, prefetch, consommerTransition }),
    [transition, navigate, navigateTab, prefetch, consommerTransition],
  );

  return <AppNavigationContext.Provider value={valeur}>{children}</AppNavigationContext.Provider>;
}

export function useAppNavigation() {
  const ctx = useContext(AppNavigationContext);
  if (!ctx) {
    throw new Error("useAppNavigation doit être utilisé dans AppNavigationProvider");
  }
  return ctx;
}
