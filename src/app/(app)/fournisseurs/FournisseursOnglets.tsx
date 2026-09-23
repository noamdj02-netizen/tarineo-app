"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const ONGLETS = [
  { id: "fournisseurs", label: "Fournisseurs", href: "/fournisseurs" },
  { id: "analyses", label: "Analyses", href: "/fournisseurs?onglet=analyses" },
  { id: "veille", label: "Veille", href: "/fournisseurs?onglet=veille" },
] as const;

export function FournisseursOnglets() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onglet = searchParams.get("onglet") ?? "fournisseurs";
  const actif = pathname.startsWith("/fournisseurs") ? onglet : "fournisseurs";

  return (
    <nav
      aria-label="Sections fournisseurs"
      className="mb-5 flex gap-1 overflow-x-auto rounded-full bg-secondary p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {ONGLETS.map((o) => {
        const selected = actif === o.id || (o.id === "fournisseurs" && actif === "fournisseurs");
        return (
          <Link
            key={o.id}
            href={o.href}
            aria-current={selected ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              selected ? "bg-white text-primary shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {o.label}
          </Link>
        );
      })}
    </nav>
  );
}
