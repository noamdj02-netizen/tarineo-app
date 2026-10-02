import type { FollowUpView } from "@/lib/metier/follow-ups";
import { documentAmountHt, formatRelativeFr } from "@/lib/metier/follow-ups";
import { KIND_LABEL, type DocumentCard, type PriceAlert } from "@/lib/metier/types";
import type { AppNotification } from "@/lib/notifications/types";
import { priorityDot } from "@/lib/notifications/types";
import { R } from "@/lib/routes";
import { signedPct, variation } from "@/lib/site/tarineo";

export const EASE = "duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]";
export const SURFACE =
  "h-fit rounded-[16px] border border-line bg-surface shadow-soft transition-[border-color,box-shadow,background-color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]";
export const SURFACE_HOVER = "hover:border-line-strong hover:shadow-lift hover:bg-surface-2";
export const ACTION_LINK =
  "inline-flex items-center gap-1 text-[13px] font-medium text-tarineo-orange transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:text-tarineo-orange";
export const BTN =
  "inline-flex h-11 items-center rounded-[12px] px-4 text-[13px] font-medium transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/35 md:h-[38px] md:rounded-[10px]";
export const BTN_PRIMARY = `${BTN} bg-tarineo-orange text-white hover:brightness-[0.96]`;
export const BTN_SECONDARY = `${BTN} border border-line bg-surface text-ink hover:bg-surface-2`;

export type ActionItem = {
  key: string;
  title: string;
  hint: string;
  href: string;
  cta: string;
  dot: string;
};

export type ActivityItem = {
  key: string;
  at: string;
  label: string;
  when: string;
  hot?: boolean;
};

export function buildActions({
  devisAEnvoyer,
  alerts,
  pendingDocs,
  relancesDue,
  documents,
  actionNotifications = [],
}: {
  devisAEnvoyer: DocumentCard[];
  alerts: PriceAlert[];
  pendingDocs: DocumentCard[];
  relancesDue: FollowUpView[];
  documents: DocumentCard[];
  actionNotifications?: AppNotification[];
}): ActionItem[] {
  const items: ActionItem[] = [];
  const seen = new Set<string>();

  for (const n of actionNotifications) {
    const entityKey = `${n.entityType}:${n.entityId}`;
    if (n.entityId && seen.has(entityKey)) continue;
    if (n.entityId) seen.add(entityKey);
    items.push({
      key: `n-${n.id}`,
      title: n.title,
      hint: n.message.split("\n")[0] ?? "",
      href: n.actionUrl || "/notifications",
      cta: "Ouvrir",
      dot: priorityDot(n.priority),
    });
  }

  for (const f of relancesDue.slice(0, 2)) {
    const ek = `document:${f.document_id}`;
    if (seen.has(ek)) continue;
    seen.add(ek);
    items.push({
      key: `fu-${f.id}`,
      title: f.document_title,
      hint: f.contact ? `${f.contact} · à relancer` : "À relancer",
      href: `/pieces/${f.document_id}`,
      cta: "Relancer",
      dot: "bg-nav-orange",
    });
  }
  for (const d of devisAEnvoyer.slice(0, 2)) {
    const ek = `document:${d.id}`;
    if (seen.has(ek)) continue;
    seen.add(ek);
    items.push({
      key: `dv-${d.id}`,
      title: d.title,
      hint: "Prêt à être envoyé",
      href: `/pieces/${d.id}`,
      cta: "Envoyer",
      dot: "bg-nav-orange",
    });
  }
  for (const a of alerts.slice(0, 1)) {
    const ek = a.document_id ? `document:${a.document_id}` : `alert:${a.id}`;
    if (seen.has(ek)) continue;
    seen.add(ek);
    const party = documents.find((d) => d.id === a.document_id)?.party_name;
    const pct = signedPct(variation(Number(a.old_price), Number(a.new_price)));
    items.push({
      key: `al-${a.id}`,
      title: a.label,
      hint: party ? `${party} · ${pct}` : pct,
      href: a.document_id ? `/pieces/${a.document_id}` : R.hausses,
      cta: "Voir",
      dot: "bg-[#F59E0B]",
    });
  }
  for (const d of pendingDocs.slice(0, 1)) {
    const ek = `document:${d.id}`;
    if (seen.has(ek)) continue;
    seen.add(ek);
    items.push({
      key: `in-${d.id}`,
      title: d.title,
      hint: d.party_name ? `${d.party_name} · à transformer` : "Document d’achat à vérifier",
      href: `/pieces/${d.id}`,
      cta: "Ouvrir",
      dot: "bg-[#C4C4C4]",
    });
  }
  return items;
}

export function buildActivity(documents: DocumentCard[], relances: FollowUpView[]): ActivityItem[] {
  const items: ActivityItem[] = [];
  for (const d of documents) {
    if (!d.created_at) continue;
    const kindLabel = d.kind && KIND_LABEL[d.kind] ? KIND_LABEL[d.kind] : "Document";
    const verb = d.direction === "in" ? "enregistré" : "créé";
    items.push({
      key: `doc-${d.id}`,
      at: d.created_at,
      label: `${kindLabel} ${verb}`,
      when: activityWhen(d.created_at),
    });
  }
  for (const f of relances) {
    const at = f.sent_at || f.scheduled_at || f.created_at;
    if (!at) continue;
    items.push({
      key: `fu-${f.id}`,
      at,
      label: f.sent_at ? "Relance envoyée" : "Relance programmée",
      when: activityWhen(at),
      hot: true,
    });
  }
  return items.sort((a, b) => b.at.localeCompare(a.at));
}

function activityWhen(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return formatRelativeFr(iso);
  const hm = new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${formatRelativeFr(iso)} · ${hm}`;
}
