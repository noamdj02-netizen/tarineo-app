import {
  Blocks,
  Bot,
  House,
  Layers,
  Library,
  Palette,
  ScanSearch,
  Sparkles,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type Tab = {
  href: string;
  label: string;
  /** libellé court pour la barre du bas sur mobile */
  short: string;
  icon: LucideIcon;
};

/** Les 10 onglets, dans le même ordre que le HTML d'origine. */
export const TABS: Tab[] = [
  { href: "/projets", label: "Projets", short: "Projets", icon: House },
  { href: "/assistant", label: "Assistant IA", short: "IA", icon: Bot },
  { href: "/ressources", label: "Ressources", short: "Ressources", icon: Library },
  { href: "/outils", label: "Outils", short: "Outils", icon: Wrench },
  { href: "/workflow", label: "Figma → Cursor", short: "Figma", icon: Workflow },
  { href: "/anatomie", label: "Anatomie", short: "Anatomie", icon: Layers },
  { href: "/composants", label: "Composants", short: "Compos", icon: Blocks },
  { href: "/composants-2", label: "Composants 2", short: "Compos 2", icon: Sparkles },
  { href: "/themes", label: "Thèmes", short: "Thèmes", icon: Palette },
  { href: "/audit", label: "Mes sites", short: "Sites", icon: ScanSearch },
];

export function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}
