import assert from "node:assert/strict";
import test from "node:test";
import { previousPeriod, resolveDateRangePreset } from "@/lib/metier/accounting-export/period";

test("previousPeriod monthly", () => {
  const p = previousPeriod("monthly", new Date("2026-03-15T12:00:00Z"));
  assert.equal(p.start, "2026-02-01");
  assert.equal(p.end, "2026-02-28");
});

test("previousPeriod yearly", () => {
  const p = previousPeriod("yearly", new Date("2026-06-01T12:00:00Z"));
  assert.equal(p.start, "2025-01-01");
  assert.equal(p.end, "2025-12-31");
});

test("resolveDateRangePreset year", () => {
  const r = resolveDateRangePreset("year", new Date("2026-06-01T12:00:00Z"));
  assert.match(r.start, /^\d{4}-01-01$/);
  assert.match(r.end, /-12-31$/);
});
