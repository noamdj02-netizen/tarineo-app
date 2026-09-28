import type Anthropic from "@anthropic-ai/sdk";
import type { CopilotAction } from "./actions-markup";
import type { AssistantContext } from "./page-context";
import { issuePendingAction } from "./pending-action";

export type ToolMode = "read" | "mutation";

export type ToolSpec = {
  name: string;
  description: string;
  mode: ToolMode;
  requiresConfirmation: boolean;
  input_schema: Anthropic.Tool["input_schema"];
};

export const TOOL_SPECS: ToolSpec[] = [
  {
    name: "list_chantiers",
    mode: "read",
    requiresConfirmation: false,
    description: "Liste les chantiers de l’artisan connecté (focus, pause, fini) avec client et nombre de pièces.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "get_chantier",
    mode: "read",
    requiresConfirmation: false,
    description: "Point sur un chantier : client, adresse, statut, documents, achats, devis, commandes, factures, relances. id, slug ou nom. N’invente rien.",
    input_schema: {
      type: "object",
      properties: {
        chantierId: { type: "string" },
        slug: { type: "string" },
        name: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "list_documents",
    mode: "read",
    requiresConfirmation: false,
    description: "Liste les pièces de l’artisan. direction=in achats, out client. kind: devis|facture|bon_commande|bon_enlevement.",
    input_schema: {
      type: "object",
      properties: {
        direction: { type: "string", enum: ["in", "out"] },
        kind: { type: "string", enum: ["devis", "facture", "bon_commande", "bon_enlevement", "bl", "autre"] },
        chantier: { type: "string" },
        enseigne: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_document",
    mode: "read",
    requiresConfirmation: false,
    description: "Détail d’une pièce appartenant à l’artisan : type, client, chantier, montants, lignes, relations.",
    input_schema: {
      type: "object",
      properties: { documentId: { type: "string" } },
      required: ["documentId"],
      additionalProperties: false,
    },
  },
  {
    name: "list_achats",
    mode: "read",
    requiresConfirmation: false,
    description: "Achats (pièces direction in) d’un chantier de l’artisan. Pas d’invention.",
    input_schema: {
      type: "object",
      properties: { chantierId: { type: "string" }, chantier: { type: "string" } },
      additionalProperties: false,
    },
  },
  {
    name: "compare_supplier_prices",
    mode: "read",
    requiresConfirmation: false,
    description: "Compare deux devis d’achat existants (documentIdA et documentIdB), ou résume les hausses réellement détectées s’il n’y a pas deux pièces. Toujours appeler l’outil : il dira s’il manque un second devis. N’invente pas d’évolution.",
    input_schema: {
      type: "object",
      properties: { documentIdA: { type: "string" }, documentIdB: { type: "string" } },
      additionalProperties: false,
    },
  },
  {
    name: "list_follow_ups",
    mode: "read",
    requiresConfirmation: false,
    description: "Relances de l’artisan (à traiter, programmées, envoyées). Lecture seule.",
    input_schema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "create_devis",
    mode: "mutation",
    requiresConfirmation: true,
    description: "Prépare un devis client à partir d’un achat (sourceId). N’écrit rien tant que l’artisan n’a pas confirmé via le bouton.",
    input_schema: {
      type: "object",
      properties: {
        sourceId: { type: "string" },
        marginPct: { type: "number" },
        clientId: { type: "string" },
      },
      required: ["sourceId"],
      additionalProperties: false,
    },
  },
  {
    name: "create_commande",
    mode: "mutation",
    requiresConfirmation: true,
    description: "Prépare une commande client à partir d’un devis client (sourceId). Confirmation bouton obligatoire.",
    input_schema: {
      type: "object",
      properties: { sourceId: { type: "string" } },
      required: ["sourceId"],
      additionalProperties: false,
    },
  },
  {
    name: "create_facture",
    mode: "mutation",
    requiresConfirmation: true,
    description: "Prépare une facture client à partir d’un devis ou d’une commande (sourceId). Confirmation bouton obligatoire.",
    input_schema: {
      type: "object",
      properties: { sourceId: { type: "string" } },
      required: ["sourceId"],
      additionalProperties: false,
    },
  },
  {
    name: "create_follow_up",
    mode: "mutation",
    requiresConfirmation: true,
    description: "Programme une relance (n’envoie pas l’e-mail tout de suite). Confirmation bouton obligatoire.",
    input_schema: {
      type: "object",
      properties: {
        documentId: { type: "string" },
        to: { type: "string" },
        days: { type: "number" },
      },
      required: ["documentId", "to"],
      additionalProperties: false,
    },
  },
  {
    name: "generate_document_pdf",
    mode: "read",
    requiresConfirmation: false,
    description: "Vérifie qu’un PDF réel peut être généré pour une pièce de l’artisan. Retourne le nom et la taille, pas le fichier.",
    input_schema: {
      type: "object",
      properties: { documentId: { type: "string" } },
      required: ["documentId"],
      additionalProperties: false,
    },
  },
];

export const COPILOT_TOOLS: Anthropic.Tool[] = TOOL_SPECS.map((t) => ({
  name: t.name,
  description: t.description,
  input_schema: t.input_schema,
}));

export function getToolSpec(name: string) {
  return TOOL_SPECS.find((t) => t.name === name) ?? null;
}

export type ToolResult = {
  success: boolean;
  text: string;
  action?: CopilotAction;
  reveal?: string;
  awaiting?: boolean;
};

export function stripUntrustedUserId(raw: Record<string, unknown>) {
  const { user_id: _a, userId: _b, ...rest } = raw;
  void _a;
  void _b;
  return rest;
}

export function pendingToolResult(ctx: AssistantContext, tool: string, args: Record<string, unknown>, preview: string): ToolResult {
  const { token } = issuePendingAction({ userId: ctx.userId, tool, args });
  return {
    success: false,
    awaiting: true,
    text: JSON.stringify({
      success: false,
      status: "awaiting_confirmation",
      tool,
      actionId: token,
      preview,
      message: "En attente de confirmation de l’artisan (bouton). Ne pas relancer l’outil avec confirm=true.",
    }),
    action: { kind: "confirm", label: "Confirmer", actionId: token },
  };
}
