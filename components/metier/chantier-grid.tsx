"use client";

import { Loader2, Plus, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/app-ui/empty-state";
import { FilterPills } from "@/components/app-ui/filter-pills";
import { StatusBadge, chantierTone } from "@/components/tarineo/status-badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createChantierAction, deleteChantierAction } from "@/app/(app)/metier/actions";
import { ChantierStatusToggle } from "@/components/metier/chantier-status";
import type { ChantierCard } from "@/lib/metier/types";
import { DEMO_MARK } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

export function ChantierGrid({
  chantiers,
  dueByChantier = {},
}: {
  chantiers: ChantierCard[];
  dueByChantier?: Map<string, number> | Record<string, number>;
}) {
  const dueOf = (id: string) =>
    dueByChantier instanceof Map ? (dueByChantier.get(id) ?? 0) : (dueByChantier[id] ?? 0);
  const [filter, setFilter] = useState<"all" | ChantierCard["status"]>("all");
  const rows = filter === "all" ? chantiers : chantiers.filter((c) => c.status === filter);
  return (
    <div className="flex flex-col gap-4">
      <FilterPills
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "Tous" },
          { id: "focus", label: "En cours" },
          { id: "pause", label: "En pause" },
          { id: "fini", label: "Terminés" },
        ]}
      />
      {!rows.length && filter !== "all" ? (
        <EmptyState
          title="Aucun chantier"
          text="Aucun chantier dans ce filtre. Affichez tous les chantiers ou créez-en un nouveau."
          actionHref="/chantiers#nouveau"
          actionLabel="Nouveau chantier"
        />
      ) : (
      <div className="grid gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
      {rows.map((c) => (
        <article
          key={c.id}
          className={cn(
            "card-soft card-lift relative flex flex-col gap-3 p-5",
            c.status === "focus" && "border-l-[3px] border-l-nav-orange",
            c.status === "pause" && "border-l-[3px] border-l-st-pause",
            c.status === "fini" && "border-l-[3px] border-l-line-strong",
          )}
        >
          <div>
            {c.seed_key ? <p className="mono-label text-[10px]">{DEMO_MARK}</p> : null}
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-display text-[16px] leading-snug font-semibold tracking-[-0.02em]">
                <Link
                  href={`/chantiers/${c.slug}`}
                  className="outline-none after:absolute after:inset-0 after:rounded-card"
                >
                  {c.name}
                </Link>
              </h3>
              <StatusBadge
                label={c.status === "focus" ? "En cours" : c.status === "pause" ? "Pause" : "Fini"}
                tone={chantierTone(c.status)}
                className="relative z-10 shrink-0"
              />
            </div>
            <p className="mt-1 text-[13.5px] text-muted-foreground">{c.address || "Lieu à préciser"}</p>
          </div>
          <p className="text-[14px]">
            {c.client_name ?? "Client à lier"} · {c.docs_count} document{c.docs_count > 1 ? "s" : ""}
          </p>
          {dueOf(c.id) > 0 ? (
            <p className="text-[13px] text-brand-orange">
              {dueOf(c.id)} relance{dueOf(c.id) > 1 ? "s" : ""} à traiter
            </p>
          ) : null}
          <div className="relative z-10 flex items-center justify-between gap-2">
            <p className="text-[13px] font-medium text-tarineo-orange">Voir le chantier →</p>
            <DeleteChantierButton id={c.id} name={c.name} docsCount={c.docs_count} />
          </div>
          <div className="relative z-10 hidden md:block" onClick={(e) => e.preventDefault()}>
            <ChantierStatusToggle id={c.id} status={c.status} />
          </div>
        </article>
      ))}
      <NewChantier />
    </div>
      )}
    </div>
  );
}

function DeleteChantierButton({
  id,
  name,
  docsCount,
}: {
  id: string;
  name: string;
  docsCount: number;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        aria-label={`Supprimer le chantier ${name}`}
        title="Supprimer le chantier"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          const docsNote =
            docsCount > 0
              ? `\n\n${docsCount} document${docsCount > 1 ? "s" : ""} resteront dans vos pièces (sans chantier).`
              : "";
          if (
            !window.confirm(
              `Supprimer le chantier « ${name} » ?${docsNote}\n\nCette action est définitive.`,
            )
          ) {
            return;
          }
          setError(null);
          start(async () => {
            const res = await deleteChantierAction(id);
            if (!res.ok) {
              setError(res.error);
              return;
            }
            router.refresh();
          });
        }}
        className="inline-flex size-9 items-center justify-center rounded-[10px] border border-line text-muted-foreground transition-colors hover:border-destructive/40 hover:bg-destructive/5 hover:text-destructive disabled:opacity-50"
      >
        {pending ? <Loader2 className="size-3.5 animate-spin" aria-hidden /> : <Trash2 className="size-3.5" aria-hidden />}
      </button>
      {error ? (
        <p className="max-w-[12rem] text-right text-[11px] text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function NewChantier() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const open = () => setOpen(true);
    if (typeof window !== "undefined" && window.location.hash === "#nouveau") open();
    window.addEventListener("navpit:new-project", open);
    return () => window.removeEventListener("navpit:new-project", open);
  }, []);

  return (
    <div id="nouveau" className="flex min-h-[180px] flex-col rounded-card border border-dashed border-ink/15">
      {open ? (
        <form
          className="flex flex-1 flex-col justify-center gap-2 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            setError(null);
            start(async () => {
              const res = await createChantierAction(fd);
              if (!res.ok) {
                setError(res.error);
                return;
              }
              router.push(`/chantiers/${res.slug}`);
            });
          }}
        >
          <input name="name" required placeholder="Nom du chantier" className="h-12 rounded-[12px] border border-line px-3 text-base md:h-9 md:rounded-[10px] md:text-[14px]" />
          <input name="client" placeholder="Client (ex. Madame Dupont)" className="h-12 rounded-[12px] border border-line px-3 text-base md:h-9 md:rounded-[10px] md:text-[14px]" />
          <input name="address" placeholder="Lieu du chantier" className="h-9 rounded-[10px] border border-line px-3 text-[14px]" />
          {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
          <button type="submit" disabled={pending} className="btn-orange inline-flex h-9 w-fit items-center gap-2 px-3 text-[13.5px] font-medium">
            {pending ? <Loader2 className="size-4 animate-spin" /> : "Créer"}
          </button>
        </form>
      ) : (
        <button type="button" onClick={() => setOpen(true)} className="flex flex-1 flex-col items-center justify-center gap-2 text-muted-foreground hover:text-ink">
          <Plus className="size-5" />
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase">Nouveau chantier</span>
        </button>
      )}
    </div>
  );
}
