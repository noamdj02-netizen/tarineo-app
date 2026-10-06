import assert from "node:assert/strict";
import { test } from "node:test";
import {
  pickNextQuoteFollowUpSequence,
  quoteFollowUpClosedForDocument,
} from "@/lib/automation/quote-followup-sequence";
import { DEFAULT_QUOTE_FOLLOWUP_CONFIG } from "@/lib/automation/config";
import type { FollowUp } from "@/lib/metier/follow-ups";
import type { DocumentCard } from "@/lib/metier/types";

function doc(sentAt: string): DocumentCard {
  return {
    id: "d1",
    direction: "out",
    kind: "devis",
    title: "Devis",
    party_id: null,
    chantier_id: null,
    source_document_id: null,
    file_path: "",
    extract: { sent_at: sentAt, last_sent_to: "client@example.com" },
    status: "ready",
    error: "",
    seed_key: null,
    created_at: sentAt,
    party_name: "Client",
    party_address: null,
    party_kind: "client",
    chantier_name: null,
    chantier_slug: null,
    lines: [],
  };
}

test("pickNextQuoteFollowUpSequence — seq 1 après délai", () => {
  const sent = "2026-01-01T10:00:00.000Z";
  const now = Date.parse("2026-01-10T12:00:00.000Z");
  const next = pickNextQuoteFollowUpSequence(doc(sent), [], DEFAULT_QUOTE_FOLLOWUP_CONFIG, now);
  assert.ok(!("skip" in next));
  assert.equal(next.seq, 1);
});

test("pickNextQuoteFollowUpSequence — délai non atteint", () => {
  const sent = "2026-01-09T10:00:00.000Z";
  const now = Date.parse("2026-01-10T08:00:00.000Z");
  const next = pickNextQuoteFollowUpSequence(doc(sent), [], DEFAULT_QUOTE_FOLLOWUP_CONFIG, now);
  assert.ok("skip" in next);
});

test("pickNextQuoteFollowUpSequence — seq 2 après relance 1 envoyée", () => {
  const sent = "2026-01-01T10:00:00.000Z";
  const sentFu: FollowUp = {
    id: "f0",
    document_id: "d1",
    chantier_id: null,
    audience: "client",
    status: "sent",
    scheduled_at: "2026-01-04T08:00:00.000Z",
    last_action_at: sent,
    sent_at: "2026-01-04T09:00:00.000Z",
    to_email: "client@example.com",
    subject: "S",
    body: "B",
    created_at: sent,
    sequence_number: 1,
  };
  const now = Date.parse("2026-01-20T12:00:00.000Z");
  const next = pickNextQuoteFollowUpSequence(doc(sent), [sentFu], DEFAULT_QUOTE_FOLLOWUP_CONFIG, now);
  assert.ok(!("skip" in next));
  assert.equal(next.seq, 2);
});

test("pickNextQuoteFollowUpSequence — max sequences", () => {
  const sent = "2026-01-01T10:00:00.000Z";
  const fus: FollowUp[] = [1, 2].map((n) => ({
    id: `f${n}`,
    document_id: "d1",
    chantier_id: null,
    audience: "client" as const,
    status: "sent" as const,
    scheduled_at: sent,
    last_action_at: sent,
    sent_at: sent,
    to_email: "a@b.fr",
    subject: "S",
    body: "B",
    created_at: sent,
    sequence_number: n,
  }));
  const next = pickNextQuoteFollowUpSequence(
    doc(sent),
    fus,
    { ...DEFAULT_QUOTE_FOLLOWUP_CONFIG, maxSequences: 2 },
    Date.parse("2026-02-01T12:00:00.000Z"),
  );
  assert.ok("skip" in next && next.skip === "max-sequences");
});

test("quoteFollowUpClosedForDocument — refus / réponse", () => {
  const closed: FollowUp = {
    id: "f1",
    document_id: "d1",
    chantier_id: null,
    audience: "client",
    status: "answered",
    scheduled_at: null,
    last_action_at: null,
    sent_at: null,
    to_email: "a@b.fr",
    subject: "",
    body: "",
    created_at: "2026-01-01T00:00:00.000Z",
  };
  assert.equal(quoteFollowUpClosedForDocument([closed], "d1"), true);
  const next = pickNextQuoteFollowUpSequence(doc("2026-01-01T10:00:00.000Z"), [closed], DEFAULT_QUOTE_FOLLOWUP_CONFIG);
  assert.ok("skip" in next && next.skip === "closed");
});

test("pickNextQuoteFollowUpSequence — pas de seq 2 sans relance 1 envoyée", () => {
  const sent = "2026-01-01T10:00:00.000Z";
  const now = Date.parse("2026-01-20T12:00:00.000Z");
  const scheduled: FollowUp = {
    id: "f1",
    document_id: "d1",
    chantier_id: null,
    audience: "client",
    status: "scheduled",
    scheduled_at: "2026-01-10T08:00:00.000Z",
    last_action_at: sent,
    sent_at: null,
    to_email: "client@example.com",
    subject: "S",
    body: "B",
    created_at: sent,
    sequence_number: 1,
  };
  const next = pickNextQuoteFollowUpSequence(doc(sent), [scheduled], DEFAULT_QUOTE_FOLLOWUP_CONFIG, now);
  assert.ok("skip" in next && next.skip === "sequence-already-scheduled");
});
