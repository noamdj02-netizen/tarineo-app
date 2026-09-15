"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ONGLETS = [
  {
    href: "/accueil",
    label: "Accueil",
    icone: (actif: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={actif ? 2 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={24}
        height={24}
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M4 11.5 12 4l8 7.5" />
        <path d="M6 10v9a1 1 0 0 0 1 1h3v-6h4v6h3a1 1 0 0 0 1-1v-9" />
      </svg>
    ),
  },
  {
    href: "/devis-clients",
    label: "Documents",
    estActif: (pathname: string) =>
      pathname.startsWith("/devis-clients") ||
      pathname.startsWith("/bons-de-commande") ||
      pathname.startsWith("/bons-enlevement") ||
      pathname.startsWith("/documents"),
    icone: (actif: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={actif ? 2 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={24}
        height={24}
        className="h-6 w-6"
        aria-hidden="true"
      >
        <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
        <path d="M13 3v4a1 1 0 0 0 1 1h4" />
        <path d="M9 13h6M9 17h6" />
      </svg>
    ),
  },
  {
    href: "/analyses",
    label: "Analyses",
    estActif: (pathname: string) => pathname.startsWith("/analyses"),
    icone: (actif: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={actif ? 2 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={24}
        height={24}
        className="h-6 w-6"
        aria-hidden="true"
      >
        <rect x="3" y="3" width="8" height="8" rx="2" />
        <rect x="13" y="3" width="8" height="8" rx="2" />
        <rect x="3" y="13" width="8" height="8" rx="2" />
        <rect x="13" y="13" width="8" height="8" rx="2" />
      </svg>
    ),
  },
  {
    href: "/parametres",
    label: "Compte",
    icone: (actif: boolean) => (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={actif ? 2 : 1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        width={24}
        height={24}
        className="h-6 w-6"
        aria-hidden="true"
      >
        <circle cx="12" cy="8" r="3.25" />
        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.06)] lg:hidden"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-5xl items-stretch justify-around">
        {ONGLETS.map((onglet) => {
          const actif = onglet.estActif
            ? onglet.estActif(pathname)
            : pathname === onglet.href || pathname.startsWith(`${onglet.href}/`);
          return (
            <Link
              key={onglet.href}
              href={onglet.href}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                actif ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
              aria-current={actif ? "page" : undefined}
            >
              {onglet.icone(actif)}
              {onglet.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
