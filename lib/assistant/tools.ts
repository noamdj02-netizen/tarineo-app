import "server-only";
import { revalidatePath } from "next/cache";
import { compareQuotes } from "@/lib/metier/compare-quotes";
import { listAlerts, listChantiers, listDocuments, rankingRows, transformImportedDocument, getDocument } from "@/lib/metier/queries";
import { buildFollowUpViews, FOLLOW_UP_STATUS_LABEL, isDocumentTransformed } from "@/lib/metier/follow-ups";
import { listStoredFollowUps, scheduleFollowUpForDocument } from "@/lib/metier/follow-up-queries";
import { CLIENT_DEVIS_NEXT_KINDS, KIND_LABEL, marginToMarkup, type ClientDevisNextKind } from "@/lib/metier/types";
import { totalsFromExtract } from "@/lib/metier/types";
import type { AssistantContext } from "./page-context";
import { pendingToolResult, stripUntrustedUserId, type ToolResult } from "./registry";

export { COPILOT_TOOLS, getToolSpec, TOOL_SPECS } from "./registry";
export type { CopilotAction } from "./actions-markup";

function str(v: unknown) {
  return typeof v === "string" ? v.trim() : "";
}

function asRecord(raw: unknown): Record<string, unknown> {
  return raw && typeof raw === "object" && !Array.isArray(raw) ? (raw as Record<string, unknown>) : {};
}

function refreshMetier() {
  for (const p of ["/accueil", "/copilote", "/chantiers", "/client/devis", "/client/bon-commande", "/client/facture", "/distributeur", "/hausses", "/achats", "/comparateur", "/relances"]) {
    revalidatePath(p);
  }
}

function humanWriteError(err: unknown) {
  const message = err instanceof Error ? err.message : "Action impossible.";
  if (/23505|duplicate|unique/i.test(message)) return "Je n’ai pas pu créer la pièce : un document équivalent existe déjà.";
  if (/introuvable|not found/i.test(message)) return "Pièce introuvable parmi vos documents.";
  return message.slice(0, 240);
}

function findChantier(rows: Awaited<ReturnType<typeof listChantiers>>, input: Record<string, unknown>) {
  const id = str(input.chantierId);
  const slug = str(input.slug).toLowerCase();
  const name = str(input.name).toLowerCase() || str(input.chantier).toLowerCase();
  if (id) return rows.find((c) => c.id === id) ?? null;
  if (slug) return rows.find((c) => c.slug === slug) ?? null;
  if (name) {
    const exact = rows.find((c) => c.name.toLowerCase() === name);
    if (exact) return exact;
    const hits = rows.filter((c) => c.name.toLowerCase().includes(name) || (c.client_name ?? "").toLowerCase().includes(name));
    return hits.length === 1 ? hits[0] : null;
  }
  return null;
}

async function transformOwned(
  ctx: AssistantContext,
  sourceId: string,
  kind: "devis" | "bon_commande" | "facture" | "bon_enlevement",
  marginPct?: number,
  clientId?: string,
): Promise<ToolResult> {
  void ctx;
  const src = await getDocument(sourceId);
  if (!src) return { success: false, text: JSON.stringify({ success: false, tool: kind, error: { code: "not_found", message: "Document source introuvable parmi vos pièces." } }) };
  let copySell = false;
  let markup = 1.35;
  if (src.direction === "out") {
    const fromDevis = src.kind === "devis" && CLIENT_DEVIS_NEXT_KINDS.includes(kind as ClientDevisNextKind);
    const fromCommande = src.kind === "bon_commande" && kind === "facture";
    if (!fromDevis && !fromCommande) {
      return { success: false, text: JSON.stringify({ success: false, error: { code: "invalid", message: "Choisissez une commande ou une facture client à partir de ce document." } }) };
    }
    copySell = true;
    markup = 1;
  } else {
    markup = kind === "bon_enlevement" ? 1 : marginToMarkup(typeof marginPct === "number" ? marginPct : 35);
  }
  try {
    const doc = await transformImportedDocument(sourceId, markup, clientId || src.party_id, kind, copySell);
    if (!doc) {
      return { success: false, text: JSON.stringify({ success: false, error: { code: "write_failed", message: "La pièce n’a pas pu être créée." } }) };
    }
    refreshMetier();
    return {
      success: true,
      text: JSON.stringify({
        success: true,
        tool: kind === "devis" ? "create_devis" : kind === "bon_commande" ? "create_commande" : "create_facture",
        result: { documentId: doc.id, reference: doc.title, amount: totalsFromExtract(doc.extract).ht ?? null, href: `/pieces/${doc.id}` },
      }),
      action: { kind: "piece", label: doc.title, href: `/pieces/${doc.id}` },
    };
  } catch (err) {
    return { success: false, text: JSON.stringify({ success: false, error: { code: "write_failed", message: humanWriteError(err) } }) };
  }
}

export async function runCopilotTool(
  ctx: AssistantContext,
  name: string,
  raw: unknown,
  opts?: { serverConfirmed?: boolean },
): Promise<ToolResult> {
  const input = stripUntrustedUserId(asRecord(raw));
  try {
    switch (name) {
      case "list_chantiers": {
        const rows = await listChantiers();
        return {
          success: true,
          text: JSON.stringify({
            success: true,
            result: rows.slice(0, 40).map((c) => ({
              id: c.id,
              slug: c.slug,
              name: c.name,
              status: c.status,
              client: c.client_name,
              docs: c.docs_count,
            })),
          }),
        };
      }
      case "get_chantier": {
        const rows = await listChantiers();
        let c = findChantier(rows, input);
        if (!c && ctx.page?.entityId) c = rows.find((row) => row.id === ctx.page?.entityId) ?? null;
        if (!c && ctx.page?.route) {
          const slug = ctx.page.route.split("/").filter(Boolean)[1]?.toLowerCase() ?? "";
          if (slug) c = rows.find((row) => row.slug === slug) ?? null;
        }
        if (!c && rows.length === 1) c = rows[0];
        if (!c) return { success: false, text: JSON.stringify({ success: false, error: { code: "not_found", message: "Chantier introuvable parmi les vôtres." } }) };
        const [docs, stored] = await Promise.all([listDocuments({ chantierId: c.id }), listStoredFollowUps()]);
        const follow = buildFollowUpViews(docs, stored);
        const achats = docs.filter((d) => d.direction === "in");
        const devis = docs.filter((d) => d.direction === "out" && d.kind === "devis");
        const commandes = docs.filter((d) => d.direction === "out" && d.kind === "bon_commande");
        const factures = docs.filter((d) => d.direction === "out" && d.kind === "facture");
        return {
          success: true,
          text: JSON.stringify({
            success: true,
            result: {
              id: c.id,
              name: c.name,
              slug: c.slug,
              status: c.status,
              client: c.client_name,
              address: c.address,
              achats: achats.slice(0, 20).map((d) => ({ id: d.id, title: d.title, ht: totalsFromExtract(d.extract).ht, href: `/pieces/${d.id}` })),
              devis: devis.slice(0, 20).map((d) => ({ id: d.id, title: d.title, href: `/pieces/${d.id}` })),
              commandes: commandes.slice(0, 20).map((d) => ({ id: d.id, title: d.title, href: `/pieces/${d.id}` })),
              factures: factures.slice(0, 20).map((d) => ({ id: d.id, title: d.title, href: `/pieces/${d.id}` })),
              relances: follow.slice(0, 20).map((r) => ({ status: FOLLOW_UP_STATUS_LABEL[r.status], document: r.document_title })),
            },
          }),
          action: { kind: "chantier", label: c.name, href: `/chantiers/${c.slug}` },
        };
      }
      case "list_documents": {
        const direction = input.direction === "out" ? "out" : input.direction === "in" ? "in" : undefined;
        const kind = str(input.kind) || undefined;
        let docs = await listDocuments({ direction, kind: kind as never });
        const ch = str(input.chantier).toLowerCase();
        if (ch) {
          docs = docs.filter(
            (d) =>
              (d.chantier_name ?? "").toLowerCase().includes(ch) ||
              (d.chantier_slug ?? "").toLowerCase().includes(ch),
          );
        }
        const enseigne = str(input.enseigne).toLowerCase();
        if (enseigne) docs = docs.filter((d) => (d.party_name ?? "").toLowerCase().includes(enseigne));
        return {
          success: true,
          text: JSON.stringify({
            success: true,
            result: docs.slice(0, 40).map((d) => ({
              id: d.id,
              title: d.title,
              direction: d.direction,
              kind: d.kind,
              party: d.party_name,
              chantier: d.chantier_name,
              href: `/pieces/${d.id}`,
            })),
          }),
        };
      }
      case "get_document": {
        const doc = await getDocument(str(input.documentId));
        if (!doc) return { success: false, text: JSON.stringify({ success: false, error: { code: "not_found", message: "Pièce introuvable parmi les vôtres." } }) };
        const ht = totalsFromExtract(doc.extract).ht ?? doc.lines.reduce((s, l) => s + Number(l.sell_price || l.buy_price) * Number(l.qty), 0);
        return {
          success: true,
          text: JSON.stringify({
            success: true,
            result: {
              id: doc.id,
              title: doc.title,
              kind: KIND_LABEL[doc.kind],
              type: doc.kind,
              party: doc.party_name,
              chantier: doc.chantier_name,
              source_document_id: doc.source_document_id,
              status: doc.status,
              ht,
              lines: doc.lines.map((l) => ({ label: l.label, qty: l.qty, unit: l.unit, buy: l.buy_price, sell: l.sell_price })),
              href: `/pieces/${doc.id}`,
            },
          }),
          action: { kind: "piece", label: doc.title, href: `/pieces/${doc.id}` },
        };
      }
      case "list_achats": {
        const rows = await listChantiers();
        const withPage = {
          ...input,
          chantierId: str(input.chantierId) || ctx.page?.entityId || "",
        };
        const c = findChantier(rows, withPage);
        const docs = await listDocuments({
          direction: "in",
          chantierId: c?.id,
        });
        if (str(input.chantierId) || str(input.chantier) || str(input.slug) || str(input.name)) {
          if (!c) return { success: false, text: JSON.stringify({ success: false, error: { code: "not_found", message: "Chantier introuvable parmi les vôtres." } }) };
        }
        return {
          success: true,
          text: JSON.stringify({
            success: true,
            result: docs.slice(0, 40).map((d) => ({
              id: d.id,
              title: d.title,
              party: d.party_name,
              chantier: d.chantier_name,
              ht: totalsFromExtract(d.extract).ht,
              href: `/pieces/${d.id}`,
            })),
          }),
        };
      }
      case "compare_supplier_prices": {
        const aId = str(input.documentIdA);
        const bId = str(input.documentIdB);
        if (aId && bId) {
          const a = await getDocument(aId);
          const b = await getDocument(bId);
          if (!a || !b) return { success: false, text: JSON.stringify({ success: false, error: { code: "not_found", message: "Une des deux pièces est introuvable parmi les vôtres." } }) };
          return { success: true, text: JSON.stringify({ success: true, result: compareQuotes(a, b) }) };
        }
        const alerts = await listAlerts();
        const { enseignes } = await rankingRows();
        return {
          success: true,
          text: JSON.stringify({
            success: true,
            result: {
              hausses: alerts.slice(0, 20).map((x) => ({ label: x.label, old: x.old_price, new: x.new_price, chantier: x.chantier_name })),
              enseignes: enseignes.slice(0, 12).map((e) => ({ nom: e.label, ht: e.amount })),
            },
          }),
        };
      }
      case "list_follow_ups": {
        const [docs, stored] = await Promise.all([listDocuments(), listStoredFollowUps()]);
        const rows = buildFollowUpViews(docs, stored);
        return {
          success: true,
          text: JSON.stringify({
            success: true,
            result: rows.slice(0, 40).map((r) => ({
              id: r.id,
              status: FOLLOW_UP_STATUS_LABEL[r.status],
              contact: r.contact,
              chantier: r.chantier_name,
              document: r.document_title,
              documentId: r.document_id,
              montant: r.amount_ht,
              href: `/pieces/${r.document_id}`,
            })),
          }),
        };
      }
      case "create_devis": {
        if (!opts?.serverConfirmed) {
          return pendingToolResult(ctx, name, input, `Créer un devis client à partir de ${str(input.sourceId)}.`);
        }
        return transformOwned(ctx, str(input.sourceId), "devis", typeof input.marginPct === "number" ? input.marginPct : undefined, str(input.clientId) || undefined);
      }
      case "create_commande": {
        if (!opts?.serverConfirmed) {
          return pendingToolResult(ctx, name, input, `Créer une commande à partir de ${str(input.sourceId)}.`);
        }
        return transformOwned(ctx, str(input.sourceId), "bon_commande");
      }
      case "create_facture": {
        if (!opts?.serverConfirmed) {
          return pendingToolResult(ctx, name, input, `Créer une facture à partir de ${str(input.sourceId)}.`);
        }
        return transformOwned(ctx, str(input.sourceId), "facture");
      }
      case "create_follow_up": {
        if (!opts?.serverConfirmed) {
          return pendingToolResult(ctx, name, input, `Programmer une relance vers ${str(input.to)}.`);
        }
        const documentId = str(input.documentId);
        const doc = await getDocument(documentId);
        if (!doc) {
          return { success: false, text: JSON.stringify({ success: false, error: { code: "not_found", message: "Pièce introuvable parmi les vôtres." } }) };
        }
        const { draftDocumentMail } = await import("@/lib/metier/draft-mail");
        const draft = await draftDocumentMail(doc);
        const days = typeof input.days === "number" && input.days > 0 ? Math.min(30, Math.floor(input.days)) : 3;
        const res = await scheduleFollowUpForDocument({
          documentId,
          to: str(input.to),
          subject: draft.subject,
          body: draft.body,
          days,
        });
        if (!res.ok) {
          return { success: false, text: JSON.stringify({ success: false, error: { code: "write_failed", message: res.error } }) };
        }
        refreshMetier();
        return { success: true, text: JSON.stringify({ success: true, tool: "create_follow_up", result: { id: res.followUp.id } }) };
      }
      case "generate_document_pdf": {
        const doc = await getDocument(str(input.documentId));
        if (!doc) return { success: false, text: JSON.stringify({ success: false, error: { code: "not_found", message: "Pièce introuvable parmi les vôtres." } }) };
        const { pdfFromDocument } = await import("@/lib/metier/pdf/from-document");
        try {
          const { buffer, filename } = await pdfFromDocument(doc);
          if (!buffer?.length) {
            return { success: false, text: JSON.stringify({ success: false, error: { code: "pdf_failed", message: "Le PDF n’a pas pu être généré." } }) };
          }
          return {
            success: true,
            text: JSON.stringify({
              success: true,
              tool: "generate_document_pdf",
              result: { documentId: doc.id, filename, bytes: buffer.length, href: `/api/metier/documents/${doc.id}/pdf` },
            }),
            action: { kind: "piece", label: filename, href: `/api/metier/documents/${doc.id}/pdf` },
          };
        } catch (err) {
          return { success: false, text: JSON.stringify({ success: false, error: { code: "pdf_failed", message: humanWriteError(err) } }) };
        }
      }
      default:
        return { success: false, text: JSON.stringify({ success: false, error: { code: "unknown_tool", message: "Outil inconnu." } }) };
    }
  } catch (err) {
    return { success: false, text: JSON.stringify({ success: false, error: { code: "tool_failed", message: humanWriteError(err) } }) };
  }
}

export { isDocumentTransformed };
