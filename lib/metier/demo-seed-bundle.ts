import type { SupabaseClient } from "@supabase/supabase-js";
import { DEMO_IDS } from "@/lib/metier/demo";

/** Prix client calculés comme `transformImportedDocument` (queries.ts). */
export const DEMO_BUY_UNIT = 24.6;
export const DEMO_MARKUP = 1.35;
export const DEMO_SELL_UNIT = Math.round(DEMO_BUY_UNIT * DEMO_MARKUP * 100) / 100;
export const DEMO_QTY = 18;
export const DEMO_BUY_HT = Math.round(DEMO_BUY_UNIT * DEMO_QTY * 100) / 100;
export const DEMO_CLIENT_HT = Math.round(DEMO_SELL_UNIT * DEMO_QTY * 100) / 100;

export function demoSentAtIso(daysAgo = 4) {
  return new Date(Date.now() - daysAgo * 86_400_000).toISOString();
}

/** Envoyé il y a 3 jours (affichage « Il y a 3 jours ») tout en étant « À relancer » (≥ 3 j). */
export function demoSentAtRelance() {
  return new Date(Date.now() - 3 * 86_400_000 - 3_600_000).toISOString();
}

type SeedCtx = {
  uid: string;
  clientId: string;
  distId: string;
  fournId: string;
  productId: string;
  chantierId: string;
};

function outLine(ctx: SeedCtx, documentId: string, sellPrice: number) {
  return {
    user_id: ctx.uid,
    document_id: documentId,
    product_id: ctx.productId,
    supplier_party_id: ctx.fournId,
    distributor_party_id: ctx.distId,
    label: "Tube PVC Ø 500",
    qty: DEMO_QTY,
    unit: "ml",
    buy_price: DEMO_BUY_UNIT,
    sell_price: sellPrice,
    position: 0,
  };
}

export async function upsertDemoDocuments(
  supabase: SupabaseClient,
  ctx: SeedCtx,
): Promise<{ docInId: string | null; docOutId: string | null; docOutPretId: string | null }> {
  const { data: docIn } = await supabase
    .from("documents")
    .upsert(
      {
        user_id: ctx.uid,
        direction: "in",
        kind: "devis",
        title: "Devis Cedeo - tubes PVC",
        party_id: ctx.distId,
        chantier_id: ctx.chantierId,
        extract: {
          demo: true,
          totals: { ht: DEMO_BUY_HT, eco_contribution: 0.42, pmcb: 0.42, weight_kg: 86.4 },
        },
        status: "ready",
        seed_key: DEMO_IDS.docIn,
      },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();

  const { data: docOut } = await supabase
    .from("documents")
    .upsert(
      {
        user_id: ctx.uid,
        direction: "out",
        kind: "devis",
        title: "Devis client Dupont",
        party_id: ctx.clientId,
        chantier_id: ctx.chantierId,
        source_document_id: docIn?.id ?? null,
        extract: {
          demo: true,
          markup: DEMO_MARKUP,
          sent_at: demoSentAtIso(4),
          totals: { ht: DEMO_CLIENT_HT },
        },
        status: "ready",
        seed_key: DEMO_IDS.docOut,
      },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();

  const { data: docOutPret } = await supabase
    .from("documents")
    .upsert(
      {
        user_id: ctx.uid,
        direction: "out",
        kind: "devis",
        title: "Devis client — extension Dupont",
        party_id: ctx.clientId,
        chantier_id: ctx.chantierId,
        extract: {
          demo: true,
          markup: DEMO_MARKUP,
          sent_at: demoSentAtRelance(),
          totals: { ht: DEMO_CLIENT_HT },
        },
        status: "ready",
        seed_key: DEMO_IDS.docOutPret,
      },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();

  const { data: docOutCmd } = await supabase
    .from("documents")
    .upsert(
      {
        user_id: ctx.uid,
        direction: "out",
        kind: "devis",
        title: "Devis client — cuisine Dupont",
        party_id: ctx.clientId,
        chantier_id: ctx.chantierId,
        extract: { demo: true, markup: DEMO_MARKUP, totals: { ht: DEMO_CLIENT_HT } },
        status: "ready",
        seed_key: DEMO_IDS.docOutCommande,
      },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();

  const { data: docBc } = await supabase
    .from("documents")
    .upsert(
      {
        user_id: ctx.uid,
        direction: "out",
        kind: "bon_commande",
        title: "Bon de commande client n°001",
        party_id: ctx.clientId,
        chantier_id: ctx.chantierId,
        source_document_id: docOut?.id ?? null,
        extract: {
          demo: true,
          markup: 1,
          from: docOut?.id,
          from_title: docOut?.id ? "Devis client Dupont" : null,
          totals: { ht: DEMO_CLIENT_HT },
        },
        status: "ready",
        seed_key: DEMO_IDS.docBc,
      },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();

  const { data: docFacture } = await supabase
    .from("documents")
    .upsert(
      {
        user_id: ctx.uid,
        direction: "out",
        kind: "facture",
        title: "Facture client n°001",
        party_id: ctx.clientId,
        chantier_id: ctx.chantierId,
        source_document_id: docBc?.id ?? null,
        extract: {
          demo: true,
          markup: 1,
          from: docBc?.id,
          from_title: "Bon de commande client n°001",
          totals: { ht: DEMO_CLIENT_HT },
        },
        status: "ready",
        seed_key: DEMO_IDS.docFacture,
      },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();

  const docIds = [docIn?.id, docOut?.id, docOutPret?.id, docOutCmd?.id, docBc?.id, docFacture?.id].filter(Boolean) as string[];
  for (const id of docIds) {
    await supabase.from("document_lines").delete().eq("document_id", id);
  }

  if (docIn?.id) {
    await supabase.from("document_lines").insert({
      user_id: ctx.uid,
      document_id: docIn.id,
      product_id: ctx.productId,
      supplier_party_id: ctx.fournId,
      distributor_party_id: ctx.distId,
      label: "Tube PVC Ø 500",
      qty: DEMO_QTY,
      unit: "ml",
      buy_price: DEMO_BUY_UNIT,
      sell_price: 0,
      position: 0,
    });
  }

  const outDocs: { id?: string; sell: number }[] = [
    { id: docOut?.id, sell: DEMO_SELL_UNIT },
    { id: docOutPret?.id, sell: DEMO_SELL_UNIT },
    { id: docOutCmd?.id, sell: DEMO_SELL_UNIT },
    { id: docBc?.id, sell: DEMO_SELL_UNIT },
    { id: docFacture?.id, sell: DEMO_SELL_UNIT },
  ];
  for (const row of outDocs) {
    if (!row.id) continue;
    await supabase.from("document_lines").insert(outLine(ctx, row.id, row.sell));
  }

  await supabase.from("price_alerts").upsert(
    {
      user_id: ctx.uid,
      product_id: ctx.productId,
      document_id: docIn?.id ?? null,
      chantier_id: ctx.chantierId,
      label: "Tube PVC Ø 500 chez Cedeo",
      old_price: 22.4,
      new_price: 24.6,
      seed_key: DEMO_IDS.alert,
    },
    { onConflict: "user_id,seed_key" },
  );

  return {
    docInId: docIn?.id ?? null,
    docOutId: docOut?.id ?? null,
    docOutPretId: docOutPret?.id ?? null,
  };
}
