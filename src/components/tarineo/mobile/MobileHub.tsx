"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_GRADIENT_ACCENT } from "./mobileTokens";

type Lien = { href: string; title: string; description?: string };

const SECTIONS: { id: string; title: string; subtitle: string; liens: Lien[] }[] = [
  {
    id: "facturation",
    title: "Facturation clients",
    subtitle: "Devis, factures et carnet",
    liens: [
      { href: "/devis-clients", title: "Devis clients", description: "Créer ou modifier" },
      { href: "/factures-clients", title: "Factures clients", description: "Depuis vos devis" },
      { href: "/clients", title: "Clients", description: "Carnet regroupé" },
    ],
  },
  {
    id: "suivi",
    title: "Suivi & archives",
    subtitle: "Coffre, veille et analyses",
    liens: [
      { href: "/coffre", title: "Mon coffre", description: "Documents archivés" },
      { href: "/veille", title: "Veille prix", description: "Surveiller vos références" },
      { href: "/analyses", title: "Analyses", description: "Hausses & dépenses" },
      { href: "/chantiers", title: "Chantiers", description: "Marge par chantier" },
    ],
  },
  {
    id: "compte",
    title: "Compte & réglages",
    subtitle: "Entreprise et abonnement",
    liens: [
      { href: "/parametres", title: "Paramètres", description: "Entreprise, équipe, intégrations" },
      { href: "/compte", title: "Mon compte", description: "Profil et abonnement" },
    ],
  },
];

function SectionTiroir({
  title,
  subtitle,
  liens,
  ouvertParDefaut,
}: {
  title: string;
  subtitle: string;
  liens: Lien[];
  ouvertParDefaut?: boolean;
}) {
  const [ouvert, setOuvert] = useState(ouvertParDefaut ?? false);

  return (
    <div className="overflow-hidden rounded-[20px] border border-[#eeedff] bg-white shadow-[0_4px_16px_rgba(15,23,36,0.04)]">
      <button
        type="button"
        onClick={() => setOuvert((v) => !v)}
        className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left active:bg-[#fafafa]"
      >
        <div className="min-w-0">
          <p className="text-[16px] font-semibold text-[#171717]">{title}</p>
          <p className="mt-0.5 text-xs text-[#595959]">{subtitle}</p>
        </div>
        <ChevronDownIcon
          className={cn("size-5 shrink-0 text-[#8a96a3] transition-transform duration-200", ouvert && "rotate-180")}
        />
      </button>
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-out",
          ouvert ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="overflow-hidden">
          <ul className="border-t border-[#f0f0f2] px-2 pb-2 pt-1">
            {liens.map((lien) => (
              <li key={lien.href}>
                <Link
                  href={lien.href}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-3 active:bg-[#f6f7f9]"
                >
                  <div className="min-w-0">
                    <p className="text-[15px] font-medium text-[#171717]">{lien.title}</p>
                    {lien.description && <p className="text-xs text-[#8a96a3]">{lien.description}</p>}
                  </div>
                  <span className="text-lg text-[#c4c4c4]" aria-hidden>›</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function MobileHub() {
  return (
    <div className="flex flex-col gap-3 lg:hidden">
      <div
        className="rounded-[20px] px-4 py-5 text-white"
        style={{ backgroundImage: MOBILE_GRADIENT_ACCENT }}
      >
        <p className="text-lg font-semibold">Menu Tarineo</p>
        <p className="mt-1 text-sm text-white/85">Toutes vos sections, regroupées par thème.</p>
      </div>
      {SECTIONS.map((section, index) => (
        <SectionTiroir
          key={section.id}
          title={section.title}
          subtitle={section.subtitle}
          liens={section.liens}
          ouvertParDefaut={index === 0}
        />
      ))}
    </div>
  );
}
