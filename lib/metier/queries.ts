import "server-only";
import { getDb } from "@/lib/db";
import { DEMO_IDS, demoNow } from "@/lib/metier/demo";
import { upsertDemoDocuments } from "@/lib/metier/demo-seed-bundle";
import {
  getMem,
  memAddDocument,
  memCreateChantier,
  memGetCompany,
  memSetChantierStatus,
  memSetCompany,
  memTransform,
  memUpdateDocument,
  seedMem,
} from "@/lib/metier/memory";
import type { CompanyProfile } from "@/lib/metier/company";
import type {
  Chantier,
  ChantierCard,
  ChantierStatus,
  DocumentCard,
  DocumentLine,
  DocumentRow,
  Party,
  PriceAlert,
  Product,
} from "@/lib/metier/types";
import { CLIENT_OUT_LABEL } from "@/lib/metier/types";
import { normalizeChantierText } from "@/lib/metier/chantier-match";
import {
  normalizeDocumentListPaging,
  pageDocumentRows,
  relatedIdsFromDocuments,
  type DocumentListFilter,
} from "@/lib/metier/list-documents-query";
import { isOpenAccess } from "@/lib/supabase/config";

function isMissingTable(error: { message?: string; code?: string } | null) {
  const m = error?.message ?? "";
  return /does not exist|schema cache|Could not find the table/i.test(m);
}

function allowLocalMemory() {
  return process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "preview" && process.env.VERCEL_ENV !== "production";
}

function logMetier(op: string, error: unknown) {
  console.error("[metier]", op, error);
}

function persistUnavailable(op: string): never {
  logMetier(op, "no-session");
  throw new Error("Vos données sont inaccessibles. Vérifiez la connexion, puis réessayez.");
}

function failRead(op: string, error: unknown): never {
  logMetier(op, error);
  throw new Error("Impossible de charger vos données. Réessayez.");
}

async function getRemote() {
  const db = await getDb();
  return db;
}

async function assertOwned(
  db: NonNullable<Awaited<ReturnType<typeof getRemote>>>,
  table: "parties" | "chantiers",
  id: string | null | undefined,
) {
  if (!id) return null;
  const { data } = await db.supabase.from(table).select("id").eq("id", id).eq("user_id", db.user.id).maybeSingle();
  return data?.id ?? null;
}

function hydrateCards(userId: string): { parties: Party[]; products: Product[]; chantiers: Chantier[]; documents: DocumentRow[]; lines: DocumentLine[]; alerts: PriceAlert[] } {
  return seedMem(userId);
}

function cardsFromMem(userId: string): ChantierCard[] {
  const u = hydrateCards(userId);
  return u.chantiers.map((c) => ({
    ...c,
    client_name: u.parties.find((p) => p.id === c.client_id)?.name ?? null,
    docs_count: u.documents.filter((d) => d.chantier_id === c.id).length,
  }));
}

function docCardsFromMem(userId: string, filter?: DocumentListFilter): DocumentCard[] {
  const u = hydrateCards(userId);
  const filtered = u.documents
    .filter((d) => (filter?.direction ? d.direction === filter.direction : true))
    .filter((d) => (filter?.chantierId ? d.chantier_id === filter.chantierId : true))
    .filter((d) => (filter?.kind ? d.kind === filter.kind : true));
  return pageDocumentRows(filtered, filter)
    .map((d) => {
      const party = u.parties.find((p) => p.id === d.party_id);
      const ch = u.chantiers.find((c) => c.id === d.chantier_id);
      return {
        ...d,
        party_name: party?.name ?? null,
        party_address: party?.address ?? null,
        party_kind: party?.kind ?? null,
        chantier_name: ch?.name ?? null,
        chantier_slug: ch?.slug ?? null,
        lines: u.lines.filter((l) => l.document_id === d.id).sort((a, b) => a.position - b.position),
      };
    });
}

let demoSeedInFlight: Promise<void> | null = null;

async function runDemoSeedOnce() {
  const vercel = process.env.VERCEL_ENV;
  if (vercel === "production" || vercel === "preview") return;
  if (process.env.NODE_ENV === "production" || !isOpenAccess()) return;
  const db = await getRemote();
  if (!db) return;
  const { error } = await db.supabase
    .from("chantiers")
    .select("id")
    .eq("user_id", db.user.id)
    .eq("seed_key", DEMO_IDS.chantier)
    .maybeSingle();
  if (error && isMissingTable(error)) {
    seedMem(db.user.id);
    return;
  }

  const uid = db.user.id;
  const now = demoNow();
  const { data: client } = await db.supabase
    .from("parties")
    .upsert(
      { user_id: uid, kind: "client", name: "Madame Dupont", address: "12 rue des Acacias, 69003 Lyon", seed_key: DEMO_IDS.client },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();
  const { data: dist } = await db.supabase
    .from("parties")
    .upsert(
      { user_id: uid, kind: "distributeur", name: "Cedeo Lyon", address: "Avenue Jean Jaurès, Lyon", seed_key: DEMO_IDS.dist },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();
  const { data: fourn } = await db.supabase
    .from("parties")
    .upsert(
      { user_id: uid, kind: "fournisseur", name: "Nicoll", address: "", seed_key: DEMO_IDS.fourn },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();
  const { data: product } = await db.supabase
    .from("products")
    .upsert(
      { user_id: uid, name: "Tube PVC Ø 500", family: "Évacuation", unit: "ml", seed_key: DEMO_IDS.product },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();
  if (!client || !dist || !fourn || !product) {
    seedMem(uid);
    return;
  }
  const { data: chantier } = await db.supabase
    .from("chantiers")
    .upsert(
      {
        user_id: uid,
        slug: "madame-dupont",
        name: "Chantier Madame Dupont",
        address: "12 rue des Acacias, 69003 Lyon",
        client_id: client.id,
        status: "focus",
        seed_key: DEMO_IDS.chantier,
        updated_at: now,
      },
      { onConflict: "user_id,seed_key" },
    )
    .select("id")
    .single();
  if (!chantier) {
    seedMem(uid);
    return;
  }
  await upsertDemoDocuments(db.supabase, {
    uid,
    clientId: client.id,
    distId: dist.id,
    fournId: fourn.id,
    productId: product.id,
    chantierId: chantier.id,
  });
}

export async function ensureMetierSeed() {
  if (!demoSeedInFlight) {
    demoSeedInFlight = runDemoSeedOnce().finally(() => {
      demoSeedInFlight = null;
    });
  }
  await demoSeedInFlight;
}

export async function listChantiers(): Promise<ChantierCard[]> {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) persistUnavailable("listChantiers");
    return cardsFromMem("local");
  }
  await ensureMetierSeed();
  const { data, error } = await db.supabase
    .from("chantiers")
    .select("id, slug, name, address, client_id, project_id, status, seed_key, created_at, updated_at")
    .eq("user_id", db.user.id)
    .order("updated_at", { ascending: false });
  if (error) {
    if (!allowLocalMemory()) failRead("listChantiers", error);
    logMetier("listChantiers", error);
    return [];
  }
  const ids = (data ?? []).map((c) => c.id);
  const [{ data: parties }, { data: docs }] = await Promise.all([
    db.supabase.from("parties").select("id, name").eq("user_id", db.user.id),
    ids.length
      ? db.supabase.from("documents").select("id, chantier_id").eq("user_id", db.user.id).in("chantier_id", ids)
      : Promise.resolve({ data: [] as { id: string; chantier_id: string | null }[] }),
  ]);
  const names = new Map((parties ?? []).map((p) => [p.id, p.name]));
  const counts = new Map<string, number>();
  for (const d of docs ?? []) {
    if (!d.chantier_id) continue;
    counts.set(d.chantier_id, (counts.get(d.chantier_id) ?? 0) + 1);
  }
  return (data ?? []).map((c) => ({
    ...c,
    client_name: c.client_id ? names.get(c.client_id) ?? null : null,
    docs_count: counts.get(c.id) ?? 0,
  }));
}

export async function getChantier(slug: string): Promise<(ChantierCard & { documents: DocumentCard[] }) | null> {
  const all = await listChantiers();
  const card = all.find((c) => c.slug === slug);
  if (!card) return null;
  const documents = await listDocuments({ chantierId: card.id });
  return { ...card, documents };
}

export async function listParties(kind?: Party["kind"]): Promise<Party[]> {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) persistUnavailable("listParties");
    const u = hydrateCards("local");
    return kind ? u.parties.filter((p) => p.kind === kind) : u.parties;
  }
  await ensureMetierSeed();
  let q = db.supabase
    .from("parties")
    .select("id, kind, name, address, seed_key, contact_name, contact_email, contact_phone")
    .eq("user_id", db.user.id);
  if (kind) q = q.eq("kind", kind);
  const { data, error } = await q.order("name");
  if (error) {
    // Migration contacts pas encore appliquée : fallback colonnes historiques.
    let q2 = db.supabase.from("parties").select("id, kind, name, address, seed_key").eq("user_id", db.user.id);
    if (kind) q2 = q2.eq("kind", kind);
    const retry = await q2.order("name");
    if (!retry.error) return (retry.data ?? []) as Party[];
    if (!allowLocalMemory()) failRead("listParties", error);
    logMetier("listParties", error);
    return [];
  }
  return (data ?? []) as Party[];
}

export async function listDocuments(filter?: DocumentListFilter): Promise<DocumentCard[]> {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) persistUnavailable("listDocuments");
    return docCardsFromMem("local", filter);
  }
  await ensureMetierSeed();
  const paging = normalizeDocumentListPaging(filter);
  let q = db.supabase
    .from("documents")
    .select("id, direction, kind, title, party_id, chantier_id, source_document_id, file_path, extract, status, error, seed_key, created_at")
    .eq("user_id", db.user.id)
    .order("created_at", { ascending: false });
  if (filter?.direction) q = q.eq("direction", filter.direction);
  if (filter?.chantierId) q = q.eq("chantier_id", filter.chantierId);
  if (filter?.kind) q = q.eq("kind", filter.kind as DocumentRow["kind"]);
  if (paging.limit !== null) {
    const from = paging.offset;
    const to = paging.offset + Math.max(paging.limit, 1) - 1;
    q = q.range(from, to);
  }
  if (paging.limit === 0) {
    return [];
  }
  const { data, error } = await q;
  if (error) {
    if (!allowLocalMemory()) failRead("listDocuments", error);
    logMetier("listDocuments", error);
    return [];
  }
  const docs = (data ?? []) as DocumentRow[];
  const { partyIds, chantierIds } = relatedIdsFromDocuments(docs);
  const [{ data: parties }, { data: chantiers }, { data: lines }] = await Promise.all([
    partyIds.length
      ? db.supabase
          .from("parties")
          .select("id, name, kind, address")
          .eq("user_id", db.user.id)
          .in("id", partyIds)
      : Promise.resolve({ data: [] as Party[] }),
    chantierIds.length
      ? db.supabase
          .from("chantiers")
          .select("id, name, slug")
          .eq("user_id", db.user.id)
          .in("id", chantierIds)
      : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[] }),
    docs.length
      ? db.supabase.from("document_lines").select("*").eq("user_id", db.user.id).in(
          "document_id",
          docs.map((d) => d.id),
        )
      : Promise.resolve({ data: [] as DocumentLine[] }),
  ]);
  const pMap = new Map((parties ?? []).map((p) => [p.id, p]));
  const cMap = new Map((chantiers ?? []).map((c) => [c.id, c]));
  const byDoc = new Map<string, DocumentLine[]>();
  for (const l of (lines ?? []) as DocumentLine[]) {
    const list = byDoc.get(l.document_id) ?? [];
    list.push(l);
    byDoc.set(l.document_id, list);
  }
  return docs.map((d) => {
    const p = d.party_id ? pMap.get(d.party_id) : undefined;
    const c = d.chantier_id ? cMap.get(d.chantier_id) : undefined;
    return {
      ...d,
      extract: (d.extract ?? {}) as Record<string, unknown>,
      party_name: p?.name ?? null,
      party_address: (p as { address?: string } | undefined)?.address ?? null,
      party_kind: (p?.kind as Party["kind"]) ?? null,
      chantier_name: c?.name ?? null,
      chantier_slug: c?.slug ?? null,
      lines: (byDoc.get(d.id) ?? []).sort((a, b) => a.position - b.position),
    };
  });
}

/** Charge une pièce par id (ownership user_id) — n’appelle plus listDocuments() complet. */
export async function getDocument(id: string): Promise<DocumentCard | null> {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) persistUnavailable("getDocument");
    return docCardsFromMem("local").find((d) => d.id === id) ?? null;
  }
  await ensureMetierSeed();
  const { data, error } = await db.supabase
    .from("documents")
    .select("id, direction, kind, title, party_id, chantier_id, source_document_id, file_path, extract, status, error, seed_key, created_at")
    .eq("user_id", db.user.id)
    .eq("id", id)
    .maybeSingle();
  if (error) {
    if (!allowLocalMemory()) failRead("getDocument", error);
    logMetier("getDocument", error);
    return null;
  }
  if (!data) return null;
  const doc = data as DocumentRow;
  const { partyIds, chantierIds } = relatedIdsFromDocuments([doc]);
  const [{ data: parties }, { data: chantiers }, { data: lines }] = await Promise.all([
    partyIds.length
      ? db.supabase
          .from("parties")
          .select("id, name, kind, address")
          .eq("user_id", db.user.id)
          .in("id", partyIds)
      : Promise.resolve({ data: [] as Party[] }),
    chantierIds.length
      ? db.supabase
          .from("chantiers")
          .select("id, name, slug")
          .eq("user_id", db.user.id)
          .in("id", chantierIds)
      : Promise.resolve({ data: [] as { id: string; name: string; slug: string }[] }),
    db.supabase.from("document_lines").select("*").eq("user_id", db.user.id).eq("document_id", doc.id),
  ]);
  const p = doc.party_id ? (parties ?? []).find((x) => x.id === doc.party_id) : undefined;
  const c = doc.chantier_id ? (chantiers ?? []).find((x) => x.id === doc.chantier_id) : undefined;
  return {
    ...doc,
    extract: (doc.extract ?? {}) as Record<string, unknown>,
    party_name: p?.name ?? null,
    party_address: (p as { address?: string } | undefined)?.address ?? null,
    party_kind: (p?.kind as Party["kind"]) ?? null,
    chantier_name: c?.name ?? null,
    chantier_slug: c?.slug ?? null,
    lines: ((lines ?? []) as DocumentLine[]).sort((a, b) => a.position - b.position),
  };
}

export async function listAlerts(): Promise<PriceAlert[]> {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) persistUnavailable("listAlerts");
    return hydrateCards("local").alerts;
  }
  await ensureMetierSeed();
  const { data, error } = await db.supabase
    .from("price_alerts")
    .select("id, product_id, document_id, chantier_id, label, old_price, new_price, created_at, seed_key")
    .eq("user_id", db.user.id)
    .order("created_at", { ascending: false });
  if (error) {
    if (!allowLocalMemory()) failRead("listAlerts", error);
    logMetier("listAlerts", error);
    return [];
  }
  const { data: chantiers } = await db.supabase.from("chantiers").select("id, name").eq("user_id", db.user.id);
  const names = new Map((chantiers ?? []).map((c) => [c.id, c.name]));
  return (data ?? []).map((a) => ({
    ...a,
    chantier_name: a.chantier_id ? names.get(a.chantier_id) ?? null : null,
  }));
}

export async function rankingRows() {
  const docs = await listDocuments({ direction: "in" });
  const byArticle = new Map<string, { label: string; qty: number; amount: number }>();
  const byParty = new Map<string, { label: string; qty: number; amount: number }>();
  for (const d of docs) {
    const party = d.party_name ?? "Enseigne";
    for (const l of d.lines) {
      const amount = Number(l.buy_price) * Number(l.qty);
      const a = byArticle.get(l.label) ?? { label: l.label, qty: 0, amount: 0 };
      a.qty += Number(l.qty);
      a.amount += amount;
      byArticle.set(l.label, a);
      const p = byParty.get(party) ?? { label: party, qty: 0, amount: 0 };
      p.qty += Number(l.qty);
      p.amount += amount;
      byParty.set(party, p);
    }
  }
  return {
    articles: [...byArticle.values()].sort((a, b) => b.amount - a.amount),
    enseignes: [...byParty.values()].sort((a, b) => b.amount - a.amount),
  };
}

export async function compareLabels() {
  const docs = await listDocuments({ direction: "in" });
  const set = new Set<string>();
  for (const d of docs) for (const l of d.lines) if (l.label.trim()) set.add(l.label);
  return [...set].sort((a, b) => a.localeCompare(b, "fr"));
}

export async function compareProduct(label?: string) {
  const docs = await listDocuments({ direction: "in" });
  const labels = await compareLabels();
  const pick = label && labels.includes(label) ? label : labels[0] ?? "Article";
  const needle = pick.toLowerCase();
  const rows: { distributor: string; price: number; document: string; date: string }[] = [];
  for (const d of docs) {
    for (const l of d.lines) {
      if (l.label.toLowerCase() === needle || l.label.toLowerCase().includes(needle.slice(0, 10))) {
        rows.push({
          distributor: d.party_name ?? "Distributeur",
          price: Number(l.buy_price),
          document: d.title,
          date: d.created_at,
        });
      }
    }
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  const yoy = rows.map((r) => {
    const yearAgo = new Date(r.date);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    const prev = [...rows]
      .reverse()
      .find((x) => x.distributor === r.distributor && new Date(x.date) <= yearAgo);
    return { ...r, yearAgo: prev?.price ?? null };
  });
  return { label: pick, labels, rows: yoy };
}

export async function createParty(input: {
  name: string;
  kind: Party["kind"];
  address?: string;
  website?: string;
}) {
  const name = input.name.trim();
  if (!name) return { ok: false as const, error: "Nom manquant." };
  const address = [input.address?.trim(), input.website?.trim()].filter(Boolean).join(" · ");
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) return { ok: false as const, error: "Enregistrement impossible. Vérifiez la connexion." };
    const u = seedMem("local");
    if (!u.parties.some((p) => p.name === name && p.kind === input.kind)) {
      u.parties.push({ id: `p-${Math.random().toString(36).slice(2, 8)}`, kind: input.kind, name, address, seed_key: null });
    }
    return { ok: true as const };
  }
  const { data: existing } = await db.supabase
    .from("parties")
    .select("id")
    .eq("user_id", db.user.id)
    .eq("name", name)
    .eq("kind", input.kind)
    .maybeSingle();
  if (existing) return { ok: true as const };
  const { error } = await db.supabase.from("parties").insert({
    user_id: db.user.id,
    kind: input.kind,
    name,
    address,
  });
  if (error) return { ok: false as const, error: error.message };
  return { ok: true as const };
}

export async function recordPriceAlerts(doc: DocumentCard) {
  if (doc.direction !== "in") return;
  const others = (await listDocuments({ direction: "in" })).filter((d) => d.id !== doc.id);
  const db = await getRemote();
  const { getNotificationPreferences } = await import("@/lib/settings/notification-store");
  const prefs = await getNotificationPreferences();
  const ALERT_THRESHOLD = prefs.supplierThresholdPct ?? 5;
  const rises: { label: string; oldPrice: number; newPrice: number; pct: number }[] = [];
  for (const line of doc.lines) {
    const prev = others
      .flatMap((d) => d.lines.map((l) => ({ l, d })))
      .filter((x) => x.l.label.toLowerCase() === line.label.toLowerCase())
      .sort((a, b) => b.d.created_at.localeCompare(a.d.created_at))[0];
    if (!prev) continue;
    const oldP = Number(prev.l.buy_price);
    const newP = Number(line.buy_price);
    if (!oldP || !newP) continue;
    const pct = ((newP - oldP) / oldP) * 100;
    if (pct < ALERT_THRESHOLD) continue;
    rises.push({ label: line.label, oldPrice: oldP, newPrice: newP, pct });
    const alert: PriceAlert = {
      id: `a-${Math.random().toString(36).slice(2, 8)}`,
      product_id: null,
      document_id: doc.id,
      chantier_id: doc.chantier_id,
      label: line.label,
      old_price: oldP,
      new_price: newP,
      created_at: new Date().toISOString(),
    };
    if (!db) {
      if (!allowLocalMemory()) continue;
      seedMem("local").alerts.unshift(alert);
      continue;
    }
    await db.supabase.from("price_alerts").insert({
      user_id: db.user.id,
      product_id: null,
      document_id: doc.id,
      chantier_id: doc.chantier_id,
      label: line.label,
      old_price: oldP,
      new_price: newP,
    });
  }
  if (rises.length) {
    const { notifySupplierIncreases } = await import("@/lib/notifications/emitters");
    await notifySupplierIncreases({
      documentId: doc.id,
      partyName: doc.party_name,
      items: rises,
    });
  }
}

export async function createChantier(input: { name: string; address?: string; clientName?: string }) {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) throw new Error("Impossible de créer le chantier. Vérifiez la connexion.");
    return memCreateChantier("local", input);
  }
  const name = input.name.trim();
  const { data: ownedChantiers } = await db.supabase
    .from("chantiers")
    .select("id, slug, name, address, client_id, project_id, status, seed_key, created_at, updated_at")
    .eq("user_id", db.user.id);
  const same = (ownedChantiers ?? []).find(
    (c) => c.name === name || normalizeChantierText(c.name) === normalizeChantierText(name),
  );
  if (same) return same as Chantier;

  const slugBase = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "chantier";
  let clientId: string | null = null;
  if (input.clientName?.trim()) {
    const { data: party } = await db.supabase
      .from("parties")
      .insert({
        user_id: db.user.id,
        kind: "client",
        name: input.clientName.trim(),
        address: input.address ?? "",
      })
      .select("id")
      .single();
    clientId = party?.id ?? null;
  }
  const { data, error } = await db.supabase
    .from("chantiers")
    .insert({
      user_id: db.user.id,
      slug: `${slugBase}-${Math.random().toString(36).slice(2, 6)}`,
      name: input.name.trim(),
      address: input.address ?? "",
      client_id: clientId,
      status: "pause",
    })
    .select("id, slug, name, address, client_id, project_id, status, seed_key, created_at, updated_at")
    .single();
  if (error || !data) {
    logMetier("createChantier", error);
    throw new Error("Impossible de créer le chantier.");
  }
  const created = data as Chantier;
  const { data: focus } = await db.supabase
    .from("chantiers")
    .select("id")
    .eq("user_id", db.user.id)
    .eq("status", "focus")
    .neq("id", created.id)
    .maybeSingle();
  if (!focus) await setChantierStatus(created.id, "focus");
  return created;
}

export async function setChantierStatus(id: string, status: ChantierStatus) {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) persistUnavailable("setChantierStatus");
    memSetChantierStatus("local", id, status);
    return;
  }
  if (status === "focus") {
    await db.supabase.from("chantiers").update({ status: "pause" }).eq("user_id", db.user.id).eq("status", "focus");
  }
  const { error } = await db.supabase.from("chantiers").update({ status }).eq("id", id).eq("user_id", db.user.id);
  if (error) {
    logMetier("setChantierStatus", error);
    throw new Error("Statut non enregistré.");
  }
}

export async function saveExtractedDocument(input: {
  title: string;
  direction: DocumentRow["direction"];
  kind: DocumentRow["kind"];
  partyName: string;
  partyKind: Party["kind"];
  chantierId: string | null;
  filePath?: string;
  contactName?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  extract: Record<string, unknown>;
  lines: Array<{ label: string; qty: number; unit: string; buy_price: number; sell_price?: number }>;
}): Promise<DocumentCard> {
  const db = await getRemote();
  const now = demoNow();
  const chantierId = db ? await assertOwned(db, "chantiers", input.chantierId) : input.chantierId;
  const contactName = String(input.contactName ?? "").trim().slice(0, 120);
  const contactEmail = String(input.contactEmail ?? "").trim().toLowerCase().slice(0, 200);
  const contactPhone = String(input.contactPhone ?? "").trim().slice(0, 40);
  if (!db) {
    if (!allowLocalMemory()) throw new Error("Enregistrement impossible. Vérifiez la connexion.");
    const u = seedMem("local");
    if (input.filePath) {
      const already = u.documents.find((d) => d.file_path && d.file_path === input.filePath);
      if (already) return (await listDocuments()).find((d) => d.id === already.id)!;
    }
    let party = u.parties.find((p) => p.name === input.partyName && p.kind === input.partyKind);
    if (!party) {
      party = {
        id: `p-${Math.random().toString(36).slice(2, 8)}`,
        kind: input.partyKind,
        name: input.partyName,
        address: "",
        seed_key: null,
        contact_name: contactName || null,
        contact_email: contactEmail || null,
        contact_phone: contactPhone || null,
      };
      u.parties.push(party);
    } else {
      if (contactName && !party.contact_name) party.contact_name = contactName;
      if (contactEmail && !party.contact_email) party.contact_email = contactEmail;
      if (contactPhone && !party.contact_phone) party.contact_phone = contactPhone;
    }
    const row: DocumentRow = {
      id: `d-${Math.random().toString(36).slice(2, 10)}`,
      direction: input.direction,
      kind: input.kind,
      title: input.title,
      party_id: party.id,
      chantier_id: chantierId,
      source_document_id: null,
      file_path: input.filePath ?? "",
      extract: input.extract,
      status: "ready",
      error: "",
      seed_key: null,
      created_at: now,
    };
    const lines: DocumentLine[] = input.lines.map((l, i) => ({
      id: `l-${Math.random().toString(36).slice(2, 8)}`,
      document_id: row.id,
      product_id: null,
      supplier_party_id: input.partyKind === "fournisseur" ? party!.id : null,
      distributor_party_id: input.partyKind === "distributeur" ? party!.id : null,
      label: l.label,
      qty: l.qty,
      unit: l.unit,
      buy_price: l.buy_price,
      sell_price: l.sell_price ?? 0,
      position: i,
    }));
    memAddDocument("local", row, lines);
    return (await listDocuments()).find((d) => d.id === row.id)!;
  }

  if (input.filePath) {
    const { data: byFile } = await db.supabase
      .from("documents")
      .select("id")
      .eq("user_id", db.user.id)
      .eq("file_path", input.filePath)
      .limit(1);
    if (byFile?.[0]?.id) {
      const existingDoc = await getDocument(byFile[0].id);
      if (existingDoc) return existingDoc;
    }
  }
  let partyId: string | null = null;
  let existingContact: {
    contact_name?: string | null;
    contact_email?: string | null;
    contact_phone?: string | null;
  } | null = null;
  {
    const withContact = await db.supabase
      .from("parties")
      .select("id, contact_name, contact_email, contact_phone")
      .eq("user_id", db.user.id)
      .eq("name", input.partyName)
      .eq("kind", input.partyKind)
      .maybeSingle();
    if (withContact.data) {
      partyId = withContact.data.id;
      existingContact = withContact.data;
    } else if (withContact.error) {
      const fallback = await db.supabase
        .from("parties")
        .select("id")
        .eq("user_id", db.user.id)
        .eq("name", input.partyName)
        .eq("kind", input.partyKind)
        .maybeSingle();
      partyId = fallback.data?.id ?? null;
    }
  }
  if (!partyId) {
    let { data: created, error: createErr } = await db.supabase
      .from("parties")
      .insert({
        user_id: db.user.id,
        kind: input.partyKind,
        name: input.partyName,
        ...(contactName ? { contact_name: contactName } : {}),
        ...(contactEmail ? { contact_email: contactEmail } : {}),
        ...(contactPhone ? { contact_phone: contactPhone } : {}),
      })
      .select("id")
      .single();
    if (createErr && (contactName || contactEmail || contactPhone)) {
      // Colonnes contact absentes (migration pas encore appliquée) : retry minimal.
      ({ data: created, error: createErr } = await db.supabase
        .from("parties")
        .insert({ user_id: db.user.id, kind: input.partyKind, name: input.partyName })
        .select("id")
        .single());
    }
    if (createErr) logMetier("saveExtractedDocument.party", createErr);
    partyId = created?.id ?? null;
  }
  if (partyId && (contactName || contactEmail || contactPhone)) {
    const patch: {
      contact_name?: string;
      contact_email?: string;
      contact_phone?: string;
    } = {};
    if (contactName && !String(existingContact?.contact_name ?? "").trim()) patch.contact_name = contactName;
    if (contactEmail && !String(existingContact?.contact_email ?? "").trim()) patch.contact_email = contactEmail;
    if (contactPhone && !String(existingContact?.contact_phone ?? "").trim()) patch.contact_phone = contactPhone;
    if (Object.keys(patch).length) {
      const { error: contactErr } = await db.supabase
        .from("parties")
        .update(patch)
        .eq("id", partyId)
        .eq("user_id", db.user.id);
      if (contactErr) logMetier("saveExtractedDocument.partyContact", contactErr);
    }
  }
  const { data: doc, error } = await db.supabase
    .from("documents")
    .insert({
      user_id: db.user.id,
      direction: input.direction,
      kind: input.kind,
      title: input.title,
      party_id: partyId,
      chantier_id: chantierId,
      file_path: input.filePath ?? "",
      extract: input.extract,
      status: "ready",
    })
    .select("id")
    .single();
  if (error || !doc) {
    logMetier("saveExtractedDocument", error);
    throw new Error("Le document n’a pas pu être enregistré.");
  }
  if (input.lines.length) {
    await db.supabase.from("document_lines").insert(
      input.lines.map((l, i) => ({
        user_id: db.user.id,
        document_id: doc.id,
        label: l.label,
        qty: l.qty,
        unit: l.unit,
        buy_price: l.buy_price,
        sell_price: l.sell_price ?? 0,
        position: i,
        distributor_party_id: input.partyKind === "distributeur" ? partyId : null,
        supplier_party_id: input.partyKind === "fournisseur" ? partyId : null,
      })),
    );
  }
  const saved = await getDocument(doc.id);
  return saved!;
}

async function nextOutTitle(kind: DocumentRow["kind"]) {
  const existing = await listDocuments({ direction: "out", kind });
  const n = existing.length + 1;
  const label = CLIENT_OUT_LABEL[kind as keyof typeof CLIENT_OUT_LABEL] ?? "Document client";
  return `${label} n°${String(n).padStart(3, "0")}`;
}

export async function transformImportedDocument(
  sourceId: string,
  markup: number,
  clientId: string | null,
  kind: DocumentRow["kind"] = "devis",
  copySell = false,
) {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) throw new Error("Enregistrement impossible. Vérifiez la connexion.");
    const out = memTransform("local", sourceId, markup, clientId, kind, copySell);
    return out ? getDocument(out.id) : null;
  }
  const src = await getDocument(sourceId);
  if (!src) return null;
  const already = (await listDocuments({ direction: "out", kind })).find((d) => d.source_document_id === src.id);
  if (already) return already;
  const partyId = await assertOwned(db, "parties", clientId ?? src.party_id);
  const factor = copySell ? 1 : markup;
  const title = await nextOutTitle(kind);
  const srcTotals = src.extract && typeof src.extract === "object" && "totals" in src.extract
    ? (src.extract as { totals?: { ht?: number | null } }).totals
    : null;
  const outTotals = srcTotals
    ? {
        ...srcTotals,
        ht: srcTotals.ht != null ? Math.round(Number(srcTotals.ht) * factor * 100) / 100 : null,
      }
    : null;
  const { data: doc, error } = await db.supabase
    .from("documents")
    .insert({
      user_id: db.user.id,
      direction: "out",
      kind,
      title,
      party_id: partyId,
      chantier_id: src.chantier_id,
      source_document_id: src.id,
      extract: { markup: factor, from: src.id, from_title: src.title, totals: outTotals },
      status: "ready",
    })
    .select("id")
    .single();
  if (error || !doc) {
    logMetier("transformImportedDocument", error);
    throw new Error(error?.message || "La pièce n’a pas pu être créée.");
  }
  if (src.lines.length) {
    await db.supabase.from("document_lines").insert(
      src.lines.map((l, i) => ({
        user_id: db.user.id,
        document_id: doc.id,
        product_id: l.product_id,
        supplier_party_id: l.supplier_party_id,
        distributor_party_id: l.distributor_party_id,
        label: l.label,
        qty: l.qty,
        unit: l.unit,
        buy_price: l.buy_price,
        sell_price: copySell
          ? Number(l.sell_price || l.buy_price)
          : Math.round(Number(l.buy_price) * markup * 100) / 100,
        position: i,
      })),
    );
  }
  return getDocument(doc.id);
}

export function focusChantier(cards: ChantierCard[]) {
  return cards.find((c) => c.status === "focus") ?? cards[0] ?? null;
}

export async function addDocumentLine(documentId: string) {
  const db = await getRemote();
  const blank = {
    label: "Nouvelle ligne",
    qty: 1,
    unit: "u",
    buy_price: 0,
    sell_price: 0,
  };
  if (!db) {
    if (!allowLocalMemory()) return { ok: false as const, error: "Enregistrement impossible. Vérifiez la connexion." };
    const u = seedMem("local");
    const doc = u.documents.find((d) => d.id === documentId);
    if (!doc) return { ok: false as const, error: "Pièce introuvable." };
    const pos = u.lines.filter((l) => l.document_id === documentId).length;
    u.lines.push({
      id: `l-${Math.random().toString(36).slice(2, 8)}`,
      document_id: documentId,
      product_id: null,
      supplier_party_id: null,
      distributor_party_id: null,
      position: pos,
      ...blank,
    });
    return { ok: true as const };
  }
  const { data: owned } = await db.supabase
    .from("documents")
    .select("id")
    .eq("id", documentId)
    .eq("user_id", db.user.id)
    .maybeSingle();
  if (!owned) return { ok: false as const, error: "Pièce introuvable." };
  const { data: existing } = await db.supabase
    .from("document_lines")
    .select("position")
    .eq("document_id", documentId)
    .eq("user_id", db.user.id);
  const { error } = await db.supabase.from("document_lines").insert({
    user_id: db.user.id,
    document_id: documentId,
    ...blank,
    position: (existing ?? []).length,
  });
  if (error) {
    logMetier("addDocumentLine", error);
    return { ok: false as const, error: "Ligne non enregistrée." };
  }
  return { ok: true as const };
}

export async function updateDocument(input: {
  id: string;
  title?: string;
  partyId?: string | null;
  chantierId?: string | null;
  partyName?: string;
  lines?: { id: string; label?: string; qty?: number; buy_price?: number; sell_price?: number }[];
}) {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) return { ok: false as const, error: "Enregistrement impossible. Vérifiez la connexion." };
    const row = memUpdateDocument("local", input.id, input);
    return row ? { ok: true as const } : { ok: false as const, error: "Pièce introuvable." };
  }
  const { data: owned } = await db.supabase
    .from("documents")
    .select("id, extract")
    .eq("user_id", db.user.id)
    .eq("id", input.id)
    .maybeSingle();
  if (!owned) {
    return { ok: false as const, error: "Pièce introuvable." };
  }
  if (input.partyId) {
    const party = await assertOwned(db, "parties", input.partyId);
    if (!party) return { ok: false as const, error: "Client introuvable." };
  }
  if (input.chantierId) {
    const chantier = await assertOwned(db, "chantiers", input.chantierId);
    if (!chantier) return { ok: false as const, error: "Chantier introuvable." };
  }
  const patchDoc: { title?: string; party_id?: string | null; chantier_id?: string | null } = {};
  if (input.title?.trim()) patchDoc.title = input.title.trim();
  if (input.partyId !== undefined) patchDoc.party_id = input.partyId;
  if (input.chantierId !== undefined) patchDoc.chantier_id = input.chantierId;
  if (Object.keys(patchDoc).length) {
    await db.supabase.from("documents").update(patchDoc).eq("id", input.id).eq("user_id", db.user.id);
  }
  if (input.partyName?.trim()) {
    const { data: current } = await db.supabase
      .from("documents")
      .select("party_id, direction")
      .eq("id", input.id)
      .eq("user_id", db.user.id)
      .maybeSingle();
    const partyId = input.partyId !== undefined ? input.partyId : (current?.party_id as string | null);
    if (partyId) {
      await db.supabase.from("parties").update({ name: input.partyName.trim() }).eq("id", partyId).eq("user_id", db.user.id);
    } else {
      const { data: created } = await db.supabase
        .from("parties")
        .insert({
          user_id: db.user.id,
          kind: current?.direction === "out" ? "client" : "distributeur",
          name: input.partyName.trim(),
        })
        .select("id")
        .maybeSingle();
      if (created?.id) {
        await db.supabase.from("documents").update({ party_id: created.id }).eq("id", input.id).eq("user_id", db.user.id);
      }
    }
  }
  for (const row of input.lines ?? []) {
    const patch: { label?: string; qty?: number; buy_price?: number; sell_price?: number } = {};
    if (row.label != null) patch.label = row.label;
    if (row.qty != null && Number.isFinite(row.qty)) patch.qty = row.qty;
    if (row.buy_price != null && Number.isFinite(row.buy_price)) patch.buy_price = row.buy_price;
    if (row.sell_price != null && Number.isFinite(row.sell_price)) patch.sell_price = row.sell_price;
    if (Object.keys(patch).length) {
      await db.supabase.from("document_lines").update(patch).eq("id", row.id).eq("user_id", db.user.id);
    }
  }
  const { data: lines } = await db.supabase
    .from("document_lines")
    .select("buy_price, sell_price, qty")
    .eq("document_id", input.id)
    .eq("user_id", db.user.id);
  const ht = (lines ?? []).reduce(
    (s, l) => s + Number(l.buy_price || l.sell_price) * Number(l.qty),
    0,
  );
  const prev = (owned.extract && typeof owned.extract === "object" ? owned.extract : {}) as Record<string, unknown>;
  await db.supabase
    .from("documents")
    .update({ extract: { ...prev, totals: { ...((prev.totals as object) ?? {}), ht: Math.round(ht * 100) / 100 } } })
    .eq("id", input.id)
    .eq("user_id", db.user.id);
  return { ok: true as const };
}

export function spendByMonth(docs: DocumentCard[]) {
  const now = new Date();
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1);
    const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    const amount = docs
      .filter((doc) => {
        const t = new Date(doc.created_at);
        return t >= d && t < next;
      })
      .reduce((s, doc) => s + doc.lines.reduce((a, l) => a + Number(l.buy_price) * Number(l.qty), 0), 0);
    return {
      key: `${d.getFullYear()}-${d.getMonth()}`,
      label: d.toLocaleDateString("fr-FR", { month: "short" }),
      amount,
    };
  });
}

export async function getCompanyProfile(): Promise<CompanyProfile | null> {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) persistUnavailable("getCompanyProfile");
    return memGetCompany("local");
  }
  const { data, error } = await db.supabase.from("company_profiles").select("*").eq("user_id", db.user.id).maybeSingle();
  if (error) {
    if (!allowLocalMemory()) failRead("getCompanyProfile", error);
    logMetier("getCompanyProfile", error);
    return null;
  }
  return (data as CompanyProfile) ?? null;
}

export async function saveCompanyProfile(input: CompanyProfile) {
  const db = await getRemote();
  if (!db) {
    if (!allowLocalMemory()) throw new Error("Enregistrement impossible. Vérifiez la connexion.");
    memSetCompany("local", input);
    return input;
  }
  const { error } = await db.supabase.from("company_profiles").upsert({
    user_id: db.user.id,
    ...input,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    logMetier("saveCompanyProfile", error);
    throw new Error("Profil entreprise non enregistré.");
  }
  return input;
}

export { getMem };
