import {
  ArrowLeftRight,
  Bell,
  Building2,
  CreditCard,
  FileSpreadsheet,
  FileText,
  FolderTree,
  HardHat,
  House,
  Package,
  Sparkles,
  LifeBuoy,
  Mail,
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
/** Import & lecture de documents (PDF, photos) — distinct du Copilote (⌘J, chat). */
export const analyseIa: Tab = {
  href: R.devisAnalyser,
  label: "Analyse IA",
  short: "Analyse",
  icon: Sparkles,
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
const produitsAchats: Tab = {
  href: R.achatsProduits,
  label: "Produits",
  short: "Produits",
  icon: Package,
};
const exportComptable: Tab = {
  href: R.achatsExport,
  label: "Export comptable",
  short: "Export",
  icon: FileSpreadsheet,
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
  id: "docs-fournisseur",
  label: "Documents fournisseur",
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
    { href: R.clientDevis, label: "Devis", short: "Devis", icon: FileSpreadsheet },
    { href: R.clientBc, label: "Bons de commande", short: "BC", icon: FileText },
    { href: R.clientFacture, label: "Factures", short: "Facture", icon: Receipt },
  ],
};

const relances: Tab = {
  href: R.relances,
  label: "Relances",
  short: "Relances",
  icon: Mail,
};

/** Sections de la barre latérale — orientée métier (pas Devis IA / Copilote). */
export const NAV_SECTIONS: NavSection[] = [
  { id: "aujourd-hui", label: "Aujourd’hui", items: [accueil, analyseIa] },
  { id: "documents", label: "Documents", items: [docsDistributeur, docsEntreprise] },
  { id: "chantiers", label: "Chantiers", items: [chantiers] },
  {
    id: "achats",
    label: "Achats",
    items: [fournisseurs, comparateur, alertes, relances, produitsAchats, exportComptable, classement],
  },
];

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
  { id: "docs-fournisseur", label: "Documents fournisseur", items: docsDistributeur.items },
  { id: "docs-entreprise", label: "Documents entreprise", items: docsEntreprise.items },
  {
    id: "suivi",
    label: "Suivi",
    items: [fournisseurs, comparateur, alertes, produitsAchats, exportComptable, classement, relances],
  },
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
