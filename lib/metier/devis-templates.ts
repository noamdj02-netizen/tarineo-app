export type DevisTemplate = {
  id: string;
  title: string;
  text: string;
  lines: { label: string; qty: number; unit: string; sell: number }[];
};

export const DEVIS_TEMPLATES: DevisTemplate[] = [
  {
    id: "vide",
    title: "Devis vide",
    text: "Titre + client, vous ajoutez les lignes.",
    lines: [{ label: "Prestation", qty: 1, unit: "ens", sell: 0 }],
  },
  {
    id: "plomberie",
    title: "Plomberie / sanitaire",
    text: "Fourniture et pose, à ajuster.",
    lines: [
      { label: "Main-d’œuvre plomberie", qty: 1, unit: "ens", sell: 480 },
      { label: "Fournitures sanitaires", qty: 1, unit: "ens", sell: 320 },
    ],
  },
  {
    id: "elec",
    title: "Électricité",
    text: "Tableau, prises, éclairage.",
    lines: [
      { label: "Main-d’œuvre électricité", qty: 1, unit: "ens", sell: 560 },
      { label: "Matériel électrique", qty: 1, unit: "ens", sell: 210 },
    ],
  },
  {
    id: "tp",
    title: "Terrassement / TP",
    text: "Forfait chantier type.",
    lines: [
      { label: "Terrassement", qty: 1, unit: "ens", sell: 1800 },
      { label: "Évacuation déblais", qty: 1, unit: "ens", sell: 420 },
    ],
  },
];
