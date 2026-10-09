"use server";

import { createHash } from "node:crypto";
import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { DEFAULT_MODEL, isModelId } from "@/lib/models";
import { getDb } from "@/lib/db";
import { DEVIS_BTP_JSON_SHAPE, DEVIS_BTP_SYSTEM } from "@/lib/metier/devis/btp-prompt";
import { draftFromProposal, type DevisProposal, type DevisProposalLine } from "@/lib/metier/devis/from-proposal";
import { matchChantiers, matchClients } from "@/lib/metier/devis/match";
import { persistDevisDraft } from "@/lib/metier/devis/persist";
import { calculateQuoteTotals, formatEuro } from "@/lib/metier/devis/totals";
import { listChantiers, listParties } from "@/lib/metier/queries";
import type { ChantierCard, Party } from "@/lib/metier/types";

export type DevisMatchResult = {
  client: { exact: Party | null; candidates: { id: string; name: string; score: number }[]; ambiguous: boolean };
  chantier: {
    exact: ChantierCard | null;
    candidates: { id: string; name: string; label: string; score: number }[];
    ambiguous: boolean;
  };
};

function model() {
  const env = process.env.ANTHROPIC_MODEL;
  return isModelId(env) ? env : DEFAULT_MODEL;
}

function refresh() {
  revalidatePath("/accueil");
  revalidatePath("/client/devis");
  revalidatePath("/devis/analyser");
}

/**
 * Structure une description orale / écrite en proposition de devis.
 * N’invente jamais de prix : unitPrice reste null si non dit explicitement.
 */
export async function structureDevisFromSpeech(input: {
  transcript: string;
  chantierName?: string | null;
  chantierAddress?: string | null;
}): Promise<{ ok: true; proposal: DevisProposal; match: DevisMatchResult } | { ok: false; error: string }> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Connexion requise." };

  const text = input.transcript.trim();
  if (text.length < 8) {
    return { ok: false, error: "Description trop courte. Décrivez le chantier un peu plus." };
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return { ok: false, error: "Analyse IA indisponible pour le moment." };
  }

  const context = [
    input.chantierName ? `Chantier : ${input.chantierName}` : null,
    input.chantierAddress ? `Adresse : ${input.chantierAddress}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const res = await new Anthropic().messages.create({
      model: model(),
      max_tokens: 2500,
      system: DEVIS_BTP_SYSTEM,
      messages: [
        {
          role: "user",
          content: `Contexte chantier (déjà connu, ne pas redemander) :
${context || "(aucun chantier sélectionné)"}

Description :
"""
${text}
"""

Réponds UNIQUEMENT en JSON :
${DEVIS_BTP_JSON_SHAPE}`,
        },
      ],
    });

    const raw = res.content.find((b) => b.type === "text")?.text ?? "";
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return { ok: false, error: "Réponse IA illisible. Réessayez." };
    const parsed = JSON.parse(jsonMatch[0]) as Partial<DevisProposal> & {
      clientQuery?: string | null;
      chantierQuery?: string | null;
      defaultVatRate?: number;
      lines?: Array<Partial<DevisProposalLine> & { vatRate?: number | null }>;
    };
    if (!Array.isArray(parsed.lines) || parsed.lines.length === 0) {
      return { ok: false, error: "Aucune prestation identifiée. Reformulez la description." };
    }

    const defaultVatRate =
      typeof parsed.defaultVatRate === "number" && Number.isFinite(parsed.defaultVatRate)
        ? parsed.defaultVatRate
        : 20;

    const proposal: DevisProposal = {
      summary: String(parsed.summary ?? "").trim() || "Proposition de devis",
      clientQuery: parsed.clientQuery ? String(parsed.clientQuery).trim() : null,
      lines: parsed.lines.slice(0, 12).map((l) => {
        const saidPrice =
          typeof l.unitPrice === "number" && Number.isFinite(l.unitPrice) && l.unitPrice > 0
            ? l.unitPrice
            : null;
        const missing = Array.isArray(l.missing) ? l.missing.map(String) : [];
        if (!saidPrice && !missing.includes("prix")) missing.push("prix");
        const vatRate =
          typeof l.vatRate === "number" && Number.isFinite(l.vatRate) ? l.vatRate : null;
        return {
          label: String(l.label ?? "").trim() || "Prestation",
          qty: typeof l.qty === "number" && Number.isFinite(l.qty) ? l.qty : null,
          unit: l.unit ? String(l.unit) : null,
          unitPrice: saidPrice,
          vatRate,
          note: l.note ? String(l.note) : null,
          missing,
        };
      }),
      questions: Array.isArray(parsed.questions) ? parsed.questions.map(String).slice(0, 6) : [],
      warnings: Array.isArray(parsed.warnings) ? parsed.warnings.map(String).slice(0, 6) : [],
      defaultVatRate,
    };

    const [clients, chantiers] = await Promise.all([listParties("client"), listChantiers()]);
    const clientMatch = matchClients(proposal.clientQuery, clients);
    const chantierQuery =
      typeof parsed.chantierQuery === "string" ? parsed.chantierQuery.trim() : input.chantierName ?? null;
    const chantierMatch = matchChantiers(chantierQuery, chantiers, clientMatch.exact?.id ?? null);

    if (clientMatch.ambiguous) {
      proposal.questions = [
        `Plusieurs clients correspondent à « ${proposal.clientQuery} ».`,
        ...proposal.questions,
      ].slice(0, 6);
    }
    if (chantierMatch.ambiguous) {
      proposal.questions = [
        `Plusieurs chantiers correspondent à « ${chantierQuery} ».`,
        ...proposal.questions,
      ].slice(0, 6);
    }

    return {
      ok: true,
      proposal,
      match: {
        client: {
          exact: clientMatch.exact,
          candidates: clientMatch.candidates.map((c) => ({
            id: c.item.id,
            name: c.item.name,
            score: c.score,
          })),
          ambiguous: clientMatch.ambiguous,
        },
        chantier: {
          exact: chantierMatch.exact,
          candidates: chantierMatch.candidates.map((c) => ({
            id: c.item.id,
            name: c.item.name,
            label: c.label,
            score: c.score,
          })),
          ambiguous: chantierMatch.ambiguous,
        },
      },
    };
  } catch (err) {
    console.error("[structureDevisFromSpeech]", err);
    return { ok: false, error: "Structuration impossible. Réessayez dans un moment." };
  }
}

/** Aperçu des totaux (serveur) sans persistence. */
export async function previewDevisProposalAction(input: {
  proposal: DevisProposal;
}): Promise<
  | { ok: true; totals: ReturnType<typeof calculateQuoteTotals>; formatted: { ht: string; tva: string; ttc: string } }
  | { ok: false; error: string }
> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Connexion requise." };
  if (!input.proposal?.lines?.length) return { ok: false, error: "Aucune ligne." };

  const draft = draftFromProposal(input.proposal, { source: "voice" });
  const totals = calculateQuoteTotals(draft.lines);
  return {
    ok: true,
    totals,
    formatted: {
      ht: formatEuro(totals.totalHT),
      tva: formatEuro(totals.totalTVA),
      ttc: formatEuro(totals.totalTTC),
    },
  };
}

/** Enregistre un devis après confirmation utilisateur — via moteur unique. */
export async function createDevisFromProposalAction(input: {
  proposal: DevisProposal;
  chantierId?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  idempotencyKey?: string | null;
}): Promise<{ ok: true; id: string; reused: boolean } | { ok: false; error: string }> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Connexion requise." };
  if (!input.proposal?.lines?.length) return { ok: false, error: "Aucune ligne à enregistrer." };

  const clients = await listParties("client");
  const client =
    (input.clientId ? clients.find((c) => c.id === input.clientId) : null) ??
    (input.clientName ? clients.find((c) => c.name === input.clientName) : null);

  const key =
    input.idempotencyKey?.trim() ||
    createHash("sha256")
      .update(JSON.stringify({ proposal: input.proposal, chantierId: input.chantierId, clientId: input.clientId }))
      .digest("hex")
      .slice(0, 32);

  const draft = draftFromProposal(input.proposal, {
    source: "voice",
    clientId: client?.id ?? input.clientId ?? null,
    clientName: client?.name ?? input.clientName ?? input.proposal.clientQuery,
    chantierId: input.chantierId ?? null,
    idempotencyKey: key,
  });

  const result = await persistDevisDraft(draft);
  if (!result.ok) return result;

  refresh();
  revalidatePath(`/pieces/${result.id}`);
  return { ok: true, id: result.id, reused: result.reused };
}

/** Création manuelle depuis le formulaire Nouveau devis. */
export async function createManualDevisAction(input: {
  title?: string | null;
  clientId?: string | null;
  clientName?: string | null;
  chantierId?: string | null;
  chantierName?: string | null;
  notes?: string | null;
  lines: Array<{
    description: string;
    quantity: number;
    unit?: string;
    unitPriceHT: number;
    vatRate: number;
  }>;
  idempotencyKey?: string | null;
}): Promise<{ ok: true; id: string; reused: boolean } | { ok: false; error: string }> {
  const db = await getDb();
  if (!db) return { ok: false, error: "Connexion requise." };
  if (!input.lines?.length) return { ok: false, error: "Ajoutez au moins une ligne." };

  const clients = await listParties("client");
  const chantiers = await listChantiers();
  const client =
    (input.clientId ? clients.find((c) => c.id === input.clientId) : null) ??
    (input.clientName ? clients.find((c) => c.name === input.clientName) : null);
  const chantier = input.chantierId ? chantiers.find((c) => c.id === input.chantierId) : null;

  const draft = {
    client: {
      id: client?.id ?? input.clientId ?? null,
      name: client?.name?.trim() || input.clientName?.trim() || "Client",
    },
    chantier:
      chantier || input.chantierName
        ? {
            id: chantier?.id ?? input.chantierId ?? null,
            name: chantier?.name ?? input.chantierName ?? null,
          }
        : undefined,
    lines: input.lines.map((l) => ({
      description: String(l.description ?? "").trim() || "Prestation",
      quantity: Number(l.quantity) || 0,
      unit: String(l.unit ?? "u").trim() || "u",
      unitPriceHT: Number(l.unitPriceHT) || 0,
      vatRate: Number(l.vatRate) || 20,
    })),
    notes: input.notes?.trim() || undefined,
    source: "manual" as const,
    title: String(input.title ?? "").trim() || "Devis",
    vatMode: "standard" as const,
    validityDays: 30,
    idempotencyKey: input.idempotencyKey?.trim() || undefined,
  };

  const result = await persistDevisDraft(draft);
  if (!result.ok) return result;

  refresh();
  revalidatePath(`/pieces/${result.id}`);
  return { ok: true, id: result.id, reused: result.reused };
}
