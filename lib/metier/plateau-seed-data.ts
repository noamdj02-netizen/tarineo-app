/**
 * Jeu « plateau vidéo » — données BTP fictives mais crédibles.
 * Toujours `seed_key` préfixé `plateau-` + `extract.demo` / `extract.plateau`.
 */

export const PLATEAU_NOTE = "Plateau vidéo — fictif";
export const PLATEAU_PREFIX = "plateau-";

export type PlateauParty = {
  seed: string;
  kind: "client" | "fournisseur" | "distributeur" | "atelier";
  name: string;
  address: string;
};

export type PlateauProduct = {
  seed: string;
  name: string;
  family: string;
  unit: string;
};

export type PlateauChantier = {
  seed: string;
  slug: string;
  name: string;
  address: string;
  clientSeed: string;
  status: "focus" | "pause" | "fini";
};

export type PlateauLine = {
  productSeed: string;
  supplierSeed?: string;
  distributorSeed?: string;
  label: string;
  qty: number;
  unit: string;
  buyPrice: number;
  sellPrice: number;
};

export type PlateauDocument = {
  seed: string;
  direction: "in" | "out";
  kind: "devis" | "facture" | "bon_commande" | "bl" | "bon_enlevement" | "autre";
  title: string;
  partySeed: string;
  chantierSeed: string;
  sourceSeed?: string;
  daysAgo: number;
  extract?: Record<string, unknown>;
  lines: PlateauLine[];
};

export type PlateauAlert = {
  seed: string;
  productSeed: string;
  documentSeed?: string;
  chantierSeed: string;
  label: string;
  oldPrice: number;
  newPrice: number;
  daysAgo: number;
};

export const PLATEAU_COMPANY = {
  raison_sociale: "Martin Électricité & Rénovation",
  siret: "352 418 726 00014",
  forme_juridique: "SARL",
  adresse_rue: "8 rue de la Part-Dieu",
  adresse_code_postal: "69003",
  adresse_ville: "Lyon",
  telephone: "04 78 42 18 90",
  email_contact: "contact@martin-elec-renovation.fr",
  regime_tva: "NORMAL" as const,
  registre_immatriculation: "RM Lyon — 352418726",
  assurance_nom: "MAAF Pro BTP",
  assurance_numero_contrat: "BTP-88421-L",
  assurance_activites_garanties: "Électricité, rénovation, domotique",
  assurance_zone_geographique: "Rhône, Loire, Ain",
  marge_par_defaut_pct: 32,
};

export const PLATEAU_PARTIES: PlateauParty[] = [
  { seed: "plateau-client-dupont", kind: "client", name: "Madame Dupont", address: "12 rue des Acacias, 69003 Lyon" },
  { seed: "plateau-client-martin", kind: "client", name: "M. & Mme Martin", address: "45 chemin des Vignes, 69160 Tassin" },
  { seed: "plateau-client-karim", kind: "client", name: "Karim Benali", address: "3 impasse des Tilleuls, 69200 Vénissieux" },
  { seed: "plateau-client-sci", kind: "client", name: "SCI Les Terrasses", address: "18 bd de la Croix-Rousse, 69004 Lyon" },
  { seed: "plateau-dist-cedeo", kind: "distributeur", name: "Cedeo Lyon Part-Dieu", address: "47 bd Vivier Merle, 69003 Lyon" },
  { seed: "plateau-dist-rexel", kind: "distributeur", name: "Rexel Vénissieux", address: "ZI Mi-Plaine, 69200 Vénissieux" },
  { seed: "plateau-dist-pointp", kind: "distributeur", name: "Point.P Caluire", address: "Chem. de la Garde, 69300 Caluire" },
  { seed: "plateau-fourn-legrand", kind: "fournisseur", name: "Legrand", address: "" },
  { seed: "plateau-fourn-schneider", kind: "fournisseur", name: "Schneider Electric", address: "" },
  { seed: "plateau-fourn-nicoll", kind: "fournisseur", name: "Nicoll", address: "" },
  { seed: "plateau-fourn-wurth", kind: "fournisseur", name: "Würth", address: "" },
];

export const PLATEAU_PRODUCTS: PlateauProduct[] = [
  { seed: "plateau-prod-cable-3g25", name: "Câble U1000 R2V 3G2,5 mm²", family: "Électricité — câbles", unit: "ml" },
  { seed: "plateau-prod-disj-20a", name: "Disjoncteur 20 A courbe C", family: "Électricité — protection", unit: "u" },
  { seed: "plateau-prod-gtl", name: "GTL 13 modules", family: "Électricité — coffrets", unit: "u" },
  { seed: "plateau-prod-pvc-100", name: "Tube PVC évacuation Ø 100", family: "Plomberie — évacuation", unit: "ml" },
  { seed: "plateau-prod-colle-carrelage", name: "Colle carrelage flexible C2 S1", family: "Carrelage — pose", unit: "sac" },
  { seed: "plateau-prod-vasque", name: "Vasque à poser 60 cm", family: "Sanitaire", unit: "u" },
  { seed: "plateau-prod-spot-led", name: "Spot LED encastrable IP44", family: "Éclairage", unit: "u" },
  { seed: "plateau-prod-gaine-icta", name: "Gaine ICTA Ø 20", family: "Électricité — cheminement", unit: "ml" },
];

export const PLATEAU_CHANTIERS: PlateauChantier[] = [
  {
    seed: "plateau-chantier-dupont-sdb",
    slug: "dupont-sdb",
    name: "Rénovation SDB — Dupont",
    address: "12 rue des Acacias, 69003 Lyon",
    clientSeed: "plateau-client-dupont",
    status: "focus",
  },
  {
    seed: "plateau-chantier-martin-elec",
    slug: "martin-mise-aux-normes",
    name: "Mise aux normes électrique — Martin",
    address: "45 chemin des Vignes, 69160 Tassin",
    clientSeed: "plateau-client-martin",
    status: "focus",
  },
  {
    seed: "plateau-chantier-karim-cuisine",
    slug: "karim-cuisine",
    name: "Réfection cuisine — Benali",
    address: "3 impasse des Tilleuls, 69200 Vénissieux",
    clientSeed: "plateau-client-karim",
    status: "pause",
  },
  {
    seed: "plateau-chantier-sci-combles",
    slug: "sci-combles",
    name: "Isolation combles — SCI Terrasses",
    address: "18 bd de la Croix-Rousse, 69004 Lyon",
    clientSeed: "plateau-client-sci",
    status: "fini",
  },
];

function demoExtract(extra: Record<string, unknown> = {}) {
  return { demo: true, plateau: true, note: PLATEAU_NOTE, ...extra };
}

export function daysAgoIso(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  d.setUTCHours(9, 0, 0, 0);
  return d.toISOString();
}

export const PLATEAU_DOCUMENTS: PlateauDocument[] = [
  {
    seed: "plateau-doc-dupont-devis-cedeo",
    direction: "in",
    kind: "devis",
    title: "Devis Cedeo n° 2026-014 — SDB Dupont",
    partySeed: "plateau-dist-cedeo",
    chantierSeed: "plateau-chantier-dupont-sdb",
    daysAgo: 42,
    extract: demoExtract({
      totals: { ht: 1310, tva: 262, ttc: 1572 },
      ref: "DEV-2026-014",
    }),
    lines: [
      {
        productSeed: "plateau-prod-pvc-100",
        supplierSeed: "plateau-fourn-nicoll",
        distributorSeed: "plateau-dist-cedeo",
        label: "Tube PVC évacuation Ø 100",
        qty: 14,
        unit: "ml",
        buyPrice: 18.4,
        sellPrice: 0,
      },
      {
        productSeed: "plateau-prod-vasque",
        supplierSeed: "plateau-fourn-nicoll",
        distributorSeed: "plateau-dist-cedeo",
        label: "Vasque à poser 60 cm",
        qty: 1,
        unit: "u",
        buyPrice: 248,
        sellPrice: 0,
      },
    ],
  },
  {
    seed: "plateau-doc-dupont-facture-cedeo",
    direction: "in",
    kind: "facture",
    title: "Facture Cedeo — commande SDB",
    partySeed: "plateau-dist-cedeo",
    chantierSeed: "plateau-chantier-dupont-sdb",
    daysAgo: 18,
    extract: demoExtract({ totals: { ht: 1288, tva: 257.6, ttc: 1545.6 }, ref: "FAC-88421" }),
    lines: [
      {
        productSeed: "plateau-prod-pvc-100",
        supplierSeed: "plateau-fourn-nicoll",
        distributorSeed: "plateau-dist-cedeo",
        label: "Tube PVC évacuation Ø 100",
        qty: 14,
        unit: "ml",
        buyPrice: 19.6,
        sellPrice: 0,
      },
      {
        productSeed: "plateau-prod-vasque",
        supplierSeed: "plateau-fourn-nicoll",
        distributorSeed: "plateau-dist-cedeo",
        label: "Vasque à poser 60 cm",
        qty: 1,
        unit: "u",
        buyPrice: 248,
        sellPrice: 0,
      },
    ],
  },
  {
    seed: "plateau-doc-dupont-devis-client",
    direction: "out",
    kind: "devis",
    title: "Devis client — Rénovation SDB Dupont",
    partySeed: "plateau-client-dupont",
    chantierSeed: "plateau-chantier-dupont-sdb",
    sourceSeed: "plateau-doc-dupont-devis-cedeo",
    daysAgo: 38,
    extract: demoExtract({ markup: 1.34, sent_at: daysAgoIso(35), ref: "Devis 2026-028" }),
    lines: [
      {
        productSeed: "plateau-prod-pvc-100",
        label: "Évacuation PVC + pose",
        qty: 14,
        unit: "ml",
        buyPrice: 18.4,
        sellPrice: 32,
      },
      {
        productSeed: "plateau-prod-vasque",
        label: "Fourniture vasque + pose",
        qty: 1,
        unit: "u",
        buyPrice: 248,
        sellPrice: 385,
      },
      {
        label: "Main-d’œuvre plomberie",
        qty: 12,
        unit: "h",
        buyPrice: 0,
        sellPrice: 58,
        productSeed: "plateau-prod-pvc-100",
      },
    ],
  },
  {
    seed: "plateau-doc-martin-devis-rexel",
    direction: "in",
    kind: "devis",
    title: "Devis Rexel — rénovation tableau",
    partySeed: "plateau-dist-rexel",
    chantierSeed: "plateau-chantier-martin-elec",
    daysAgo: 28,
    extract: demoExtract({ totals: { ht: 2846, tva: 569.2, ttc: 3415.2 }, ref: "RX-992184" }),
    lines: [
      {
        productSeed: "plateau-prod-cable-3g25",
        supplierSeed: "plateau-fourn-schneider",
        distributorSeed: "plateau-dist-rexel",
        label: "Câble U1000 R2V 3G2,5 mm²",
        qty: 120,
        unit: "ml",
        buyPrice: 3.42,
        sellPrice: 0,
      },
      {
        productSeed: "plateau-prod-disj-20a",
        supplierSeed: "plateau-fourn-legrand",
        distributorSeed: "plateau-dist-rexel",
        label: "Disjoncteur 20 A courbe C",
        qty: 8,
        unit: "u",
        buyPrice: 14.8,
        sellPrice: 0,
      },
      {
        productSeed: "plateau-prod-gtl",
        supplierSeed: "plateau-fourn-legrand",
        distributorSeed: "plateau-dist-rexel",
        label: "GTL 13 modules",
        qty: 1,
        unit: "u",
        buyPrice: 186,
        sellPrice: 0,
      },
    ],
  },
  {
    seed: "plateau-doc-martin-facture-rexel",
    direction: "in",
    kind: "facture",
    title: "Facture Rexel — matériel élec. Martin",
    partySeed: "plateau-dist-rexel",
    chantierSeed: "plateau-chantier-martin-elec",
    daysAgo: 12,
    extract: demoExtract({ totals: { ht: 2912, tva: 582.4, ttc: 3494.4 }, ref: "FAC-RX-44102" }),
    lines: [
      {
        productSeed: "plateau-prod-cable-3g25",
        supplierSeed: "plateau-fourn-schneider",
        distributorSeed: "plateau-dist-rexel",
        label: "Câble U1000 R2V 3G2,5 mm²",
        qty: 120,
        unit: "ml",
        buyPrice: 3.84,
        sellPrice: 0,
      },
      {
        productSeed: "plateau-prod-disj-20a",
        supplierSeed: "plateau-fourn-legrand",
        distributorSeed: "plateau-dist-rexel",
        label: "Disjoncteur 20 A courbe C",
        qty: 8,
        unit: "u",
        buyPrice: 15.9,
        sellPrice: 0,
      },
      {
        productSeed: "plateau-prod-gtl",
        supplierSeed: "plateau-fourn-legrand",
        distributorSeed: "plateau-dist-rexel",
        label: "GTL 13 modules",
        qty: 1,
        unit: "u",
        buyPrice: 186,
        sellPrice: 0,
      },
    ],
  },
  {
    seed: "plateau-doc-martin-devis-client",
    direction: "out",
    kind: "devis",
    title: "Devis client — Mise aux normes Martin",
    partySeed: "plateau-client-martin",
    chantierSeed: "plateau-chantier-martin-elec",
    sourceSeed: "plateau-doc-martin-devis-rexel",
    daysAgo: 24,
    extract: demoExtract({ markup: 1.38, sent_at: daysAgoIso(22), ref: "Devis 2026-031" }),
    lines: [
      {
        productSeed: "plateau-prod-cable-3g25",
        label: "Câble + cheminement",
        qty: 120,
        unit: "ml",
        buyPrice: 3.42,
        sellPrice: 6.2,
      },
      {
        productSeed: "plateau-prod-disj-20a",
        label: "Protection modulaire",
        qty: 8,
        unit: "u",
        buyPrice: 14.8,
        sellPrice: 28,
      },
      {
        productSeed: "plateau-prod-gtl",
        label: "Coffret GTL + pose",
        qty: 1,
        unit: "u",
        buyPrice: 186,
        sellPrice: 420,
      },
      {
        label: "Main-d’œuvre électricien",
        qty: 16,
        unit: "h",
        buyPrice: 0,
        sellPrice: 62,
        productSeed: "plateau-prod-gtl",
      },
    ],
  },
  {
    seed: "plateau-doc-martin-bc-client",
    direction: "out",
    kind: "bon_commande",
    title: "Bon de commande client — Martin",
    partySeed: "plateau-client-martin",
    chantierSeed: "plateau-chantier-martin-elec",
    sourceSeed: "plateau-doc-martin-devis-client",
    daysAgo: 8,
    extract: demoExtract({ ref: "BC-2026-008" }),
    lines: [
      {
        productSeed: "plateau-prod-cable-3g25",
        label: "Lot électricité — validé client",
        qty: 1,
        unit: "forfait",
        buyPrice: 2912,
        sellPrice: 4280,
      },
    ],
  },
  {
    seed: "plateau-doc-karim-devis-pointp",
    direction: "in",
    kind: "devis",
    title: "Devis Point.P — chape & colle",
    partySeed: "plateau-dist-pointp",
    chantierSeed: "plateau-chantier-karim-cuisine",
    daysAgo: 55,
    extract: demoExtract({ totals: { ht: 892, tva: 178.4, ttc: 1070.4 } }),
    lines: [
      {
        productSeed: "plateau-prod-colle-carrelage",
        supplierSeed: "plateau-fourn-wurth",
        distributorSeed: "plateau-dist-pointp",
        label: "Colle carrelage flexible C2 S1",
        qty: 6,
        unit: "sac",
        buyPrice: 38.5,
        sellPrice: 0,
      },
    ],
  },
  {
    seed: "plateau-doc-karim-devis-client",
    direction: "out",
    kind: "devis",
    title: "Devis client — Cuisine Benali",
    partySeed: "plateau-client-karim",
    chantierSeed: "plateau-chantier-karim-cuisine",
    sourceSeed: "plateau-doc-karim-devis-pointp",
    daysAgo: 50,
    extract: demoExtract({ sent_at: daysAgoIso(48), markup: 1.32 }),
    lines: [
      {
        productSeed: "plateau-prod-colle-carrelage",
        label: "Carrelage sol + colle",
        qty: 28,
        unit: "m²",
        buyPrice: 38.5,
        sellPrice: 72,
      },
    ],
  },
  {
    seed: "plateau-doc-sci-facture-rexel",
    direction: "in",
    kind: "facture",
    title: "Facture Rexel — spots combles",
    partySeed: "plateau-dist-rexel",
    chantierSeed: "plateau-chantier-sci-combles",
    daysAgo: 95,
    extract: demoExtract({ totals: { ht: 624, tva: 124.8, ttc: 748.8 } }),
    lines: [
      {
        productSeed: "plateau-prod-spot-led",
        supplierSeed: "plateau-fourn-legrand",
        distributorSeed: "plateau-dist-rexel",
        label: "Spot LED encastrable IP44",
        qty: 12,
        unit: "u",
        buyPrice: 42,
        sellPrice: 0,
      },
      {
        productSeed: "plateau-prod-gaine-icta",
        supplierSeed: "plateau-fourn-legrand",
        distributorSeed: "plateau-dist-rexel",
        label: "Gaine ICTA Ø 20",
        qty: 45,
        unit: "ml",
        buyPrice: 1.12,
        sellPrice: 0,
      },
    ],
  },
];

export const PLATEAU_ALERTS: PlateauAlert[] = [
  {
    seed: "plateau-alert-cable-rexel",
    productSeed: "plateau-prod-cable-3g25",
    documentSeed: "plateau-doc-martin-facture-rexel",
    chantierSeed: "plateau-chantier-martin-elec",
    label: "Câble U1000 R2V 3G2,5 mm² chez Rexel",
    oldPrice: 3.42,
    newPrice: 3.84,
    daysAgo: 12,
  },
  {
    seed: "plateau-alert-disj-rexel",
    productSeed: "plateau-prod-disj-20a",
    documentSeed: "plateau-doc-martin-facture-rexel",
    chantierSeed: "plateau-chantier-martin-elec",
    label: "Disjoncteur 20 A courbe C chez Rexel",
    oldPrice: 14.8,
    newPrice: 15.9,
    daysAgo: 12,
  },
  {
    seed: "plateau-alert-pvc-cedeo",
    productSeed: "plateau-prod-pvc-100",
    documentSeed: "plateau-doc-dupont-facture-cedeo",
    chantierSeed: "plateau-chantier-dupont-sdb",
    label: "Tube PVC évacuation Ø 100 chez Cedeo",
    oldPrice: 18.4,
    newPrice: 19.6,
    daysAgo: 18,
  },
  {
    seed: "plateau-alert-spot-rexel",
    productSeed: "plateau-prod-spot-led",
    documentSeed: "plateau-doc-sci-facture-rexel",
    chantierSeed: "plateau-chantier-sci-combles",
    label: "Spot LED encastrable IP44 chez Rexel",
    oldPrice: 39.5,
    newPrice: 42,
    daysAgo: 60,
  },
  {
    seed: "plateau-alert-colle-pointp",
    productSeed: "plateau-prod-colle-carrelage",
    chantierSeed: "plateau-chantier-karim-cuisine",
    label: "Colle carrelage flexible C2 S1 chez Point.P",
    oldPrice: 36.2,
    newPrice: 38.5,
    daysAgo: 45,
  },
];
