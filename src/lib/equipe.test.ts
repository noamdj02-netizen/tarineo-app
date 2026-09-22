import { describe, expect, it } from "vitest";
import { accesEquipe } from "./equipe";

describe("equipe", () => {
  it("refuse l'équipe hors plan Équipe", () => {
    expect(accesEquipe("starter", "trialing")).toBe(false);
    expect(accesEquipe("pro", "active")).toBe(false);
    expect(accesEquipe("starter", "active")).toBe(false);
  });

  it("autorise le plan Équipe actif ou en essai", () => {
    expect(accesEquipe("equipe", "active")).toBe(true);
    expect(accesEquipe("equipe", "trialing")).toBe(true);
    expect(accesEquipe("equipe", null)).toBe(true);
  });
});
