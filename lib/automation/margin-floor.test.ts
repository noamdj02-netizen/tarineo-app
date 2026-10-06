import assert from "node:assert/strict";
import { test } from "node:test";
import { effectiveMarginFloorPct } from "@/lib/automation/margin-floor";
import { emptyWorkspaceSettings } from "@/lib/settings/workspace-settings";

test("effectiveMarginFloorPct — priorité config automation", () => {
  const v = effectiveMarginFloorPct({
    configFloor: 28,
    settings: { ...emptyWorkspaceSettings(), commercial: { ...emptyWorkspaceSettings().commercial, margeCiblePct: 30 } },
    profile: { marge_par_defaut_pct: 35 } as never,
  });
  assert.equal(v, 28);
});

test("effectiveMarginFloorPct — puis paramètres entreprise", () => {
  const v = effectiveMarginFloorPct({
    configFloor: null,
    settings: { ...emptyWorkspaceSettings(), commercial: { ...emptyWorkspaceSettings().commercial, margeCiblePct: 30 } },
    profile: { marge_par_defaut_pct: 35 } as never,
  });
  assert.equal(v, 30);
});

test("effectiveMarginFloorPct — défaut 25", () => {
  const v = effectiveMarginFloorPct({
    configFloor: null,
    settings: emptyWorkspaceSettings(),
    profile: null,
  });
  assert.equal(v, 25);
});
