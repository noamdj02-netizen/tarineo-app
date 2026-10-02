import { BRAND } from "../../lib/brand";

export const BRAND_COPY = {
  name: BRAND.name,
  tagline: BRAND.tagline,
  ctaHost: "app.tarineo.com",
} as const;

export const PROBLEM_LINES = [
  "Trop de devis.",
  "Trop de factures.",
  "Trop de choses à gérer.",
] as const;

export const DASH_HIGHLIGHTS = [
  "KPI",
  "Chantiers",
  "Devis",
  "Factures",
  "Achats",
] as const;

export const DEVIS_OPTIONS = [
  { icon: "✍", title: "Manuel", hint: "Prestations & matériaux" },
  { icon: "✨", title: "IA", hint: "Structurer un chantier" },
  { icon: "🎙", title: "Voix", hint: "Décrire naturellement" },
] as const;

export const IA_PROMPT =
  "Rénovation d'une salle de bain de 8 m²...";

export const IA_LINES = [
  { label: "Dépose carrelage", qty: "8 m²" },
  { label: "Pose carrelage", qty: "8 m²" },
  { label: "Fourniture carrelage", qty: "8 m²" },
  { label: "Installation douche", qty: "1 unité" },
] as const;

/** Exemple générique de démonstration — non issu d’un fournisseur réel. */
export const PRICE_EXAMPLE = {
  label: "Exemple · carrelage 60×60",
  oldPrice: "12,40 €",
  newPrice: "14,10 €",
  pct: "+13,7 %",
  note: "Exemple illustratif",
} as const;

export const ORBIT_ITEMS = [
  "Chantiers",
  "Devis",
  "Factures",
  "Achats",
  "Analyse",
] as const;

export const DEMO_KPIS = [
  { label: "Devis à envoyer", value: "3", hint: "prêts côté client", accent: false },
  { label: "Hausses", value: "2", hint: "prix fournisseur", accent: true },
  { label: "Factures client", value: "5", hint: "pièces émises", accent: false },
  { label: "Relances", value: "1", hint: "à traiter", accent: false },
  { label: "Achats du mois", value: "18,4 k€", hint: "HT lignes", accent: false },
] as const;

export const DEMO_CHANTIERS = [
  { name: "SDB · Dupont", status: "En cours", tone: "#16A34A" },
  { name: "Cuisine · Martin", status: "Pause", tone: "#F59E0B" },
  { name: "Rénovation · Leroy", status: "En cours", tone: "#16A34A" },
] as const;

export const DEMO_ACTIONS = [
  { title: "Envoyer devis SDB Dupont", hint: "Client · 4 280 € HT", cta: "Ouvrir" },
  { title: "Hausse carrelage détectée", hint: "Exemple illustratif", cta: "Voir" },
  { title: "Relancer facture #1042", hint: "Échéance dépassée", cta: "Relancer" },
] as const;

export const NAV_ITEMS = [
  "Accueil",
  "Chantiers",
  "Devis",
  "Factures",
  "Achats",
  "Hausses",
  "Copilote",
] as const;
