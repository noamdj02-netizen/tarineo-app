export interface PlanTarineo {
  id: string;
  nom: string;
  prixMensuel: number;
  desc: string;
  features: { label: string; bientot?: boolean }[];
  misEnAvant: boolean;
}

export const PLANS_TARINEO: PlanTarineo[] = [
  {
    id: "starter",
    nom: "Starter",
    prixMensuel: 17,
    desc: "Pour débuter et tester",
    features: [
      { label: "150 documents analysés / mois" },
      { label: "Historique 12 mois" },
      { label: "3 distributeurs comparés" },
      { label: "Alertes hausse de prix" },
    ],
    misEnAvant: false,
  },
  {
    id: "pro",
    nom: "Pro",
    prixMensuel: 29,
    desc: "Pour les artisans actifs",
    features: [
      { label: "400 documents analysés / mois" },
      { label: "Historique complet" },
      { label: "Tous les distributeurs" },
      { label: "Devis client PDF (logo + SIRET)" },
      { label: "Export comptable" },
      { label: "Bibliothèque fournisseurs", bientot: true },
      { label: "Notifications push", bientot: true },
    ],
    misEnAvant: true,
  },
  {
    id: "equipe",
    nom: "Équipe",
    prixMensuel: 49,
    desc: "Pour les entreprises artisanales",
    features: [
      { label: "1 000 documents analysés / mois" },
      { label: "Tout le plan Pro" },
      { label: "Multi-utilisateurs chantier", bientot: true },
      { label: "Intégrations WhatsApp / Drive", bientot: true },
      { label: "Support prioritaire" },
    ],
    misEnAvant: false,
  },
];
