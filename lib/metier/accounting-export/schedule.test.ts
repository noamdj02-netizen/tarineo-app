import assert from "node:assert/strict";
import test from "node:test";
import { computeNextRun } from "@/lib/metier/accounting-export/schedule";

test("computeNextRun picks future day", () => {
  const iso = computeNextRun({ frequency: "monthly", dayOfMonth: 15, from: new Date("2026-03-10T10:00:00Z") });
  const d = new Date(iso);
  assert.ok(d.getTime() > Date.parse("2026-03-10T10:00:00Z"));
});
