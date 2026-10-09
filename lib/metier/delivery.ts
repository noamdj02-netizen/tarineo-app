import type { DocumentCard } from "@/lib/metier/types";

const ISO_DAY = /^\d{4}-\d{2}-\d{2}$/;

/** Lit la date de livraison prévue stockée dans l’extract du document. */
export function documentDeliveryDate(doc: Pick<DocumentCard, "extract">): string | null {
  const raw = doc.extract?.delivery_date;
  if (typeof raw !== "string") return null;
  const day = raw.trim();
  return ISO_DAY.test(day) ? day : null;
}

/** Affichage FR JJ/MM/AAAA. */
export function formatDeliveryDateFr(isoDay: string): string {
  const day = isoDay.trim();
  if (!ISO_DAY.test(day)) return day;
  const [y, m, d] = day.split("-");
  return `${d}/${m}/${y}`;
}

export type UpcomingDelivery = {
  documentId: string;
  day: string;
  title: string;
  partyName: string | null;
  chantierName: string | null;
  chantierSlug: string | null;
};

function todayIsoLocal(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Livraisons à venir (aujourd’hui inclus), triées par date. */
export function upcomingDeliveries(
  docs: DocumentCard[],
  opts?: { fromDay?: string; limit?: number },
): UpcomingDelivery[] {
  const from = opts?.fromDay ?? todayIsoLocal();
  const limit = opts?.limit ?? 12;
  return docs
    .map((doc) => {
      const day = documentDeliveryDate(doc);
      if (!day || day < from) return null;
      return {
        documentId: doc.id,
        day,
        title: doc.title,
        partyName: doc.party_name,
        chantierName: doc.chantier_name,
        chantierSlug: doc.chantier_slug,
      } satisfies UpcomingDelivery;
    })
    .filter((x): x is UpcomingDelivery => Boolean(x))
    .sort((a, b) => a.day.localeCompare(b.day) || a.title.localeCompare(b.title))
    .slice(0, limit);
}
