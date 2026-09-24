"use client";

import { LayoutDashboard, Shapes } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DashboardProjectRow = {
  slug: string;
  name: string;
  status: string;
  next: string;
};

export type DashboardSchemaRow = {
  id: string;
  title: string;
  kind: string;
};

export function DashboardProjectsWidget({ projects }: { projects: DashboardProjectRow[] }) {
  const list = projects.slice(0, 5);
  return (
    <section className="card-soft flex flex-col gap-2 p-3.5 sm:p-4" aria-label="Mes projets">
      <header className="flex items-center justify-between gap-2">
        <p className="mono-label">{"/ Projets ///"}</p>
        <Link href="/projets" className="text-[12px] font-medium text-muted-foreground hover:text-ink">
          Tout voir
        </Link>
      </header>
      {list.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          Aucun projet.{" "}
          <Link href="/projets#nouveau" className="text-ink underline underline-offset-2">
            Créer
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {list.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/projets/${p.slug}`}
                className="flex min-h-10 items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-accent-soft"
              >
                <LayoutDashboard className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{p.name}</span>
                {p.status === "focus" ? (
                  <Badge variant="secondary" className="shrink-0 rounded-full text-[10px]">
                    Focus
                  </Badge>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function DashboardSchemasWidget({ schemas }: { schemas: DashboardSchemaRow[] }) {
  const list = schemas.slice(0, 4);
  return (
    <section className="card-soft flex flex-col gap-2 p-3.5 sm:p-4" aria-label="Schémas">
      <header className="flex items-center justify-between gap-2">
        <p className="mono-label">{"/ Schémas ///"}</p>
        <Link href="/schemas" className="text-[12px] font-medium text-muted-foreground hover:text-ink">
          Bibliothèque
        </Link>
      </header>
      {list.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">
          <Link href="/schemas" className="text-ink underline underline-offset-2">
            Importer ou créer un schéma
          </Link>
        </p>
      ) : (
        <ul className="flex flex-col gap-1">
          {list.map((s) => (
            <li key={s.id}>
              <Link
                href={`/schemas/${s.id}`}
                className="flex min-h-10 items-center gap-2 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-accent-soft"
              >
                <Shapes className="size-4 shrink-0 text-muted-foreground" aria-hidden />
                <span className="min-w-0 flex-1 truncate text-[14px] font-medium">{s.title}</span>
                <span className={cn("font-mono text-[10px] uppercase text-muted-foreground")}>
                  {s.kind}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
