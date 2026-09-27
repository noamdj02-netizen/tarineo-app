"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { transformQuoteAction } from "@/app/(app)/metier/actions";
import { Button } from "@/components/ui/button";
import { CLIENT_OUT_KINDS, CLIENT_OUT_LABEL, type ClientOutKind, type DocumentCard, type Party } from "@/lib/metier/types";

export function TransformForm({
  source,
  clients,
  defaultClientId,
  defaultMarginPct = 35,
}: {
  source: DocumentCard;
  clients: Party[];
  defaultClientId: string | null;
  defaultMarginPct?: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [kind, setKind] = useState<ClientOutKind>("devis");

  return (
    <form
      className="mt-4 flex flex-col gap-2 rounded-[22px] border border-line bg-surface-2 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        fd.set("sourceId", source.id);
        fd.set("kind", kind);
        setError(null);
        start(async () => {
          const res = await transformQuoteAction(fd);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          router.push("/composants");
          router.refresh();
        });
      }}
    >
      <p className="text-[14px] font-medium">Transformer pour le client</p>
      <p className="text-[13px] text-muted-foreground">
        Recopie les lignes de « {source.title} ». Marge sur devis et facture, quantité seule sur le bon d’enlèvement.
      </p>
      <div className="flex flex-wrap gap-2">
        {CLIENT_OUT_KINDS.map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setKind(k)}
            className={
              kind === k
                ? "rounded-full bg-ink px-3 py-1.5 text-[13px] text-accent-ink"
                : "rounded-full border border-line px-3 py-1.5 text-[13px]"
            }
          >
            {CLIENT_OUT_LABEL[k]}
          </button>
        ))}
      </div>
      <label className="text-[13px]">
        Client
        <select name="clientId" defaultValue={defaultClientId ?? ""} className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3">
          <option value="">Choisir</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </label>
      {kind === "bon_enlevement" ? (
        <input type="hidden" name="margin" value="0" />
      ) : (
        <label className="text-[13px]">
          Marge (%)
          <input name="margin" type="number" step="1" min="0" defaultValue={defaultMarginPct} className="mt-1 h-11 w-full rounded-xl border border-line px-3" />
        </label>
      )}
      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
      <Button type="submit" disabled={pending} className="w-fit rounded-full">
        {pending ? "Création…" : `Créer ${CLIENT_OUT_LABEL[kind].toLowerCase()}`}
      </Button>
    </form>
  );
}
