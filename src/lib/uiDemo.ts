export const DEMO_MOIS = ["Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sept"] as const;

export const COULEURS_ENSEIGNES: Record<string, string> = {
  Cedeo: "#3B82F6",
  "Point P": "#F97316",
  Rexel: "#22C55E",
  Sonepar: "#EF4444",
  "Leroy Merlin": "#A855F7",
  Castorama: "#0EA5E9",
  "Brico Dépôt": "#64748B",
  Autres: "#CBD5E1",
};

export type StatutDevis = "brouillon" | "envoye" | "accepte" | "refuse" | "expire";
export type StatutFacture = "brouillon" | "envoyee" | "payee" | "en_retard";
export type StatutBc = "brouillon" | "envoye" | "confirme" | "annule";
export type StatutBe = "a_enlever" | "enleve" | "annule";

export const DEMO_DEVIS = [
  { id: "dv-2026-014", numero: "DV-2026-014", client: "Cedeo", clientId: "cedeo", montantHt: 1240, statut: "envoye" as StatutDevis, date: "11 sept. 2026" },
  { id: "dv-2026-013", numero: "DV-2026-013", client: "Point P", clientId: "point-p", montantHt: 780, statut: "accepte" as StatutDevis, date: "08 sept. 2026" },
  { id: "dv-2026-012", numero: "DV-2026-012", client: "Rexel", clientId: "rexel", montantHt: 890, statut: "brouillon" as StatutDevis, date: "07 sept. 2026" },
  { id: "dv-2026-011", numero: "DV-2026-011", client: "Sonepar", clientId: "sonepar", montantHt: 2100, statut: "accepte" as StatutDevis, date: "05 sept. 2026" },
  { id: "dv-2026-010", numero: "DV-2026-010", client: "Cedeo", clientId: "cedeo", montantHt: 640, statut: "expire" as StatutDevis, date: "02 sept. 2026" },
  { id: "dv-2026-009", numero: "DV-2026-009", client: "Rexel", clientId: "rexel", montantHt: 750, statut: "envoye" as StatutDevis, date: "28 août 2026" },
  { id: "dv-2026-008", numero: "DV-2026-008", client: "Leroy Merlin", clientId: "leroy-merlin", montantHt: 410, statut: "refuse" as StatutDevis, date: "26 août 2026" },
  { id: "dv-2026-007", numero: "DV-2026-007", client: "Cedeo", clientId: "cedeo", montantHt: 1240, statut: "envoye" as StatutDevis, date: "11 sept. 2026" },
  { id: "dv-2026-006", numero: "DV-2026-006", client: "Point P", clientId: "point-p", montantHt: 780, statut: "accepte" as StatutDevis, date: "08 sept. 2026" },
  { id: "dv-2026-005", numero: "DV-2026-005", client: "Rexel", clientId: "rexel", montantHt: 890, statut: "brouillon" as StatutDevis, date: "07 sept. 2026" },
  { id: "dv-2026-004", numero: "DV-2026-004", client: "Sonepar", clientId: "sonepar", montantHt: 2100, statut: "accepte" as StatutDevis, date: "05 sept. 2026" },
  { id: "dv-2026-003", numero: "DV-2026-003", client: "Cedeo", clientId: "cedeo", montantHt: 640, statut: "expire" as StatutDevis, date: "02 sept. 2026" },
  { id: "dv-2026-002", numero: "DV-2026-002", client: "Castorama", clientId: "castorama", montantHt: 560, statut: "refuse" as StatutDevis, date: "24 août 2026" },
  { id: "dv-2026-001", numero: "DV-2026-001", client: "Cedeo", clientId: "cedeo", montantHt: 1240, statut: "envoye" as StatutDevis, date: "11 sept. 2026" },
];

export const DEMO_DEVIS_LIGNES = [
  { designation: "Carrelage 60x60", quantite: 35, pu: 20, tva: 20, total: 700 },
  { designation: "Colle carrelage", quantite: 8, pu: 12.5, tva: 20, total: 100 },
  { designation: "Plinthes", quantite: 22, pu: 4.5, tva: 20, total: 99 },
  { designation: "Joint et finitions", quantite: 1, pu: 41, tva: 20, total: 41 },
];

export const DEMO_FACTURES = [
  { id: "fa-2026-012", numero: "FA-2026-012", client: "Cedeo", clientId: "cedeo", montantHt: 1488, statut: "payee" as StatutFacture, echeance: "11 sept. 2026" },
  { id: "fa-2026-011", numero: "FA-2026-011", client: "Point P", clientId: "point-p", montantHt: 890, statut: "envoyee" as StatutFacture, echeance: "08 sept. 2026" },
  { id: "fa-2026-010", numero: "FA-2026-010", client: "Rexel", clientId: "rexel", montantHt: 1560, statut: "envoyee" as StatutFacture, echeance: "05 sept. 2026" },
  { id: "fa-2026-009", numero: "FA-2026-009", client: "Sonepar", clientId: "sonepar", montantHt: 720, statut: "brouillon" as StatutFacture, echeance: "02 sept. 2026" },
  { id: "fa-2026-008", numero: "FA-2026-008", client: "Cedeo", clientId: "cedeo", montantHt: 2340, statut: "payee" as StatutFacture, echeance: "28 août 2026" },
  { id: "fa-2026-007", numero: "FA-2026-007", client: "Leroy Merlin", clientId: "leroy-merlin", montantHt: 410, statut: "en_retard" as StatutFacture, echeance: "20 août 2026" },
];

export const DEMO_BC = [
  { id: "bc-2026-012", numero: "BC-2026-012", fournisseur: "Cedeo", montantHt: 1240, statut: "confirme" as StatutBc, date: "11 sept. 2026" },
  { id: "bc-2026-011", numero: "BC-2026-011", fournisseur: "Point P", montantHt: 780, statut: "envoye" as StatutBc, date: "08 sept. 2026" },
  { id: "bc-2026-010", numero: "BC-2026-010", fournisseur: "Rexel", montantHt: 2150, statut: "brouillon" as StatutBc, date: "07 sept. 2026" },
  { id: "bc-2026-009", numero: "BC-2026-009", fournisseur: "Sonepar", montantHt: 1520, statut: "confirme" as StatutBc, date: "05 sept. 2026" },
  { id: "bc-2026-008", numero: "BC-2026-008", fournisseur: "Leroy Merlin", montantHt: 640, statut: "annule" as StatutBc, date: "02 sept. 2026" },
  { id: "bc-2026-007", numero: "BC-2026-007", fournisseur: "Brico Dépôt", montantHt: 1020, statut: "envoye" as StatutBc, date: "30 août 2026" },
  { id: "bc-2026-006", numero: "BC-2026-006", fournisseur: "Cedeo", montantHt: 3480, statut: "confirme" as StatutBc, date: "28 août 2026" },
  { id: "bc-2026-005", numero: "BC-2026-005", fournisseur: "Point P", montantHt: 960, statut: "brouillon" as StatutBc, date: "26 août 2026" },
  { id: "bc-2026-004", numero: "BC-2026-004", fournisseur: "Rexel", montantHt: 1780, statut: "confirme" as StatutBc, date: "24 août 2026" },
  { id: "bc-2026-003", numero: "BC-2026-003", fournisseur: "Sonepar", montantHt: 2320, statut: "envoye" as StatutBc, date: "21 août 2026" },
  { id: "bc-2026-002", numero: "BC-2026-002", fournisseur: "Cedeo", montantHt: 540, statut: "brouillon" as StatutBc, date: "18 août 2026" },
  { id: "bc-2026-001", numero: "BC-2026-001", fournisseur: "Point P", montantHt: 880, statut: "envoye" as StatutBc, date: "15 août 2026" },
];

export const DEMO_BE = [
  { id: "be-2026-008", numero: "BE-2026-008", fournisseur: "Cedeo", chantier: "Rénovation salle de bain", dateEnlevement: "12 sept. 2026", statut: "a_enlever" as StatutBe },
  { id: "be-2026-007", numero: "BE-2026-007", fournisseur: "Point P", chantier: "Appartement Lyon 3", dateEnlevement: "08 sept. 2026", statut: "enleve" as StatutBe },
  { id: "be-2026-006", numero: "BE-2026-006", fournisseur: "Rexel", chantier: "Tableau électrique", dateEnlevement: "05 sept. 2026", statut: "enleve" as StatutBe },
  { id: "be-2026-005", numero: "BE-2026-005", fournisseur: "Sonepar", chantier: "Chaufferie", dateEnlevement: "01 sept. 2026", statut: "annule" as StatutBe },
  { id: "be-2026-004", numero: "BE-2026-004", fournisseur: "Cedeo", chantier: "Plomberie sanitaire", dateEnlevement: "28 août 2026", statut: "enleve" as StatutBe },
];

export const DEMO_CLIENTS = [
  { id: "cedeo", nom: "Cedeo", contact: "contact@cedeo.fr", ville: "Paris", devis: 12, ca: 24580, activite: "11 sept. 2026", logo: "/dashboard/cedeo.png" },
  { id: "point-p", nom: "Point P", contact: "contact@pointp.fr", ville: "Lyon", devis: 8, ca: 8920, activite: "08 sept. 2026", logo: "/dashboard/pointp.png" },
  { id: "sonepar", nom: "Sonepar", contact: "contact@sonepar.fr", ville: "Bordeaux", devis: 6, ca: 4150, activite: "05 sept. 2026", logo: null },
  { id: "leroy-merlin", nom: "Leroy Merlin", contact: "pro@leroymerlin.fr", ville: "Lille", devis: 5, ca: 3480, activite: "02 sept. 2026", logo: null },
  { id: "castorama", nom: "Castorama", contact: "pro@castorama.fr", ville: "Nantes", devis: 4, ca: 2320, activite: "28 août 2026", logo: null },
  { id: "brico-depot", nom: "Brico Dépôt", contact: "pro@bricodepot.fr", ville: "Nantes", devis: 3, ca: 2320, activite: "26 août 2026", logo: null },
];

export const DEMO_FOURNISSEURS = [
  { id: "cedeo", nom: "Cedeo", contact: "contact@cedeo.fr", ville: "Paris", produits: 124, evolution: "+2,4 %", dernier: "11 sept. 2026", fiabilite: 96, site: "www.cedeo.fr", logo: "/dashboard/cedeo.png" },
  { id: "point-p", nom: "Point P", contact: "contact@pointp.fr", ville: "Lyon", produits: 98, evolution: "+1,8 %", dernier: "08 sept. 2026", fiabilite: 94, site: "www.pointp.fr", logo: "/dashboard/pointp.png" },
  { id: "rexel", nom: "Rexel", contact: "contact@rexel.fr", ville: "Paris", produits: 87, evolution: "+3,1 %", dernier: "07 sept. 2026", fiabilite: 98, site: "www.rexel.fr", logo: "/dashboard/rexel.webp" },
  { id: "leroy-merlin", nom: "Leroy Merlin", contact: "pro@leroymerlin.fr", ville: "Lille", produits: 52, evolution: "-0,4 %", dernier: "02 sept. 2026", fiabilite: 90, site: "www.leroymerlin.fr", logo: "/dashboard/leroy-merlin.png" },
  { id: "brico-depot", nom: "Brico Dépôt", contact: "pro@bricodepot.fr", ville: "Nantes", produits: 41, evolution: "+0,8 %", dernier: "28 août 2026", fiabilite: 88, site: "www.bricodepot.fr", logo: "/dashboard/brico-depot.png" },
  { id: "sonepar", nom: "Sonepar", contact: "contact@sonepar.fr", ville: "Bordeaux", produits: 64, evolution: "+1,1 %", dernier: "05 sept. 2026", fiabilite: 92, site: "www.sonepar.fr", logo: null },
  { id: "castorama", nom: "Castorama", contact: "pro@castorama.fr", ville: "Nantes", produits: 41, evolution: "+0,8 %", dernier: "28 août 2026", fiabilite: 88, site: "www.castorama.fr", logo: null },
];

export const DEMO_HAUSSES = [
  { produit: "Tube cuivre 16mm", fournisseur: "Cedeo", hausse: 28, categorie: "Plomberie", date: "12 sept. 2026", avant: 2.1, actuel: 2.69 },
  { produit: "Disjoncteur 32A", fournisseur: "Rexel", hausse: 24, categorie: "Électricité", date: "10 sept. 2026", avant: 18.5, actuel: 22.9 },
  { produit: "Carrelage 60x60", fournisseur: "Point P", hausse: 22, categorie: "Carrelage", date: "08 sept. 2026", avant: 24.9, actuel: 30.4 },
  { produit: "Chaudière gaz", fournisseur: "Sonepar", hausse: 18, categorie: "Chauffage", date: "05 sept. 2026", avant: 1420, actuel: 1680 },
  { produit: "Câble électrique 3G2.5", fournisseur: "Cedeo", hausse: 16, categorie: "Électricité", date: "02 sept. 2026", avant: 1.95, actuel: 2.26 },
];

export const DEMO_HAUSSES_CEDEO = [
  { produit: "Tube cuivre 16mm", ancien: 2.4, nouveau: 2.95, variation: 22, categorie: "Plomberie", date: "12 sept. 2026" },
  { produit: "Disjoncteur 32A", ancien: 8.5, nouveau: 10.5, variation: 24, categorie: "Électricité", date: "10 sept. 2026" },
  { produit: "Carrelage 60x60", ancien: 18, nouveau: 22, variation: 22, categorie: "Carrelage", date: "08 sept. 2026" },
  { produit: "Chaudière gaz", ancien: 1250, nouveau: 1475, variation: 18, categorie: "Chauffage", date: "05 sept. 2026" },
  { produit: "Câble électrique 3G2.5", ancien: 1.2, nouveau: 1.42, variation: 18, categorie: "Électricité", date: "02 sept. 2026" },
];

export const DEMO_DEPENSES = [
  { nom: "Cedeo", pct: 32, montant: 7866, couleur: "#3B82F6" },
  { nom: "Point P", pct: 24, montant: 5899, couleur: "#F97316" },
  { nom: "Rexel", pct: 18, montant: 4424, couleur: "#22C55E" },
  { nom: "Sonepar", pct: 12, montant: 2951, couleur: "#EF4444" },
  { nom: "Leroy Merlin", pct: 8, montant: 1967, couleur: "#A855F7" },
  { nom: "Autres", pct: 6, montant: 1473, couleur: "#CBD5E1" },
];

export const DEMO_SERIES_PRIX = [
  { nom: "Cedeo", couleur: "#3B82F6", points: [6, 14, 19, 21, 24, 27, 30] },
  { nom: "Point P", couleur: "#F97316", points: [4, 10, 12, 16, 18, 21, 24] },
  { nom: "Rexel", couleur: "#EF4444", points: [2, 8, 11, 13, 16, 18, 20] },
  { nom: "Sonepar", couleur: "#22C55E", points: [0, 2, 3, 4, 7, 8, 10] },
  { nom: "Leroy Merlin", couleur: "#A855F7", points: [-4, -2, 0, 1, 2, 3, 5] },
];

export const DEMO_SERIES_CATEGORIES = [
  { nom: "Carrelage", couleur: "#3B82F6", points: [6, 10, 14, 18, 22, 26, 30] },
  { nom: "Plomberie", couleur: "#F97316", points: [4, 8, 9, 12, 16, 18, 20] },
  { nom: "Électricité", couleur: "#A855F7", points: [2, 5, 8, 10, 14, 16, 18] },
  { nom: "Chauffage", couleur: "#22C55E", points: [8, 9, 10, 11, 12, 13, 14] },
];

export const DEMO_DEVIS_CEDEO = [
  { numero: "DV-2026-124", categorie: "Plomberie", date: "11 sept. 2026", montant: 1240 },
  { numero: "DV-2026-118", categorie: "Chauffage", date: "08 sept. 2026", montant: 780 },
  { numero: "DV-2026-112", categorie: "Électricité", date: "05 sept. 2026", montant: 2150 },
  { numero: "DV-2026-109", categorie: "Carrelage", date: "02 sept. 2026", montant: 640 },
  { numero: "DV-2026-105", categorie: "Plomberie", date: "28 août 2026", montant: 3480 },
];

export const DEMO_TRANSMISSIONS = [
  { numero: "FA-2026-012", client: "Cedeo", statut: "Transmise", date: "11 sept. 2026, 10:42" },
  { numero: "FA-2026-011", client: "Point P", statut: "Transmise", date: "08 sept. 2026, 16:18" },
  { numero: "FA-2026-010", client: "Rexel", statut: "Erreur", date: "05 sept. 2026, 09:03" },
  { numero: "FA-2026-008", client: "Sonepar", statut: "Transmise", date: "02 sept. 2026, 14:21" },
];

export const DEMO_CLIENT_CEDEO = {
  id: "cedeo",
  nom: "Cedeo",
  adresse: "123 Rue des Artisans\n75011 Paris",
  tva: "FR 12 345 678 901",
  siret: "812 345 678 00012",
  telephone: "01 23 45 67 89",
  email: "contact@cedeo.fr",
  site: "www.cedeo.fr",
  contact: { nom: "Thomas Bernard", role: "Chargé d'affaires", email: "thomas.bernard@cedeo.fr" },
  notes: "Client fidèle, souvent des commandes pour la plomberie sanitaire.",
};

export const DEMO_UTILISATEUR = {
  nom: "Noam DJ02",
  email: "noamdj02@gmail.com",
  prenom: "Noam",
};

export const DEMO_NOTIFICATIONS = [
  {
    id: "notif-1",
    titre: "Hausse détectée chez Cedeo",
    message: "Tube cuivre 16 mm : +22 % par rapport à votre dernier achat.",
    date: "Il y a 2 h",
    nonLu: true,
  },
  {
    id: "notif-2",
    titre: "Devis scanné",
    message: "DV-2026-014 importé — 3 lignes analysées, 1 alerte.",
    date: "Il y a 5 h",
    nonLu: true,
  },
  {
    id: "notif-3",
    titre: "Économie potentielle",
    message: "Point P propose un prix plus bas sur la réf. PA1951BTNE.",
    date: "Hier",
    nonLu: false,
  },
  {
    id: "notif-4",
    titre: "Objectif Cedeo",
    message: "Vous avez atteint 78 % de votre objectif annuel.",
    date: "10 sept.",
    nonLu: false,
  },
];

export const DEMO_DASHBOARD = {
  nbDocumentsMois: 17,
  hausseMoyenne: 4.2,
  economiesPotentielles: 1240,
  payloadsCount: 6,
  totalSemaine: 386,
  evolutionPct: 12,
  donneesSemaine: [
    { jour: "Lun", montant: 42 },
    { jour: "Mar", montant: 58 },
    { jour: "Mer", montant: 36 },
    { jour: "Jeu", montant: 71 },
    { jour: "Ven", montant: 55 },
    { jour: "Sam", montant: 24 },
    { jour: "Dim", montant: 100 },
  ],
  fournisseurs: [
    { distributor: "Cedeo", distributorNorm: "cedeo", depenses: 7866, pourcentageAtteinte: 78, objectif: 10000 },
    { distributor: "Point P", distributorNorm: "pointp", depenses: 5899, pourcentageAtteinte: 62, objectif: 9500 },
    { distributor: "Rexel", distributorNorm: "rexel", depenses: 4424, pourcentageAtteinte: null, objectif: null },
  ],
  documentsRecents: [
    {
      id: "demo-doc-1",
      distributor: "Cedeo",
      documentDate: new Date("2026-09-11T12:00:00Z"),
      totalHt: 1240,
      hausseLabel: "+8% hausse",
      haussePositive: true,
      hausseNegative: false,
    },
    {
      id: "demo-doc-2",
      distributor: "Point P",
      documentDate: new Date("2026-09-08T12:00:00Z"),
      totalHt: 780,
      hausseLabel: "+5% hausse",
      haussePositive: true,
      hausseNegative: false,
    },
    {
      id: "demo-doc-3",
      distributor: "Rexel",
      documentDate: new Date("2026-09-07T12:00:00Z"),
      totalHt: 890,
      hausseLabel: "Stable",
      haussePositive: false,
      hausseNegative: false,
    },
    {
      id: "demo-doc-4",
      distributor: "Leroy Merlin",
      documentDate: new Date("2026-09-05T12:00:00Z"),
      totalHt: 2100,
      hausseLabel: "+12% hausse",
      haussePositive: true,
      hausseNegative: false,
    },
    {
      id: "demo-doc-5",
      distributor: "Brico Dépôt",
      documentDate: new Date("2026-09-02T12:00:00Z"),
      totalHt: 640,
      hausseLabel: "-2% baisse",
      haussePositive: false,
      hausseNegative: true,
    },
  ],
  repartitionParDistributeur: [
    { distributorNorm: "cedeo", distributor: "Cedeo", count: 12 },
    { distributorNorm: "pointp", distributor: "Point P", count: 9 },
    { distributorNorm: "rexel", distributor: "Rexel", count: 7 },
    { distributorNorm: "sonepar", distributor: "Sonepar", count: 4 },
    { distributorNorm: "leroymerlin", distributor: "Leroy Merlin", count: 3 },
    { distributorNorm: "castorama", distributor: "Castorama", count: 2 },
  ],
  evolutionDepenses: [
    { mois: "2026-04", montant: 4200 },
    { mois: "2026-05", montant: 5100 },
    { mois: "2026-06", montant: 4800 },
    { mois: "2026-07", montant: 6200 },
    { mois: "2026-08", montant: 5900 },
    { mois: "2026-09", montant: 7350 },
  ],
};

export const formaterEurosDemo = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(valeur);

export const formaterEurosDec = (valeur: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(valeur);
