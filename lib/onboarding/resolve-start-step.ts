import type { OnboardStepId } from "@/lib/onboarding/catalog";

const MAX = 2;

/** Reprise du wizard depuis metadata + prénom déjà connu (inscription / Google). */
export function resolveOnboardingStartStep(input: {
  firstName: string;
  onboardingStep?: string | null;
  queryStep?: number;
  devJump?: boolean;
}): number {
  const { firstName, onboardingStep, queryStep, devJump } = input;
  if (devJump && queryStep != null && queryStep >= 0 && queryStep <= MAX) return queryStep;

  if (onboardingStep === "document" || onboardingStep === "document_skipped") return 2;
  if (onboardingStep === "identite") return 1;

  if (firstName.trim().length >= 2) return 1;
  return 0;
}

export function onboardingStepIdForIndex(index: number): OnboardStepId {
  if (index <= 0) return "identite";
  if (index === 1) return "document";
  return "go";
}
