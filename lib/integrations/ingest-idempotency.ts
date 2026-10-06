import "server-only";

import type { createAdminClient } from "@/lib/supabase/admin";
import type { IngestDocumentResponse } from "@/lib/integrations/ingest-response";

type Admin = ReturnType<typeof createAdminClient>;

function isMissingTable(error: { message?: string; code?: string } | null) {
  const m = error?.message ?? "";
  return error?.code === "42P01" || /does not exist/i.test(m);
}

export async function loadIdempotentIngest(
  admin: Admin,
  userId: string,
  idempotencyKey: string,
  contentSha256: string,
): Promise<
  | { status: "miss" }
  | { status: "hit"; response: IngestDocumentResponse }
  | { status: "conflict" }
> {
  const { data, error } = await admin
    .from("integration_ingest_idempotency")
    .select("content_sha256, response_json")
    .eq("user_id", userId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) return { status: "miss" };
    throw error;
  }
  if (!data) return { status: "miss" };
  if (data.content_sha256 !== contentSha256) return { status: "conflict" };
  return { status: "hit", response: data.response_json as IngestDocumentResponse };
}

export async function saveIdempotentIngest(
  admin: Admin,
  input: {
    userId: string;
    idempotencyKey: string;
    contentSha256: string;
    documentId: string;
    response: IngestDocumentResponse;
  },
): Promise<void> {
  const { error } = await admin.from("integration_ingest_idempotency").insert({
    user_id: input.userId,
    idempotency_key: input.idempotencyKey,
    content_sha256: input.contentSha256,
    document_id: input.documentId,
    response_json: input.response,
  });
  if (error) {
    if (error.code === "23505") return;
    if (isMissingTable(error)) return;
    throw error;
  }
}

export async function assertIdempotencyContentMatch(
  admin: Admin,
  userId: string,
  idempotencyKey: string,
  contentSha256: string,
): Promise<"ok" | "conflict" | "miss"> {
  const { data, error } = await admin
    .from("integration_ingest_idempotency")
    .select("content_sha256")
    .eq("user_id", userId)
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (error) {
    if (isMissingTable(error)) return "miss";
    throw error;
  }
  if (!data) return "miss";
  if (data.content_sha256 !== contentSha256) return "conflict";
  return "ok";
}
