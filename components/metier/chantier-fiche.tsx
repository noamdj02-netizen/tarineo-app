"use client";

import { EmptyState } from "@/components/app-ui/empty-state";
import { PageHeader } from "@/components/app-ui/page-header";
import { DocumentChain } from "@/components/metier/document-chain";
import { ChantierStatusToggle } from "@/components/metier/chantier-status";
import { DocumentDrop } from "@/components/metier/document-drop";
import { DocumentList } from "@/components/metier/document-list";
import { CancelFollowUpButton, MarkAnsweredButton, RelanceButton, RelanceStatus } from "@/components/metier/relance-dialog";
import { UpcomingDeliveries } from "@/components/metier/upcoming-deliveries";
import { SupplierLogo } from "@/components/site/supplier-logo";
import { StatusBadge } from "@/components/tarineo/status-badge";
import {
  formatDeliveryDateFr,
  upcomingDeliveries,
} from "@/lib/metier/delivery";
import {
  documentAmountHt,
  documentChains,
  documentLifecycleLabel,
  formatRelativeFr,
  isDocumentTransformed,
  type FollowUpView,
} from "@/lib/metier/follow-ups";
import type { ChantierCard, DocumentCard, Party, PriceAlert } from "@/lib/metier/types";
import { KIND_LABEL } from "@/lib/metier/types";
import { R } from "@/lib/routes";
import { signedPct, variation } from "@/lib/site/tarineo";
import { DEMO_MARK, euro } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";
import { ArrowRight, FileText, User } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

type Tab = "vue" | "documents" | "achats" | "relances" | "activite";

function asTab(value?: string): Tab {
  if (value === "documents" || value === "achats" || value === "relances" || value === "activite" || value === "vue") {
    return value;
  }
  return "vue";
}

export function ChantierFiche({
  chantier,
  documents,
  clients,
  chantiers,
  defaultMarginPct,
  alerts = [],
  followUps = [],
  initialTab,
}: {
  chantier: ChantierCard;
  documents: DocumentCard[];
  clients: Party[];
  chantiers: ChantierCard[];
  defaultMarginPct?: number;
  alerts?: PriceAlert[];
  followUps?: FollowUpView[];
  initialTab?: string;
}) {
  const [tab, setTab] = useState<Tab>(asTab(initialTab));
  void defaultMarginPct;
  const inbound = documents.filter((d) => d.direction === "in");
  const outbound = documents.filter((d) => d.direction === "out");
  const buyHt = inbound.reduce((s, d) => s + documentAmountHt(d), 0);
  const sellHt = outbound.reduce((s, d) => s + documentAmountHt(d), 0);
  const marginHt = sellHt - buyHt;
  const chains = documentChains(documents);
  const devis = outbound.filter((d) => d.kind === "devis");
  const commandes = outbound.filter((d) => d.kind === "bon_commande");
  const factures = outbound.filter((d) => d.kind === "facture");
  const relances = followUps.filter((f) => f.status === "due" || f.status === "scheduled");
  const marginPct = sellHt > 0 ? Math.round((marginHt / sellHt) * 1000) / 10 : null;
  const pendingInbound = inbound.filter((d) => !isDocumentTransformed(d, documents));
  const deliveries = useMemo(() => upcomingDeliveries(documents, { limit: 8 }), [documents]);
  const todos: { key: string; title: string; hint: string; href?: string; tone: "warn" | "focus" | "muted" }[] = [
    ...deliveries.map((d) => ({
      key: `del-${d.documentId}`,
      title: `Livraison le ${formatDeliveryDateFr(d.day)}`,
      hint: `${d.title}${d.partyName ? ` · ${d.partyName}` : ""} — préparer le chantier`,
      href: `/pieces/${d.documentId}` as string | undefined,
      tone: "focus" as const,
    })),
    ...relances.map((f) => ({
      key: `fu-${f.id}`,
      title: `Relancer ${f.document_title}`,
      hint: f.status === "due" ? "À relancer" : "Programmée",
      href: undefined as string | undefined,
      tone: "warn" as const,
    })),
    ...alerts.slice(0, 4).map((a) => ({
      key: `al-${a.id}`,
      title: a.label,
      hint: `Hausse ${signedPct(variation(Number(a.old_price), Number(a.new_price)))}`,
      href: undefined as string | undefined,
      tone: "warn" as const,
    })),
    ...pendingInbound.slice(0, 3).map((d) => ({
      key: `in-${d.id}`,
      title: d.title,
      hint: "Devis d’achat à transformer",
      href: `/pieces/${d.id}`,
      tone: "muted" as const,
    })),
  ];

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

  const activity = useMemo(() => {
    const items: { at: string; label: string }[] = [];
    for (const d of documents) {
      items.push({ at: d.created_at, label: `${KIND_LABEL[d.kind]} « ${d.title} »` });
      const sent = d.extract?.sent_at;
      if (typeof sent === "string") items.push({ at: sent, label: `Envoyé : ${d.title}` });
    }
    for (const f of followUps) {
      if (f.sent_at) items.push({ at: f.sent_at, label: `Relance : ${f.document_title}` });
    }
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 20);
  }, [documents, followUps]);

  const tabs: [Tab, string][] = [
    ["vue", "Vue d’ensemble"],
    ["documents", "Documents"],
    ["achats", "Achats"],
    ["relances", "Relances"],
    ["activite", "Activité"],
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageHeader
        crumbs={[
          { href: R.accueil, label: "Accueil" },
          { href: R.chantiers, label: "Chantiers" },
          { label: chantier.name },
        ]}
        title={chantier.name}
        description={
          [chantier.address || null, chantier.seed_key ? DEMO_MARK : null].filter(Boolean).join(" · ") || undefined
        }
        action={<ChantierStatusToggle id={chantier.id} status={chantier.status} />}
      />
      <div className="inline-flex max-w-full items-center gap-2.5 rounded-[12px] border border-line bg-surface px-3 py-2 shadow-soft">
        <User className="size-3.5 text-muted-foreground" strokeWidth={1.75} aria-hidden />
        <div className="min-w-0">
          <p className="text-[10.5px] font-medium tracking-[0.08em] text-muted-foreground uppercase">Client</p>
          <p className="truncate text-[14px] font-medium">{chantier.client_name ?? "à lier"}</p>
        </div>
        <StatusBadge
          label={chantier.status === "focus" ? "En cours" : chantier.status === "pause" ? "En pause" : "Terminé"}
          tone={chantier.status === "focus" ? "focus" : chantier.status === "pause" ? "pause" : "fini"}
          className="ml-1 shrink-0"
        />
      </div>

      <ChantierKpis
        sellHt={sellHt}
        buyHt={buyHt}
        marginHt={marginHt}
        marginPct={marginPct}
        devisCount={devis.length}
        buyCount={inbound.length}
        docsCount={documents.length}
      />

      <nav className="scroll-x border-b border-line" aria-label="Dossier chantier">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={cn(
              "shrink-0 border-b-2 px-3 py-2.5 text-[13.5px] whitespace-nowrap transition-colors duration-150",
              tab === id
                ? "border-tarineo-orange text-tarineo-orange"
                : "border-transparent text-muted-foreground hover:text-tarineo-orange",
            )}
          >
            {label}
            {id === "relances" && relances.length ? (
              <span className="ml-1.5 tabular-nums text-[12px] text-brand-orange">{relances.length}</span>
            ) : null}
          </button>
        ))}
      </nav>

      {tab === "vue" ? (
        <div className="flex flex-col gap-8">
          <UpcomingDeliveries
            items={deliveries}
            title={
              chantier.client_name
                ? `Livraisons — client ${chantier.client_name}`
                : "Livraisons prévues sur ce chantier"
            }
          />
          {todos.length ? (
            <section className="rounded-[16px] border border-line bg-surface px-4 py-4">
              <div className="mb-3 flex items-baseline justify-between gap-2">
                <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">À traiter</p>
                <span className="tabular-nums text-[12px] text-muted-foreground">{todos.length}</span>
              </div>
              <ul className="grid gap-1">
                {todos.slice(0, 6).map((item) => {
                  const row = (
                    <span className="flex items-center justify-between gap-3 px-1 py-2">
                      <span className="min-w-0">
                        <span className="flex items-center gap-2">
                          <StatusBadge
                            label={
                              item.key.startsWith("del-")
                                ? "Livraison"
                                : item.tone === "warn"
                                  ? "Action"
                                  : "Pièce"
                            }
                            tone={item.tone}
                          />
                          <span className="truncate font-medium">{item.title}</span>
                        </span>
                        <span className="mt-0.5 block pl-7 text-[13px] text-muted-foreground">{item.hint}</span>
                      </span>
                      <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                    </span>
                  );
                  return (
                    <li key={item.key} className="rounded-[10px] transition-colors duration-150 hover:bg-wash-row-hover">
                      {item.href ? (
                        <Link href={item.href} className="block">
                          {row}
                        </Link>
                      ) : (
                        <button type="button" className="w-full text-left" onClick={() => setTab(item.key.startsWith("fu-") ? "relances" : "achats")}>
                          {row}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          {chains.length ? (
            <section>
              <p className="mb-3 text-[12px] text-muted-foreground">Suite devis → commande → facture</p>
              <div className="grid gap-6 sm:grid-cols-2">
                {chains.map((c) => (
                  <DocumentChain key={c[0].id} chain={c} />
                ))}
              </div>
            </section>
          ) : null}

          {inbound.length >= 2 ? (
            <Link
              href={`${R.comparateur}?a=${inbound[0].id}&b=${inbound[1].id}`}
              className="text-[13px] underline underline-offset-2"
            >
              Comparer les deux derniers devis d’achat
            </Link>
          ) : null}

          {rows.length ? (
            <section>
              <p className="mb-3 text-[12px] text-muted-foreground">Articles</p>
              <ul className="divide-y divide-line rounded-[16px] border border-line bg-surface">
                {rows.slice(0, 8).map((l) => (
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
            </section>
          ) : (
            <EmptyState
              title="Dossier encore vide"
              text="Importez un document d’achat (onglet Achats) ou créez un devis client. La même pièce reste visible dans Documents entreprise."
            />
          )}
        </div>
      ) : null}

      {tab === "documents" ? (
        <div className="flex flex-col gap-8">
          {!devis.length && !commandes.length && !factures.length && !inbound.length ? (
            <EmptyState
              title="Aucun document sur ce chantier"
              text="Les devis et factures restent aussi visibles dans Documents entreprise. Reliez-les à ce chantier pour les retrouver ici."
              actionHref={R.clientDevis}
              actionLabel="Voir les devis"
            />
          ) : (
            <>
              <DocGroup title="Devis" docs={devis} all={documents} />
              <DocGroup title="Commandes" docs={commandes} all={documents} />
              <DocGroup title="Factures" docs={factures} all={documents} />
              <DocGroup title="Documents fournisseur" docs={inbound} all={documents} inbound />
            </>
          )}
          <p className="text-[13px] text-muted-foreground">
            <Link href={`${R.clientDevis}?chantier=${chantier.slug}`} className="underline underline-offset-2">
              Tous les devis
            </Link>
            {" · "}
            <Link href={`${R.clientFacture}?chantier=${chantier.slug}`} className="underline underline-offset-2">
              Toutes les factures
            </Link>
            {" · "}
            <Link href={`${R.distributeurDevis}?chantier=${chantier.slug}`} className="underline underline-offset-2">
              Documents fournisseur
            </Link>
          </p>
        </div>
      ) : null}

      {tab === "achats" ? (
        <div className="flex flex-col gap-6">
          <DocumentDrop chantiers={chantiers} clients={clients} defaultChantierId={chantier.id} />
          {inbound.length ? (
            <ul className="grid gap-2">
              {inbound.map((d) => {
                const ht = documentAmountHt(d);
                const alert = alerts.find((a) => a.document_id === d.id);
                const pct = alert ? variation(Number(alert.old_price), Number(alert.new_price)) : null;
                const critical = pct != null && pct >= 20;
                return (
                  <li key={d.id}>
                    <Link
                      href={`/pieces/${d.id}`}
                      className="flex items-center justify-between gap-3 rounded-[14px] border border-brand-orange/20 bg-wash-orange-strong px-4 py-3 transition-colors duration-150 hover:bg-wash-orange-hover"
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        {d.party_name ? <SupplierLogo name={d.party_name} size={28} /> : null}
                        <span className="min-w-0">
                          <span className="block truncate font-medium">{d.party_name ?? d.title}</span>
                          <span className="block truncate text-[13px] text-muted-foreground">{d.title}</span>
                        </span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block tabular-nums text-[14px] font-medium">{euro(ht)} HT</span>
                        {pct != null ? (
                          <span className={cn("tabular-nums text-[12.5px]", critical ? "text-red-600" : "text-nav-orange")}>
                            {signedPct(pct)}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : null}
          <DocumentList
            docs={inbound}
            empty="Pas encore de devis ou facture fournisseur."
            className="sm:grid-cols-1 xl:grid-cols-2"
          />
        </div>
      ) : null}

      {tab === "relances" ? (
        relances.length ? (
          <ul className="divide-y divide-line rounded-[16px] border border-line bg-surface">
            {relances.map((f) => {
              const doc = documents.find((d) => d.id === f.document_id);
              if (!doc) return null;
              return (
                <li key={f.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div>
                    <RelanceStatus followUp={f} />
                    <p className="mt-1 font-medium">{f.document_title}</p>
                    <p className="text-[13px] text-muted-foreground">{f.contact}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <RelanceButton doc={doc} followUp={f} />
                    <MarkAnsweredButton followUpId={f.id} virtual={f.virtual} />
                    <CancelFollowUpButton followUpId={f.id} virtual={f.virtual} />
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-[14px] text-muted-foreground">Aucune relance en cours.</p>
        )
      ) : null}

      {tab === "activite" ? (
        activity.length ? (
          <ol className="relative ml-2 border-l border-line pl-5">
            {activity.map((a, i) => (
              <li key={`${a.at}-${i}`} className="mb-4">
                <p className="text-[12px] text-muted-foreground">{formatRelativeFr(a.at)}</p>
                <p className="text-[14.5px]">{a.label}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[14px] text-muted-foreground">Pas encore d’activité sur ce dossier.</p>
        )
      ) : null}
    </div>
  );
}

function ChantierKpis({
  sellHt,
  buyHt,
  marginHt,
  marginPct,
  devisCount,
  buyCount,
  docsCount,
}: {
  sellHt: number;
  buyHt: number;
  marginHt: number;
  marginPct: number | null;
  devisCount: number;
  buyCount: number;
  docsCount: number;
}) {
  const cards = [
    {
      key: "devis",
      label: "Devis",
      value: sellHt ? euro(sellHt) : "—",
      hint: `${devisCount} devis`,
      dot: "bg-nav-orange",
      className: "border-brand-orange/20 bg-wash-orange",
    },
    {
      key: "achats",
      label: "Achats",
      value: buyHt ? euro(buyHt) : "—",
      hint: `${buyCount} achat${buyCount > 1 ? "s" : ""}`,
      dot: "bg-muted-foreground/50",
      className: "border-line bg-wash-neutral",
    },
    {
      key: "marge",
      label: "Marge",
      value: sellHt ? euro(marginHt) : "—",
      hint: marginPct != null ? `${marginPct} %` : "—",
      dot: "bg-st-focus",
      className: "border-st-focus/25 bg-wash-success sm:col-span-1 lg:col-span-1",
      bar: marginPct,
    },
    {
      key: "docs",
      label: "Documents",
      value: String(docsCount),
      hint: "documents liés",
      dot: "bg-muted-foreground/40",
      className: "border-line bg-wash-neutral-2",
    },
  ];
  return (
    <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cards.map((c) => (
        <li key={c.key} className={cn("rounded-card border px-4 py-4", c.className)}>
          <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground">
            <span aria-hidden className={cn("size-1.5 rounded-full", c.dot)} />
            {c.label}
          </p>
          <p className="mt-1 font-display text-[20px] font-semibold tabular-nums tracking-[-0.02em] text-ink sm:text-[22px]">
            {c.value}
          </p>
          <p className="mt-0.5 text-[12.5px] text-muted-foreground">{c.hint}</p>
          {c.bar != null ? (
            <span className="mt-3 block h-1 overflow-hidden rounded-full bg-wash-success-track" aria-hidden>
              <span
                className="block h-full rounded-full bg-wash-success-bar"
                style={{ width: `${Math.max(0, Math.min(100, c.bar))}%` }}
              />
            </span>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

function lifecycleTone(label: string): "ok" | "muted" | "warn" {
  if (label === "Prêt" || label === "Facturé" || label === "Commande créée" || label === "Lié") return "ok";
  if (label === "Envoyé" || label === "Envoyée" || label === "Facturée") return "ok";
  return "muted";
}

function DocGroup({
  title,
  docs,
  all,
  inbound,
}: {
  title: string;
  docs: DocumentCard[];
  all: DocumentCard[];
  inbound?: boolean;
}) {
  if (!docs.length) return null;
  return (
    <section>
      <p className="mb-3 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">{title}</p>
      <ul className="grid gap-2">
        {docs.map((d) => {
          const life = documentLifecycleLabel(d, all);
          return (
            <li key={d.id}>
              <Link
                href={`/pieces/${d.id}`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-[14px] border px-4 py-3 transition-colors duration-150",
                  inbound
                    ? "border-brand-orange/20 bg-wash-orange-strong hover:bg-wash-orange-hover"
                    : "border-line bg-surface hover:bg-surface-2",
                )}
              >
                <span className="flex min-w-0 items-start gap-2.5">
                  <FileText className="mt-0.5 size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{d.title}</span>
                    <StatusBadge label={life} tone={lifecycleTone(life)} className="mt-1" />
                  </span>
                </span>
                <span className="shrink-0 tabular-nums text-[13.5px] text-muted-foreground">
                  {euro(documentAmountHt(d))} HT
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
