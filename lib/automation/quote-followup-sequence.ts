import type { QuoteFollowupConfig } from "@/lib/automation/types";
import { documentSentAt, type FollowUp } from "@/lib/metier/follow-ups";
import type { DocumentCard } from "@/lib/metier/types";

function dueAtMs(referenceIso: string, delayDays: number, hourLocal: number): number {
  const d = new Date(referenceIso);
  d.setDate(d.getDate() + delayDays);
  d.setHours(hourLocal, 0, 0, 0);
  return d.getTime();
}

function seqNumber(fu: FollowUp) {
  return fu.sequence_number ?? 1;
}

function closedStatus(s: string) {
  return s === "done" || s === "cancelled" || s === "answered";
}

/** Relance clôturée (réponse client, refus, annulation manuelle). */
export function quoteFollowUpClosedForDocument(stored: FollowUp[], documentId: string) {
  return stored.some((f) => f.document_id === documentId && closedStatus(f.status));
}

export function pickNextQuoteFollowUpSequence(
  doc: DocumentCard,
  stored: FollowUp[],
  config: QuoteFollowupConfig,
  now = Date.now(),
): { seq: number; scheduledAt: string; referenceIso: string } | { skip: string } {
  if (quoteFollowUpClosedForDocument(stored, doc.id)) return { skip: "closed" };
  const docFus = stored.filter((f) => f.document_id === doc.id && !closedStatus(f.status));
  const maxSent = docFus.filter((f) => f.status === "sent").reduce((m, f) => Math.max(m, seqNumber(f)), 0);
  const seq = maxSent + 1;
  if (seq > (config.maxSequences ?? 2)) return { skip: "max-sequences" };
  if (docFus.some((f) => seqNumber(f) === seq && (f.status === "scheduled" || f.status === "sent"))) {
    return { skip: "sequence-already-scheduled" };
  }

  const sentAt = documentSentAt(doc.extract);
  if (!sentAt) return { skip: "not-sent" };

  let referenceIso = sentAt;
  let delayDays = config.firstDelayDays ?? 3;
  if (seq > 1) {
    const prev = docFus
      .filter((f) => f.status === "sent" && seqNumber(f) === seq - 1)
      .sort((a, b) => (b.sent_at ?? "").localeCompare(a.sent_at ?? ""))[0];
    if (!prev?.sent_at) return { skip: "prior-sequence-not-sent" };
    referenceIso = prev.sent_at;
    delayDays = config.betweenSequencesDays ?? 7;
  }

  const hour = config.scheduleHourLocal ?? 9;
  const dueAt = dueAtMs(referenceIso, delayDays, hour);
  if (now < dueAt) return { skip: "delay-not-met" };

  return { seq, scheduledAt: new Date(dueAt).toISOString(), referenceIso };
}
