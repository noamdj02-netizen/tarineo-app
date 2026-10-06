/** Centre produit des connexions (Phase 1). */
export const INTEGRATIONS_HUB_PATH = "/automatisations";
export const INTEGRATIONS_HUB_SECTION_ID = "connexions";

export function integrationsHubUrl(query?: Record<string, string>) {
  const q = new URLSearchParams(query);
  const suffix = q.toString() ? `?${q}` : "";
  return `${INTEGRATIONS_HUB_PATH}${suffix}#${INTEGRATIONS_HUB_SECTION_ID}`;
}

export function googleOAuthHref(tool: "gmail" | "drive" = "gmail") {
  const returnTo = encodeURIComponent(
    `${INTEGRATIONS_HUB_PATH}?bound=${tool === "drive" ? "drive" : "gmail"}`,
  );
  return `/api/connect/google?tools=${tool}&return=${returnTo}`;
}
