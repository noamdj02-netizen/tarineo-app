"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, HardHat, User, FileText, Wrench, Zap, LandPlot } from "lucide-react";
import { createFromTemplateAction } from "@/app/(app)/metier/actions";
import { DEVIS_TEMPLATES } from "@/lib/metier/devis-templates";
import type { ChantierCard, Party } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

const ICONS = {
  vide: FileText,
  plomberie: Wrench,
  elec: Zap,
  tp: LandPlot,
} as const;

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
        className="mb-3 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(async () => {
            const res = await createFromTemplateAction(fd);
            if (res.ok) router.push(`/pieces/${res.id}`);
          });
        }}
      >
        <label className="text-[13px] text-muted-foreground">
          <span className="mb-1 inline-flex items-center gap-1.5">
            <HardHat className="size-3.5" aria-hidden />
            Chantier
          </span>
          <select
            name="chantierId"
            className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3 transition-[border-color,box-shadow] duration-150 focus-visible:border-brand-orange/40 focus-visible:ring-3 focus-visible:ring-brand-orange/20"
          >
            <option value="">Sans chantier</option>
            {chantiers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-[13px] text-muted-foreground">
          <span className="mb-1 inline-flex items-center gap-1.5">
            <User className="size-3.5" aria-hidden />
            Client
          </span>
          <select
            name="clientId"
            className="mt-1 h-11 w-full rounded-xl border border-line bg-surface px-3 transition-[border-color,box-shadow] duration-150 focus-visible:border-brand-orange/40 focus-visible:ring-3 focus-visible:ring-brand-orange/20"
          >
            <option value="">Sans client</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
          {DEVIS_TEMPLATES.map((t) => {
            const Icon = ICONS[t.id as keyof typeof ICONS] ?? FileText;
            return (
              <button
                key={t.id}
                type="submit"
                name="templateId"
                value={t.id}
                disabled={pending}
                className={cn(
                  "group flex items-start gap-3 rounded-[22px] border border-line bg-surface p-4 text-left transition-[border-color,transform,box-shadow] duration-200 ease-out-soft",
                  "hover:-translate-y-0.5 hover:border-brand-orange/25 hover:shadow-lift",
                  "focus-visible:ring-3 focus-visible:ring-brand-orange/25 disabled:opacity-60",
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange">
                  <Icon className="size-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink">{t.title}</span>
                    <ArrowUpRight className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </span>
                  <span className="mt-1 block text-[13px] text-muted-foreground">{t.text}</span>
                </span>
              </button>
            );
          })}
        </div>
      </form>
    </div>
  );
}
