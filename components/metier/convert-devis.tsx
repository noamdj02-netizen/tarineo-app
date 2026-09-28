"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { transformQuoteAction } from "@/app/(app)/metier/actions";
import {
  CLIENT_DEVIS_NEXT_KINDS,
  CLIENT_OUT_LABEL,
  type ClientDevisNextKind,
  type DocKind,
} from "@/lib/metier/types";
import { cn } from "@/lib/utils";

export function ConvertDevisActions({
  sourceId,
  sourceKind = "devis",
  className,
  size = "card",
}: {
  sourceId: string;
  sourceKind?: DocKind;
  className?: string;
  size?: "card" | "form";
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<ClientDevisNextKind | null>(null);
  const kinds: ClientDevisNextKind[] =
    sourceKind === "bon_commande" ? ["facture"] : [...CLIENT_DEVIS_NEXT_KINDS];

  function convert(kind: ClientDevisNextKind) {
    const fd = new FormData();
    fd.set("sourceId", sourceId);
    fd.set("kind", kind);
    setError(null);
    setBusy(kind);
    start(async () => {
      const res = await transformQuoteAction(fd);
      setBusy(null);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.push(`/pieces/${res.id}`);
      router.refresh();
    });
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {size === "form" ? (
        <>
          <p className="text-[14px] font-medium">
            {sourceKind === "bon_commande" ? "Transformer la commande" : "Transformer le devis"}
          </p>
          <p className="text-[13px] text-muted-foreground">
            Recopie les lignes, les prix, le client et le chantier. Le document source reste.
          </p>
        </>
      ) : null}
      <div className="flex flex-wrap gap-2">
        {kinds.map((k) => (
          <button
            key={k}
            type="button"
            disabled={pending}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              convert(k);
            }}
            className={cn(
              "rounded-full border border-line px-3 py-1.5 text-[13px] hover:bg-surface-2 disabled:opacity-50",
              size === "form" && "min-h-10 px-4",
            )}
          >
            {busy === k ? "Création…" : k === "bon_commande" ? "Commande client" : CLIENT_OUT_LABEL[k]}
          </button>
        ))}
      </div>
      {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
    </div>
  );
}
