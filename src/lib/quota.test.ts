import { describe, expect, it } from "vitest";
import { calculerEtatQuota } from "./quota";

const base = {
  createdAtUtilisateur: new Date("2026-02-01"),
  plan: "starter" as const,
  documentsAvantCeMois: 0,
  documentsCeMois: 0,
  maintenant: new Date("2026-02-15"),
};

describe("calculerEtatQuota", () => {
  it("bloque si past_due", () => {
    const etat = calculerEtatQuota({
      ...base,
      subscriptionStatus: "past_due",
    });
    expect(etat.phase).toBe("bloque_paiement_requis");
  });

  it("autorise l'essai avant fin de période", () => {
    const etat = calculerEtatQuota({
      ...base,
      subscriptionStatus: null,
    });
    expect(etat.phase).toBe("historique");
  });

  it("bloque après essai sans paiement", () => {
    const etat = calculerEtatQuota({
      ...base,
      maintenant: new Date("2026-04-01"),
      subscriptionStatus: null,
    });
    expect(etat.phase).toBe("bloque_paiement_requis");
  });
});
