import { DEMO_IDS, demoNow } from "@/lib/metier/demo";
import {
  DEMO_BUY_HT,
  DEMO_BUY_UNIT,
  DEMO_CLIENT_HT,
  DEMO_MARKUP,
  DEMO_QTY,
  DEMO_SELL_UNIT,
  demoSentAtIso,
  demoSentAtRelance,
} from "@/lib/metier/demo-seed-bundle";
import type { CompanyProfile } from "@/lib/metier/company";
import type { FollowUp } from "@/lib/metier/follow-ups";
import type {
  Chantier,
  ChantierStatus,
  DocumentLine,
  DocumentRow,
  Party,
  PriceAlert,
  Product,
} from "@/lib/metier/types";

export type MemUser = {
  parties: Party[];
  products: Product[];
  chantiers: Chantier[];
  documents: DocumentRow[];
  lines: DocumentLine[];
  alerts: PriceAlert[];
  followUps: FollowUp[];
};

const g = globalThis as unknown as {
  __tarineoMetier?: Map<string, MemUser>;
  __tarineoCompany?: Map<string, CompanyProfile>;
};
const store = (g.__tarineoMetier ??= new Map<string, MemUser>());
const companies = (g.__tarineoCompany ??= new Map<string, CompanyProfile>());

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function emptyUser(): MemUser {
  return { parties: [], products: [], chantiers: [], documents: [], lines: [], alerts: [], followUps: [] };
}

export function getMem(userId: string): MemUser {
  let u = store.get(userId);
  if (!u) {
    u = emptyUser();
    store.set(userId, u);
  }
  if (!u.followUps) u.followUps = [];
  return u;
}

function upsertDoc(
  u: MemUser,
  row: Omit<DocumentRow, "id" | "created_at"> & { seed_key: string },
  now: string,
) {
  const prev = u.documents.find((d) => d.seed_key === row.seed_key);
  if (prev) {
    Object.assign(prev, row);
    return prev;
  }
  const stableId = row.seed_key.startsWith("demo-") ? `seed-${row.seed_key}` : uid("d");
  const doc: DocumentRow = {
    ...row,
    id: stableId,
    created_at: now,
  };
  u.documents.push(doc);
  return doc;
}

function ensureDemoParties(u: MemUser, now: string) {
  const pushParty = (row: Omit<Party, "id">) => {
    if (!u.parties.some((p) => p.seed_key === row.seed_key)) u.parties.push({ ...row, id: uid("p") });
  };
  pushParty({
    kind: "client",
    name: "Madame Dupont",
    address: "12 rue des Acacias, 69003 Lyon",
    seed_key: DEMO_IDS.client,
  });
  pushParty({
    kind: "distributeur",
    name: "Cedeo Lyon",
    address: "Avenue Jean Jaurès, Lyon",
    seed_key: DEMO_IDS.dist,
  });
  pushParty({ kind: "fournisseur", name: "Nicoll", address: "", seed_key: DEMO_IDS.fourn });
  if (!u.products.some((p) => p.seed_key === DEMO_IDS.product)) {
    u.products.push({
      id: uid("pr"),
      name: "Tube PVC Ø 500",
      family: "Évacuation",
      unit: "ml",
      seed_key: DEMO_IDS.product,
    });
  }
  if (!u.chantiers.some((c) => c.seed_key === DEMO_IDS.chantier)) {
    const client = u.parties.find((p) => p.seed_key === DEMO_IDS.client)!;
    u.chantiers.push({
      id: uid("ch"),
      slug: "madame-dupont",
      name: "Chantier Madame Dupont",
      address: "12 rue des Acacias, 69003 Lyon",
      client_id: client.id,
      project_id: null,
      status: "focus",
      seed_key: DEMO_IDS.chantier,
      created_at: now,
      updated_at: now,
    });
  }
}

function syncDemoMem(u: MemUser) {
  const now = demoNow();
  ensureDemoParties(u, now);
  const client = u.parties.find((p) => p.seed_key === DEMO_IDS.client)!;
  const dist = u.parties.find((p) => p.seed_key === DEMO_IDS.dist)!;
  const fourn = u.parties.find((p) => p.seed_key === DEMO_IDS.fourn)!;
  const product = u.products.find((p) => p.seed_key === DEMO_IDS.product)!;
  const chantier = u.chantiers.find((c) => c.seed_key === DEMO_IDS.chantier)!;
  const docIn = upsertDoc(
    u,
    {
      direction: "in",
      kind: "devis",
      title: "Devis Cedeo - tubes PVC",
      party_id: dist.id,
      chantier_id: chantier.id,
      source_document_id: null,
      file_path: "",
      extract: {
        demo: true,
        totals: { ht: DEMO_BUY_HT, eco_contribution: 0.42, pmcb: 0.42, weight_kg: 86.4 },
      },
      status: "ready",
      error: "",
      seed_key: DEMO_IDS.docIn,
    },
    now,
  );
  const docOut = upsertDoc(
    u,
    {
      direction: "out",
      kind: "devis",
      title: "Devis client Dupont",
      party_id: client.id,
      chantier_id: chantier.id,
      source_document_id: docIn.id,
      file_path: "",
      extract: { demo: true, markup: DEMO_MARKUP, sent_at: demoSentAtIso(4), totals: { ht: DEMO_CLIENT_HT } },
      status: "ready",
      error: "",
      seed_key: DEMO_IDS.docOut,
    },
    now,
  );
  const docOutPret = upsertDoc(
    u,
    {
      direction: "out",
      kind: "devis",
      title: "Devis client — extension Dupont",
      party_id: client.id,
      chantier_id: chantier.id,
      source_document_id: null,
      file_path: "",
      extract: {
        demo: true,
        markup: DEMO_MARKUP,
        sent_at: demoSentAtRelance(),
        totals: { ht: DEMO_CLIENT_HT },
      },
      status: "ready",
      error: "",
      seed_key: DEMO_IDS.docOutPret,
    },
    now,
  );
  const docOutCmd = upsertDoc(
    u,
    {
      direction: "out",
      kind: "devis",
      title: "Devis client — cuisine Dupont",
      party_id: client.id,
      chantier_id: chantier.id,
      source_document_id: null,
      file_path: "",
      extract: { demo: true, markup: DEMO_MARKUP, totals: { ht: DEMO_CLIENT_HT } },
      status: "ready",
      error: "",
      seed_key: DEMO_IDS.docOutCommande,
    },
    now,
  );
  const docBc = upsertDoc(
    u,
    {
      direction: "out",
      kind: "bon_commande",
      title: "Bon de commande client n°001",
      party_id: client.id,
      chantier_id: chantier.id,
      source_document_id: docOut.id,
      file_path: "",
      extract: {
        demo: true,
        markup: 1,
        from: docOut.id,
        from_title: "Devis client Dupont",
        totals: { ht: DEMO_CLIENT_HT },
      },
      status: "ready",
      error: "",
      seed_key: DEMO_IDS.docBc,
    },
    now,
  );
  upsertDoc(
    u,
    {
      direction: "out",
      kind: "facture",
      title: "Facture client n°001",
      party_id: client.id,
      chantier_id: chantier.id,
      source_document_id: docBc.id,
      file_path: "",
      extract: {
        demo: true,
        markup: 1,
        from: docBc.id,
        from_title: "Bon de commande client n°001",
        totals: { ht: DEMO_CLIENT_HT },
      },
      status: "ready",
      error: "",
      seed_key: DEMO_IDS.docFacture,
    },
    now,
  );

  const demoDocIds = new Set(
    u.documents.filter((d) => d.seed_key?.startsWith("demo-doc")).map((d) => d.id),
  );
  u.lines = u.lines.filter((l) => !demoDocIds.has(l.document_id));

  const lineIn = {
    product_id: product.id,
    supplier_party_id: fourn.id,
    distributor_party_id: dist.id,
    label: "Tube PVC Ø 500",
    qty: DEMO_QTY,
    unit: "ml",
    buy_price: DEMO_BUY_UNIT,
  };
  u.lines.push({
    id: uid("l"),
    document_id: docIn.id,
    ...lineIn,
    sell_price: 0,
    position: 0,
  });
  for (const doc of [docOut, docOutPret, docOutCmd, docBc]) {
    u.lines.push({
      id: uid("l"),
      document_id: doc.id,
      ...lineIn,
      sell_price: DEMO_SELL_UNIT,
      position: 0,
    });
  }
  const facture = u.documents.find((d) => d.seed_key === DEMO_IDS.docFacture);
  if (facture) {
    u.lines.push({
      id: uid("l"),
      document_id: facture.id,
      ...lineIn,
      sell_price: DEMO_SELL_UNIT,
      position: 0,
    });
  }

  const alertIdx = u.alerts.findIndex((a) => a.label === "Tube PVC Ø 500 chez Cedeo");
  const alert: PriceAlert = {
    id: alertIdx >= 0 ? u.alerts[alertIdx].id : uid("a"),
    product_id: product.id,
    document_id: docIn.id,
    chantier_id: chantier.id,
    label: "Tube PVC Ø 500 chez Cedeo",
    old_price: 22.4,
    new_price: 24.6,
    created_at: now,
    chantier_name: chantier.name,
  };
  if (alertIdx >= 0) u.alerts[alertIdx] = alert;
  else u.alerts.push(alert);
}

export function seedMem(userId: string): MemUser {
  const u = getMem(userId);
  syncDemoMem(u);
  return u;
}

export function memCreateChantier(
  userId: string,
  input: { name: string; address?: string; clientName?: string },
): Chantier {
  const u = seedMem(userId);
  const name = input.name.trim();
  const existing = u.chantiers.find(
    (c) => c.name === name || c.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() === name.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase(),
  );
  if (existing) return existing;
  const slug = input.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48) || "chantier";
  let unique = slug;
  let n = 2;
  while (u.chantiers.some((c) => c.slug === unique)) unique = `${slug}-${n++}`;
  let clientId: string | null = null;
  if (input.clientName?.trim()) {
    const p: Party = {
      id: uid("p"),
      kind: "client",
      name: input.clientName.trim(),
      address: input.address ?? "",
      seed_key: null,
    };
    u.parties.push(p);
    clientId = p.id;
  }
  const now = demoNow();
  const c: Chantier = {
    id: uid("ch"),
    slug: unique,
    name: input.name.trim(),
    address: input.address ?? "",
    client_id: clientId,
    project_id: null,
    status: u.chantiers.some((x) => x.status === "focus") ? "pause" : "focus",
    seed_key: null,
    created_at: now,
    updated_at: now,
  };
  u.chantiers.push(c);
  return c;
}

export function memSetChantierStatus(userId: string, id: string, status: ChantierStatus) {
  const u = seedMem(userId);
  for (const c of u.chantiers) {
    if (status === "focus" && c.id !== id && c.status === "focus") c.status = "pause";
    if (c.id === id) c.status = status;
  }
}

export function memAddDocument(userId: string, row: DocumentRow, lines: DocumentLine[]) {
  const u = seedMem(userId);
  u.documents.unshift(row);
  u.lines.push(...lines);
}

export function memTransform(
  userId: string,
  sourceId: string,
  markup: number,
  clientId: string | null,
  kind: DocumentRow["kind"] = "devis",
  copySell = false,
): DocumentRow | null {
  const u = seedMem(userId);
  const src = u.documents.find((d) => d.id === sourceId);
  if (!src) return null;
  const already = u.documents.find((d) => d.source_document_id === src.id && d.kind === kind && d.direction === "out");
  if (already) return already;
  const now = demoNow();
  const n = u.documents.filter((d) => d.direction === "out" && d.kind === kind).length + 1;
  const titles: Record<string, string> = {
    devis: "Devis client",
    facture: "Facture client",
    bon_commande: "Bon de commande client",
    bon_enlevement: "Bon d’enlèvement",
  };
  const factor = copySell ? 1 : markup;
  const out: DocumentRow = {
    id: uid("d"),
    direction: "out",
    kind,
    title: `${titles[kind] ?? "Document client"} n°${String(n).padStart(3, "0")}`,
    party_id: clientId ?? src.party_id,
    chantier_id: src.chantier_id,
    source_document_id: src.id,
    file_path: "",
    extract: {
      markup: factor,
      from: src.id,
      from_title: src.title,
      totals: (() => {
        const t = (src.extract?.totals ?? src.extract) as { ht?: number | null } | undefined;
        if (!t || typeof t !== "object") return src.extract?.totals ?? null;
        return { ...t, ht: t.ht != null ? Math.round(Number(t.ht) * factor * 100) / 100 : t.ht };
      })(),
    },
    status: "ready",
    error: "",
    seed_key: null,
    created_at: now,
  };
  u.documents.unshift(out);
  const srcLines = u.lines.filter((l) => l.document_id === src.id);
  for (const l of srcLines) {
    const sell = copySell
      ? Number(l.sell_price || l.buy_price)
      : Math.round(Number(l.buy_price) * markup * 100) / 100;
    u.lines.push({
      ...l,
      id: uid("l"),
      document_id: out.id,
      sell_price: sell,
    });
  }
  return out;
}

export function memUpdateDocument(
  userId: string,
  id: string,
  input: {
    title?: string;
    partyId?: string | null;
    chantierId?: string | null;
    partyName?: string;
    lines?: { id: string; label?: string; qty?: number; buy_price?: number; sell_price?: number }[];
  },
) {
  const u = seedMem(userId);
  const doc = u.documents.find((d) => d.id === id);
  if (!doc) return null;
  if (input.title?.trim()) doc.title = input.title.trim();
  if (input.chantierId !== undefined) doc.chantier_id = input.chantierId;
  if (input.partyId !== undefined) doc.party_id = input.partyId;
  if (input.partyName?.trim()) {
    let party = input.partyId ? u.parties.find((p) => p.id === input.partyId) : u.parties.find((p) => p.id === doc.party_id);
    if (!party) {
      party = {
        id: uid("p"),
        kind: doc.direction === "out" ? "client" : "distributeur",
        name: input.partyName.trim(),
        address: "",
        seed_key: null,
      };
      u.parties.push(party);
      doc.party_id = party.id;
    } else {
      party.name = input.partyName.trim();
    }
  }
  for (const row of input.lines ?? []) {
    const line = u.lines.find((l) => l.id === row.id && l.document_id === id);
    if (!line) continue;
    if (row.label != null) line.label = row.label;
    if (row.qty != null && Number.isFinite(row.qty)) line.qty = row.qty;
    if (row.buy_price != null && Number.isFinite(row.buy_price)) line.buy_price = row.buy_price;
    if (row.sell_price != null && Number.isFinite(row.sell_price)) line.sell_price = row.sell_price;
  }
  const ht = u.lines
    .filter((l) => l.document_id === id)
    .reduce((s, l) => s + Number(l.buy_price || l.sell_price) * Number(l.qty), 0);
  const prev = (doc.extract && typeof doc.extract === "object" ? doc.extract : {}) as Record<string, unknown>;
  const totals = { ...((prev.totals as object) ?? {}), ht: Math.round(ht * 100) / 100 };
  doc.extract = { ...prev, totals };
  return doc;
}

export function memGetCompany(userId: string): CompanyProfile | null {
  return companies.get(userId) ?? null;
}

export function memSetCompany(userId: string, profile: CompanyProfile) {
  companies.set(userId, profile);
}

export function memMergeExtract(userId: string, id: string, patch: Record<string, unknown>) {
  const u = getMem(userId);
  const doc = u.documents.find((d) => d.id === id);
  if (!doc) return null;
  const prev = (doc.extract && typeof doc.extract === "object" ? doc.extract : {}) as Record<string, unknown>;
  doc.extract = { ...prev, ...patch };
  return doc;
}

export function memListFollowUps(userId: string): FollowUp[] {
  return [...getMem(userId).followUps];
}

export function memUpsertFollowUp(userId: string, row: FollowUp) {
  const u = getMem(userId);
  const i = u.followUps.findIndex((f) => f.id === row.id);
  if (i >= 0) u.followUps[i] = row;
  else u.followUps.unshift(row);
  return row;
}

export function memUpdateFollowUp(userId: string, id: string, patch: Partial<FollowUp>) {
  const u = getMem(userId);
  const row = u.followUps.find((f) => f.id === id);
  if (!row) return null;
  Object.assign(row, patch);
  return row;
}
