"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { saveDistributorGoalsAction } from "@/app/(app)/parametres/actions";
import { Button } from "@/components/ui/button";

export function DistributorGoalsForm({
  enseignes,
  goals,
  monthlyGoals,
  disabled,
}: {
  enseignes: { label: string; amount: number }[];
  goals: Record<string, number>;
  monthlyGoals: Record<string, number>;
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
        <p className="text-[15px] font-medium text-ink">Objectifs d’achat (HT)</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Fixez un plafond mensuel (ex. 5&nbsp;000&nbsp;€ chez un grossiste) et un objectif annuel. Les jauges
          suivent vos achats du mois et de l’année en cours.
        </p>
      </div>
      <ul className="grid gap-4">
        {rows.map((e) => (
          <li key={e.label} className="rounded-xl border border-line bg-surface px-3.5 py-3">
            <p className="text-[14px] font-medium text-ink">{e.label}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              <label className="text-[12px] text-muted-foreground">
                Objectif mensuel (€ HT)
                <input
                  name={`goalMonth:${e.label}`}
                  type="number"
                  min={0}
                  step={100}
                  disabled={disabled || pending}
                  defaultValue={monthlyGoals[e.label] ?? ""}
                  placeholder="ex. 5000"
                  className="mt-1 h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-[14px] tabular-nums text-ink"
                />
              </label>
              <label className="text-[12px] text-muted-foreground">
                Objectif annuel (€ HT)
                <input
                  name={`goal:${e.label}`}
                  type="number"
                  min={0}
                  step={100}
                  disabled={disabled || pending}
                  defaultValue={goals[e.label] ?? ""}
                  placeholder="ex. 60000"
                  className="mt-1 h-11 w-full rounded-xl border border-line bg-surface-2 px-3 text-[14px] tabular-nums text-ink"
                />
              </label>
            </div>
          </li>
        ))}
      </ul>
      {error ? (
        <p className="text-[13px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      {saved ? (
        <p className="text-[13px] text-muted-foreground" aria-live="polite">
          Objectifs enregistrés.
        </p>
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
