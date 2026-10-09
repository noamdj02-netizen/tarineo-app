import type { IllustrationName } from "@/lib/illustrations";

/** Option A : identité → premier PDF → accueil (entreprise / chantier via checklist). */
export const ONBOARD_STEPS = [
  { id: "identite", label: "Vous", art: "onboarding-bienvenue" as IllustrationName },
  { id: "document", label: "Premier PDF", art: "onboarding-premier-pas" as IllustrationName },
  { id: "go", label: "C’est parti", art: "landing-victoire" as IllustrationName },
] as const;

export type OnboardStepId = (typeof ONBOARD_STEPS)[number]["id"];
