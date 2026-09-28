import assert from "node:assert/strict";
import test from "node:test";
import { issuePendingAction, verifyPendingAction } from "@/lib/assistant/pending-action";

const env = { ASSISTANT_ACTION_SECRET: "qa-secret-assistant-core-v1" };

test("token valable pour le bon user", () => {
  const { token } = issuePendingAction({ userId: "user-a", tool: "create_devis", args: { sourceId: "d1" } }, env);
  const v = verifyPendingAction(token, "user-a", env);
  assert.equal(v.ok, true);
  if (v.ok) assert.equal(v.pending.tool, "create_devis");
});

test("user B ne confirme pas l’action de A", () => {
  const { token } = issuePendingAction({ userId: "user-a", tool: "create_devis", args: {} }, env);
  const v = verifyPendingAction(token, "user-b", env);
  assert.equal(v.ok, false);
  if (!v.ok) assert.equal(v.code, "forbidden");
});

test("token expiré refusé", () => {
  const { token } = issuePendingAction({ userId: "user-a", tool: "create_devis", args: {} }, env, Date.now() - 20 * 60 * 1000);
  const v = verifyPendingAction(token, "user-a", env);
  assert.equal(v.ok, false);
  if (!v.ok) assert.equal(v.code, "expired");
});

test("token falsifié refusé", () => {
  const { token } = issuePendingAction({ userId: "user-a", tool: "create_devis", args: {} }, env);
  const v = verifyPendingAction(`${token}x`, "user-a", env);
  assert.equal(v.ok, false);
});
