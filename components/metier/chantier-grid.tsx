"use client";

import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { createChantierAction } from "@/app/(app)/metier/actions";
import { ChantierStatusToggle } from "@/components/metier/chantier-status";
import type { ChantierCard } from "@/lib/metier/types";
import { DEMO_MARK } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

export function ChantierGrid({ chantiers }: { chantiers: ChantierCard[] }) {
  return (
    <div className="grid gap-3.5 sm:grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
      {chantiers.map((c) => (
        <article
          key={c.id}
          className={cn(
            "card-soft relative flex flex-col gap-3 p-5 transition-shadow hover:shadow-lift",
            c.status === "focus"
              ? "shadow-[inset_4px_0_24px_-8px_color-mix(in_srgb,var(--color-brand-orange)_55%,transparent),inset_-4px_0_24px_-8px_color-mix(in_srgb,var(--color-brand-orange)_55%,transparent),inset_4px_0_0_var(--color-brand-orange),inset_-4px_0_0_var(--color-brand-orange)]"
              : c.status === "pause"
                ? "shadow-[inset_4px_0_0_#f4c4a8]"
                : "",
          )}
        >
          <div>
            {c.seed_key ? <p className="mono-label text-[10px]">{DEMO_MARK}</p> : null}
            <h3 className="font-display text-[22px] leading-tight font-semibold tracking-tight">
              <Link
                href={`/chantiers/${c.slug}`}
                className="outline-none after:absolute after:inset-0 after:rounded-card"
              >
                {c.name}
              </Link>
            </h3>
            <p className="mt-1 text-[13.5px] text-muted-foreground">{c.address || "Lieu à préciser"}</p>
          </div>
          <p className="text-[14px]">
            {c.client_name ?? "Client à lier"} · {c.docs_count} document{c.docs_count > 1 ? "s" : ""}
          </p>
          <div className="relative z-10" onClick={(e) => e.preventDefault()}>
            <ChantierStatusToggle id={c.id} status={c.status} />
          </div>
        </article>
      ))}
      <NewChantier />
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
          <input name="name" required placeholder="Nom du chantier" className="min-h-11 rounded-xl border border-line px-3" />
          <input name="client" placeholder="Client (ex. Madame Dupont)" className="min-h-11 rounded-xl border border-line px-3" />
          <input name="address" placeholder="Lieu du chantier" className="min-h-11 rounded-xl border border-line px-3" />
          {error ? <p className="text-[13px] text-destructive">{error}</p> : null}
          <button type="submit" disabled={pending} className="btn-dark min-h-10 w-fit rounded-xl px-3 text-[13px]">
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
