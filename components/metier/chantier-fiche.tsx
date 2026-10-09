"use client";

import { EmptyState } from "@/components/app-ui/empty-state";
import { FilterPills } from "@/components/app-ui/filter-pills";
import { PageHeader } from "@/components/app-ui/page-header";
import { DocumentChain } from "@/components/metier/document-chain";
import { ChantierClientPanel } from "@/components/metier/chantier-client-panel";
import { ChantierDocRow } from "@/components/metier/chantier-doc-row";
import { ChantierStatusToggle } from "@/components/metier/chantier-status";
import { DocumentDrop } from "@/components/metier/document-drop";
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
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";

type Tab = "vue" | "pieces" | "relances" | "activite";
type ScopeFilter = "all" | "client" | "fournisseur";
type KindFilter = "all" | "devis" | "bon_commande" | "facture";

function asTab(value?: string): Tab {
  if (value === "pieces" || value === "relances" || value === "activite" || value === "vue") return value;
  // Anciennes URLs ?tab=documents|achats
  if (value === "documents" || value === "achats") return "pieces";
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
  const router = useRouter();
  const pathname = usePathname();
  const [tab, setTabState] = useState<Tab>(() => asTab(initialTab));
  const [scope, setScope] = useState<ScopeFilter>("all");
  const [kind, setKind] = useState<KindFilter>("all");
  void defaultMarginPct;

  const setTab = useCallback(
    (next: Tab) => {
      setTabState(next);
      const href = next === "vue" ? pathname : `${pathname}?tab=${next}`;
      router.replace(href, { scroll: false });
    },
    [pathname, router],
  );

  const client = useMemo(
    () => clients.find((c) => c.id === chantier.client_id) ?? null,
    [clients, chantier.client_id],
  );
  const followUpByDoc = useMemo(() => {
    const map = new Map<string, FollowUpView>();
    for (const f of followUps) map.set(f.document_id, f);
    return map;
  }, [followUps]);

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
  const relancesDue = followUps.filter((f) => f.status === "due").length;
  const marginPct = sellHt > 0 ? Math.round((marginHt / sellHt) * 1000) / 10 : null;
  const pendingInbound = inbound.filter((d) => !isDocumentTransformed(d, documents));
  const deliveries = useMemo(() => upcomingDeliveries(documents, { limit: 8 }), [documents]);
  const todos: { key: string; title: string; hint: string; href?: string; tone: "warn" | "focus" | "muted"; goTab?: Tab }[] = [
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
      goTab: "relances" as Tab,
    })),
    ...alerts.slice(0, 4).map((a) => ({
      key: `al-${a.id}`,
      title: a.label,
      hint: `Hausse ${signedPct(variation(Number(a.old_price), Number(a.new_price)))}`,
      href: undefined as string | undefined,
      tone: "warn" as const,
      goTab: "pieces" as Tab,
    })),
    ...pendingInbound.slice(0, 3).map((d) => ({
      key: `in-${d.id}`,
      title: d.title,
      hint: "Devis d’achat à transformer",
      href: `/pieces/${d.id}`,
      tone: "muted" as const,
    })),
  ];
  const enCours = todos.slice(0, 3);

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

  const filteredPieces = useMemo(() => {
    return documents.filter((d) => {
      if (scope === "client" && d.direction !== "out") return false;
      if (scope === "fournisseur" && d.direction !== "in") return false;
      if (kind !== "all" && d.kind !== kind) return false;
      return true;
    });
  }, [documents, scope, kind]);

  const filteredDevis = filteredPieces.filter((d) => d.direction === "out" && d.kind === "devis");
  const filteredCommandes = filteredPieces.filter((d) => d.direction === "out" && d.kind === "bon_commande");
  const filteredFactures = filteredPieces.filter((d) => d.direction === "out" && d.kind === "facture");
  const filteredInbound = filteredPieces.filter((d) => d.direction === "in");

  const activity = useMemo(() => {
    type Item = { at: string; label: string; tone: "ok" | "warn" | "focus" | "muted"; href?: string; badge: string };
    const items: Item[] = [];
    for (const d of documents) {
      items.push({
        at: d.created_at,
        label: `${KIND_LABEL[d.kind]} « ${d.title} »`,
        tone: d.direction === "in" ? "warn" : "muted",
        href: R.piece(d.id),
        badge: d.direction === "in" ? "Achat" : "Pièce",
      });
      const sent = d.extract?.sent_at;
      if (typeof sent === "string") {
        items.push({
          at: sent,
          label: `Envoyé : ${d.title}`,
          tone: "ok",
          href: R.piece(d.id),
          badge: "Envoi",
        });
      }
    }
    for (const f of followUps) {
      if (f.sent_at) {
        items.push({
          at: f.sent_at,
          label: `Relance : ${f.document_title}`,
          tone: "warn",
          href: R.piece(f.document_id),
          badge: "Relance",
        });
      }
      if (f.status === "due") {
        items.push({
          at: f.last_action_at || f.created_at,
          label: `À relancer : ${f.document_title}`,
          tone: "warn",
          badge: "Due",
        });
      }
    }
    for (const d of deliveries) {
      items.push({
        at: `${d.day}T09:00:00`,
        label: `Livraison prévue — ${d.title}`,
        tone: "focus",
        href: R.piece(d.documentId),
        badge: "Livraison",
      });
    }
    return items.sort((a, b) => b.at.localeCompare(a.at)).slice(0, 24);
  }, [documents, followUps, deliveries]);

  const tabs: [Tab, string][] = [
    ["vue", "Vue d’ensemble"],
    ["pieces", "Pièces"],
    ["relances", "Relances"],
    ["activite", "Journal"],
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

      <ChantierClientPanel
        chantier={chantier}
        client={client}
        devisCount={devis.length}
        relancesDue={relancesDue}
      />

      <ChantierKpis
        sellHt={sellHt}
        buyHt={buyHt}
        marginHt={marginHt}
        marginPct={marginPct}
        devisCount={devis.length}
        buyCount={inbound.length}
        docsCount={documents.length}
      />

      {enCours.length ? (
        <section className="rounded-[16px] border border-line bg-surface px-4 py-3.5">
          <div className="mb-2 flex items-baseline justify-between gap-2">
            <p className="text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">En cours</p>
            <button
              type="button"
              onClick={() => setTab("vue")}
              className="text-[12.5px] font-medium text-tarineo-orange hover:underline"
            >
              Tout voir
            </button>
          </div>
          <ul className="grid gap-1">
            {enCours.map((item) => (
              <li key={item.key}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex min-h-11 items-center justify-between gap-3 rounded-[10px] px-1 py-1.5 hover:bg-wash-row-hover"
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <StatusBadge
                          label={item.key.startsWith("del-") ? "Livraison" : item.tone === "warn" ? "Action" : "Pièce"}
                          tone={item.tone}
                        />
                        <span className="truncate text-[14px] font-medium">{item.title}</span>
                      </span>
                      <span className="mt-0.5 block pl-7 text-[12.5px] text-muted-foreground">{item.hint}</span>
                    </span>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  </Link>
                ) : (
                  <button
                    type="button"
                    className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[10px] px-1 py-1.5 text-left hover:bg-wash-row-hover"
                    onClick={() => setTab(item.goTab ?? "vue")}
                  >
                    <span className="min-w-0">
                      <span className="flex items-center gap-2">
                        <StatusBadge label={item.tone === "warn" ? "Action" : "Pièce"} tone={item.tone} />
                        <span className="truncate text-[14px] font-medium">{item.title}</span>
                      </span>
                      <span className="mt-0.5 block pl-7 text-[12.5px] text-muted-foreground">{item.hint}</span>
                    </span>
                    <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

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
            {id === "pieces" && documents.length ? (
              <span className="ml-1.5 tabular-nums text-[12px] text-muted-foreground">{documents.length}</span>
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
                        <button
                          type="button"
                          className="w-full text-left"
                          onClick={() => setTab(item.goTab ?? (item.key.startsWith("fu-") ? "relances" : "pieces"))}
                        >
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
              text="Importez un devis fournisseur ou créez un devis client pour ce chantier."
              action={
                <button
                  type="button"
                  onClick={() => setTab("pieces")}
                  className="btn-orange inline-flex h-9 items-center px-4 text-[13.5px] font-medium"
                >
                  Ajouter une pièce
                </button>
              }
            />
          )}
        </div>
      ) : null}

      {tab === "pieces" ? (
        <div className="flex flex-col gap-6">
          <DocumentDrop chantiers={chantiers} clients={clients} defaultChantierId={chantier.id} />

          <div className="flex flex-col gap-3">
            <FilterPills
              value={scope}
              onChange={setScope}
              options={[
                { id: "all", label: `Toutes · ${documents.length}` },
                { id: "client", label: `Client · ${outbound.length}` },
                { id: "fournisseur", label: `Fournisseur · ${inbound.length}` },
              ]}
            />
            <FilterPills
              value={kind}
              onChange={setKind}
              options={[
                { id: "all", label: "Tous types" },
                { id: "devis", label: "Devis" },
                { id: "bon_commande", label: "Commandes" },
                { id: "facture", label: "Factures" },
              ]}
            />
          </div>

          {!filteredPieces.length ? (
            <EmptyState
              title={documents.length ? "Aucune pièce dans ce filtre" : "Aucune pièce sur ce chantier"}
              text={
                documents.length
                  ? "Changez le filtre client / fournisseur ou le type de document."
                  : "Importez un PDF fournisseur ci-dessus, ou créez un devis client pour démarrer le dossier."
              }
              actionHref={R.devisNouveau}
              actionLabel="Créer un devis"
            />
          ) : (
            <>
              <DocGroup title="Devis client" docs={filteredDevis} all={documents} followUpByDoc={followUpByDoc} />
              <DocGroup title="Bons de commande" docs={filteredCommandes} all={documents} followUpByDoc={followUpByDoc} />
              <DocGroup title="Factures" docs={filteredFactures} all={documents} followUpByDoc={followUpByDoc} />
              <DocGroup
                title="Achats fournisseur"
                docs={filteredInbound}
                all={documents}
                followUpByDoc={followUpByDoc}
                inbound
              />
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
          <EmptyState
            title="Aucune relance en cours"
            text="Les devis clients envoyés sans suite apparaissent ici. Vous pouvez aussi relancer depuis une pièce."
            action={
              <button
                type="button"
                onClick={() => setTab("pieces")}
                className="btn-orange inline-flex h-9 items-center px-4 text-[13.5px] font-medium"
              >
                Voir les pièces
              </button>
            }
          />
        )
      ) : null}

      {tab === "activite" ? (
        activity.length ? (
          <ol className="relative ml-1 border-l border-line pl-5">
            {activity.map((a, i) => {
              const body = (
                <>
                  <p className="flex flex-wrap items-center gap-2">
                    <StatusBadge label={a.badge} tone={a.tone} />
                    <span className="text-[12px] text-muted-foreground">{formatRelativeFr(a.at)}</span>
                  </p>
                  <p className="mt-1 text-[14.5px] font-medium text-ink">{a.label}</p>
                </>
              );
              return (
                <li key={`${a.at}-${a.label}-${i}`} className="relative mb-5">
                  <span
                    aria-hidden
                    className={cn(
                      "absolute top-1.5 -left-[1.4rem] size-2.5 rounded-full border-2 border-bg",
                      a.tone === "warn"
                        ? "bg-tarineo-orange"
                        : a.tone === "focus"
                          ? "bg-[#16A34A]"
                          : a.tone === "ok"
                            ? "bg-[#16A34A]"
                            : "bg-[#C4C4C4]",
                    )}
                  />
                  {a.href ? (
                    <Link href={a.href} className="block rounded-[10px] hover:bg-wash-row-hover">
                      {body}
                    </Link>
                  ) : (
                    body
                  )}
                </li>
              );
            })}
          </ol>
        ) : (
          <EmptyState
            title="Pas encore d’activité"
            text="Dès qu’une pièce est importée, envoyée ou relancée, le journal se remplit ici."
            action={
              <button
                type="button"
                onClick={() => setTab("pieces")}
                className="btn-orange inline-flex h-9 items-center px-4 text-[13.5px] font-medium"
              >
                Ajouter une pièce
              </button>
            }
          />
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

function DocGroup({
  title,
  docs,
  all,
  followUpByDoc,
  inbound,
}: {
  title: string;
  docs: DocumentCard[];
  all: DocumentCard[];
  followUpByDoc: Map<string, FollowUpView>;
  inbound?: boolean;
}) {
  if (!docs.length) return null;
  return (
    <section>
      <p className="mb-3 text-[11px] font-medium tracking-[0.08em] text-muted-foreground uppercase">{title}</p>
      <ul className="grid gap-2">
        {docs.map((d) => (
          <ChantierDocRow
            key={d.id}
            doc={d}
            all={all}
            followUp={followUpByDoc.get(d.id)}
            inbound={inbound}
          />
        ))}
      </ul>
    </section>
  );
}
