import { describe, expect, it } from "vitest";
import { messageErreurEnvoiDocument } from "@/lib/erreursUploadClient";

describe("messageErreurEnvoiDocument", () => {
  it("distingue erreur réseau (TypeError fetch)", () => {
    const { message, type } = messageErreurEnvoiDocument(new TypeError("Failed to fetch"));
    expect(type).toBe("reseau");
    expect(message).toMatch(/réseau/i);
  });

  it("distingue erreur serveur générique", () => {
    const { message, type } = messageErreurEnvoiDocument(new Error("Internal Server Error"));
    expect(type).toBe("serveur");
    expect(message).toMatch(/notre côté/i);
  });
});
