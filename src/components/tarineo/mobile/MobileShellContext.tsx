"use client";

import { createContext, useContext } from "react";
import type { NotifUi } from "@/lib/notifications";

export type MobileShellValue = {
  prenom: string;
  avatarUrl: string | null;
  companyName: string | null;
  notifications: NotifUi[];
};

const MobileShellContext = createContext<MobileShellValue | null>(null);

export function MobileShellProvider({
  value,
  children,
}: {
  value: MobileShellValue;
  children: React.ReactNode;
}) {
  return <MobileShellContext.Provider value={value}>{children}</MobileShellContext.Provider>;
}

export function useMobileShell(): MobileShellValue {
  const ctx = useContext(MobileShellContext);
  if (!ctx) {
    throw new Error("useMobileShell doit être utilisé dans MobileShellProvider");
  }
  return ctx;
}
