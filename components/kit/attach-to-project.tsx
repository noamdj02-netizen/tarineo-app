"use client";

import { FolderPlus } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { attachLanding } from "@/app/(app)/bibliotheque/heros/actions";
import { attachKitComponent } from "@/app/(app)/composants/actions";
import { cn } from "@/lib/utils";

export type AttachTarget = { id: string; slug: string; name: string; status: string };

export function AttachToProject({
  name,
  themeId,
  projects,
  variant = "ghost",
  landingSlug,
  landingValues,
}: {
  name: string;
  themeId?: string;
  projects: AttachTarget[];
  variant?: "ghost" | "primary";
  landingSlug?: string;
  landingValues?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const label = msg ?? "Ajouter au projet";
  const btnClass =
    variant === "primary"
      ? "btn-dark inline-flex min-h-10 items-center gap-1.5 rounded-pill px-3.5 text-[13px] disabled:opacity-40"
      : "copy";

  if (!projects.length) {
    return (
      <Link href="/chantiers#nouveau" className={btnClass}>
        <FolderPlus className="size-3.5" aria-hidden />
        Créer un projet
      </Link>
    );
  }

  const ordered = [...projects].sort((a, b) => Number(b.status === "focus") - Number(a.status === "focus"));

  return (
    <div className="relative">
      <button type="button" className={cn(btnClass)} onClick={() => setOpen((v) => !v)} disabled={pending}>
        <FolderPlus className="size-3.5" aria-hidden />
        {label}
      </button>
      {open ? (
        <ul className="absolute top-full right-0 z-20 mt-1 min-w-[14rem] rounded-xl border border-line bg-surface p-1 shadow-lift">
          {ordered.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                disabled={pending}
                className="flex min-h-10 w-full items-center justify-between rounded-lg px-2.5 text-left text-[13px] hover:bg-accent-soft"
                onClick={() =>
                  start(async () => {
                    const res = landingSlug
                      ? await attachLanding({
                          projectId: p.id,
                          slug: landingSlug,
                          values: landingValues,
                        })
                      : await attachKitComponent({
                          projectId: p.id,
                          name,
                          themeId,
                        });
                    setMsg(res.ok ? "Ajouté ✓" : res.error);
                    setOpen(false);
                    setTimeout(() => setMsg(null), 1800);
                  })
                }
              >
                <span className="truncate">{p.name}</span>
                {p.status === "focus" ? (
                  <span className="font-mono text-[10px] text-muted-foreground">Focus</span>
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
