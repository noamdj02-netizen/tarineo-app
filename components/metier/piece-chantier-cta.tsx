"use client";

import { FolderPlus, Loader2, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createChantierForDocumentAction } from "@/app/(app)/metier/actions";
import { Button } from "@/components/ui/button";
import { R } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function PieceChantierCta({
  documentId,
  chantierSlug,
  chantierName,
  className,
}: {
  documentId: string;
  chantierSlug?: string | null;
  chantierName?: string | null;
  className?: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (chantierSlug) {
    return (
      <Link
        href={R.chantier(chantierSlug)}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-[10px] border border-line bg-surface px-3 text-[13px] font-medium text-ink transition-colors hover:bg-surface-2",
          className,
        )}
      >
        <MapPin className="size-3.5 text-brand-orange" aria-hidden />
        {chantierName ? `Chantier · ${chantierName}` : "Voir le chantier"}
      </Link>
    );
  }

  return (
    <div className={cn("flex flex-col items-stretch gap-1 sm:items-end", className)}>
      <Button
        type="button"
        disabled={pending}
        className="h-9 rounded-[10px] bg-brand-orange px-3 text-[13px] text-white hover:brightness-[0.96]"
        onClick={() => {
          setError(null);
          start(async () => {
            const res = await createChantierForDocumentAction(documentId);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            router.push(R.chantier(res.slug));
            router.refresh();
          });
        }}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" />
        ) : (
          <FolderPlus className="size-3.5" data-icon="inline-start" />
        )}
        {pending ? "Création…" : "Créer un chantier"}
      </Button>
      {error ? <p className="text-[12px] text-destructive">{error}</p> : null}
    </div>
  );
}

/** Bandeau d’orientation si le document n’a pas encore de chantier. */
export function PieceOrientationBanner({
  documentId,
  hasChantier,
  kindLabel,
}: {
  documentId: string;
  hasChantier: boolean;
  kindLabel: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (hasChantier) return null;

  return (
    <div className="flex flex-col gap-3 rounded-[16px] border border-brand-orange/25 bg-wash-orange/40 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="text-[14px] font-medium text-ink">Où ranger ce {kindLabel.toLowerCase()} ?</p>
        <p className="mt-0.5 text-[13px] text-muted-foreground">
          Créez un chantier pour regrouper devis, commandes et factures au même endroit — ou liez-en un
          existant dans Informations à droite.
        </p>
        {error ? <p className="mt-1 text-[12px] text-destructive">{error}</p> : null}
      </div>
      <Button
        type="button"
        disabled={pending}
        className="h-10 shrink-0 rounded-full bg-brand-orange px-4 text-[13px] text-white hover:brightness-[0.96]"
        onClick={() => {
          setError(null);
          start(async () => {
            const res = await createChantierForDocumentAction(documentId);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            router.push(R.chantier(res.slug));
            router.refresh();
          });
        }}
      >
        {pending ? (
          <Loader2 className="size-3.5 animate-spin" data-icon="inline-start" />
        ) : (
          <FolderPlus className="size-3.5" data-icon="inline-start" />
        )}
        {pending ? "Création…" : "Créer un chantier pour ce document"}
      </Button>
    </div>
  );
}
