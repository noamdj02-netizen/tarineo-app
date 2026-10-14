/** Offre de lancement — mettre à jour manuellement quand une place est prise. */
export const LAUNCH_TOTAL_PLACES = 30;
export const PLACES_RESTANTES = 25;

export const LAUNCH_FREE_MONTHS = 1;

export const LAUNCH_CONTACT_FORM_ID = "contact";

export function scrollToLaunchContactForm() {
  if (typeof document === "undefined") return;
  const el = document.getElementById(LAUNCH_CONTACT_FORM_ID);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.setTimeout(() => {
    const first = el.querySelector<HTMLElement>(
      "input:not([type='hidden']):not([tabindex='-1']), select, textarea",
    );
    first?.focus({ preventScroll: true });
  }, 400);
}
