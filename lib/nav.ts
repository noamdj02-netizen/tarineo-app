import {
  ArrowLeftRight,
  Bell,
  Building2,
  CreditCard,
  FileSearch,
  FileSpreadsheet,
  FileText,
  FolderTree,
  HardHat,
  House,
  LifeBuoy,
  Receipt,
  Store,
  Truck,
  type LucideIcon,
} from "lucide-react";
import { BRAND } from "@/lib/brand";
import { R } from "@/lib/routes";

export type Tab = {
  href: string;
  label: string;
  /** libellé court pour la barre du bas sur mobile */
  short: string;
  icon: LucideIcon;
};

export type NavDrawer = {
  id: string;
  label: string;
  icon: LucideIcon;
  items: Tab[];
};

export type NavItem = Tab | NavDrawer;

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

export function isNavDrawer(item: NavItem): item is NavDrawer {
  return "items" in item && !("href" in item);
}

const accueil: Tab = {
  href: "/accueil",
  label: "Accueil",
  short: "Accueil",
  icon: House,
};
const analyse: Tab = {
  href: "/copilote",
  label: "Analyse",
  short: "Analyse",
  icon: FileSearch,
};
const alertes: Tab = {
  href: R.hausses,
  label: "Hausses",
  short: "Hausses",
  icon: Bell,
};
const classement: Tab = {
  href: R.achats,
  label: "Achats",
  short: "Achats",
  icon: FolderTree,
};
const chantiers: Tab = {
  href: R.chantiers,
  label: "Chantiers",
  short: "Chantiers",
  icon: HardHat,
};
const fournisseurs: Tab = {
  href: R.fournisseurs,
  label: "Fournisseurs",
  short: "Fournisseurs",
  icon: Store,
};
const comparateur: Tab = {
  href: R.comparateur,
  label: "Comparateur",
  short: "Compare",
  icon: ArrowLeftRight,
};
const tarifs: Tab = {
  href: "/abonnement",
  label: "Tarifs",
  short: "Tarifs",
  icon: CreditCard,
};

const docsDistributeur: NavDrawer = {
  id: "docs-distributeur",
  label: "Documents distributeur",
  icon: Truck,
  items: [
    { href: R.distributeurDevis, label: "Devis", short: "Devis", icon: FileText },
    { href: R.distributeurBc, label: "Bons de commande", short: "BC", icon: FileSpreadsheet },
    { href: R.distributeurBe, label: "Bons d’enlèvement", short: "Enlèvement", icon: Truck },
    { href: R.distributeurFacture, label: "Factures", short: "Facture", icon: Receipt },
  ],
};
const docsEntreprise: NavDrawer = {
  id: "docs-entreprise",
  label: "Documents entreprise",
  icon: Building2,
  items: [
    { href: R.clientDevis, label: "Devis client", short: "Devis", icon: FileSpreadsheet },
    { href: R.clientBc, label: "Bons de commande client", short: "BC client", icon: FileText },
    { href: R.clientFacture, label: "Factures client", short: "Facture", icon: Receipt },
  ],
};

/** Sections de la barre latérale — mêmes thèmes que la landing. */
export const NAV_SECTIONS: NavSection[] = [
  { id: "aujourd-hui", label: "Aujourd’hui", items: [accueil, analyse] },
  { id: "documents", label: "Documents", items: [docsDistributeur, docsEntreprise] },
  { id: "chantiers", label: "Chantiers", items: [chantiers] },
  { id: "achats", label: "Achats", items: [fournisseurs, comparateur, alertes, classement] },
];

const relances: Tab = {
  href: R.relances,
  label: "Relances",
  short: "Relances",
  icon: Bell,
};
const entreprise: Tab = {
  href: R.entreprise,
  label: "Mon entreprise",
  short: "SIRET",
  icon: Building2,
};
const support: Tab = {
  href: `mailto:${BRAND.contactEmail}?subject=Support%20TARINEO`,
  label: "Support",
  short: "Support",
  icon: LifeBuoy,
};

export const MOBILE_MORE_SECTIONS: { id: string; label: string; items: Tab[] }[] = [
  { id: "docs-distributeur", label: "Documents distributeur", items: docsDistributeur.items },
  { id: "docs-entreprise", label: "Documents entreprise", items: docsEntreprise.items },
  { id: "suivi", label: "Suivi", items: [fournisseurs, comparateur, alertes, classement, relances] },
  { id: "compte", label: "Compte", items: [entreprise, tarifs, support] },
];

/** Menu mobile « Plus » (liste plate, pour l’état actif). */
export const MOBILE_MORE: Tab[] = MOBILE_MORE_SECTIONS.flatMap((s) => s.items);

/** Liste plate (palette ⌘K, mobile, etc.). */
export const TABS: Tab[] = NAV_SECTIONS.flatMap((s) =>
  s.items.flatMap((item) => (isNavDrawer(item) ? item.items : [item])),
);

export function hrefPath(href: string) {
  const q = href.indexOf("?");
  return q < 0 ? href : href.slice(0, q);
}

export function hrefQuery(href: string) {
  const q = href.indexOf("?");
  return q < 0 ? "" : href.slice(q + 1);
}

export function isActive(pathname: string, href: string, search = "") {
  const path = hrefPath(href);
  const want = hrefQuery(href);
  if (pathname !== path && !pathname.startsWith(`${path}/`)) return false;
  if (!want) {
    if (pathname !== path && pathname.startsWith(`${path}/`)) return true;
    return pathname === path;
  }
  if (pathname !== path) return false;
  const wantP = new URLSearchParams(want);
  const haveP = new URLSearchParams(search);
  for (const [k, v] of wantP) {
    if (haveP.get(k) !== v) return false;
  }
  return true;
}
