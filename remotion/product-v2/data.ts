export const METIERS = [
  "PLOMBIER",
  "ÉLECTRICIEN",
  "CHAUFFAGISTE",
  "MAÇON",
  "PEINTRE",
  "MENUISIER",
] as const;

export const DOCS = [
  { name: "DEVIS.pdf", kind: "DEVIS" },
  { name: "FACTURE.pdf", kind: "FACTURE" },
  { name: "COMMANDE.pdf", kind: "COMMANDE" },
  { name: "FACTURE_FOURNISSEUR.pdf", kind: "ACHAT" },
] as const;

export const ANALYSE_STEPS = [
  { ok: true, text: "Document identifié" },
  { ok: true, text: "Fournisseur identifié" },
  { ok: true, text: "24 lignes extraites" },
  { ok: true, text: "TVA identifiée" },
  { ok: true, text: "Total identifié" },
  { ok: false, text: "2 éléments à vérifier" },
] as const;

export const CATEGORIES = ["DEVIS", "FACTURE", "COMMANDE", "ACHAT"] as const;

export const COPILOTE_ACTIONS = [
  "Analyser ce devis",
  "Comparer ce fournisseur",
  "Préparer une relance",
] as const;

export const TRANSFORM_STEPS = ["DEVIS", "ANALYSE", "VÉRIFICATION", "FACTURE"] as const;

export const ECO_NODES = [
  "DEVIS",
  "FACTURES",
  "COMMANDES",
  "ACHATS",
  "CHANTIERS",
  "ANALYSE",
] as const;

export const PAIN_LINES = [
  "Les hausses fournisseur passent inaperçues.",
  "Les devis à envoyer s’empilent.",
  "La compta réclame encore un export Excel.",
] as const;

export const COPY = {
  painHook: "Trop de paperasse. Pas assez de marge.",
  metierLine: "Pensé pour les artisans du BTP.",
  uploadPain: "Vos PDF s’empilent sur le bureau.",
  uploadLine: "Déposez devis et factures — on lit pour vous.",
  analysePain: "Impossible de tout relire ligne par ligne.",
  analyseLine: "L’Analyse IA extrait prix, TVA et fournisseur.",
  dashboardLine: "Un accueil qui dit quoi faire en premier.",
  transformLine: "Devis fournisseur → devis client, sans recopier.",
  exportPain: "Fin de mois = stress comptable.",
  exportLine: "Export comptable : CSV prêt pour le cabinet.",
  copilotePain: "Vous jonglez entre chantiers et relances.",
  copiloteLine: "Le Copilote connaît vos pièces (⌘J).",
  copiloteAsk: "Que voulez-vous faire ?",
  v2Title: "TARINEO V2",
  v2Sub: "Maintenant.",
  /** Formulation demandée pour l’outro produit. */
  outroTagline: "L'assistant métier des artisans.",
  cta: "app.tarineo.com",
  brand: "TARINEO",
} as const;
