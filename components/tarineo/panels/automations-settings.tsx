"use client";

import { useState, useTransition } from "react";
import { saveAutomationsAction } from "@/app/(app)/automatisations/actions";
import { mergeMarginConfig, mergeQuoteFollowupConfig } from "@/lib/automation/config";
import type { AutomationDefinitionRow } from "@/lib/automation/types";

export function AutomationsSettings({
  quote,
  margin,
}: {
  quote: AutomationDefinitionRow | null;
  margin: AutomationDefinitionRow | null;
}) {
  const quoteCfg = mergeQuoteFollowupConfig(quote?.config);
  const marginCfg = mergeMarginConfig(margin?.config);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const res = await saveAutomationsAction(fd);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto flex w-full max-w-[720px] flex-col gap-8">
      <section className="rounded-[14px] border border-line bg-surface p-6 shadow-soft">
        <h2 className="text-[17px] font-semibold text-ink">Relance automatique des devis</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
          Programme les relances e-mail après envoi du devis client. Les relances manuelles depuis la fiche document
          restent possibles.
        </p>

        <label className="mt-6 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="quoteEnabled"
            defaultChecked={quote?.enabled ?? false}
            className="size-4 rounded border-line accent-[#EC5821]"
          />
          <span className="text-[14px] font-medium text-ink">Activer la relance devis</span>
        </label>

        <label className="mt-4 flex cursor-pointer items-center gap-3 pl-7">
          <input
            type="checkbox"
            name="quoteAutoSchedule"
            defaultChecked={quoteCfg.autoScheduleEnabled ?? false}
            className="size-4 rounded border-line accent-[#EC5821]"
          />
          <span className="text-[14px] text-ink">Planification automatique (cron quotidien)</span>
        </label>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="text-muted-foreground">Délai 1ʳᵉ relance (jours)</span>
            <input
              type="number"
              name="firstDelayDays"
              min={1}
              max={60}
              defaultValue={quoteCfg.firstDelayDays ?? 3}
              className="h-10 rounded-[10px] border border-line bg-paper-0 px-3 text-ink"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="text-muted-foreground">Relances max</span>
            <input
              type="number"
              name="maxSequences"
              min={1}
              max={5}
              defaultValue={quoteCfg.maxSequences ?? 2}
              className="h-10 rounded-[10px] border border-line bg-paper-0 px-3 text-ink"
            />
          </label>
          <label className="flex flex-col gap-1.5 text-[13px]">
            <span className="text-muted-foreground">Délai entre relances (jours)</span>
            <input
              type="number"
              name="betweenSequencesDays"
              min={1}
              max={60}
              defaultValue={quoteCfg.betweenSequencesDays ?? 7}
              className="h-10 rounded-[10px] border border-line bg-paper-0 px-3 text-ink"
            />
          </label>
        </div>
      </section>

      <section className="rounded-[14px] border border-line bg-surface p-6 shadow-soft">
        <h2 className="text-[17px] font-semibold text-ink">Alerte marge sous seuil</h2>
        <p className="mt-2 text-[13.5px] leading-relaxed text-muted-foreground">
          Notification in-app après création d’un devis client si la marge estimée est sous le seuil. Le seuil vide
          reprend vos paramètres entreprise, puis le profil (défaut 25 %).
        </p>

        <label className="mt-6 flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            name="marginEnabled"
            defaultChecked={margin?.enabled ?? false}
            className="size-4 rounded border-line accent-[#EC5821]"
          />
          <span className="text-[14px] font-medium text-ink">Activer l’alerte marge</span>
        </label>

        <label className="mt-4 flex max-w-xs flex-col gap-1.5 text-[13px]">
          <span className="text-muted-foreground">Seuil personnalisé (% marge HT, optionnel)</span>
          <input
            type="number"
            name="floorMarginPct"
            min={0}
            max={99}
            step={0.1}
            placeholder="Hériter entreprise"
            defaultValue={marginCfg.floorMarginPct ?? ""}
            className="h-10 rounded-[10px] border border-line bg-paper-0 px-3 text-ink"
          />
        </label>
      </section>

      {error ? <p className="text-[13px] text-red-600">{error}</p> : null}
      {saved ? <p className="text-[13px] text-[#1f7a45]">Préférences enregistrées.</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-11 w-fit items-center justify-center rounded-full bg-[#EC5821] px-6 text-[14px] font-medium text-white shadow-[0_6px_16px_-10px_rgb(236_88_33/0.45)] hover:bg-[#d44e1c] disabled:opacity-50"
      >
        {pending ? "Enregistrement…" : "Enregistrer"}
      </button>
    </form>
  );
}
