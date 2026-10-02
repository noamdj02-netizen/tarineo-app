import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveVendorKey, vendorDisplayName } from "@/lib/metier/document-agent/vendor-key";

test("resolveVendorKey reconnaît Point P", () => {
  assert.equal(resolveVendorKey("Point P Lyon Est"), "point_p");
  assert.equal(resolveVendorKey("", "devis-point-p.pdf"), "point_p");
});

test("resolveVendorKey reconnaît Cedeo", () => {
  assert.equal(resolveVendorKey("CEDEO Villeurbanne"), "cedeo");
});

test("resolveVendorKey reconnaît Tereva", () => {
  assert.equal(resolveVendorKey("TEREVA Lyon"), "tereva");
});

test("resolveVendorKey inconnu", () => {
  assert.equal(resolveVendorKey("Grossiste local"), "unknown");
});

test("vendorDisplayName", () => {
  assert.equal(vendorDisplayName("point_p"), "Point.P");
  assert.match(vendorDisplayName("unknown"), /non reconnue/i);
});
