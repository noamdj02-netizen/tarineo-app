import {
  Blocks,
  Bot,
  Clapperboard,
  House,
  LayoutDashboard,
  Layers,
  Library,
  Palette,
  ScanSearch,
  Shapes,
  Sparkles,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";

export type Tab = {
  href: string;
  label: string;
  /** libellé court pour la barre du bas sur mobile */
  short: string;
  icon: LucideIcon;
};

export type NavSection = {
  id: string;
  label: string;
  items: Tab[];
};

const accueil: Tab = { href: "/accueil", label: "Accueil", short: "Accueil", icon: House };
const copilote: Tab = { href: "/copilote", label: "Copilote", short: "IA", icon: Bot };
const automatisations: Tab = {
  href: "/automatisations",
  label: "Automatisations",
  short: "Auto",
  icon: Zap,
};
const projets: Tab = {
  href: "/projets",
  label: "Projets",
  short: "Projets",
  icon: LayoutDashboard,
};
const ressources: Tab = {
  href: "/ressources",
  label: "Ressources",
  short: "Ressources",
  icon: Library,
};
const outils: Tab = { href: "/outils", label: "Outils", short: "Outils", icon: Wrench };
const schemas: Tab = { href: "/schemas", label: "Schémas", short: "Schémas", icon: Shapes };
const anatomie: Tab = { href: "/anatomie", label: "Anatomie", short: "Anatomie", icon: Layers };
const heros: Tab = {
  href: "/bibliotheque/heros",
  label: "Heros",
  short: "Heros",
  icon: Clapperboard,
};
const composants: Tab = {
  href: "/composants",
  label: "Composants",
  short: "Compos",
  icon: Blocks,
};
const composants2: Tab = {
  href: "/composants-2",
  label: "Composants 2",
  short: "Compos 2",
  icon: Sparkles,
};
const themes: Tab = { href: "/themes", label: "Thèmes", short: "Thèmes", icon: Palette };
const audit: Tab = { href: "/audit", label: "Mes sites", short: "Sites", icon: ScanSearch };

/** Sections de la barre latérale (desktop). */
export const NAV_SECTIONS: NavSection[] = [
  { id: "cockpit", label: "Cockpit", items: [accueil, copilote, automatisations, projets] },
  {
    id: "library",
    label: "Bibliothèque",
    items: [ressources, schemas, anatomie, heros],
  },
  {
    id: "studio",
    label: "Studio design",
    items: [composants, composants2, themes],
  },
  {
    id: "stack",
    label: "Stack & audit",
    items: [outils, audit],
  },
];

/** Liste plate (palette ⌘K, mobile, etc.). */
export const TABS: Tab[] = NAV_SECTIONS.flatMap((s) => s.items);

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
