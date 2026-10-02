/**
 * Tests purs — préférences notifications + catalogue intégrations.
 * Exécuter : npx tsx scripts/test-settings-integrations-notifications.ts
 */
import assert from "node:assert/strict";
import {
  DEFAULT_NOTIFICATION_PREFS,
  parseNotificationPreferences,
  preferencesToRow,
} from "../lib/settings/notification-preferences";
import { INTEGRATIONS, isIntegrationId } from "../lib/settings/integrations-catalog";

function testParseDefaults() {
  const p = parseNotificationPreferences(null);
  assert.equal(p.emailQuotes, true);
  assert.equal(p.supplierThresholdPct, 5);
  assert.deepEqual(p.events, {});
}

function testParseRow() {
  const p = parseNotificationPreferences({
    email_quotes: false,
    in_app_supplier_increases: false,
    supplier_threshold_pct: 12.5,
    event_prefs: {
      quote_sent: { email: true, in_app: false },
    },
  });
  assert.equal(p.emailQuotes, false);
  assert.equal(p.inAppSupplierIncreases, false);
  assert.equal(p.supplierThresholdPct, 12.5);
  assert.equal(p.events.quote_sent?.email, true);
  assert.equal(p.events.quote_sent?.inApp, false);
}

function testRoundTrip() {
  const next = {
    ...DEFAULT_NOTIFICATION_PREFS,
    emailQuotes: false,
    supplierThresholdPct: 8,
    events: { invoice_overdue: { email: true, inApp: false } },
  };
  const row = preferencesToRow(next);
  assert.equal(row.email_quotes, false);
  assert.equal(row.supplier_threshold_pct, 8);
  const back = parseNotificationPreferences(row);
  assert.equal(back.emailQuotes, false);
  assert.equal(back.supplierThresholdPct, 8);
  assert.equal(back.events.invoice_overdue?.inApp, false);
}

function testThresholdClamp() {
  const p = parseNotificationPreferences({ supplier_threshold_pct: 250 });
  assert.equal(p.supplierThresholdPct, 100);
  const p2 = parseNotificationPreferences({ supplier_threshold_pct: -3 });
  assert.equal(p2.supplierThresholdPct, 0);
}

function testIntegrationsHonesty() {
  const google = INTEGRATIONS.find((i) => i.id === "google");
  const ms = INTEGRATIONS.find((i) => i.id === "microsoft");
  const api = INTEGRATIONS.find((i) => i.id === "api_tarineo");
  assert.ok(google && google.capability === "oauth");
  assert.ok(ms && ms.capability === "none");
  assert.ok(api && api.capability === "api_keys");
  assert.equal(isIntegrationId("google"), true);
  assert.equal(isIntegrationId("fake"), false);
  // Aucune intégration « connected » au niveau catalogue (état runtime seulement)
  for (const i of INTEGRATIONS) {
    assert.ok(i.capability === "oauth" || i.capability === "ical" || i.capability === "api_keys" || i.capability === "manual_import" || i.capability === "none");
  }
}

testParseDefaults();
testParseRow();
testRoundTrip();
testThresholdClamp();
testIntegrationsHonesty();
console.log("ok — settings integrations/notifications");
