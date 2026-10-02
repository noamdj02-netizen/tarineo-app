/** Libellés sidebar — miroir de `lib/nav.ts` (sans Lucide). */
export type NavMirrorItem = { label: string; indent?: boolean };

export type NavMirrorSection = {
  id: string;
  label: string;
  items: NavMirrorItem[];
};

export const NAV_MIRROR: NavMirrorSection[] = [
  {
    id: "aujourd-hui",
    label: "Aujourd’hui",
    items: [{ label: "Accueil" }, { label: "Analyse IA" }],
  },
  {
    id: "documents",
    label: "Documents",
    items: [
      { label: "Documents fournisseur" },
      { label: "Devis", indent: true },
      { label: "Bons de commande", indent: true },
      { label: "Factures", indent: true },
      { label: "Documents entreprise" },
      { label: "Devis client", indent: true },
    ],
  },
  { id: "chantiers", label: "Chantiers", items: [{ label: "Chantiers" }] },
  {
    id: "achats",
    label: "Achats",
    items: [
      { label: "Fournisseurs" },
      { label: "Comparateur" },
      { label: "Hausses" },
      { label: "Relances" },
      { label: "Export comptable" },
      { label: "Achats" },
    ],
  },
];
