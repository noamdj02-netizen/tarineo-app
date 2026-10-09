import assert from "node:assert/strict";
import { test } from "node:test";
import { emptyWorkspaceSettings, parseWorkspaceSettings } from "@/lib/settings/workspace-settings";

test("parseWorkspaceSettings rétrocompat sans email", () => {
  const out = parseWorkspaceSettings({
    commercial: { margeCiblePct: 40 },
    documents: {},
    ai: {},
  });
  assert.equal(out.email.signOff, "");
  assert.equal(out.email.signatureText, "");
  assert.equal(out.commercial.margeCiblePct, 40);
});

test("parseWorkspaceSettings lit email", () => {
  const out = parseWorkspaceSettings({
    ...emptyWorkspaceSettings(),
    email: {
      signOff: "Bien à vous,",
      signatureText: "Ada Lovelace\nTARINEO",
      fromName: "Ada",
      logoFromEmailUrl: "https://example.com/l.png",
    },
  });
  assert.equal(out.email.signOff, "Bien à vous,");
  assert.match(out.email.signatureText, /Ada Lovelace/);
  assert.equal(out.email.fromName, "Ada");
});

test("parseWorkspaceSettings lit objectifs mensuels fournisseur", () => {
  const out = parseWorkspaceSettings({
    commercial: {
      distributorGoalsHt: { Pompée: 60000 },
      distributorGoalsMonthlyHt: { Pompée: 5000 },
    },
  });
  assert.equal(out.commercial.distributorGoalsHt.Pompée, 60000);
  assert.equal(out.commercial.distributorGoalsMonthlyHt.Pompée, 5000);
});

test("parseWorkspaceSettings rétrocompat sans objectifs mensuels", () => {
  const out = parseWorkspaceSettings({
    commercial: { distributorGoalsHt: { PointP: 10000 } },
  });
  assert.equal(out.commercial.distributorGoalsHt.PointP, 10000);
  assert.deepEqual(out.commercial.distributorGoalsMonthlyHt, {});
});
