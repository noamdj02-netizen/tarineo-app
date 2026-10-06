import assert from "node:assert/strict";
import { test } from "node:test";
import { marginBelowKey, quoteFollowupScheduleKey, quoteFollowupSendKey } from "@/lib/automation/types";

test("quote_followup send key stable par document et séquence", () => {
  const a = quoteFollowupSendKey("doc-uuid", 1);
  const b = quoteFollowupSendKey("doc-uuid", 1);
  const c = quoteFollowupSendKey("doc-uuid", 2);
  assert.equal(a, "quote_followup:send:doc-uuid:1");
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test("quote_followup schedule key distinct de send", () => {
  const schedule = quoteFollowupScheduleKey("doc-uuid", 1);
  const send = quoteFollowupSendKey("doc-uuid", 1);
  assert.equal(schedule, "quote_followup:schedule:doc-uuid:1");
  assert.notEqual(schedule, send);
});

test("margin_below key inclut floor et jour", () => {
  assert.equal(marginBelowKey("d1", 25, "2026-10-06"), "margin_below:document:d1:25.0:2026-10-06");
});
