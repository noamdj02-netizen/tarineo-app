"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, HardHat, User, FileText, Wrench, Zap, LandPlot, Loader2 } from "lucide-react";
import { createFromTemplateAction } from "@/app/(app)/metier/actions";
import { getSystemTemplates, type SystemDevisTemplate } from "@/lib/metier/devis-templates";
import type { ChantierCard, Party } from "@/lib/metier/types";
import { cn } from "@/lib/utils";

const ICONS: Record<SystemDevisTemplate["id"], typeof FileText> = {
  blank: FileText,
  plumbing: Wrench,
  electrical: Zap,
  earthworks: LandPlot,
};

export function DevisTemplates({
  chantiers,
  clients,
}: {
  chantiers: ChantierCard[];
  clients: Party[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [templates] = useState(() => {
    try {
      return getSystemTemplates();
    } catch {
      return null;
    }
  });
  const lock = useRef(false);

  function createFromTemplate(templateId: string, form: HTMLFormElement) {
    if (lock.current || pending) return;
    lock.current = true;
    setSelectedId(templateId);
    setError(null);
    const fd = new FormData(form);
    fd.set("templateId", templateId);
    fd.set("idempotencyKey", `tpl:${templateId}:${crypto.randomUUID()}`);
    start(async () => {
      try {
        const res = await createFromTemplateAction(fd);
        if (!res.ok) {
          setError(res.error);
          lock.current = false;
          setSelectedId(null);
          return;
        }
        router.push(`/pieces/${res.id}`);
      } catch {
        setError("Impossible de préparer le devis. Réessayez.");
        lock.current = false;
        setSelectedId(null);
      }
    });
  }

  if (!templates) {
    return (
      <div className="card-soft flex flex-col gap-3 p-5">
        <p className="text-[14px] text-ink">Les modèles ne sont pas disponibles pour le moment.</p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createFromTemplate("blank", e.currentTarget);
          }}
        >
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#FF6B1A] px-5 text-[14px] font-medium text-white disabled:opacity-60"
          >
            {pending ? "Préparation du devis…" : "Créer un devis vide"}
          </button>
        </form>
        {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
      </div>
    );
  }

  return (
    <div className="pb-28 md:pb-0">
      <p className="mono-label mb-3">{"/ Modèles ///"}</p>
      <form
        id="devis-template-form"
        className="mb-3 grid gap-3 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          const submitter = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
          const templateId = submitter?.value || String(new FormData(e.currentTarget).get("templateId") || "");
          if (templateId) createFromTemplate(templateId, e.currentTarget);
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

        {pending ? (
          <p className="sm:col-span-2 text-[14px] text-muted-foreground" aria-live="polite">
            <Loader2 className="mr-1.5 inline size-4 animate-spin" aria-hidden />
            Préparation du devis…
          </p>
        ) : null}

        {error ? (
          <p className="sm:col-span-2 text-[13px] text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid gap-2 sm:col-span-2 sm:grid-cols-2">
          {templates.map((t) => {
            const Icon = ICONS[t.id] ?? FileText;
            const selected = selectedId === t.id;
            return (
              <button
                key={t.id}
                type="submit"
                name="templateId"
                value={t.id}
                disabled={pending}
                aria-pressed={selected}
                className={cn(
                  "group flex items-start gap-3 rounded-[22px] border border-line bg-surface p-4 text-left transition-[border-color,transform,box-shadow] duration-200 ease-out-soft",
                  "hover:-translate-y-0.5 hover:border-brand-orange/25 hover:shadow-lift",
                  "focus-visible:ring-3 focus-visible:ring-brand-orange/25 disabled:opacity-60",
                  selected && "border-brand-orange/50 ring-2 ring-brand-orange/20",
                )}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-brand-orange/10 text-brand-orange">
                  {selected && pending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : (
                    <Icon className="size-4" aria-hidden />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink">{t.title}</span>
                    <ArrowUpRight
                      className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                      aria-hidden
                    />
                  </span>
                  <span className="mt-1 block text-[13px] text-muted-foreground">{t.description}</span>
                  {t.lines.some((l) => l.unitPriceHT <= 0) && t.type !== "blank" ? (
                    <span className="mt-2 block text-[12px] text-muted-foreground">Prix à renseigner</span>
                  ) : null}
                </span>
              </button>
            );
          })}
        </div>
      </form>
    </div>
  );
}
