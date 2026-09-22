"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export type TransitionNavigation = "default" | "import";

type Contexte = {
  transition: TransitionNavigation;
  navigate: (href: string, type?: TransitionNavigation) => void;
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

  const consommerTransition = useCallback(() => {
    const courante = transition;
    if (courante !== "default") {
      setTransition("default");
    }
    return courante;
  }, [transition]);

  const valeur = useMemo(
    () => ({ transition, navigate, consommerTransition }),
    [transition, navigate, consommerTransition],
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
