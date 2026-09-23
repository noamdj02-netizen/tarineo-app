import { cn } from "@/lib/utils";

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Dashboard — grille 4 cases */
export function IconWidget({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <rect x="2.6" y="2.6" width="8" height="8" rx="2.2" />
      <rect x="13.4" y="2.6" width="8" height="8" rx="2.2" />
      <rect x="2.6" y="13.4" width="8" height="8" rx="2.2" />
      <rect x="13.4" y="13.4" width="8" height="8" rx="2.2" />
    </svg>
  );
}

/** Mes documents — fichier avec lignes */
export function IconDocument({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <path d="M7 3.25h6.4L18.75 8.6V19.5A1.25 1.25 0 0 1 17.5 20.75H7A1.25 1.25 0 0 1 5.75 19.5V4.5A1.25 1.25 0 0 1 7 3.25Z" />
      <path d="M13.25 3.4v4.6h4.6" />
      <path d="M9 13h6M9 16.5h4" />
    </svg>
  );
}

/** Fournisseurs — enseigne / bâtiment */
export function IconFournisseurs({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

/** Facturation clients — carte bancaire */
export function IconInvoice({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="2.2" />
      <path d="M2.5 10.5h19" />
      <path d="M6.5 15.5h4.5" />
    </svg>
  );
}

/** Analyses — courbe de tendance */
export function IconAnalyses({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <path d="M4 19V5" />
      <path d="M4 19h16" />
      <path d="M8 15l3-4 3 2.5 4-6" />
    </svg>
  );
}

/** Paramètres — roue crantée */
export function IconSettings({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 12 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 12a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V12c.26.604.852.997 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

/** Accueil mobile */
export function IconHome({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}

/** Scanner document */
export function IconScanner({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <path d="M7 3h3M14 3h3M21 7v3M21 14v3M17 21h-3M10 21H7M3 17v-3M3 10V7" />
      <circle cx="12" cy="12" r="3.5" />
    </svg>
  );
}

/** Fournisseurs mobile (carte + envoi — Figma card-send) */
export function IconCardSend({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <rect x="2.5" y="6" width="14" height="10" rx="2" />
      <path d="M16.5 10.5 21 8v8l-4.5-2.5" />
      <path d="M6.5 11h5M6.5 14h3" />
    </svg>
  );
}

/** Compte mobile */
export function IconCompte({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" {...stroke}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20.5c0-3.5 3.1-5.5 7-5.5s7 2 7 5.5" />
    </svg>
  );
}

/** Menu « Plus » mobile */
export function IconMore({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-6", className)} aria-hidden="true" fill="currentColor" stroke="none">
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
    </svg>
  );
}

export function IconFile({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5", className)} aria-hidden="true" {...stroke}>
      <path d="M7 3.25h6.4L18.75 8.6V19.5A1.25 1.25 0 0 1 17.5 20.75H7A1.25 1.25 0 0 1 5.75 19.5V4.5A1.25 1.25 0 0 1 7 3.25Z" />
      <path d="M13.25 3.4v4.6h4.6" />
    </svg>
  );
}

export function IconCalendar({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true" {...stroke}>
      <rect x="3.5" y="5" width="17" height="15" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M3.5 10h17" />
    </svg>
  );
}

export function IconChevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true" {...stroke}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconFilter({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true" {...stroke}>
      <path d="M4 6h16M7 12h10M10 18h4" />
    </svg>
  );
}

export function IconPlus({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} aria-hidden="true" {...stroke}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
