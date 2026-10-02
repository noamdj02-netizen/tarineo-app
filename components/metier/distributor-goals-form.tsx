"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { saveDistributorGoalsAction } from "@/app/(app)/parametres/actions";
import { Button } from "@/components/ui/button";

export function DistributorGoalsForm({
  enseignes,
  goals,
  disabled,
}: {
  enseignes: { label: string; amount: number }[];
  goals: Record<string, number>;
  disabled?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();
  const rows = enseignes.slice(0, 12);

  if (!rows.length) return null;

  return (
    <form
      className="card-soft flex flex-col gap-4 p-5"
      onSubmit={(e) => {
        e.preventDefault();
        if (disabled || pending) return;
        setError(null);
        setSaved(false);
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const res = await saveDistributorGoalsAction(fd);
          if (!res.ok) {
            setError(res.error);
            return;
          }
          setSaved(true);
        });
      }}
    >
      <div>
        <p className="text-[15px] font-medium text-ink">Objectifs d’achat annuels (HT)</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Utilisés dans les graphiques objectifs. Laissez vide pour l’estimation automatique (+15 % sur vos achats
          actuels).
        </p>
      </div>
      <ul className="grid gap-3 sm:grid-cols-2">
        {rows.map((e) => (
          <li key={e.label}>
            <label className="text-[13px] text-muted-foreground">
              {e.label}
              <input
                name={`goal:${e.label}`}
                type="number"
                min={0}
                step={100}
                disabled={disabled || pending}
                defaultValue={goals[e.label] ?? ""}
                placeholder="Objectif € HT"
                className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3 text-[14px] tabular-nums text-ink"
              />
            </label>
          </li>
        ))}
      </ul>
      {error ? <p className="text-[13px] text-destructive" role="alert">{error}</p> : null}
      {saved ? (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">Objectifs enregistrés.</p>
      ) : null}
      <Button type="submit" disabled={disabled || pending} className="self-start">
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            Enregistrement…
          </>
        ) : (
          "Enregistrer les objectifs"
        )}
      </Button>
    </form>
  );
}
