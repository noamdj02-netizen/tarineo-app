/**
 * Plateau vidéo BTP — compte riche en données fictives (seed_key `plateau-*`).
 *
 *   npm run seed:plateau
 *   npm run seed:plateau -- --reset
 *
 * .env.local : NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 * PLATEAU_USER_EMAIL (défaut noamdj02@gmail.com)
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";
import {
  PLATEAU_ALERTS,
  PLATEAU_CHANTIERS,
  PLATEAU_COMPANY,
  PLATEAU_DOCUMENTS,
  PLATEAU_PARTIES,
  PLATEAU_PREFIX,
  PLATEAU_PRODUCTS,
  daysAgoIso,
} from "../lib/metier/plateau-seed-data";
import type { Database } from "../lib/supabase/types";

config({ path: resolve(process.cwd(), ".env.local") });

const DEFAULT_EMAIL = "noamdj02@gmail.com";

function env(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Variable manquante : ${name} (.env.local)`);
  return v;
}

function die(msg: string): never {
  console.error(msg);
  process.exit(1);
}

async function findUserId(
  supabase: ReturnType<typeof createClient<Database>>,
  email: string,
) {
  for (let page = 1; page < 20; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === email);
    if (hit) return hit.id;
    if (data.users.length < 200) break;
  }
  return null;
}

async function resetPlateau(supabase: ReturnType<typeof createClient<Database>>, userId: string) {
  const { data: docs } = await supabase
    .from("documents")
    .select("id")
    .eq("user_id", userId)
    .like("seed_key", `${PLATEAU_PREFIX}%`);
  const docIds = (docs ?? []).map((d) => d.id);
  if (docIds.length) {
    await supabase.from("follow_ups").delete().in("document_id", docIds);
    await supabase.from("document_lines").delete().eq("user_id", userId).in("document_id", docIds);
  }
  await supabase.from("price_alerts").delete().eq("user_id", userId).like("seed_key", `${PLATEAU_PREFIX}%`);
  await supabase.from("documents").delete().eq("user_id", userId).like("seed_key", `${PLATEAU_PREFIX}%`);
  await supabase.from("chantiers").delete().eq("user_id", userId).like("seed_key", `${PLATEAU_PREFIX}%`);
  await supabase.from("products").delete().eq("user_id", userId).like("seed_key", `${PLATEAU_PREFIX}%`);
  await supabase.from("parties").delete().eq("user_id", userId).like("seed_key", `${PLATEAU_PREFIX}%`);
  await supabase
    .from("notifications")
    .delete()
    .eq("user_id", userId)
    .like("idempotency_key", `${PLATEAU_PREFIX}%`);
  console.log("Données plateau supprimées (seed_key plateau-*).");
}

async function main() {
  const reset = process.argv.includes("--reset");
  const email = (process.env.PLATEAU_USER_EMAIL ?? DEFAULT_EMAIL).trim().toLowerCase();

  const supabase = createClient<Database>(env("NEXT_PUBLIC_SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let userId = await findUserId(supabase, email);
  if (!userId) {
    const { data, error } = await supabase.auth.admin.createUser({ email, email_confirm: true });
    if (error || !data.user) die(`Compte introuvable et création impossible : ${error?.message ?? "user null"}`);
    userId = data.user.id;
    console.log(`Compte créé : ${email}`);
  } else {
    console.log(`Compte : ${email} (${userId})`);
  }

  await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { first_name: process.env.PLATEAU_USER_FIRST_NAME?.trim() || "Noam" },
  });

  if (reset) await resetPlateau(supabase, userId);

  const { error: coErr } = await supabase.from("company_profiles").upsert(
    { user_id: userId, ...PLATEAU_COMPANY },
    { onConflict: "user_id" },
  );
  if (coErr) die(`Entreprise : ${coErr.message}`);

  const partyIds = new Map<string, string>();
  for (const p of PLATEAU_PARTIES) {
    const { data, error } = await supabase
      .from("parties")
      .upsert(
        { user_id: userId, kind: p.kind, name: p.name, address: p.address, seed_key: p.seed },
        { onConflict: "user_id,seed_key" },
      )
      .select("id, seed_key")
      .single();
    if (error || !data) die(`Partie ${p.seed} : ${error?.message ?? "no row"}`);
    partyIds.set(p.seed, data.id);
  }

  const productIds = new Map<string, string>();
  for (const pr of PLATEAU_PRODUCTS) {
    const { data, error } = await supabase
      .from("products")
      .upsert(
        { user_id: userId, name: pr.name, family: pr.family, unit: pr.unit, seed_key: pr.seed },
        { onConflict: "user_id,seed_key" },
      )
      .select("id, seed_key")
      .single();
    if (error || !data) die(`Produit ${pr.seed} : ${error?.message ?? "no row"}`);
    productIds.set(pr.seed, data.id);
  }

  const chantierIds = new Map<string, string>();
  const now = new Date().toISOString();
  for (const ch of PLATEAU_CHANTIERS) {
    const clientId = partyIds.get(ch.clientSeed);
    if (!clientId) die(`Client manquant pour ${ch.seed}`);
    const { data, error } = await supabase
      .from("chantiers")
      .upsert(
        {
          user_id: userId,
          slug: ch.slug,
          name: ch.name,
          address: ch.address,
          client_id: clientId,
          status: ch.status,
          seed_key: ch.seed,
          updated_at: now,
        },
        { onConflict: "user_id,seed_key" },
      )
      .select("id, seed_key")
      .single();
    if (error || !data) die(`Chantier ${ch.seed} : ${error?.message ?? "no row"}`);
    chantierIds.set(ch.seed, data.id);
  }

  const docIds = new Map<string, string>();

  for (const doc of PLATEAU_DOCUMENTS) {
    const partyId = partyIds.get(doc.partySeed);
    const chantierId = chantierIds.get(doc.chantierSeed);
    if (!partyId || !chantierId) die(`Liens manquants pour ${doc.seed}`);

    const { data, error } = await supabase
      .from("documents")
      .upsert(
        {
          user_id: userId,
          direction: doc.direction,
          kind: doc.kind,
          title: doc.title,
          party_id: partyId,
          chantier_id: chantierId,
          source_document_id: null,
          file_path: "",
          extract: doc.extract ?? { demo: true, plateau: true },
          status: "ready",
          seed_key: doc.seed,
          created_at: daysAgoIso(doc.daysAgo),
        },
        { onConflict: "user_id,seed_key" },
      )
      .select("id, seed_key")
      .single();
    if (error || !data) die(`Document ${doc.seed} : ${error?.message ?? "no row"}`);
    docIds.set(doc.seed, data.id);
  }

  for (const doc of PLATEAU_DOCUMENTS) {
    if (!doc.sourceSeed) continue;
    const id = docIds.get(doc.seed);
    const sourceId = docIds.get(doc.sourceSeed);
    if (!id || !sourceId) continue;
    const { error } = await supabase.from("documents").update({ source_document_id: sourceId }).eq("id", id);
    if (error) die(`Lien source ${doc.seed} : ${error.message}`);
  }

  for (const doc of PLATEAU_DOCUMENTS) {
    const documentId = docIds.get(doc.seed);
    if (!documentId) continue;
    await supabase.from("document_lines").delete().eq("document_id", documentId);
    const rows = doc.lines.map((line, position) => ({
      user_id: userId,
      document_id: documentId,
      product_id: productIds.get(line.productSeed) ?? null,
      supplier_party_id: line.supplierSeed ? partyIds.get(line.supplierSeed) ?? null : null,
      distributor_party_id: line.distributorSeed ? partyIds.get(line.distributorSeed) ?? null : null,
      label: line.label,
      qty: line.qty,
      unit: line.unit,
      buy_price: line.buyPrice,
      sell_price: line.sellPrice,
      position,
    }));
    const { error } = await supabase.from("document_lines").insert(rows);
    if (error) die(`Lignes ${doc.seed} : ${error.message}`);
  }

  for (const a of PLATEAU_ALERTS) {
    const { error } = await supabase.from("price_alerts").upsert(
      {
        user_id: userId,
        product_id: productIds.get(a.productSeed) ?? null,
        document_id: a.documentSeed ? docIds.get(a.documentSeed) ?? null : null,
        chantier_id: chantierIds.get(a.chantierSeed) ?? null,
        label: a.label,
        old_price: a.oldPrice,
        new_price: a.newPrice,
        seed_key: a.seed,
        created_at: daysAgoIso(a.daysAgo),
      },
      { onConflict: "user_id,seed_key" },
    );
    if (error) die(`Alerte ${a.seed} : ${error.message}`);
  }

  const followDevis = docIds.get("plateau-doc-karim-devis-client");
  if (followDevis) {
    await supabase.from("follow_ups").delete().eq("document_id", followDevis).eq("user_id", userId);
    const { error } = await supabase.from("follow_ups").insert({
      user_id: userId,
      document_id: followDevis,
      chantier_id: chantierIds.get("plateau-chantier-karim-cuisine"),
      audience: "client",
      status: "due",
      scheduled_at: daysAgoIso(-2),
      subject: "Relance devis cuisine — Benali",
      body: "Bonjour,\n\nJe me permets de revenir vers vous concernant le devis cuisine transmis la semaine dernière. Souhaitez-vous que nous planifions le démarrage des travaux ?\n\nBien cordialement,\nMartin Électricité & Rénovation",
      to_email: "karim.benali@example.com",
    });
    if (error) die(`Relance : ${error.message}`);
  }

  const notifs = [
    {
      key: "plateau-notif-hausses",
      type: "supplier_increase",
      title: "Hausses détectées sur Rexel",
      message: "2 articles ont augmenté sur votre dernière facture Rexel (câble, disjoncteur).",
      action_url: "/hausses",
      priority: "high" as const,
    },
    {
      key: "plateau-notif-devis",
      type: "quote_followup",
      title: "Devis à relancer",
      message: "Devis cuisine Benali — pas de réponse depuis 48 h.",
      action_url: "/devis",
      priority: "normal" as const,
    },
  ];
  for (const n of notifs) {
    const { error } = await supabase.from("notifications").upsert(
      {
        user_id: userId,
        organization_id: userId,
        type: n.type,
        title: n.title,
        message: n.message,
        priority: n.priority,
        read: false,
        action_url: n.action_url,
        entity_type: "plateau",
        entity_id: n.key,
        idempotency_key: n.key,
        metadata: { demo: true, plateau: true },
      },
      { onConflict: "user_id,idempotency_key" },
    );
    if (error) die(`Notification ${n.key} : ${error.message}`);
  }

  console.log("");
  console.log("Plateau TARINEO injecté :");
  console.log(`  • ${PLATEAU_PARTIES.length} contacts (clients, distributeurs, fabricants)`);
  console.log(`  • ${PLATEAU_CHANTIERS.length} chantiers`);
  console.log(`  • ${PLATEAU_PRODUCTS.length} produits`);
  console.log(`  • ${PLATEAU_DOCUMENTS.length} documents (achats + devis / BC client)`);
  console.log(`  • ${PLATEAU_ALERTS.length} alertes hausses`);
  console.log("  • 1 relance client + 2 notifications");
  console.log("");
  console.log("Tout est marqué fictif (seed_key plateau-*, extract.demo).");
  console.log("Pour repartir de zéro : npm run seed:plateau -- --reset");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
