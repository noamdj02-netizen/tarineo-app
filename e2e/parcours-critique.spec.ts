import { test, expect } from "@playwright/test";

/**
 * Parcours critique V1 — smoke test public + pages auth.
 * Le flux complet (inscription → import PDF → alerte → abonnement) nécessite
 * DATABASE_URL, Supabase et clés IA en CI — étendre quand l'environnement de test est prêt.
 */
test.describe("Parcours critique Tarinéo", () => {
  test("landing et pages publiques essentielles", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const reponseTarifs = await page.goto("/tarifs");
    expect(reponseTarifs?.ok()).toBeTruthy();

    await page.goto("/connexion");
    await expect(page.getByRole("heading", { name: /Heureux de vous revoir/i })).toBeVisible();

    await page.goto("/inscription");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("redirects légaux", async ({ page }) => {
    const reponseCgu = await page.goto("/cgu");
    expect(reponseCgu?.url()).toContain("/legal/cgu");

    const reponseConf = await page.goto("/confidentialite");
    expect(reponseConf?.url()).toContain("/legal/confidentialite");
  });
});
