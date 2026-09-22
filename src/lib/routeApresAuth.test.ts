import { describe, expect, it } from "vitest";
import { estCallbackUrlInterne, lienHubApresConnexion } from "./routeApresAuth";

describe("estCallbackUrlInterne", () => {
  it("accepte un chemin interne", () => {
    expect(estCallbackUrlInterne("/invitation/abc")).toBe(true);
    expect(estCallbackUrlInterne("/accueil")).toBe(true);
  });

  it("refuse les redirections externes ou dangereuses", () => {
    expect(estCallbackUrlInterne("https://evil.com")).toBe(false);
    expect(estCallbackUrlInterne("//evil.com")).toBe(false);
    expect(estCallbackUrlInterne("/../admin")).toBe(false);
    expect(estCallbackUrlInterne("/connexion")).toBe(false);
  });
});

describe("lienHubApresConnexion", () => {
  it("encode le callbackUrl valide", () => {
    expect(lienHubApresConnexion("/invitation/token")).toBe(
      "/apres-connexion?callbackUrl=%2Finvitation%2Ftoken",
    );
  });

  it("ignore un callback invalide", () => {
    expect(lienHubApresConnexion("https://evil.com")).toBe("/apres-connexion");
  });
});
