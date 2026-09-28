"use client";

import { useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { EmptyState } from "@/components/app-ui/empty-state";
import { FilterPills } from "@/components/app-ui/filter-pills";
import { CancelFollowUpButton, MarkAnsweredButton, RelanceButton, RelanceStatus } from "@/components/metier/relance-dialog";
import { formatNextActionFr, formatRelativeFr, type FollowUpView } from "@/lib/metier/follow-ups";
import type { DocumentCard } from "@/lib/metier/types";
import { euro } from "@/lib/site/tarineo";
import Link from "next/link";

export function RelancesTable({
  rows,
  documents,
}: {
  rows: FollowUpView[];
  documents: DocumentCard[];
}) {
  const [filter, setFilter] = useState<"all" | "client" | "fournisseur">("all");
  const list = useMemo(
    () => (filter === "all" ? rows : rows.filter((r) => r.audience === filter)),
    [rows, filter],
  );

  return (
    <div className="flex flex-col gap-4">
      <FilterPills
        value={filter}
        onChange={setFilter}
        options={[
          { id: "all", label: "Toutes" },
          { id: "client", label: "Clients" },
          { id: "fournisseur", label: "Fournisseurs" },
        ]}
      />

      {list.length ? (
        <>
          <ul className="grid gap-2 md:hidden">
            {list.map((r) => {
              const doc = documents.find((d) => d.id === r.document_id);
              return (
                <li key={r.id} className="rounded-[16px] border border-line bg-surface p-4">
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
                      <p className="mt-1 text-[12px] text-muted-foreground">{formatNextActionFr(r)}</p>
                    </div>
                    <Link href={`/pieces/${r.document_id}`} className="shrink-0 text-[#FF6B1A]" aria-label="Voir le document">
                      →
                    </Link>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {doc && r.status !== "answered" && r.status !== "done" && r.status !== "cancelled" ? (
                      <RelanceButton doc={doc} followUp={r} />
                    ) : null}
                    {r.status !== "answered" && r.status !== "done" && r.status !== "cancelled" ? (
                      <MarkAnsweredButton followUpId={r.id} virtual={r.virtual} />
                    ) : null}
                    {r.status === "scheduled" || r.status === "due" ? (
                      <CancelFollowUpButton followUpId={r.id} virtual={r.virtual} />
                    ) : null}
                  </div>
                </li>
              );
            })}
          </ul>
          <div className="hidden overflow-x-auto rounded-card border border-line md:block">
          <table className="app-table min-w-[860px]">
            <thead>
              <tr>
                <th>Statut</th>
                <th>Contact</th>
                <th>Chantier</th>
                <th>Document</th>
                <th className="text-right">Montant</th>
                <th>Dernière action</th>
                <th>Prochaine action</th>
                <th className="text-right" />
              </tr>
            </thead>
            <tbody>
              {list.map((r) => {
                const doc = documents.find((d) => d.id === r.document_id);
                return (
                  <tr key={r.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <RelanceStatus followUp={r} />
                    </td>
                    <td className="px-4 py-3">{r.contact}</td>
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
                    <td className="px-4 py-3 tabular-nums">{r.amount_ht ? `${euro(r.amount_ht)} HT` : "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatRelativeFr(r.last_action_at || r.sent_at || r.created_at)}
                    </td>
                    <td className="px-4 py-3">{formatNextActionFr(r)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        {doc && r.status !== "answered" && r.status !== "done" && r.status !== "cancelled" ? (
                          <RelanceButton doc={doc} followUp={r} />
                        ) : null}
                        {r.status !== "answered" && r.status !== "done" && r.status !== "cancelled" ? (
                          <MarkAnsweredButton followUpId={r.id} virtual={r.virtual} />
                        ) : null}
                        {r.status === "scheduled" || r.status === "due" ? (
                          <CancelFollowUpButton followUpId={r.id} virtual={r.virtual} />
                        ) : null}
                      </div>
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
          title={filter === "all" ? "Aucune relance" : "Aucune relance dans ce filtre"}
          text={
            filter === "all"
              ? "Un devis envoyé sans suite apparaît ici après quelques jours."
              : `Aucune relance ${filter === "client" ? "client" : "fournisseur"}.`
          }
        />
      )}
    </div>
  );
}
