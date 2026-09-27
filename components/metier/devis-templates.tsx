"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createFromTemplateAction } from "@/app/(app)/metier/actions";
import { DEVIS_TEMPLATES } from "@/lib/metier/devis-templates";
import type { ChantierCard, Party } from "@/lib/metier/types";

export function DevisTemplates({
  chantiers,
  clients,
}: {
  chantiers: ChantierCard[];
  clients: Party[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();

  return (
    <div>
      <p className="mono-label mb-3">{"/ Modèles ///"}</p>
      <form
        className="mb-3 grid gap-2 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const res = await createFromTemplateAction(fd);
            if (res.ok) router.push(`/pieces/${res.id}`);
          });
        }}
      >
        <label className="text-[13px]">
          Chantier
          <select name="chantierId" className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3">
            <option value="">Sans chantier</option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px]">
          Client
          <select name="clientId" className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3">
            <option value="">Sans client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
          {DEVIS_TEMPLATES.map((t) => (
            <button
              key={t.id}
              type="submit"
              name="templateId"
              value={t.id}
              disabled={pending}
              className="card-soft p-4 text-left hover:shadow-lift disabled:opacity-60"
            >
              <p className="font-medium">{t.title}</p>
              <p className="mt-1 text-[13px] text-muted-foreground">{t.text}</p>
            </button>
          ))}
        </div>
      </form>
    </div>
  );
}
