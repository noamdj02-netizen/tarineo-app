import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(() => {
    throw new Error("NOT_FOUND");
  }),
}));

describe("features.clientBilling", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("est false quand FEATURE_CLIENT_BILLING est vide", async () => {
    vi.stubEnv("FEATURE_CLIENT_BILLING", "");
    const { features } = await import("@/lib/features");
    expect(features.clientBilling).toBe(false);
  });

  it("layout devis-clients appelle notFound quand flag absent", async () => {
    vi.stubEnv("FEATURE_CLIENT_BILLING", "");
    const { verifierFeaturePage } = await import("@/lib/verifierFeaturePage");
    expect(() => verifierFeaturePage("clientBilling")).toThrow("NOT_FOUND");
  });
});
