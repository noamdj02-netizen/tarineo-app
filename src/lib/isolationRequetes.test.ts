import { describe, expect, it } from "vitest";

/**
 * Rappel contractuel : toute requête métier doit filtrer par userId.
 * Ce test documente le pattern attendu sans appeler la base.
 */
function filtreDocumentUtilisateur(userId: string, documentId: string) {
  return { id: documentId, userId };
}

describe("isolation utilisateur", () => {
  it("inclut toujours userId dans le filtre document", () => {
    const filtre = filtreDocumentUtilisateur("user-a", "doc-1");
    expect(filtre.userId).toBe("user-a");
    expect(filtre).toHaveProperty("id", "doc-1");
  });

  it("deux utilisateurs ne partagent pas le même filtre", () => {
    const a = filtreDocumentUtilisateur("user-a", "doc-1");
    const b = filtreDocumentUtilisateur("user-b", "doc-1");
    expect(a.userId).not.toBe(b.userId);
  });
});
