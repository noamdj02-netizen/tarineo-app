"use client";

import { Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { sendDocumentAction } from "@/app/(app)/metier/actions";
import { Button } from "@/components/ui/button";
import type { DocumentCard } from "@/lib/metier/types";

export function DocumentSend({ doc }: { doc: DocumentCard }) {
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  if (doc.direction !== "out") return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex h-8 items-center rounded-full border border-line px-3 text-[12.5px] font-medium hover:bg-surface-2"
      >
        <Mail className="mr-1.5 size-3.5" aria-hidden />
        {sent ? "Renvoyer" : "Envoyer"}
      </button>
    );
  }

  return (
    <form
      className="flex w-full flex-col gap-2 rounded-[22px] border border-line bg-surface-2 p-3 sm:min-w-[280px]"
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
      <label className="text-[12.5px]">
        E-mail du client
        <input
          name="to"
          type="email"
          required
          placeholder="client@exemple.fr"
          className="mt-1 h-10 w-full rounded-xl border border-line bg-surface px-3"
        />
      </label>
      <label className="text-[12.5px]">
        Message
        <textarea
          name="note"
          rows={3}
          placeholder="Bonjour, veuillez trouver le devis en pièce jointe."
          className="mt-1 w-full rounded-xl border border-line bg-surface px-3 py-2"
        />
      </label>
      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
      {sent ? <p className="text-[13px] text-brand-orange">Envoyé.</p> : null}
      <div className="flex gap-2">
        <Button type="submit" disabled={pending} className="rounded-full" size="sm">
          {pending ? "Envoi…" : "Envoyer le PDF"}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={() => setOpen(false)}>
          Annuler
        </Button>
      </div>
    </form>
  );
}
