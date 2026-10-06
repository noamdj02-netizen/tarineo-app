import type { AuthInfo, McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { canUseFeature } from "@/lib/billing/entitlements-core";
import { planForUserId } from "@/lib/billing/plan";
import { INTEGRATION_DOCUMENT_KINDS } from "@/lib/integrations/document-kind";
import { documentToIngestResponse } from "@/lib/integrations/ingest-response";
import { runIngestDocument } from "@/lib/integrations/ingest-document";
import { getUserId, McpAuthError, requireScope } from "@/lib/mcp/auth";
import type { Scope } from "@/lib/mcp/types";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getDocumentForUser,
  listDocumentsForUserApi,
} from "@/lib/metier/save-document-for-user";

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

const ok = (payload: unknown): ToolResult => ({
  content: [
    { type: "text", text: typeof payload === "string" ? payload : JSON.stringify(payload, null, 2) },
  ],
});

const fail = (message: string): ToolResult => ({
  content: [{ type: "text", text: message }],
  isError: true,
});

async function requireTarineoBusiness(userId: string): Promise<void> {
  const plan = await planForUserId(userId);
  if (!canUseFeature(plan, "mcp_business")) {
    throw new McpAuthError(
      JSON.stringify({ error: "feature_requires_pro", feature: "mcp_business" }),
    );
  }
}

function tarineoGuarded<A>(
  scope: Scope,
  fn: (args: A, userId: string, scopes: Scope[]) => Promise<ToolResult>,
) {
  return async (args: A, ctx: { http?: { authInfo?: AuthInfo } }): Promise<ToolResult> => {
    try {
      const authInfo = ctx.http?.authInfo;
      requireScope(authInfo, scope);
      const userId = getUserId(authInfo);
      const scopes = (authInfo?.scopes ?? []).filter((s): s is Scope => s === "read" || s === "write");
      await requireTarineoBusiness(userId);
      return await fn(args, userId, scopes);
    } catch (err) {
      if (err instanceof McpAuthError) return fail(err.message);
      console.error("[tarineo-mcp]", err);
      return fail("Erreur interne TARINEO métier.");
    }
  };
}

const id = z.string().uuid();

export function registerTarineoTools(server: McpServer): void {
  server.registerTool(
    "tarineo_ingest_document",
    {
      title: "TARINEO — Importer un document",
      description:
        "Envoie un PDF ou une image : extraction IA + enregistrement document métier. Nécessite plan Pro, scope write, et idempotency_key unique.",
      inputSchema: z.object({
        file_name: z.string().min(1).max(200),
        mime_type: z.string().min(3).max(80),
        content_base64: z.string().min(8),
        document_kind: z.enum([
          "supplier_quote",
          "supplier_invoice",
          "supplier_purchase_order",
          "supplier_delivery_note",
          "customer_quote",
          "customer_invoice",
          "customer_purchase_order",
        ]),
        idempotency_key: z.string().min(8).max(128),
        metadata: z
          .object({
            chantier_id: z.string().uuid().optional(),
            title: z.string().max(200).optional(),
          })
          .optional(),
      }),
    },
    tarineoGuarded(
      "write",
      async ({ file_name, mime_type, content_base64, document_kind, idempotency_key, metadata }, userId, scopes) => {
        const buffer = Buffer.from(content_base64, "base64");
        const result = await runIngestDocument({
          auth: { userId, keyId: "mcp", scopes },
          fileName: file_name,
          declaredMime: mime_type,
          buffer,
          documentKind: document_kind,
          idempotencyKey: idempotency_key,
          metadata,
        });
        if (!result.ok) return fail(JSON.stringify({ error: result.code, message: result.message }));
        return ok(result.response);
      },
    ),
  );

  server.registerTool(
    "tarineo_list_documents",
    {
      title: "TARINEO — Lister les documents",
      description: "Liste les documents métier de l’utilisateur (max 50). Plan Pro requis.",
      inputSchema: z.object({
        limit: z.number().int().min(1).max(50).optional(),
      }),
    },
    tarineoGuarded("read", async ({ limit }, userId, _scopes) => {
      const admin = createAdminClient();
      const docs = await listDocumentsForUserApi(admin, userId, limit ?? 50);
      return ok(
        docs.map((d) => ({
          id: d.id,
          title: d.title,
          direction: d.direction,
          kind: d.kind,
          party_name: d.party_name,
          chantier_id: d.chantier_id,
          created_at: d.created_at,
          line_count: d.lines.length,
        })),
      );
    }),
  );

  server.registerTool(
    "tarineo_get_document",
    {
      title: "TARINEO — Détail document",
      description: "Renvoie un document métier et ses lignes. Plan Pro requis.",
      inputSchema: z.object({ document_id: id }),
    },
    tarineoGuarded("read", async ({ document_id }, userId, _scopes) => {
      const admin = createAdminClient();
      const doc = await getDocumentForUser(admin, userId, document_id);
      if (!doc) return fail("Document introuvable.");
      const type =
        doc.direction === "in"
          ? doc.kind === "facture"
            ? "supplier_invoice"
            : "supplier_quote"
          : "customer_quote";
      return ok(documentToIngestResponse(doc, type as (typeof INTEGRATION_DOCUMENT_KINDS)[number]));
    }),
  );
}
