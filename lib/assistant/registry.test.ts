import assert from "node:assert/strict";
import test from "node:test";
import { getToolSpec, pendingToolResult, stripUntrustedUserId, TOOL_SPECS } from "@/lib/assistant/registry";

const envSecret = { ASSISTANT_ACTION_SECRET: "qa-registry-secret" };

test("tools lecture vs mutation", () => {
  assert.equal(getToolSpec("list_chantiers")?.mode, "read");
  assert.equal(getToolSpec("create_devis")?.requiresConfirmation, true);
  assert.equal(getToolSpec("create_commande")?.requiresConfirmation, true);
  assert.equal(getToolSpec("create_facture")?.requiresConfirmation, true);
  assert.equal(getToolSpec("create_follow_up")?.requiresConfirmation, true);
  assert.equal(getToolSpec("inconnu"), null);
});

test("user_id fourni par le LLM est retiré", () => {
  const clean = stripUntrustedUserId({ user_id: "attacker", userId: "attacker", sourceId: "d1" });
  assert.equal("user_id" in clean, false);
  assert.equal("userId" in clean, false);
  assert.equal(clean.sourceId, "d1");
});

test("mutation sans confirmation serveur → awaiting + token", () => {
  process.env.ASSISTANT_ACTION_SECRET = envSecret.ASSISTANT_ACTION_SECRET;
  const out = pendingToolResult({ userId: "user-a" }, "create_devis", { sourceId: "d1" }, "preview");
  assert.equal(out.success, false);
  assert.equal(out.awaiting, true);
  const parsed = JSON.parse(out.text) as { status?: string; actionId?: string };
  assert.equal(parsed.status, "awaiting_confirmation");
  assert.ok(parsed.actionId?.includes("."));
  assert.equal(out.action?.kind, "confirm");
});

test("chaque mutation exige confirmation", () => {
  for (const t of TOOL_SPECS.filter((x) => x.mode === "mutation")) {
    assert.equal(t.requiresConfirmation, true);
  }
});
