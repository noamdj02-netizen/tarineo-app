import "server-only";

import { createHash } from "node:crypto";
import { canUseFeature } from "@/lib/billing/entitlements-core";
import { planForUserId } from "@/lib/billing/plan";
import {
  parseIntegrationDocumentKind,
  resolveIntegrationKind,
  type IntegrationDocumentKind,
} from "@/lib/integrations/document-kind";
import { loadIdempotentIngest, saveIdempotentIngest } from "@/lib/integrations/ingest-idempotency";
import { documentToIngestResponse, type IngestDocumentResponse } from "@/lib/integrations/ingest-response";
import { checkIngestRateLimit } from "@/lib/integrations/ingest-rate-limit";
import { validateIngestFile } from "@/lib/integrations/validate-ingest-file";
import { ingestDocumentWithAgent } from "@/lib/metier/document-agent/extract-with-agent";
import { saveExtractedDocumentForUser } from "@/lib/metier/save-document-for-user";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ApiKeyAuthContext } from "@/lib/integrations/api-key-auth";

export type IngestDocumentInput = {
  auth: ApiKeyAuthContext;
  fileName: string;
  declaredMime: string;
  buffer: Buffer;
  documentKind: string;
  idempotencyKey: string;
  metadata?: {
    chantier_id?: string | null;
    title?: string | null;
  };
};

export type IngestDocumentResult =
  | { ok: true; response: IngestDocumentResponse; reused: boolean }
  | {
      ok: false;
      code:
        | "feature_requires_pro"
        | "forbidden"
        | "invalid_file"
        | "file_too_large"
        | "idempotency_conflict"
        | "extraction_failed"
        | "rate_limited"
        | "internal_error"
        | "invalid_request";
      message?: string;
    };

function normalizeIdempotencyKey(raw: string): string | null {
  const key = raw.trim();
  if (key.length < 8 || key.length > 128) return null;
  return key;
}

export async function runIngestDocument(input: IngestDocumentInput): Promise<IngestDocumentResult> {
  if (!isSupabaseConfigured()) {
    return { ok: false, code: "internal_error", message: "Base de données indisponible." };
  }

  const idempotencyKey = normalizeIdempotencyKey(input.idempotencyKey);
  if (!idempotencyKey) {
    return { ok: false, code: "invalid_request", message: "Idempotency-Key invalide (8 à 128 caractères)." };
  }

  const integrationKind = parseIntegrationDocumentKind(input.documentKind);
  if (!integrationKind) {
    return {
      ok: false,
      code: "invalid_request",
      message: `document_kind invalide. Valeurs : supplier_quote, supplier_invoice, …`,
    };
  }

  const plan = await planForUserId(input.auth.userId);
  if (!canUseFeature(plan, "mcp_business")) {
    return { ok: false, code: "feature_requires_pro" };
  }

  if (!input.auth.scopes.includes("write")) {
    return { ok: false, code: "forbidden", message: "Scope write requis pour l’import." };
  }

  if (!checkIngestRateLimit(input.auth.userId)) {
    return { ok: false, code: "rate_limited" };
  }

  const validated = validateIngestFile(input.fileName, input.declaredMime, input.buffer);
  if (!validated.ok) {
    return { ok: false, code: validated.code, message: validated.message };
  }

  const contentSha256 = createHash("sha256").update(input.buffer).digest("hex");
  const admin = createAdminClient();

  const idem = await loadIdempotentIngest(admin, input.auth.userId, idempotencyKey, contentSha256);
  if (idem.status === "hit") return { ok: true, response: idem.response, reused: true };
  if (idem.status === "conflict") return { ok: false, code: "idempotency_conflict" };

  const safeName = input.fileName.replace(/[^\w.\-]+/g, "_") || "document";
  const filePath = `${input.auth.userId}/${contentSha256}-${safeName}`;
  const { error: uploadError } = await admin.storage.from("documents").upload(filePath, input.buffer, {
    contentType: validated.mime,
    upsert: true,
  });
  if (uploadError) {
    return { ok: false, code: "internal_error", message: "Stockage du fichier impossible." };
  }

  let extracted;
  let agentMeta;
  let recap;
  try {
    const result = await ingestDocumentWithAgent({
      fileName: input.fileName,
      mime: validated.mime,
      base64: input.buffer.toString("base64"),
    });
    extracted = result.extracted;
    agentMeta = result.agent;
    recap = result.recap;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Extraction impossible.";
    return { ok: false, code: "extraction_failed", message };
  }

  const mapping = resolveIntegrationKind(integrationKind);
  const direction = mapping.direction;
  const kind = mapping.kind;
  const partyKind = extracted.party_kind || mapping.defaultPartyKind;
  const partyName = extracted.party_name?.trim() || "Fournisseur";
  const title = input.metadata?.title?.trim() || extracted.title?.trim() || safeName;
  const chantierId = input.metadata?.chantier_id ?? null;

  const lines = extracted.lines.map((l) => ({
    label: l.label,
    qty: l.qty,
    unit: l.unit,
    buy_price: l.buy_price,
    sell_price: direction === "out" ? (l.sell_price ?? l.buy_price) : undefined,
  }));

  const responseType: IntegrationDocumentKind = integrationKind;

  try {
    const doc = await saveExtractedDocumentForUser(admin, input.auth.userId, {
      title,
      direction,
      kind,
      partyName,
      partyKind,
      chantierId,
      filePath,
      extract: {
        confirmed: true,
        totals: extracted.totals,
        lines: extracted.lines,
        file_sha256: contentSha256,
        document_number: extracted.document_number ?? null,
        issue_date: extracted.issue_date ?? null,
        party_address: extracted.party_address ?? null,
        raw_model: extracted,
        vendor_key: agentMeta.vendor_key,
        profile_version: agentMeta.profile_version,
        read_recap: recap,
        source: "integration_ingest",
      },
      lines,
    });

    const response = documentToIngestResponse(doc, responseType);
    await saveIdempotentIngest(admin, {
      userId: input.auth.userId,
      idempotencyKey,
      contentSha256,
      documentId: doc.id,
      response,
    });
    return { ok: true, response, reused: false };
  } catch {
    return { ok: false, code: "internal_error", message: "Enregistrement du document impossible." };
  }
}
