export type UiLibCategory = "animated" | "sections" | "base";
export type UiLibPricing = "free" | "free_with_pro";

export type UiLib = {
  id: string;
  name: string;
  url: string;
  description: string;
  category: UiLibCategory;
  pricing: UiLibPricing;
  license: string;
  tags: string[];
  stack: string[];
  /** Prompt rédigé par Navpit — jamais du code source de la lib. */
  starterPrompt: string;
};

export const UI_LIB_CATEGORIES: UiLibCategory[] = ["animated", "sections", "base"];
export const UI_LIB_PRICINGS: UiLibPricing[] = ["free", "free_with_pro"];

export const UI_LIB_CATEGORY_LABELS: Record<UiLibCategory, string> = {
  animated: "Animé",
  sections: "Sections",
  base: "Base",
};

export const UI_LIB_PRICING_LABELS: Record<UiLibPricing, string> = {
  free: "100% gratuit",
  free_with_pro: "Gratuit + Pro",
};
