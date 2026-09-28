"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import {
  draftDocumentMailAction,
  markFollowUpStatusAction,
  scheduleFollowUpAction,
  sendFollowUpNowAction,
} from "@/app/(app)/metier/actions";
import { documentAmountHt, FOLLOW_UP_STATUS_LABEL, formatNextActionFr, type FollowUpView } from "@/lib/metier/follow-ups";
import { KIND_LABEL, type DocumentCard } from "@/lib/metier/types";
import { euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

export function RelanceButton({
  doc,
  followUp,
  size = "chip",
}: {
  doc: DocumentCard;
  followUp?: FollowUpView | null;
  size?: "chip" | "row";
}) {
  const [open, setOpen] = useState(false);
  if (followUp?.status === "answered" || followUp?.status === "done" || followUp?.status === "cancelled") return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative z-10 rounded-full border border-line px-3 py-1.5 text-[13px] hover:bg-surface-2",
          size === "row" && "min-h-8",
        )}
      >
        Relancer
      </button>
      {open ? <RelanceDialog doc={doc} followUp={followUp} onClose={() => setOpen(false)} /> : null}
    </>
  );
}

function RelanceDialog({
  doc,
  followUp,
  onClose,
}: {
  doc: DocumentCard;
  followUp?: FollowUpView | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [to, setTo] = useState(followUp?.to_email ?? "");
  const [subject, setSubject] = useState(followUp?.subject ?? "");
  const [note, setNote] = useState(followUp?.body ?? "");
  const sentAt = typeof doc.extract?.sent_at === "string" ? doc.extract.sent_at : null;

  useEffect(() => {
    let cancelled = false;
    void draftDocumentMailAction(doc.id).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setTo((t) => t || res.to);
      setSubject((s) => s || res.subject);
      setNote((n) => n || res.body);
    });
    return () => {
      cancelled = true;
    };
  }, [doc.id]);

  const ht = documentAmountHt(doc);

  function run(kind: "now" | 1 | 3 | 7) {
    const fd = new FormData();
    fd.set("documentId", doc.id);
    fd.set("to", to);
    fd.set("subject", subject);
    fd.set("note", note);
    if (followUp && !followUp.virtual) fd.set("followUpId", followUp.id);
    if (kind !== "now") fd.set("days", String(kind));
    setError(null);
    start(async () => {
      const res = kind === "now" ? await sendFollowUpNowAction(fd) : await scheduleFollowUpAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" aria-label="Fermer" className="absolute inset-0 bg-ink/30" onClick={onClose} />
      <div
        role="dialog"
        aria-labelledby="relance-title"
        className="relative z-10 w-full max-w-[440px] rounded-t-[20px] border border-line bg-surface p-5 shadow-lift sm:rounded-[20px]"
      >
        <p id="relance-title" className="font-display text-[22px] font-semibold tracking-tight">
          Relancer
        </p>
        <dl className="mt-4 grid gap-2 text-[13.5px]">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{doc.direction === "out" ? "Client" : "Fournisseur"}</dt>
            <dd>{doc.party_name || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Document</dt>
            <dd>{doc.title || KIND_LABEL[doc.kind]}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Chantier</dt>
            <dd>{doc.chantier_name || "—"}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Montant</dt>
            <dd className="tabular-nums">{ht ? `${euro(ht)} HT` : "—"}</dd>
          </div>
          {sentAt ? (
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Dernier envoi</dt>
              <dd>{new Date(sentAt).toLocaleDateString("fr-FR")}</dd>
            </div>
          ) : null}
        </dl>

        {loading ? <p className="mt-4 text-[13px] text-muted-foreground">Préparation du message…</p> : null}

        <label className="mt-4 block text-[12.5px]">
          E-mail
          <input
            type="email"
            required
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-line bg-bg px-3"
          />
        </label>
        <label className="mt-3 block text-[12.5px]">
          Objet
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="mt-1 h-10 w-full rounded-xl border border-line bg-bg px-3"
          />
        </label>
        <label className="mt-3 block text-[12.5px]">
          Message
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={6}
            className="mt-1 w-full rounded-xl border border-line bg-bg px-3 py-2"
          />
        </label>
        {error ? <p className="mt-2 text-[13px] text-destructive">{error}</p> : null}

        <div className="mt-4 flex flex-col gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => run("now")}
            className="btn-dark min-h-10 rounded-pill px-4 text-[13.5px] font-medium disabled:opacity-50"
          >
            Relancer maintenant
          </button>
          <p className="text-[12px] text-muted-foreground">Programmer dans</p>
          <div className="flex flex-wrap gap-2">
            {([1, 3, 7] as const).map((d) => (
              <button
                key={d}
                type="button"
                disabled={pending}
                onClick={() => run(d)}
                className="rounded-full border border-line px-3 py-1.5 text-[13px] hover:bg-surface-2 disabled:opacity-50"
              >
                {d} jour{d > 1 ? "s" : ""}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function RelanceStatus({ followUp }: { followUp: FollowUpView | null | undefined }) {
  if (!followUp) return null;
  const color =
    followUp.status === "due"
      ? "bg-[#ec5821]"
      : followUp.status === "scheduled"
        ? "bg-[#c9a227]"
        : followUp.status === "answered"
          ? "bg-[#2f7d4a]"
          : followUp.status === "cancelled"
            ? "bg-ink/25"
            : followUp.status === "done"
              ? "bg-[#2f7d4a]"
              : "bg-ink/30";
  return (
    <p className="flex items-center gap-2 text-[13.5px]">
      <span className={cn("size-2 shrink-0 rounded-full", color)} aria-hidden />
      {FOLLOW_UP_STATUS_LABEL[followUp.status]}
      {followUp.status === "scheduled" ? ` · ${formatNextActionFr(followUp)}` : ""}
    </p>
  );
}

export function CancelFollowUpButton({ followUpId, virtual }: { followUpId: string; virtual?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (virtual) return null;
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await markFollowUpStatusAction(followUpId, "cancelled");
          router.refresh();
        })
      }
      className="text-[12.5px] text-muted-foreground underline-offset-2 hover:underline"
    >
      Annuler
    </button>
  );
}

export function MarkAnsweredButton({ followUpId, virtual }: { followUpId: string; virtual?: boolean }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  if (virtual) return null;
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        start(async () => {
          await markFollowUpStatusAction(followUpId, "answered");
          router.refresh();
        })
      }
      className="text-[12.5px] text-muted-foreground underline-offset-2 hover:underline"
    >
      Réponse reçue
    </button>
  );
}
