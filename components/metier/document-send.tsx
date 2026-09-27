"use client";

import { Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { draftDocumentMailAction, sendDocumentAction } from "@/app/(app)/metier/actions";
import { Button } from "@/components/ui/button";
import type { DocumentCard } from "@/lib/metier/types";

export function DocumentSend({ doc }: { doc: DocumentCard }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [note, setNote] = useState("");
  const [toLabel, setToLabel] = useState(doc.direction === "out" ? "E-mail du client" : "E-mail du distributeur");

  async function openForm() {
    setOpen(true);
    setError(null);
    setLoading(true);
    const res = await draftDocumentMailAction(doc.id);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setTo(res.to);
    setSubject(res.subject);
    setNote(res.body);
    setToLabel(res.toLabel);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => void openForm()}
        className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[12.5px] font-medium hover:bg-surface-2"
      >
        <Mail className="mr-1.5 size-3.5" aria-hidden />
        {sent ? "Renvoyer" : "Envoyer"}
      </button>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-2 rounded-[22px] border border-line bg-surface-2 p-3 sm:min-w-[300px]"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("documentId", doc.id);
        setError(null);
        start(async () => {
          const res = await sendDocumentAction(fd);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setSent(true);
          setOpen(false);
        });
      }}
    >
      <p className="text-[12px] text-muted-foreground">
        {loading ? "Rédaction à partir du chantier…" : "Message préparé. Vous pouvez le corriger."}
      </p>
      <label className="text-[12.5px]">
        {toLabel}
        <input
          name="to"
          type="email"
          required
          value={to}
          onChange={(e) => setTo(e.target.value)}
          placeholder="contact@exemple.fr"
          className="mt-1 h-10 w-full rounded-xl border border-line bg-surface px-3"
        />
      </label>
      <label className="text-[12.5px]">
        Objet
        <input
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 h-10 w-full rounded-xl border border-line bg-surface px-3"
        />
      </label>
      <label className="text-[12.5px]">
        Message
        <textarea
          name="note"
          rows={7}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2"
        />
      </label>
      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending || loading} className="rounded-full" size="sm">
          {pending ? "Envoi…" : "Envoyer le PDF"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
