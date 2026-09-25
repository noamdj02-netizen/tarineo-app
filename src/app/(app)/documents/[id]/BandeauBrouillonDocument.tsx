"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { conserverBrouillonDocument } from "./actions";

export function BandeauBrouillonDocument({
  documentId,
  expireLe,
}: {
  documentId: string;
  expireLe: string;
}) {
  const router = useRouter();
  const [erreur, setErreur] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const dateLabel = new Date(expireLe).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function conserver() {
    setErreur(null);
    startTransition(async () => {
      const res = await conserverBrouillonDocument(documentId);
      if (!res.succes) {
        setErreur(res.erreur);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-foreground">
      <p className="font-medium">Brouillon (doublon)</p>
      <p className="mt-1 text-muted-foreground">
        Ce document n&apos;apparaît pas dans vos listes tant qu&apos;il n&apos;est pas conservé. Suppression
        automatique le {dateLabel} si vous ne faites rien.
      </p>
      {erreur && <p className="mt-2 text-xs text-destructive">{erreur}</p>}
      <Button type="button" size="sm" className="mt-3 rounded-full" disabled={pending} onClick={conserver}>
        {pending ? "Enregistrement…" : "Conserver ce document"}
      </Button>
    </div>
  );
}
