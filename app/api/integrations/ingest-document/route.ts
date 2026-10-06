import { NextResponse } from "next/server";
import { authenticateApiKey, bearerFromRequest } from "@/lib/integrations/api-key-auth";
import { integrationErrorBody, integrationErrorStatus } from "@/lib/integrations/api-errors";
import { runIngestDocument } from "@/lib/integrations/ingest-document";

export const runtime = "nodejs";
export const maxDuration = 120;

function err(
  code: Parameters<typeof integrationErrorBody>[0],
  extra?: { feature?: string; message?: string },
) {
  const body = integrationErrorBody(code, extra);
  return NextResponse.json(body, { status: integrationErrorStatus(code) });
}

export async function POST(req: Request) {
  const token = bearerFromRequest(req);
  const auth = await authenticateApiKey(token);
  if (!auth.ok) {
    return err("unauthorized", { message: "Clé API invalide ou absente." });
  }

  const idempotencyKey = req.headers.get("idempotency-key") ?? req.headers.get("Idempotency-Key") ?? "";
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return err("invalid_request", { message: "multipart/form-data attendu." });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return err("invalid_request", { message: "Champ file requis." });
  }

  const documentKind = String(form.get("document_kind") ?? "").trim();
  let metadata: { chantier_id?: string | null; title?: string | null } | undefined;
  const metaRaw = form.get("metadata");
  if (typeof metaRaw === "string" && metaRaw.trim()) {
    try {
      const parsed = JSON.parse(metaRaw) as Record<string, unknown>;
      metadata = {
        chantier_id: typeof parsed.chantier_id === "string" ? parsed.chantier_id : null,
        title: typeof parsed.title === "string" ? parsed.title : null,
      };
    } catch {
      return err("invalid_request", { message: "metadata doit être du JSON valide." });
    }
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await runIngestDocument({
    auth: auth.ctx,
    fileName: file.name || "document.pdf",
    declaredMime: file.type || "application/octet-stream",
    buffer,
    documentKind,
    idempotencyKey,
    metadata,
  });

  if (!result.ok) {
    if (result.code === "feature_requires_pro") {
      return err("feature_requires_pro", { feature: "mcp_business", message: result.message });
    }
    if (result.code === "forbidden") {
      return err("forbidden", { message: result.message });
    }
    return err(result.code, { message: result.message });
  }

  return NextResponse.json(
    { ...result.response, idempotent_replay: result.reused },
    { status: result.reused ? 200 : 201 },
  );
}
