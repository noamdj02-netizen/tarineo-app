/** Détection mobile côté client. */
export function estAppareilMobile(): boolean {
  if (typeof window === "undefined") return false;
  if (/iPhone|iPad|iPod|Android/i.test(navigator.userAgent)) return true;
  // Viewport étroit + tactile (iPad desktop UA, PWA, Playwright isMobile, etc.)
  const etroit = window.matchMedia("(max-width: 1023px)").matches;
  const tactile = navigator.maxTouchPoints > 0 || "ontouchstart" in window;
  return etroit && tactile;
}

/** Viewport app mobile (≤ lg), indépendant du User-Agent. */
export function estViewportMobile(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 1023px)").matches;
}
