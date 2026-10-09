import assert from "node:assert/strict";
import { test } from "node:test";
import { formatMailClosing } from "@/lib/metier/mail-closing";

test("formatMailClosing préfère le bloc signature", () => {
  assert.equal(
    formatMailClosing({
      signOff: "Cordialement,",
      signatureText: "Jean\nSARL X",
      companyName: "Ignored",
    }),
    "Cordialement,\nJean\nSARL X",
  );
});

test("formatMailClosing fallback profil si pas de signature", () => {
  const out = formatMailClosing({
    signOff: "",
    signatureText: "",
    companyName: "SARL X",
    phone: "06 00 00 00 00",
    email: "a@b.fr",
  });
  assert.match(out, /^Cordialement,/);
  assert.match(out, /SARL X/);
  assert.match(out, /a@b\.fr/);
});
