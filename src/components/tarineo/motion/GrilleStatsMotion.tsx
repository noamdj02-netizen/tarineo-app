"use client";

import type { ReactNode } from "react";
import { AppStagger, AppStaggerItem } from "./AppStagger";
import { CarteResume } from "../CarteResume";

export function GrilleStatsMotion({ className = "", children }: { className?: string; children: ReactNode }) {
  return (
    <AppStagger className={className} stagger={0.04} delayChildren={0.03}>
      {children}
    </AppStagger>
  );
}

export function CarteResumeMotion({
  label,
  valeur,
  hint,
  accent,
}: {
  label: string;
  valeur: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <AppStaggerItem>
      <CarteResume label={label} valeur={valeur} hint={hint} accent={accent} />
    </AppStaggerItem>
  );
}
