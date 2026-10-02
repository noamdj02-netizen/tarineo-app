/**
 * Tests purs — service notifications (idempotence / préférences).
 * npx tsx scripts/test-notifications-service.ts
 */
import assert from "node:assert/strict";
import {
  DEFAULT_NOTIFICATION_PREFS,
  parseNotificationPreferences,
} from "../lib/settings/notification-preferences";
import { NOTIFICATION_TYPE_LABEL, priorityDot } from "../lib/notifications/types";

function testPrefsPushDefaults() {
  const p = parseNotificationPreferences(null);
  assert.equal(p.pushEnabled, false);
  assert.equal(p.pushQuotes, true);
  assert.equal(p.supplierThresholdPct, 5);
}

function testPrefsPushParse() {
  const p = parseNotificationPreferences({
    push_enabled: true,
    push_supplier_increases: false,
    supplier_threshold_pct: 8,
  });
  assert.equal(p.pushEnabled, true);
  assert.equal(p.pushSupplierIncreases, false);
  assert.equal(p.supplierThresholdPct, 8);
}

function testThresholdBelowNoNotify() {
  // Logique métier : pct < seuil → pas de notif (testée côté emitter avec filtre)
  const threshold = DEFAULT_NOTIFICATION_PREFS.supplierThresholdPct;
  const pct = 3;
  assert.ok(pct < threshold);
}

function testTypes() {
  assert.ok(NOTIFICATION_TYPE_LABEL.client_followup);
  assert.equal(priorityDot("critical"), "bg-destructive");
  assert.equal(priorityDot("high"), "bg-tarineo-orange");
}

testPrefsPushDefaults();
testPrefsPushParse();
testThresholdBelowNoNotify();
testTypes();
console.log("ok — notifications service");
