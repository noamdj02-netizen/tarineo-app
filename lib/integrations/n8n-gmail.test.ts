import assert from "node:assert/strict";
import test from "node:test";
import {
  attachmentSortPriority,
  buildIngestIdempotencyKeyFromGmail,
  guessSupplierDocumentKindFromEmail,
  isLikelyBusinessAttachment,
} from "@/lib/integrations/n8n-gmail";

test("idempotency key stable for same gmail message + attachment", () => {
  const a = buildIngestIdempotencyKeyFromGmail({
    gmailMessageId: "18f2abc123",
    attachmentId: "ANGjdJ8x",
  });
  const b = buildIngestIdempotencyKeyFromGmail({
    gmailMessageId: "18f2abc123",
    attachmentId: "ANGjdJ8x",
  });
  assert.equal(a, b);
  assert.ok(a.length >= 8 && a.length <= 128);
});

test("idempotency key differs for different attachments", () => {
  const a = buildIngestIdempotencyKeyFromGmail({
    gmailMessageId: "18f2abc123",
    attachmentId: "A1",
  });
  const b = buildIngestIdempotencyKeyFromGmail({
    gmailMessageId: "18f2abc123",
    attachmentId: "A2",
  });
  assert.notEqual(a, b);
});

test("guessSupplierDocumentKindFromEmail", () => {
  assert.equal(guessSupplierDocumentKindFromEmail("Facture Cedeo mars", "fact.pdf"), "supplier_invoice");
  assert.equal(guessSupplierDocumentKindFromEmail("Devis chantier", "doc.pdf"), "supplier_quote");
  assert.equal(guessSupplierDocumentKindFromEmail("Hello", "image.png"), "needs_review");
});

test("isLikelyBusinessAttachment and sort priority", () => {
  assert.equal(isLikelyBusinessAttachment("devis.pdf"), true);
  assert.equal(isLikelyBusinessAttachment("logo.gif", "image/gif"), true);
  assert.equal(isLikelyBusinessAttachment("notes.txt"), false);
  assert.ok(attachmentSortPriority("a.pdf") < attachmentSortPriority("b.jpg"));
});
