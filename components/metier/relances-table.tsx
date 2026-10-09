"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Bell, Search } from "lucide-react";
import { EmptyState } from "@/components/app-ui/empty-state";
import { FilterPills } from "@/components/app-ui/filter-pills";
import {
  CancelFollowUpButton,
  MarkAnsweredButton,
  RelanceButton,
  RelanceStatus,
} from "@/components/metier/relance-dialog";
import {
  formatNextActionFr,
  formatRelativeFr,
  type FollowUpStatus,
  type FollowUpView,
} from "@/lib/metier/follow-ups";
import type { DocumentCard } from "@/lib/metier/types";
import { R } from "@/lib/routes";
import { euro, euroInt } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

type AudienceFilter = "all" | "client" | "fournisseur";
type StatusFilter = "active" | "due" | "scheduled" | "sent" | "answered" | "all";

const ACTIVE: FollowUpStatus[] = ["due", "scheduled", "sent"];

function daysWaiting(iso: string | null, now = Date.now()) {
  if (!iso) return null;
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return null;
  return Math.max(0, Math.floor((now - t) / 86_400_000));
}

function waitingLabel(r: FollowUpView) {
  const days = daysWaiting(r.last_action_at || r.sent_at || r.created_at);
  if (days == null) return null;
  if (r.status !== "due") return null;
  if (days <= 0) return "Depuis aujourd’hui";
  if (days === 1) return "Depuis hier";
  return `En attente depuis ${days} j`;
}

function matchesSearch(r: FollowUpView, q: string) {
  if (!q) return true;
  const hay = [r.contact, r.chantier_name, r.document_title, r.to_email]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}

function KpiButton({
  active,
  onClick,
  label,
  value,
  hint,
  accent,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  value: string;
  hint: string;
  accent: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[14px] border bg-surface px-4 py-3.5 text-left shadow-soft transition-[border-color,box-shadow,background-color]",
        "hover:border-line-strong hover:bg-surface-2 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/30",
        active ? "border-tarineo-orange ring-1 ring-tarineo-orange/25" : "border-line",
      )}
    >
      <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.05em] text-muted-foreground uppercase">
        <span aria-hidden className={cn("size-[5px] rounded-full", accent)} />
        {label}
      </p>
      <p className="mt-1.5 font-display text-[24px] font-semibold tabular-nums tracking-[-0.025em]">{value}</p>
      <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
    </button>
  );
}

function RowActions({
  r,
  doc,
  emphasize,
}: {
  r: FollowUpView;
  doc?: DocumentCard;
  emphasize?: boolean;
}) {
  const open = r.status !== "answered" && r.status !== "done" && r.status !== "cancelled";
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {doc && open ? <RelanceButton doc={doc} followUp={r} size={emphasize ? "primary" : "chip"} /> : null}
      {open ? <MarkAnsweredButton followUpId={r.id} virtual={r.virtual} /> : null}
      {r.status === "scheduled" || r.status === "due" ? (
        <CancelFollowUpButton followUpId={r.id} virtual={r.virtual} />
      ) : null}
    </div>
  );
}

export function RelancesTable({
  rows,
  documents,
}: {
  rows: FollowUpView[];
  documents: DocumentCard[];
}) {
  const [audience, setAudience] = useState<AudienceFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [query, setQuery] = useState("");

  const counts = useMemo(() => {
    const due = rows.filter((r) => r.status === "due");
    const scheduled = rows.filter((r) => r.status === "scheduled");
    const sent = rows.filter((r) => r.status === "sent");
    const dueHt = due.reduce((s, r) => s + (r.amount_ht || 0), 0);
    return {
      due: due.length,
      scheduled: scheduled.length,
      sent: sent.length,
      active: due.length + scheduled.length + sent.length,
      dueHt,
    };
  }, [rows]);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (audience !== "all" && r.audience !== audience) return false;
      if (status === "active" && !ACTIVE.includes(r.status)) return false;
      if (status !== "active" && status !== "all" && r.status !== status) return false;
      return matchesSearch(r, q);
    });
  }, [rows, audience, status, query]);

  const docsById = useMemo(() => new Map(documents.map((d) => [d.id, d])), [documents]);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiButton
          active={status === "due"}
          onClick={() => setStatus(status === "due" ? "active" : "due")}
          label="À relancer"
          value={String(counts.due)}
          hint={counts.due ? "à traiter en priorité" : "rien de dû"}
          accent="bg-tarineo-orange"
        />
        <KpiButton
          active={status === "scheduled"}
          onClick={() => setStatus(status === "scheduled" ? "active" : "scheduled")}
          label="Programmées"
          value={String(counts.scheduled)}
          hint={counts.scheduled ? "envoi planifié" : "aucune"}
          accent="bg-[#F59E0B]"
        />
        <KpiButton
          active={status === "sent"}
          onClick={() => setStatus(status === "sent" ? "active" : "sent")}
          label="Envoyées"
          value={String(counts.sent)}
          hint={counts.sent ? "en attente de réponse" : "aucune"}
          accent="bg-[#9A9A9A]"
        />
        <div className="rounded-[14px] border border-line bg-surface px-4 py-3.5 shadow-soft">
          <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.05em] text-muted-foreground uppercase">
            <span aria-hidden className="size-[5px] rounded-full bg-[#16A34A]" />
            Enjeu HT
          </p>
          <p className="mt-1.5 font-display text-[24px] font-semibold tabular-nums tracking-[-0.025em]">
            {counts.dueHt ? euroInt(counts.dueHt) : "—"}
          </p>
          <p className="mt-1 text-[12px] text-muted-foreground">sur les relances dues</p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterPills
          value={audience}
          onChange={setAudience}
          options={[
            { id: "all", label: `Toutes${counts.active ? ` · ${counts.active}` : ""}` },
            { id: "client", label: "Clients" },
            { id: "fournisseur", label: "Fournisseurs" },
          ]}
        />
        <label className="relative block min-w-0 sm:w-[240px]">
          <Search
            className="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Contact, chantier, devis…"
            className="h-10 w-full rounded-[10px] border border-line bg-surface pr-3 pl-9 text-[13px] outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/30"
          />
        </label>
      </div>

      <FilterPills
        value={status}
        onChange={setStatus}
        options={[
          { id: "active", label: "Actives" },
          { id: "due", label: "À relancer" },
          { id: "scheduled", label: "Programmées" },
          { id: "sent", label: "Envoyées" },
          { id: "answered", label: "Répondues" },
          { id: "all", label: "Tout" },
        ]}
      />

      {list.length ? (
        <>
          <ul className="grid gap-2 md:hidden">
            {list.map((r) => {
              const doc = docsById.get(r.document_id);
              const wait = waitingLabel(r);
              return (
                <li
                  key={r.id}
                  className={cn(
                    "rounded-[16px] border bg-surface p-4",
                    r.status === "due" ? "border-tarineo-orange/35" : "border-line",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <RelanceStatus followUp={r} />
                      <p className="mt-2 truncate text-[14px] font-medium">{r.document_title}</p>
                      <p className="mt-0.5 truncate text-[12px] text-muted-foreground">
                        {r.contact}
                        {r.chantier_name ? ` · ${r.chantier_name}` : ""}
                      </p>
                      <p className="mt-1 tabular-nums text-[13px]">
                        {r.amount_ht ? `${euro(r.amount_ht)} HT` : "—"}
                      </p>
                      <p className="mt-1 text-[12px] text-muted-foreground">
                        {wait ?? formatNextActionFr(r)}
                      </p>
                    </div>
                    <Link
                      href={`/pieces/${r.document_id}`}
                      className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-tarineo-orange hover:bg-tarineo-orange-soft"
                      aria-label="Voir le document"
                    >
                      <ArrowRight className="size-4" aria-hidden />
                    </Link>
                  </div>
                  <div className="mt-3">
                    <RowActions r={r} doc={doc} emphasize={r.status === "due"} />
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="hidden overflow-x-auto rounded-card border border-line md:block">
            <table className="app-table min-w-[920px]">
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Contact</th>
                  <th>Chantier</th>
                  <th>Document</th>
                  <th className="text-right">Montant</th>
                  <th>Dernière action</th>
                  <th>Prochaine</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {list.map((r) => {
                  const doc = docsById.get(r.document_id);
                  const wait = waitingLabel(r);
                  return (
                    <tr
                      key={r.id}
                      className={cn(
                        "border-b border-line last:border-0",
                        r.status === "due" && "bg-tarineo-orange-soft/40",
                      )}
                    >
                      <td className="px-4 py-3">
                        <RelanceStatus followUp={r} />
                        {wait ? (
                          <p className="mt-1 text-[11px] text-tarineo-orange">{wait}</p>
                        ) : null}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{r.contact}</p>
                        <p className="text-[12px] text-muted-foreground capitalize">{r.audience}</p>
                      </td>
                      <td className="px-4 py-3">
                        {r.chantier_slug ? (
                          <Link href={`/chantiers/${r.chantier_slug}`} className="hover:underline">
                            {r.chantier_name}
                          </Link>
                        ) : (
                          r.chantier_name || "—"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <Link href={`/pieces/${r.document_id}`} className="hover:underline">
                          {r.document_title}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums">
                        {r.amount_ht ? `${euro(r.amount_ht)} HT` : "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatRelativeFr(r.last_action_at || r.sent_at || r.created_at)}
                      </td>
                      <td className="px-4 py-3">{formatNextActionFr(r)}</td>
                      <td className="px-4 py-3">
                        <RowActions r={r} doc={doc} emphasize={r.status === "due"} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <EmptyState
          icon={Bell}
          title={
            query.trim()
              ? "Aucun résultat"
              : status === "due"
                ? "Rien à relancer"
                : audience === "all"
                  ? "Aucune relance active"
                  : "Aucune relance dans ce filtre"
          }
          text={
            query.trim()
              ? "Essayez un autre contact, chantier ou document."
              : status === "due"
                ? "Les devis envoyés sans suite apparaissent ici après quelques jours."
                : "Un devis client envoyé sans réponse apparaît automatiquement ici."
          }
          actionHref={R.clientDevis}
          actionLabel="Voir les devis clients"
        />
      )}
    </div>
  );
}
