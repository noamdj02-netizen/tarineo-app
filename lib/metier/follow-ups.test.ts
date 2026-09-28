import { followUpStillEligible, type FollowUp, type FollowUpStatus } from "@/lib/metier/follow-ups";
import type { DocumentCard } from "@/lib/metier/types";
import { cronBearerAuthorized } from "@/lib/metier/cron-auth";
import assert from "node:assert/strict";
import { test } from "node:test";

function doc(over: Partial<DocumentCard> = {}): DocumentCard {
  return {
    id: "d1",
    direction: "out",
    kind: "devis",
    title: "Devis",
    party_id: "p1",
    chantier_id: "c1",
    source_document_id: null,
    file_path: "",
    extract: { sent_at: "2026-09-01T08:00:00.000Z" },
    status: "ready",
    error: "",
    seed_key: null,
    created_at: "2026-09-01T08:00:00.000Z",
    party_name: "Madame Dupont",
    party_address: null,
    party_kind: "client",
    chantier_name: "Dupont",
    chantier_slug: "dupont",
    lines: [],
    ...over,
  };
}

function fu(over: Partial<FollowUp> = {}): FollowUp {
  return {
    id: "f1",
    document_id: "d1",
    chantier_id: "c1",
    audience: "client",
    status: "scheduled",
    scheduled_at: "2026-09-20T07:00:00.000Z",
    last_action_at: null,
    sent_at: null,
    to_email: "a@b.fr",
    subject: "Relance",
    body: "Bonjour",
    created_at: "2026-09-01T08:00:00.000Z",
    ...over,
  };
}

test("cron refuse sans secret", () => {
  assert.equal(cronBearerAuthorized("Bearer abc", undefined), false);
  assert.equal(cronBearerAuthorized("Bearer abc", ""), false);
});

test("cron refuse un mauvais bearer", () => {
  assert.equal(cronBearerAuthorized("Bearer wrong", "secret-token"), false);
  assert.equal(cronBearerAuthorized("secret-token", "secret-token"), false);
});

test("cron accepte le bearer exact", () => {
  assert.equal(cronBearerAuthorized("Bearer secret-token", "secret-token"), true);
});

test("éligible si envoyé, e-mail, pas transformé", () => {
  const d = doc();
  const check = followUpStillEligible(d, [d], fu(), { requirePriorSend: true });
  assert.equal(check.ok, true);
});

test("refuse sans e-mail", () => {
  const d = doc();
  const check = followUpStillEligible(d, [d], fu({ to_email: "" }), { requirePriorSend: true });
  assert.equal(check.ok, false);
  if (!check.ok) assert.equal(check.reason, "email-missing");
});

test("refuse si déjà transformé", () => {
  const devis = doc();
  const cmd = doc({ id: "d2", kind: "bon_commande", source_document_id: "d1" });
  const check = followUpStillEligible(devis, [devis, cmd], fu(), { requirePriorSend: true });
  assert.equal(check.ok, false);
  if (!check.ok) assert.equal(check.reason, "transformed");
});

test("refuse si document erreur (annulé)", () => {
  const d = doc({ status: "error", error: "lu" });
  const check = followUpStillEligible(d, [d], fu(), { requirePriorSend: true });
  assert.equal(check.ok, false);
  if (!check.ok) assert.equal(check.reason, "document-invalid");
});

test("refuse si jamais envoyé (cron)", () => {
  const d = doc({ extract: {} });
  const check = followUpStillEligible(d, [d], fu(), { requirePriorSend: true });
  assert.equal(check.ok, false);
  if (!check.ok) assert.equal(check.reason, "not-sent");
});

test("refuse relance déjà envoyée", () => {
  const d = doc();
  const check = followUpStillEligible(d, [d], fu({ status: "sent", sent_at: "2026-09-02T08:00:00.000Z" }), {
    requirePriorSend: true,
  });
  assert.equal(check.ok, false);
  if (!check.ok) assert.equal(check.reason, "already-sent");
});

test("refuse réponse / done / cancelled", () => {
  const d = doc();
  for (const status of ["answered", "done", "cancelled"] as FollowUpStatus[]) {
    const check = followUpStillEligible(d, [d], fu({ status }), { requirePriorSend: true });
    assert.equal(check.ok, false);
  }
});
