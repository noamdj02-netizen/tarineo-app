import { describe, expect, it } from "vitest";
import { accesEquipe } from "./equipe";

describe("equipe", () => {
  it("autorise l'équipe en essai", () => {
    expect(accesEquipe("starter", "trialing")).toBe(true);
  });

  it("réserve l'équipe au plan Équipe payant", () => {
    expect(accesEquipe("equipe", "active")).toBe(true);
    expect(accesEquipe("pro", "active")).toBe(false);
    expect(accesEquipe("starter", "active")).toBe(false);
  });
});
