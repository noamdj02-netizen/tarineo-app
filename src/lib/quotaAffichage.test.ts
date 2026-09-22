import { describe, expect, it } from "vitest";
import { metriquesQuota } from "./quotaAffichage";

describe("metriquesQuota", () => {
  it("formate la phase historique", () => {
    const m = metriquesQuota({
      phase: "historique",
      documentsTotal: 47,
      limiteHistorique: 150,
      documentsRestantsHistorique: 103,
    });
    expect(m?.libelleCourt).toBe("47 / 150");
    expect(m?.variante).toBe("historique");
    expect(m?.pourcentage).toBe(31);
  });

  it("formate la phase mensuelle", () => {
    const m = metriquesQuota({
      phase: "mensuel",
      quotaMensuel: 150,
      surPlanReel: false,
      documentsCeMoisHorsHistorique: 23,
      documentsRestantsCeMois: 127,
      quotaAtteint: false,
    });
    expect(m?.libelleCourt).toBe("23 / 150");
    expect(m?.variante).toBe("mensuel");
  });

  it("signale un quota mensuel plein", () => {
    const m = metriquesQuota({
      phase: "mensuel",
      quotaMensuel: 150,
      surPlanReel: true,
      documentsCeMoisHorsHistorique: 150,
      documentsRestantsCeMois: 0,
      quotaAtteint: true,
    });
    expect(m?.variante).toBe("plein");
    expect(m?.pourcentage).toBe(100);
  });

  it("formate le blocage essai expiré", () => {
    const m = metriquesQuota({
      phase: "bloque_paiement_requis",
      finEssai: new Date("2026-03-01"),
    });
    expect(m?.variante).toBe("bloque");
    expect(m?.libelleCourt).toBe("Essai expiré");
  });
});
