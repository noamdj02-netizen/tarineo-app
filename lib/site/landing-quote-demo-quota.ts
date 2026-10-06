/** Quota « une transformation gratuite » sur la landing (navigateur + cookie serveur pour le PDF). */

export const LANDING_QUOTE_DEMO_STORAGE_KEY = "tarineo.landing.quote_demo_v1";
export const LANDING_QUOTE_DEMO_COOKIE = "tarineo_landing_demo_pdf";

export function hasUsedFreeLandingTransform(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(LANDING_QUOTE_DEMO_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markFreeLandingTransformUsed(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANDING_QUOTE_DEMO_STORAGE_KEY, "1");
  } catch {
    /* quota best-effort */
  }
}
