"use client";

import { useState } from "react";
import Link from "next/link";
import { ChantierStatusToggle } from "@/components/metier/chantier-status";
import { DocumentDrop } from "@/components/metier/document-drop";
import { DocumentList } from "@/components/metier/document-list";
import { SupplierLogo } from "@/components/site/supplier-logo";
import type { ChantierCard, DocumentCard, Party } from "@/lib/metier/types";
import { DEMO_MARK, euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

type Tab = "achats" | "client" | "articles";

export function ChantierFiche({
  chantier,
  documents,
  clients,
  chantiers,
  defaultMarginPct,
}: {
  chantier: ChantierCard;
  documents: DocumentCard[];
  clients: Party[];
  chantiers: ChantierCard[];
  defaultMarginPct?: number;
}) {
  const [tab, setTab] = useState<Tab>("achats");
  const inbound = documents.filter((d) => d.direction === "in");
  const outbound = documents.filter((d) => d.direction === "out");
  const buyHt = inbound.reduce((s, d) => s + d.lines.reduce((a, l) => a + Number(l.buy_price) * Number(l.qty), 0), 0);
  const sellHt = outbound.reduce((s, d) => s + d.lines.reduce((a, l) => a + Number(l.sell_price || l.buy_price) * Number(l.qty), 0), 0);

  const articles = new Map<
    string,
    { label: string; qty: number; buy: number; sell: number; enseigne: string }
  >();
  for (const d of inbound) {
    for (const l of d.lines) {
      const cur = articles.get(l.label) ?? {
        label: l.label,
        qty: 0,
        buy: Number(l.buy_price),
        sell: 0,
        enseigne: d.party_name ?? "",
      };
      cur.qty += Number(l.qty);
      cur.buy = Number(l.buy_price);
      cur.enseigne = d.party_name ?? cur.enseigne;
      articles.set(l.label, cur);
    }
  }
  for (const d of outbound) {
    for (const l of d.lines) {
      const cur = articles.get(l.label) ?? {
        label: l.label,
        qty: Number(l.qty),
        buy: 0,
        sell: Number(l.sell_price || l.buy_price),
        enseigne: d.party_name ?? "",
      };
      cur.sell = Number(l.sell_price || l.buy_price);
      articles.set(l.label, cur);
    }
  }
  const rows = [...articles.values()];

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        {chantier.seed_key ? <p className="mono-label">{DEMO_MARK}</p> : <p className="mono-label">/ Chantier ///</p>}
        <h1 className="font-display text-[clamp(30px,6vw,44px)] leading-[1.05] font-semibold tracking-tightest">
          {chantier.name}
        </h1>
        <p className="text-[15.5px] text-muted-foreground">{chantier.address || "Lieu à préciser"}</p>
        <p className="text-[15px]">
          Client : <b>{chantier.client_name ?? "à lier"}</b>
        </p>
        <ChantierStatusToggle id={chantier.id} status={chantier.status} />
        <p className="tabular-nums text-[14px] text-muted-foreground">
          Achats {euro(buyHt)} HT · Vente {euro(sellHt)} HT
          {buyHt > 0 && sellHt > 0 ? ` · marge ${Math.round(((sellHt - buyHt) / sellHt) * 100)} %` : ""}
        </p>
      </header>

      <DocumentDrop chantiers={chantiers} clients={clients} defaultChantierId={chantier.id} />

      <nav className="flex flex-wrap gap-2 lg:hidden" aria-label="Sections chantier">
        {(
          [
            ["achats", "Achats"],
            ["client", "Client"],
            ["articles", "Articles"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "rounded-full px-3 py-1.5 text-[13px]",
              tab === id ? "bg-ink text-accent-ink" : "border border-line",
            )}
          >
            {label}
          </button>
        ))}
      </nav>

      <section className={cn("lg:block", tab === "articles" ? "block" : "hidden lg:block")}>
        <p className="mono-label mb-3">{"/ Articles ///"}</p>
        {rows.length ? (
          <ul className="divide-y divide-line rounded-[28px] border border-line bg-card">
            {rows.map((l) => (
              <li key={l.label} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
                <div className="flex min-w-0 items-center gap-2">
                  {l.enseigne ? <SupplierLogo name={l.enseigne} size={28} /> : null}
                  <div>
                    <p className="font-medium">{l.label}</p>
                    <p className="text-[13px] text-muted-foreground">
                      {l.qty} · {l.enseigne || "Enseigne"}
                    </p>
                  </div>
                </div>
                <p className="tabular-nums text-[14px]">
                  {l.buy ? `Achat ${euro(l.buy)}` : "—"}
                  {l.sell ? ` · Vente ${euro(l.sell)}` : ""}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[14.5px] text-muted-foreground">Déposez un devis ci-dessus pour voir les articles.</p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className={cn("lg:block", tab === "achats" ? "block" : "hidden lg:block")}>
          <p className="mono-label mb-3">{"/ Achats (distributeur) ///"}</p>
          <DocumentList
            docs={inbound}
            empty="Pas encore de devis ou facture fournisseur."
            clients={clients}
            defaultMarginPct={defaultMarginPct}
            defaultClientId={chantier.client_id}
          />
        </div>
        <div className={cn("lg:block", tab === "client" ? "block" : "hidden lg:block")}>
          <p className="mono-label mb-3">{"/ Pièces client ///"}</p>
          <DocumentList docs={outbound} empty="Pas encore de devis envoyé au client." />
        </div>
      </section>

      <p className="text-[13px] text-muted-foreground">
        <Link href="/ressources" className="underline underline-offset-2">
          Tous les achats
        </Link>
        {" · "}
        <Link href="/composants" className="underline underline-offset-2">
          Toutes les pièces client
        </Link>
      </p>
    </div>
  );
}
