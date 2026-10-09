"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  draftDocumentMailAction,
  markFollowUpStatusAction,
  scheduleFollowUpAction,
  sendFollowUpNowAction,
} from "@/app/(app)/metier/actions";
import { POP_PANEL } from "@/components/motion/pop";
import { SuccessPop } from "@/components/motion/success-pop";
import { documentAmountHt, FOLLOW_UP_STATUS_LABEL, formatNextActionFr, type FollowUpView } from "@/lib/metier/follow-ups";
import { KIND_LABEL, type DocumentCard } from "@/lib/metier/types";
import { euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

type SuccessKind = "sent" | "scheduled";

const SUCCESS_COPY: Record<SuccessKind, { title: string; hint: string }> = {
  sent: {
    title: "Le mail a bien été envoyé",
    hint: "Envoyé depuis Tarinéo — la relance est à jour.",
  },
  scheduled: {
    title: "Relance programmée",
    hint: "Tarinéo enverra le rappel au bon moment.",
  },
};

export function RelanceButton({
  doc,
  followUp,
  size = "chip",
}: {
  doc: DocumentCard;
  followUp?: FollowUpView | null;
  size?: "chip" | "row" | "primary";
}) {
  const [open, setOpen] = useState(false);
  if (followUp?.status === "answered" || followUp?.status === "done" || followUp?.status === "cancelled") return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "relative z-10 rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors",
          size === "primary"
            ? "bg-tarineo-orange text-white hover:brightness-[0.96]"
            : "border border-line hover:bg-surface-2",
          size === "row" && "min-h-8",
          size === "primary" && "min-h-9 px-3.5",
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
  const reduceMotion = useReducedMotion();
  const [pending, start] = useTransition();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState<SuccessKind | null>(null);
  const [to, setTo] = useState(() => (followUp?.to_email?.includes("@") ? followUp.to_email : ""));
  const [subject, setSubject] = useState(followUp?.subject ?? "");
  const [note, setNote] = useState(followUp?.body ?? "");
  const sentAt = typeof doc.extract?.sent_at === "string" ? doc.extract.sent_at : null;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    void draftDocumentMailAction(doc.id).then((res) => {
      if (cancelled) return;
      setLoading(false);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setTo((t) => (t.includes("@") ? t : res.to || t));
      setSubject((s) => (s.trim() ? s : res.subject));
      setNote((n) => (n.trim() ? n : res.body));
    });
    return () => {
      cancelled = true;
    };
  }, [doc.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    if (!success) return;
    const t = window.setTimeout(() => {
      router.refresh();
      onClose();
    }, 2200);
    return () => window.clearTimeout(t);
  }, [success, onClose, router]);

  const ht = documentAmountHt(doc);
  const copy = success ? SUCCESS_COPY[success] : null;

  function finish(kind: SuccessKind) {
    setSuccess(kind);
  }

  function buildForm() {
    const fd = new FormData();
    fd.set("documentId", doc.id);
    fd.set("to", to);
    fd.set("subject", subject);
    fd.set("note", note);
    if (followUp && !followUp.virtual) fd.set("followUpId", followUp.id);
    return fd;
  }

  function run(kind: "now" | 1 | 3 | 7) {
    const fd = buildForm();
    if (kind !== "now") fd.set("days", String(kind));
    setError(null);
    start(async () => {
      const res = kind === "now" ? await sendFollowUpNowAction(fd) : await scheduleFollowUpAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      finish(kind === "now" ? "sent" : "scheduled");
    });
  }

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Fermer"
        className="absolute inset-0 bg-ink/40"
        onClick={() => {
          if (success) {
            router.refresh();
          }
          onClose();
        }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="relance-title"
        initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduceMotion ? { duration: 0.15 } : POP_PANEL}
        className="relative z-10 flex max-h-[min(92dvh,720px)] w-full max-w-[440px] flex-col overflow-hidden rounded-t-[20px] border border-line bg-surface shadow-lift sm:rounded-[20px]"
      >
        <AnimatePresence mode="wait">
          {success && copy ? (
            <SuccessPop
              key="success"
              titleId="relance-title"
              title={copy.title}
              hint={copy.hint}
              action={
                <button
                  type="button"
                  onClick={() => {
                    router.refresh();
                    onClose();
                  }}
                  className="min-h-10 rounded-pill border border-line bg-surface px-5 text-[13.5px] font-medium hover:bg-surface-2"
                >
                  Continuer
                </button>
              }
            />
          ) : (
            <motion.div
              key="form"
              initial={false}
              exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="min-h-0 flex-1 overflow-y-auto p-5">
                <div className="flex items-start justify-between gap-3">
                  <p id="relance-title" className="font-display text-[22px] font-semibold tracking-tight">
                    Relancer
                  </p>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full px-2.5 py-1 text-[13px] text-muted-foreground hover:bg-surface-2"
                  >
                    Fermer
                  </button>
                </div>
                <dl className="mt-4 grid gap-2 text-[13.5px]">
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">{doc.direction === "out" ? "Client" : "Fournisseur"}</dt>
                    <dd className="text-right">{doc.party_name || "—"}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Document</dt>
                    <dd className="text-right">{doc.title || KIND_LABEL[doc.kind]}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-muted-foreground">Chantier</dt>
                    <dd className="text-right">{doc.chantier_name || "—"}</dd>
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
                    placeholder="client@exemple.fr"
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
              </div>

              <div className="shrink-0 border-t border-line bg-surface px-5 py-4">
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    disabled={pending || loading}
                    onClick={() => run("now")}
                    className="min-h-10 rounded-pill bg-tarineo-orange px-4 text-[13.5px] font-medium text-white hover:brightness-[0.96] disabled:opacity-50"
                  >
                    {pending ? "Envoi…" : "Relancer maintenant"}
                  </button>
                  <p className="text-[12px] text-muted-foreground">Programmer un rappel</p>
                  <div className="flex flex-wrap gap-2">
                    {([1, 3, 7] as const).map((d) => (
                      <button
                        key={d}
                        type="button"
                        disabled={pending || loading}
                        onClick={() => run(d)}
                        className="rounded-full border border-line px-3 py-1.5 text-[13px] hover:bg-surface-2 disabled:opacity-50"
                      >
                        {d} jour{d > 1 ? "s" : ""}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>,
    document.body,
  );
}

export function RelanceStatus({ followUp }: { followUp: FollowUpView | null | undefined }) {
  if (!followUp) return null;
  const color =
    followUp.status === "due"
      ? "bg-tarineo-orange"
      : followUp.status === "scheduled"
        ? "bg-[#F59E0B]"
        : followUp.status === "answered"
          ? "bg-[#16A34A]"
          : followUp.status === "cancelled"
            ? "bg-ink/25"
            : followUp.status === "done"
              ? "bg-[#16A34A]"
              : "bg-ink/30";
  return (
    <p className="flex items-center gap-2 text-[13.5px] font-medium">
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
      className="rounded-full border border-line px-3 py-1.5 text-[12.5px] text-muted-foreground hover:bg-surface-2 disabled:opacity-50"
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
      className="rounded-full border border-line px-3 py-1.5 text-[12.5px] hover:bg-surface-2 disabled:opacity-50"
    >
      Réponse reçue
    </button>
  );
}
