import { afterEach, describe, expect, it, vi } from "vitest";
import {
  erreurCheckoutSiConfigIncomplete,
  estCleStripeLive,
  validerConfigStripeLive,
} from "@/lib/stripeConfig";

describe("stripeConfig", () => {
  const env = { ...process.env };

  afterEach(() => {
    process.env = { ...env };
    vi.unstubAllEnvs();
  });

  it("n'exige pas les price IDs en mode test", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_abc");
    expect(estCleStripeLive()).toBe(false);
    expect(validerConfigStripeLive().ok).toBe(true);
    expect(erreurCheckoutSiConfigIncomplete()).toBeNull();
  });

  it("bloque le checkout si clé live sans price IDs", () => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_live_abc");
    vi.stubEnv("STRIPE_PRICE_STARTER", "");
    vi.stubEnv("STRIPE_PRICE_PRO", "price_live_pro");
    expect(estCleStripeLive()).toBe(true);
    const validation = validerConfigStripeLive();
    expect(validation.ok).toBe(false);
    if (!validation.ok) {
      expect(validation.manquants).toContain("STRIPE_PRICE_STARTER");
    }
    expect(erreurCheckoutSiConfigIncomplete()).toMatch(/pas disponible/i);
  });
});
