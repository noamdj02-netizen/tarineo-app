import { describe, expect, it } from "vitest";
import { cartesEnBrefParType } from "./statsDocuments";

const stats = {
  total: 12,
  sommeHt: 8420,
  hausses: 3,
  enseignes: 4,
  parDistributeur: [],
};

describe("cartesEnBrefParType", () => {
  it("affiche 3 cartes pour les devis fournisseurs", () => {
    const cartes = cartesEnBrefParType(stats, "DEVIS");
    expect(cartes).toHaveLength(3);
    expect(cartes[0].label).toBe("Documents");
    expect(cartes[2].label).toBe("Enseignes");
  });

  it("affiche les hausses pour les factures", () => {
    const cartes = cartesEnBrefParType(stats, "FACTURE");
    expect(cartes.some((c) => c.label === "Hausses" && c.valeur === "3")).toBe(true);
  });
});
