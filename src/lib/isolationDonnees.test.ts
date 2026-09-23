import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
const findFirstMock = vi.fn();

vi.mock("@/auth", () => ({
  auth: () => authMock(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: { findFirst: (...args: unknown[]) => findFirstMock(...args) },
    alert: { findFirst: (...args: unknown[]) => findFirstMock(...args) },
  },
}));

vi.mock("@/lib/supabase", () => ({
  DOCUMENTS_BUCKET: "documents",
  getSupabaseAdmin: () => ({
    storage: {
      from: () => ({
        download: async () => ({ data: null, error: { message: "skip" } }),
      }),
    },
  }),
}));

describe("isolation des données — routes API documents", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("refuse le téléchargement sans session", async () => {
    authMock.mockResolvedValue(null);
    const { GET } = await import("@/app/api/documents/[id]/fichier/route");
    const reponse = await GET(new Request("http://test"), { params: Promise.resolve({ id: "doc-b" }) });
    expect(reponse.status).toBe(401);
    expect(findFirstMock).not.toHaveBeenCalled();
  });

  it("filtre toujours par userId de la session pour un document", async () => {
    authMock.mockResolvedValue({ user: { id: "user-a" } });
    findFirstMock.mockResolvedValue(null);

    const { GET } = await import("@/app/api/documents/[id]/fichier/route");
    await GET(new Request("http://test"), { params: Promise.resolve({ id: "doc-b" }) });

    expect(findFirstMock).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: "doc-b", userId: "user-a" },
      }),
    );
  });

  it("utilisateur A ne peut pas lire le document de B (findFirst null → 404)", async () => {
    authMock.mockResolvedValue({ user: { id: "user-a" } });
    findFirstMock.mockResolvedValue(null);

    const { GET } = await import("@/app/api/documents/[id]/fichier/route");
    const reponse = await GET(new Request("http://test"), { params: Promise.resolve({ id: "doc-de-b" }) });

    expect(reponse.status).toBe(404);
    expect(findFirstMock.mock.calls[0][0].where.userId).toBe("user-a");
  });
});
