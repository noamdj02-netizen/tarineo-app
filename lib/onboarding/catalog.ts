import type { IllustrationName } from "@/lib/illustrations";

export const ONBOARD_GOALS = [
  { id: "first_sale", n: "Ma première vente", hint: "Un client qui paie, pas un site joli." },
  { id: "landing", n: "Une landing en 5 minutes", hint: "Hero + projet + copilote." },
  { id: "focus", n: "Un seul projet Focus", hint: "Arrêter de tout mener en parallèle." },
  { id: "studio", n: "Schémas et parcours", hint: "Voir le chemin avant de coder." },
  { id: "tools", n: "Ranger mes outils", hint: "Figma, Cursor, Stripe au même endroit." },
] as const;

export const ONBOARD_PAINS = [
  { id: "too_many_tools", n: "Trop d’outils, zéro suite" },
  { id: "no_site", n: "Pas encore de vrai site" },
  { id: "generic_copy", n: "Ma copie sonne générique" },
  { id: "no_schema", n: "Pas de schéma du parcours" },
  { id: "no_next", n: "Pas de prochaine action claire" },
  { id: "scattered", n: "Je me disperse chaque semaine" },
] as const;

export const ONBOARD_SWIPES = [
  "Je passe plus de temps à choisir un outil qu’à vendre.",
  "Ma landing ressemble à toutes les autres.",
  "Je n’ai pas de prochaine action écrite quelque part.",
] as const;

export type OnboardGoalId = (typeof ONBOARD_GOALS)[number]["id"];
export type OnboardPainId = (typeof ONBOARD_PAINS)[number]["id"];

export type OnboardingAnswers = {
  goal?: OnboardGoalId;
  pains?: OnboardPainId[];
  swipes?: boolean[];
};

export const ONBOARD_STEPS = [
  { id: "welcome", label: "Bienvenue", art: "onboarding-bienvenue" as IllustrationName },
  { id: "identite", label: "Toi", art: "onboarding-decouvrir" as IllustrationName },
  { id: "goal", label: "But", art: "onboarding-objectif" as IllustrationName },
  { id: "pain", label: "Freins", art: "feedback-question" as IllustrationName },
  { id: "proof", label: "Preuve", art: "notif-like" as IllustrationName },
  { id: "swipe", label: "Cartes", art: "onboarding-premier-pas" as IllustrationName },
  { id: "solution", label: "Pont", art: "landing-progression" as IllustrationName },
  { id: "process", label: "Pause", art: "dashboard-analyse" as IllustrationName },
  { id: "projet", label: "Projet", art: "landing-idee" as IllustrationName },
  { id: "cockpit", label: "Cockpit", art: "landing-commencer" as IllustrationName },
  { id: "paywall", label: "Essai", art: "landing-victoire" as IllustrationName },
] as const;

export type OnboardStepId = (typeof ONBOARD_STEPS)[number]["id"];

export function isGoalId(v: string): v is OnboardGoalId {
  return ONBOARD_GOALS.some((g) => g.id === v);
}

export function isPainId(v: string): v is OnboardPainId {
  return ONBOARD_PAINS.some((p) => p.id === v);
}

export function goalLabel(id?: OnboardGoalId) {
  return ONBOARD_GOALS.find((g) => g.id === id)?.n ?? "avancer";
}
