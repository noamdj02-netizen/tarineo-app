import { beforeEach, describe, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

vi.mock("heic-convert", () => ({
  default: vi.fn(async () => new Uint8Array([0xff, 0xd8, 0xff, 0xe0])),
}));

vi.mock("@/lib/sharpLoader", () => ({
  chargerSharp: vi.fn(async () => null),
}));

const uploadMock = vi.fn(async () => ({ error: null }));
vi.mock("@/lib/supabase", () => ({
  DOCUMENTS_BUCKET: "documents",
  isSupabaseConfigured: () => true,
  getSupabaseAdmin: () => ({
    storage: {
      from: () => ({
        upload: uploadMock,
        remove: vi.fn(async () => ({ error: null })),
      }),
    },
  }),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    document: {
      create: vi.fn(async ({ data }: { data: { fileKey: string } }) => ({
        id: "doc-test-1",
        ...data,
      })),
    },
  },
}));

describe("import sans sharp", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("construireBlocContenu JPEG ne charge pas sharp", async () => {
    const { construireBlocContenu } = await import("@/lib/contenuDocumentIA");
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10]);
    const bloc = await construireBlocContenu(jpeg, "jpg");
    expect(bloc.type).toBe("image");
    expect(bloc.source.media_type).toBe("image/jpeg");
    const { chargerSharp } = await import("@/lib/sharpLoader");
    expect(chargerSharp).not.toHaveBeenCalled();
  });

  it("construireBlocContenu HEIC réussit même si sharp indisponible", async () => {
    const { construireBlocContenu } = await import("@/lib/contenuDocumentIA");
    const heic = Buffer.from("fake-heic-content");
    const bloc = await construireBlocContenu(heic, "heic");
    expect(bloc.type).toBe("image");
    expect(bloc.source.media_type).toBe("image/jpeg");
  });

  it("extraireEtEnregistrerLogoFournisseur ignore sharp indisponible", async () => {
    const { extraireEtEnregistrerLogoFournisseur } = await import("@/lib/logoFournisseurDocument");
    await expect(
      extraireEtEnregistrerLogoFournisseur({
        userId: "user-1",
        distributor: "Cedeo",
        distributorNorm: "CEDEO",
        fileBuffer: Buffer.from([0xff, 0xd8, 0xff]),
        extension: "jpg",
        logoZone: { x_pct: 10, y_pct: 10, width_pct: 20, height_pct: 20, confiance: 0.9 },
      }),
    ).resolves.toBeUndefined();
  });

  it("actions upload n'importe pas extraction statiquement", () => {
    const source = readFileSync(join(process.cwd(), "src/app/(app)/documents/actions.ts"), "utf8");
    expect(source).not.toMatch(/from\s+["']@\/lib\/extraction["']/);
    expect(source).toMatch(/import\s*\(\s*["']@\/lib\/extraction["']\s*\)/);
  });

  it("enregistrerDocument JPEG réussit sans sharp", async () => {
    uploadMock.mockClear();
    const { enregistrerDocument } = await import("@/lib/documents");
    const jpeg = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46]);
    const resultat = await enregistrerDocument("user-1", "DEVIS", jpeg, "hash-jpeg");
    expect(resultat).toEqual({ succes: true, documentId: "doc-test-1" });
    expect(uploadMock).toHaveBeenCalledOnce();
  });

  it("enregistrerDocument HEIC iPhone réussit sans sharp", async () => {
    uploadMock.mockClear();
    const { enregistrerDocument } = await import("@/lib/documents");
    // Magic bytes HEIC/HEIF (ftyp heic)
    const heic = Buffer.from([
      0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x68, 0x65, 0x69, 0x63, 0x00, 0x00, 0x00, 0x00,
    ]);
    const resultat = await enregistrerDocument("user-1", "FACTURE", heic, "hash-heic");
    expect(resultat).toEqual({ succes: true, documentId: "doc-test-1" });
    expect(uploadMock).toHaveBeenCalledOnce();
  });
});
