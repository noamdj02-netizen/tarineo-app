"use client";

import { useState, useTransition } from "react";
import { addDocumentLineAction, saveDocumentAction } from "@/app/(app)/metier/actions";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { ChantierCard, DocumentCard, Party } from "@/lib/metier/types";

export function DocumentEdit({
  doc,
  chantiers,
  parties,
}: {
  doc: DocumentCard;
  chantiers: ChantierCard[];
  parties: Party[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const out = doc.direction === "out";
  const partyLabel = out ? "Client" : "Distributeur";

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setMsg(null);
        start(async () => {
          const res = await saveDocumentAction(fd);
          setMsg(res.ok ? "Enregistré." : res.error);
          if (res.ok) router.refresh();
        });
      }}
    >
      <input type="hidden" name="documentId" value={doc.id} />
      <label className="text-[13px]">
        Titre
        <input
          name="title"
          defaultValue={doc.title}
          className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
        />
      </label>
      <label className="text-[13px]">
        {partyLabel}
        <select
          name="partyId"
          defaultValue={doc.party_id ?? ""}
          className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
        >
          <option value="">Sans {partyLabel.toLowerCase()}</option>
          {parties.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </label>
      <label className="text-[13px]">
        Nom affiché
        <input
          name="partyName"
          defaultValue={doc.party_name ?? ""}
          placeholder={`Nom du ${partyLabel.toLowerCase()}`}
          className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
        />
      </label>
      <label className="text-[13px]">
        Chantier
        <select
          name="chantierId"
          defaultValue={doc.chantier_id ?? ""}
          className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3"
        >
          <option value="">Sans chantier</option>
          {chantiers.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
              {c.client_name ? ` · ${c.client_name}` : ""}
            </option>
          ))}
        </select>
      </label>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[13.5px]">
          <thead>
            <tr className="text-[12px] text-muted-foreground">
              <th className="pb-2 font-medium">Désignation</th>
              <th className="pb-2 font-medium">Qté</th>
              <th className="pb-2 font-medium">Achat</th>
              {out ? <th className="pb-2 font-medium">Vente</th> : null}
            </tr>
          </thead>
          <tbody>
            {doc.lines.map((l) => (
              <tr key={l.id} className="border-t border-line">
                <td className="py-2 pr-2">
                  <input type="hidden" name="lineId" value={l.id} />
                  <input
                    name="lineLabel"
                    defaultValue={l.label}
                    className="h-10 w-full rounded-lg border border-line px-2"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    name="lineQty"
                    type="number"
                    step="0.01"
                    defaultValue={l.qty}
                    className="h-10 w-24 rounded-lg border border-line px-2 tabular-nums"
                  />
                </td>
                <td className="py-2 pr-2">
                  <input
                    name="lineBuy"
                    type="number"
                    step="0.01"
                    defaultValue={l.buy_price}
                    className="h-10 w-28 rounded-lg border border-line px-2 tabular-nums"
                  />
                </td>
                {out ? (
                  <td className="py-2">
                    <input
                      name="lineSell"
                      type="number"
                      step="0.01"
                      defaultValue={l.sell_price}
                      className="h-10 w-28 rounded-lg border border-line px-2 tabular-nums"
                    />
                  </td>
                ) : (
                  <input type="hidden" name="lineSell" value={l.sell_price} />
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {msg ? <p className="text-[13px] text-muted-foreground">{msg}</p> : null}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={pending} className="w-fit rounded-full">
          {pending ? "Enregistrement…" : "Enregistrer"}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={pending}
          className="w-fit rounded-full"
          onClick={() => {
            setMsg(null);
            start(async () => {
              const res = await addDocumentLineAction(doc.id);
              if (!res.ok) {
                setMsg(res.error);
                return;
              }
              router.refresh();
            });
          }}
        >
          Ajouter une ligne
        </Button>
      </div>
    </form>
  );
}
