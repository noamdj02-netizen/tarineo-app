"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/react";

/** Mesure d'audience anonymisée Vercel — pas de cookie publicitaire. */
export function Analytics() {
  return <VercelAnalytics />;
}
