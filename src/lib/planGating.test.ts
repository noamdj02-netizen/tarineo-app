import { describe, expect, it } from "vitest";
import {
  accesExportComptable,
  accesDevisClientPdf,
  limiteDistributeurs,
  profondeurHistoriqueMois,
} from "./planGating";

describe("planGating", () => {
  it("refuse l'export comptable au plan Starter payant", () => {
    expect(accesExportComptable("starter", "active")).toBe(false);
    expect(accesExportComptable("pro", "active")).toBe(true);
  });

  it("autorise le PDF devis en essai", () => {
    expect(accesDevisClientPdf("starter", null)).toBe(true);
  });

  it("limite les distributeurs au Starter", () => {
    expect(limiteDistributeurs("starter", "active")).toBe(3);
    expect(limiteDistributeurs("pro", "active")).toBeNull();
  });

  it("limite l'historique à 12 mois au Starter payant", () => {
    expect(profondeurHistoriqueMois("starter", "active")).toBe(12);
    expect(profondeurHistoriqueMois("pro", "active")).toBeNull();
    expect(profondeurHistoriqueMois("starter", null)).toBeNull();
  });
});
