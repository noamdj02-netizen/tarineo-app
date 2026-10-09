import assert from "node:assert/strict";
import { test } from "node:test";
import { CHECK_IN_SUBJECT } from "@/emails/check-in";

test("check-in subject is set", () => {
  assert.match(CHECK_IN_SUBJECT, /\?$/);
  assert.ok(CHECK_IN_SUBJECT.length > 8);
});
