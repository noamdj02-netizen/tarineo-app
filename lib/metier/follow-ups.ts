import { KIND_LABEL, totalsFromExtract, type DocumentCard, type DocKind } from "@/lib/metier/types";

export type FollowUpAudience = "client" | "fournisseur";
export type FollowUpStatus = "due" | "scheduled" | "sent" | "answered" | "done" | "cancelled";

export type FollowUp = {
  id: string;
  document_id: string;
  chantier_id: string | null;
  audience: FollowUpAudience;
  status: FollowUpStatus;
  scheduled_at: string | null;
  last_action_at: string | null;
  sent_at: string | null;
  to_email: string;
  subject: string;
  body: string;
  created_at: string;
  updated_at?: string;
  attempt_number?: number;
  sequence_number?: number;
  virtual?: boolean;
};

export type FollowUpView = FollowUp & {
  contact: string;
  chantier_name: string | null;
  chantier_slug: string | null;
  document_title: string;
  document_kind: DocKind;
  amount_ht: number;
};

export const FOLLOW_UP_STATUS_LABEL: Record<FollowUpStatus, string> = {
  due: "À relancer",
  scheduled: "Programmée",
  sent: "Envoyée",
  answered: "Réponse reçue",
  done: "Terminée",
  cancelled: "Annulée",
};

export function documentAmountHt(doc: DocumentCard) {
  const t = totalsFromExtract(doc.extract);
  if (t.ht != null) return t.ht;
  return doc.lines.reduce((s, l) => {
    const unit = doc.direction === "out" ? Number(l.sell_price || l.buy_price) : Number(l.buy_price);
    return s + unit * Number(l.qty);
  }, 0);
}

export function documentSentAt(extract: Record<string, unknown> | null | undefined): string | null {
  const v = extract?.sent_at;
  return typeof v === "string" && v ? v : null;
}

export function isDocumentTransformed(doc: DocumentCard, all: DocumentCard[]) {
  return all.some((d) => d.source_document_id === doc.id);
}

/** Libellé de cycle de vie, uniquement à partir de sent_at et source_document_id. */
export function documentLifecycleLabel(doc: DocumentCard, all: DocumentCard[]) {
  const sent = documentSentAt(doc.extract);
  const next = all.filter((d) => d.source_document_id === doc.id);
  if (doc.direction === "out" && doc.kind === "devis") {
    if (next.some((n) => n.kind === "facture")) return "Facturé";
    if (next.some((n) => n.kind === "bon_commande")) return "Commande créée";
    if (sent) return "Envoyé";
    return "Prêt";
  }
  if (doc.direction === "out" && doc.kind === "bon_commande") {
    if (next.some((n) => n.kind === "facture")) return "Facturée";
    if (sent) return "Envoyée";
    return "Créée";
  }
  if (doc.kind === "facture") return sent ? "Envoyée" : "Créée";
  if (sent) return "Envoyé";
  if (next.length) return "Lié";
  return KIND_LABEL[doc.kind];
}

export function followUpAudience(doc: DocumentCard): FollowUpAudience {
  return doc.direction === "out" ? "client" : "fournisseur";
}

/** Relance auto / cron : ne pas se fier au seul statut follow_ups. */
export function followUpStillEligible(
  doc: DocumentCard | null,
  all: DocumentCard[],
  fu: FollowUp,
  opts?: { requirePriorSend?: boolean },
): { ok: true } | { ok: false; reason: string } {
  if (!doc) return { ok: false, reason: "document-missing" };
  if (doc.status !== "ready") return { ok: false, reason: "document-invalid" };
  if (doc.error) return { ok: false, reason: "document-invalid" };
  if (!fu.to_email.includes("@")) return { ok: false, reason: "email-missing" };
  if (isDocumentTransformed(doc, all)) return { ok: false, reason: "transformed" };
  if (fu.status === "answered" || fu.status === "done" || fu.status === "cancelled") {
    return { ok: false, reason: "closed" };
  }
  if (fu.status === "sent" && fu.sent_at) return { ok: false, reason: "already-sent" };
  if (opts?.requirePriorSend && !documentSentAt(doc.extract)) return { ok: false, reason: "not-sent" };
  return { ok: true };
}

export function formatRelativeFr(iso: string | null, now = Date.now()) {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  const days = Math.floor((now - t) / 86_400_000);
  if (days <= 0) return "Aujourd’hui";
  if (days === 1) return "Hier";
  return `Il y a ${days} jour${days > 1 ? "s" : ""}`;
}

export function formatNextActionFr(fu: FollowUp, now = Date.now()) {
  if (fu.status === "cancelled") return "Annulée";
  if (fu.status === "answered" || fu.status === "done") return "Terminée";
  if (fu.status === "sent") return "Envoyée";
  if (fu.status === "scheduled" && fu.scheduled_at) {
    const t = Date.parse(fu.scheduled_at);
    if (!Number.isFinite(t)) return "Programmée";
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const target = new Date(t);
    const day = new Date(target);
    day.setHours(0, 0, 0, 0);
    const diff = Math.round((day.getTime() - start.getTime()) / 86_400_000);
    const hm = target.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
    if (diff === 0) return `Aujourd’hui ${hm}`;
    if (diff === 1) return `Demain ${hm}`;
    return target.toLocaleDateString("fr-FR", { day: "numeric", month: "long" }) + ` ${hm}`;
  }
  return "Aujourd’hui";
}

const THREE_DAYS = 3 * 86_400_000;

export function buildFollowUpViews(
  documents: DocumentCard[],
  stored: FollowUp[],
  now = Date.now(),
): FollowUpView[] {
  const byDoc = new Map<string, FollowUp>();
  for (const fu of stored) {
    if (fu.status === "done" || fu.status === "cancelled") continue;
    const prev = byDoc.get(fu.document_id);
    if (!prev) {
      byDoc.set(fu.document_id, fu);
      continue;
    }
    const rank = (s: FollowUpStatus) =>
      s === "due" ? 4 : s === "scheduled" ? 3 : s === "sent" ? 2 : s === "answered" ? 1 : 0;
    if (rank(fu.status) >= rank(prev.status)) byDoc.set(fu.document_id, fu);
  }

  const views: FollowUpView[] = [];

  for (const fu of stored) {
    if (fu.status === "done" || fu.status === "cancelled") continue;
    const doc = documents.find((d) => d.id === fu.document_id);
    if (!doc) continue;
    views.push(toView(fu, doc));
  }

  for (const doc of documents) {
    if (doc.status !== "ready" || doc.error) continue;
    if (isDocumentTransformed(doc, documents)) continue;
    if (byDoc.has(doc.id)) continue;
    const eligibleKind =
      (doc.direction === "out" && (doc.kind === "devis" || doc.kind === "bon_commande")) ||
      (doc.direction === "in" && (doc.kind === "devis" || doc.kind === "bon_commande"));
    if (!eligibleKind) continue;
    const sent = documentSentAt(doc.extract);
    if (!sent) continue;
    const ref = Date.parse(sent);
    if (!Number.isFinite(ref) || now - ref < THREE_DAYS) continue;
    const virtual: FollowUp = {
      id: `virtual:${doc.id}`,
      document_id: doc.id,
      chantier_id: doc.chantier_id,
      audience: followUpAudience(doc),
      status: "due",
      scheduled_at: null,
      last_action_at: sent || doc.created_at,
      sent_at: sent,
      to_email: "",
      subject: "",
      body: "",
      created_at: doc.created_at,
      virtual: true,
    };
    views.push(toView(virtual, doc));
  }

  const order: Record<FollowUpStatus, number> = {
    due: 0,
    scheduled: 1,
    sent: 2,
    answered: 3,
    done: 4,
    cancelled: 5,
  };
  return views.sort((a, b) => order[a.status] - order[b.status] || a.document_title.localeCompare(b.document_title, "fr"));
}

function toView(fu: FollowUp, doc: DocumentCard): FollowUpView {
  return {
    ...fu,
    contact: doc.party_name || "—",
    chantier_name: doc.chantier_name,
    chantier_slug: doc.chantier_slug,
    document_title: doc.title || KIND_LABEL[doc.kind],
    document_kind: doc.kind,
    amount_ht: documentAmountHt(doc),
  };
}

export function dueCountByChantier(views: FollowUpView[]) {
  const map = new Map<string, number>();
  for (const v of views) {
    if (v.status !== "due" || !v.chantier_id) continue;
    map.set(v.chantier_id, (map.get(v.chantier_id) ?? 0) + 1);
  }
  return map;
}

export type DocChain = DocumentCard[];

const KIND_RANK: Record<string, number> = {
  devis: 0,
  bon_commande: 1,
  bon_enlevement: 2,
  facture: 3,
  bl: 4,
  autre: 5,
};

export function documentChains(docs: DocumentCard[]): DocChain[] {
  const byId = new Map(docs.map((d) => [d.id, d]));
  const children = new Map<string, DocumentCard[]>();
  for (const d of docs) {
    if (!d.source_document_id) continue;
    const list = children.get(d.source_document_id) ?? [];
    list.push(d);
    children.set(d.source_document_id, list);
  }

  function collect(id: string, acc: DocumentCard[], seen: Set<string>) {
    for (const child of children.get(id) ?? []) {
      if (seen.has(child.id)) continue;
      seen.add(child.id);
      acc.push(child);
      collect(child.id, acc, seen);
    }
  }

  const chains: DocChain[] = [];
  for (const d of docs) {
    if (d.source_document_id && byId.has(d.source_document_id)) continue;
    const desc: DocumentCard[] = [];
    collect(d.id, desc, new Set());
    if (!desc.length) continue;
    desc.sort(
      (a, b) =>
        (KIND_RANK[a.kind] ?? 9) - (KIND_RANK[b.kind] ?? 9) || a.created_at.localeCompare(b.created_at),
    );
    chains.push([d, ...desc]);
  }
  return chains;
}

export function scheduleAtNine(days: number, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  d.setHours(9, 0, 0, 0);
  return d.toISOString();
}
