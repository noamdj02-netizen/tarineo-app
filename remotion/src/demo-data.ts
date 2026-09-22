export const DEMO_USER = { prenom: "Marc", email: "marc@agencement-pro.fr" };

export const DEMO_STATS_ACCUEIL = {
  documentsMois: 12,
  hausseMoyenne: 5.2,
  economies: 340,
  haussesCount: 3,
};

export const DEMO_FOURNISSEURS = [
  { nom: "Cedeo", logo: "dashboard/cedeo.png", depenses: 18420, score: 72, description: "Détection automatique des hausses sur vos devis Cedeo." },
  { nom: "Point P", logo: "dashboard/pointp.png", depenses: 12350, score: 45, description: "Comparaison des prix multi-agences Point P." },
  { nom: "Rexel", logo: "dashboard/rexel.png", depenses: 8900, score: null as number | null, description: "Suivi des tarifs matériel électrique Rexel." },
];

export const DEMO_DOCUMENTS_RECENTS = [
  { distributeur: "Cedeo", logo: "dashboard/cedeo.png", date: "18 mars 2026", montant: 2847, hausse: "+8,2 %", alerte: true },
  { distributeur: "Point P", logo: "dashboard/pointp.png", date: "15 mars 2026", montant: 1290, hausse: "Stable", alerte: false },
  { distributeur: "Rexel", logo: "dashboard/rexel.png", date: "12 mars 2026", montant: 756, hausse: "+4,1 %", alerte: true },
];

export const DEMO_DISTRIBUTEURS_BARRES = [
  { label: "Cedeo", count: 12 },
  { label: "Point P", count: 8 },
  { label: "Rexel", count: 5 },
  { label: "Brossette", count: 3 },
];

export const DEMO_EN_BREF_DEVIS = {
  total: 28,
  montantHt: 42800,
  enseignes: 5,
};

export const DEMO_LIGNES_DOCUMENT = [
  {
    designation: "Chauffe-eau Thermor Duralis 200L",
    reference: "7381813",
    prix: 595,
    hausse: "+8,2 %",
    alerte: true,
    hint: "Dernier achat : 550 € · il y a 4 mois",
  },
  {
    designation: "Groupe sécurité + kit fixation",
    reference: "4429012",
    prix: 42,
    hausse: "Stable",
    alerte: false,
    hint: "3 achats dans l'historique",
  },
  {
    designation: "Wilo Yonos PARA 25/6-130",
    reference: "8812044",
    prix: 318,
    hausse: "+4,1 %",
    alerte: true,
    hint: "Point P : 302 € le 08/01/2026",
  },
];

export const DEMO_DEVIS = [
  { numero: "D2026-014", client: "M. Dupont", montant: 4820, statut: "envoye" as const },
  { numero: "D2026-013", client: "SARL Bâtir", montant: 12650, statut: "accepte" as const },
  { numero: "D2026-012", client: "SCI Les Oliviers", montant: 3940, statut: "expire" as const },
];
