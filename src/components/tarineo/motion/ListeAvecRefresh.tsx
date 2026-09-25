"use client";

import type { ReactNode } from "react";
import { PullToRefresh } from "@/components/tarineo/motion/PullToRefresh";

/** Enveloppe client pour les pages serveur (listes) — tirez pour rafraîchir. */
export function ListeAvecRefresh({ children }: { children: ReactNode }) {
  return <PullToRefresh>{children}</PullToRefresh>;
}
