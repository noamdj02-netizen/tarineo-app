import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { PageHeader } from "@/components/app-ui/page-header";
import { SectionHeader } from "@/components/app-ui/section-header";
import { HomeImportButton } from "@/components/home/home-import-button";
import { StatusBadge, chantierTone } from "@/components/tarineo/status-badge";
import { documentAmountHt, formatRelativeFr, type FollowUpView } from "@/lib/metier/follow-ups";
import { KIND_LABEL, type ChantierCard, type DocumentCard, type Party, type PriceAlert } from "@/lib/metier/types";
import { R } from "@/lib/routes";
import { euro, euroInt, signedPct, variation } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

const EASE = "duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]";
const SURFACE =
  "h-fit rounded-[16px] border border-line bg-surface shadow-soft transition-[border-color,box-shadow,background-color] duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)]";
const SURFACE_HOVER = "hover:border-line-strong hover:shadow-lift hover:bg-surface-2";
const ACTION_LINK =
  "inline-flex items-center gap-1 text-[13px] font-medium text-tarineo-orange transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:text-tarineo-orange";
const BTN =
  "inline-flex h-11 items-center rounded-[12px] px-4 text-[13px] font-medium transition-colors duration-150 ease-[cubic-bezier(0.2,0.8,0.2,1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/35 md:h-[38px] md:rounded-[10px]";
const BTN_PRIMARY = `${BTN} bg-tarineo-orange text-white hover:brightness-[0.96]`;
const BTN_SECONDARY = `${BTN} border border-line bg-surface text-ink hover:bg-surface-2`;

export function HomeDashboard({
  firstName,
  chantiers,
  clients = [],
  pendingDocs = [],
  devisAEnvoyer = [],
  facturesClient = 0,
  relancesDue = [],
  followUps = [],
  alerts = [],
  months = [],
  enseignes = [],
  documents = [],
}: {
  firstName?: string | null;
  chantiers: ChantierCard[];
  clients?: Party[];
  pendingDocs?: DocumentCard[];
  devisAEnvoyer?: DocumentCard[];
  facturesClient?: number;
  relancesDue?: FollowUpView[];
  followUps?: FollowUpView[];
  alerts?: PriceAlert[];
  months?: { key: string; label: string; amount: number }[];
  enseignes?: { label: string; amount: number }[];
  documents?: DocumentCard[];
}) {
  const who = firstName?.trim() || "vous";
  const thisMonth = months.at(-1)?.amount ?? 0;
  const lastMonth = months.at(-2)?.amount ?? 0;
  const monthDelta = lastMonth > 0 ? variation(lastMonth, thisMonth) : null;
  const actifs = [
    ...chantiers.filter((c) => c.status === "focus"),
    ...chantiers.filter((c) => c.status === "pause"),
  ].slice(0, 3);
  const actions = buildActions({
    devisAEnvoyer,
    alerts,
    pendingDocs,
    relancesDue,
    documents,
  }).slice(0, 4);
  const activity = buildActivity(documents, followUps).slice(0, 5);
  const buyTotal = enseignes.reduce((s, r) => s + r.amount, 0);
  const topEnseigne = enseignes[0];

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col pb-4">
      <PageHeader
        dense
        className="mb-6"
        crumbs={[{ label: "Accueil" }]}
        title={`Bonjour, ${who}`}
        description="Voici ce qui mérite votre attention."
        action={
          <>
            <Link href={R.clientDevis} className={BTN_PRIMARY}>
              <Plus className="mr-1.5 size-3.5" strokeWidth={2.2} aria-hidden />
              Nouveau devis
            </Link>
            <HomeImportButton chantiers={chantiers} clients={clients} className={BTN_SECONDARY} />
            <Link href={R.nouveauChantier} className={BTN_SECONDARY}>
              Nouveau chantier
            </Link>
          </>
        }
      />

      <ul className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Kpi
          href={R.clientDevis}
          label="Devis à envoyer"
          value={String(devisAEnvoyer.length)}
          hint={devisAEnvoyer.length ? "prêts côté client" : "aucun en attente"}
          accent="bg-[#FF6B1A]"
        />
        <Kpi
          href={R.hausses}
          label="Hausses"
          value={String(alerts.length)}
          hint={alerts.length ? "prix fournisseur" : "aucune alerte"}
          accent="bg-[#F59E0B]"
        />
        <Kpi
          href={R.clientFacture}
          label="Factures client"
          value={String(facturesClient)}
          hint={facturesClient ? "pièces émises" : "aucune pièce"}
          accent="bg-[#16A34A]"
        />
        <Kpi
          href={R.relances}
          label="Relances"
          value={String(relancesDue.length)}
          hint={relancesDue.length ? "à traiter" : "rien de dû"}
          accent="bg-[#9A9A9A]"
        />
        <Kpi
          href={R.achats}
          label="Achats du mois"
          value={thisMonth ? euroInt(thisMonth) : "—"}
          hint="HT lignes"
          accent="bg-[#9A9A9A]"
          className="col-span-2 lg:col-span-1"
        />
      </ul>

      <section data-tour="actions" className={cn(SURFACE, "mb-8 px-5 py-[18px]")}>
        <SectionHeader title="À traiter" href={R.relances} linkLabel="Voir tout" className="mb-2" />
        {actions.length ? (
          <ul className="grid gap-1">
            {actions.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.href}
                  className={cn(
                    "grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[8px] px-3 py-2.5 transition-colors",
                    EASE,
                    "hover:bg-surface-2 focus-visible:bg-surface-2 focus-visible:outline-none",
                  )}
                >
                  <span className="min-w-0">
                    <span className="flex items-center gap-2">
                      <span aria-hidden className={cn("size-[5px] shrink-0 rounded-full", item.dot)} />
                      <span className="truncate text-[14px] font-medium tracking-[-0.01em]">{item.title}</span>
                    </span>
                    <span className="mt-0.5 block truncate pl-3 text-[12px] text-muted-foreground">{item.hint}</span>
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1 text-[13px] font-medium text-nav-orange">
                    {item.cta}
                    <ArrowRight className="size-3.5" aria-hidden />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="flex items-center gap-2 py-1 text-[14px] text-muted-foreground">
            <span aria-hidden className="text-[#16A34A]">
              ✓
            </span>
            Rien à traiter
          </p>
        )}
      </section>

      <div className="mb-6 grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section>
          <SectionHeader title="Chantiers actifs" href={R.chantiers} linkLabel="Tous" />
          {actifs.length ? (
            <ul className="grid gap-2">
              {actifs.map((c) => {
                const related = documents.filter((d) => d.chantier_id === c.id);
                const sellHt = related
                  .filter((d) => d.direction === "out")
                  .reduce((s, d) => s + documentAmountHt(d), 0);
                const buyHt = related
                  .filter((d) => d.direction === "in")
                  .reduce((s, d) => s + documentAmountHt(d), 0);
                return (
                  <li key={c.id}>
                    <Link
                      href={R.chantier(c.slug)}
                      className={cn(
                        SURFACE,
                        SURFACE_HOVER,
                        "flex flex-col gap-2 border-l-2 p-4",
                        c.status === "focus"
                          ? "border-[rgba(22,163,74,0.12)] border-l-[#16A34A]"
                          : "border-[rgba(245,158,11,0.12)] border-l-[#F59E0B]",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 font-display text-[16px] font-semibold tracking-[-0.025em]">{c.name}</p>
                        <StatusBadge
                          label={c.status === "focus" ? "En cours" : "Pause"}
                          tone={chantierTone(c.status)}
                          className="w-fit shrink-0"
                        />
                      </div>
                      <p className="truncate text-[13px] text-[#6E6E6E]">
                        {c.client_name ?? "Sans client"}
                        {c.address ? ` · ${c.address}` : ""}
                      </p>
                      <p className="text-[12px] text-[#8A8A8A]">
                        {c.docs_count} document{c.docs_count > 1 ? "s" : ""}
                        {sellHt || buyHt
                          ? ` · ${sellHt ? `${euroInt(sellHt)} devis` : "—"} · ${buyHt ? `${euroInt(buyHt)} achats` : "—"}`
                          : ""}
                      </p>
                      <span className={ACTION_LINK}>
                        Voir le chantier
                        <ArrowRight className="size-3.5" aria-hidden />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[14px] text-[#6E6E6E]">
              Aucun chantier actif.{" "}
              <Link href={R.nouveauChantier} className="font-medium text-tarineo-orange">
                Nouveau chantier
              </Link>
            </p>
          )}
        </section>

        <section className={cn(SURFACE, "px-5 py-[18px]")}>
          <SectionHeader title="Hausses fournisseurs" href={R.hausses} linkLabel="Voir les hausses" className="mb-2" />
          {alerts.length ? (
            <ul>
              {alerts.slice(0, 4).map((a, i) => {
                const party = documents.find((d) => d.id === a.document_id)?.party_name;
                return (
                  <li
                    key={a.id}
                    className={cn(
                      "flex items-center justify-between gap-4 py-2",
                      i > 0 && "border-t border-line",
                    )}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-[14px] font-medium tracking-[-0.01em]">{a.label}</span>
                      <span className="mt-0.5 block truncate text-[12px] text-muted-foreground">
                        {party || a.chantier_name || "—"}
                      </span>
                    </span>
                    <span className="shrink-0 text-[13px] font-medium tabular-nums text-nav-orange">
                      {signedPct(variation(Number(a.old_price), Number(a.new_price)))}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-[14px] text-[#6E6E6E]">Pas encore de hausse relevée.</p>
          )}
        </section>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className={cn(SURFACE, "px-5 py-[18px]")}>
          <SectionHeader title="Achats" href={R.achats} linkLabel="Voir les achats" className="mb-2" />
          <p className="font-display text-[28px] font-semibold tabular-nums tracking-[-0.025em]">
            {buyTotal ? euroInt(buyTotal) : "—"}
            <span className="ml-1.5 text-[12px] font-normal tracking-normal text-[#8A8A8A]">HT</span>
          </p>
          {monthDelta != null ? (
            <p className="mt-1 text-[12px] font-medium text-nav-orange">{signedPct(monthDelta)} vs mois précédent</p>
          ) : null}
          {topEnseigne ? (
            <p className="mt-3 text-[13px]">
              {topEnseigne.label}
              <span className="mt-0.5 block text-[12px] tabular-nums text-[#8A8A8A]">{euro(topEnseigne.amount)}</span>
            </p>
          ) : (
            <p className="mt-3 text-[13px] text-[#8A8A8A]">Importez un devis d’achat pour voir les volumes.</p>
          )}
        </section>

        <section>
          <SectionHeader title="Activité récente" className="mb-3" />
          {activity.length ? (
            <ol className="grid gap-3">
              {activity.map((a) => (
                <li key={a.key} className="flex gap-2.5">
                  <span
                    aria-hidden
                    className={cn("mt-1.5 size-[5px] shrink-0 rounded-full", a.hot ? "bg-nav-orange" : "bg-[#C4C4C4]")}
                  />
                  <span>
                    <span className="block text-[14px] tracking-[-0.01em]">{a.label}</span>
                    <span className="mt-0.5 block text-[12px] text-[#8A8A8A]">{a.when}</span>
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-[14px] text-[#6E6E6E]">Pas encore d’activité.</p>
          )}
        </section>
      </div>
    </div>
  );
}

function Kpi({
  href,
  label,
  value,
  hint,
  accent,
  className,
}: {
  href: string;
  label: string;
  value: string;
  hint: string;
  accent: string;
  className?: string;
}) {
  return (
    <li className={className}>
      <Link
        href={href}
        className={cn(
          "block rounded-[14px] border border-line bg-surface px-4 py-3.5 shadow-soft transition-[border-color,box-shadow,background-color]",
          EASE,
          "hover:border-line-strong hover:bg-surface-2 hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-nav-orange/30",
        )}
      >
        <p className="flex items-center gap-1.5 text-[11px] font-medium tracking-[0.05em] text-muted-foreground uppercase">
          <span aria-hidden className={cn("size-[5px] rounded-full", accent)} />
          {label}
        </p>
        <p className="mt-1.5 font-display text-[24px] font-semibold tabular-nums tracking-[-0.025em]">{value}</p>
        <p className="mt-1 text-[12px] text-muted-foreground">{hint}</p>
      </Link>
    </li>
  );
}

function buildActions({
  devisAEnvoyer,
  alerts,
  pendingDocs,
  relancesDue,
  documents,
}: {
  devisAEnvoyer: DocumentCard[];
  alerts: PriceAlert[];
  pendingDocs: DocumentCard[];
  relancesDue: FollowUpView[];
  documents: DocumentCard[];
}) {
  const items: { key: string; title: string; hint: string; href: string; cta: string; dot: string }[] = [];
  for (const f of relancesDue.slice(0, 1)) {
    items.push({
      key: `fu-${f.id}`,
      title: f.document_title,
      hint: f.contact ? `${f.contact} · à relancer` : "À relancer",
      href: R.relances,
      cta: "Relancer",
      dot: "bg-nav-orange",
    });
  }
  for (const d of devisAEnvoyer.slice(0, 1)) {
    items.push({
      key: `dv-${d.id}`,
      title: d.title,
      hint: "Prêt à être envoyé",
      href: `/pieces/${d.id}`,
      cta: "Envoyer",
      dot: "bg-nav-orange",
    });
  }
  for (const a of alerts.slice(0, 1)) {
    const party = documents.find((d) => d.id === a.document_id)?.party_name;
    const pct = signedPct(variation(Number(a.old_price), Number(a.new_price)));
    items.push({
      key: `al-${a.id}`,
      title: a.label,
      hint: party ? `${party} · ${pct}` : pct,
      href: a.document_id ? `/pieces/${a.document_id}` : R.hausses,
      cta: "Voir",
      dot: "bg-[#F59E0B]",
    });
  }
  for (const d of pendingDocs.slice(0, 1)) {
    items.push({
      key: `in-${d.id}`,
      title: d.title,
      hint: d.party_name ? `${d.party_name} · à transformer` : "Document d’achat à vérifier",
      href: `/pieces/${d.id}`,
      cta: "Ouvrir",
      dot: "bg-[#C4C4C4]",
    });
  }
  return items;
}

function buildActivity(documents: DocumentCard[], relances: FollowUpView[]) {
  const items: { key: string; at: string; label: string; when: string; hot?: boolean }[] = [];
  for (const d of documents) {
    const verb = d.direction === "in" ? "enregistré" : "créé";
    items.push({
      key: `doc-${d.id}`,
      at: d.created_at,
      label: `${KIND_LABEL[d.kind]} ${verb}`,
      when: activityWhen(d.created_at),
    });
  }
  for (const f of relances) {
    const at = f.sent_at || f.scheduled_at || f.created_at;
    if (!at) continue;
    items.push({
      key: `fu-${f.id}`,
      at,
      label: f.sent_at ? "Relance envoyée" : "Relance programmée",
      when: activityWhen(at),
      hot: true,
    });
  }
  return items.sort((a, b) => b.at.localeCompare(a.at));
}

function activityWhen(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return formatRelativeFr(iso);
  const hm = new Date(t).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  return `${formatRelativeFr(iso)} · ${hm}`;
}
