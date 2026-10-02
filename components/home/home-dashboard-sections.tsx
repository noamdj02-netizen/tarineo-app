import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { SectionHeader } from "@/components/app-ui/section-header";
import { CalendarCard } from "@/components/home/calendar-card";
import { ChantiersWidget, HaussesWidget, PendingDocsWidget } from "@/components/home/dashboard-metier-widgets";
import { FocusProjectCard } from "@/components/home/focus-project-card";
import { PromptHero } from "@/components/home/prompt-hero";
import { PostItBoard } from "@/components/home/post-it-board";
import { WeekCard } from "@/components/home/week-card";
import { DocumentPreview } from "@/components/metier/document-preview";
import { StatusBadge, chantierTone } from "@/components/tarineo/status-badge";
import type { CompanyProfile } from "@/lib/metier/company";
import { documentAmountHt } from "@/lib/metier/follow-ups";
import { KIND_LABEL, type ChantierCard, type DocumentCard, type Party, type PriceAlert } from "@/lib/metier/types";
import type { PostIt } from "@/lib/home/dashboard-prefs";
import type { WeekStats } from "@/lib/home/week";
import { R } from "@/lib/routes";
import { euro, euroInt, signedPct, variation } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";
import {
  ACTION_LINK,
  type ActionItem,
  type ActivityItem,
  SURFACE,
  SURFACE_HOVER,
} from "@/components/home/home-dashboard-model";

export function ActionsSection({ actions }: { actions: ActionItem[] }) {
  return (
    <section data-tour="actions" className={cn(SURFACE, "px-5 py-[18px]")}>
      <SectionHeader title="À traiter" href="/notifications" linkLabel="Voir tout" className="mb-2" />
      {actions.length ? (
        <ul className="grid gap-1">
          {actions.map((item) => (
            <li key={item.key}>
              <Link
                href={item.href}
                className={cn(
                  "grid min-h-[52px] grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-[8px] px-3 py-2.5 transition-colors duration-150",
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
          <span aria-hidden className="text-[#16A34A]">✓</span>
          Rien à traiter
        </p>
      )}
    </section>
  );
}

export function ProjectsSection({
  actifs,
  documents,
}: {
  actifs: ChantierCard[];
  documents: DocumentCard[];
}) {
  return (
    <section>
      <SectionHeader title="Chantiers actifs" href={R.chantiers} linkLabel="Tous" />
      {actifs.length ? (
        <ul className="grid gap-2">
          {actifs.map((c) => {
            const related = documents.filter((d) => d.chantier_id === c.id);
            const sellHt = related.filter((d) => d.direction === "out").reduce((s, d) => s + documentAmountHt(d), 0);
            const buyHt = related.filter((d) => d.direction === "in").reduce((s, d) => s + documentAmountHt(d), 0);
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
                    <p className="min-w-0 font-display text-[16px] font-semibold tracking-[-0.025em] text-ink">{c.name}</p>
                    <StatusBadge
                      label={c.status === "focus" ? "En cours" : "Pause"}
                      tone={chantierTone(c.status)}
                      className="w-fit shrink-0"
                    />
                  </div>
                  <p className="truncate text-[13px] text-muted-foreground">
                    {c.client_name ?? "Sans client"}
                    {c.address ? ` · ${c.address}` : ""}
                  </p>
                  <p className="text-[12px] text-muted-foreground">
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
        <p className="text-[14px] text-muted-foreground">
          Aucun chantier actif.{" "}
          <Link href={R.nouveauChantier} className="font-medium text-tarineo-orange">
            Nouveau chantier
          </Link>
        </p>
      )}
    </section>
  );
}

export function SchemasSection({ alerts, documents }: { alerts: PriceAlert[]; documents: DocumentCard[] }) {
  return (
    <section className={cn(SURFACE, "px-5 py-[18px]")}>
      <SectionHeader title="Hausses fournisseurs" href={R.hausses} linkLabel="Voir les hausses" className="mb-2" />
      {alerts.length ? (
        <ul>
          {alerts.slice(0, 4).map((a, i) => {
            const party = documents.find((d) => d.id === a.document_id)?.party_name;
            return (
              <li
                key={a.id}
                className={cn("flex items-center justify-between gap-4 py-2", i > 0 && "border-t border-line")}
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
        <p className="text-[14px] text-muted-foreground">Pas encore de hausse relevée.</p>
      )}
    </section>
  );
}

export function DevisFacturesSection({
  recentPieces,
  company,
}: {
  recentPieces: DocumentCard[];
  company: CompanyProfile | null;
}) {
  return (
    <section className="mb-8">
      <SectionHeader title="Devis & factures" href={R.clientDevis} linkLabel="Tous les devis" className="mb-3" />
      {recentPieces.length ? (
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {recentPieces.map((d) => {
            const ht = documentAmountHt(d);
            return (
              <li key={d.id} className={cn(SURFACE, "overflow-hidden")}>
                <Link href={`/pieces/${d.id}`} className="block">
                  <div className="relative bg-wash-paper px-3 py-3">
                    <div className="mx-auto w-[min(100%,168px)] overflow-hidden rounded-[6px] shadow-sm">
                      <DocumentPreview doc={d} company={company} size="thumb" />
                    </div>
                    <span className="absolute top-3 left-3 rounded-full bg-wash-badge px-2.5 py-1 text-[11px] font-medium text-wash-badge-ink">
                      {KIND_LABEL[d.kind]}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 p-4">
                    <p className="truncate font-medium text-ink">{d.title}</p>
                    <p className="truncate text-[13px] text-muted-foreground">
                      {d.party_name ?? "Sans client"} · {d.chantier_name ?? "Sans chantier"}
                    </p>
                    <p className="mt-1 tabular-nums text-[15px] font-medium">{ht ? `${euro(ht)} HT` : "—"}</p>
                  </div>
                </Link>
                <div className="flex items-center justify-between border-t border-line px-4 py-2.5">
                  <Link href={`/pieces/${d.id}`} className={ACTION_LINK}>
                    Ouvrir
                    <ArrowRight className="size-3.5" aria-hidden />
                  </Link>
                  <a
                    href={`/api/metier/documents/${d.id}/pdf?dl=1`}
                    className="inline-flex h-8 items-center gap-1.5 rounded-full border border-line px-3 text-[12.5px] font-medium hover:bg-surface-2"
                  >
                    <Download className="size-3.5" aria-hidden />
                    PDF
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-[14px] text-muted-foreground">
          Aucun devis ou facture pour l’instant.{" "}
          <Link href={R.devisNouveau} className="font-medium text-tarineo-orange">
            Créer un devis
          </Link>
        </p>
      )}
    </section>
  );
}

export function AchatsActivitySection({
  buyTotal,
  monthDelta,
  topEnseigne,
  activity,
}: {
  buyTotal: number;
  monthDelta: number | null;
  topEnseigne?: { label: string; amount: number };
  activity: ActivityItem[];
}) {
  return (
    <div className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
      <section className={cn(SURFACE, "px-5 py-[18px]")}>
        <SectionHeader title="Achats" href={R.achats} linkLabel="Voir les achats" className="mb-2" />
        <p className="font-display text-[28px] font-semibold tabular-nums tracking-[-0.025em]">
          {buyTotal ? euroInt(buyTotal) : "—"}
          <span className="ml-1.5 text-[12px] font-normal tracking-normal text-muted-foreground">HT</span>
        </p>
        {monthDelta != null ? (
          <p className="mt-1 text-[12px] font-medium text-nav-orange">{signedPct(monthDelta)} vs mois précédent</p>
        ) : null}
        {topEnseigne ? (
          <p className="mt-3 text-[13px]">
            {topEnseigne.label}
            <span className="mt-0.5 block text-[12px] tabular-nums text-muted-foreground">{euro(topEnseigne.amount)}</span>
          </p>
        ) : (
          <p className="mt-3 text-[13px] text-muted-foreground">Importez un devis d’achat pour voir les volumes.</p>
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
                  <span className="block text-[14px] tracking-[-0.01em] text-ink">{a.label}</span>
                  <span className="mt-0.5 block text-[12px] text-muted-foreground">{a.when}</span>
                </span>
              </li>
            ))}
          </ol>
        ) : (
          <p className="text-[14px] text-muted-foreground">Pas encore d’activité.</p>
        )}
      </section>
    </div>
  );
}

export function MetierWidgetsSection({
  pendingDocs,
  alerts,
  chantiers,
}: {
  pendingDocs: DocumentCard[];
  alerts: PriceAlert[];
  chantiers: ChantierCard[];
}) {
  return (
    <div className="grid gap-4">
      <PendingDocsWidget docs={pendingDocs} />
      <HaussesWidget alerts={alerts} />
      <ChantiersWidget chantiers={chantiers} />
    </div>
  );
}

export function PromptWidget({ firstName }: { firstName?: string | null }) {
  return (
    <div data-tour="prompt">
      <PromptHero firstName={firstName} featured inWidget />
    </div>
  );
}

export function FocusWidget({ chantiers }: { chantiers: ChantierCard[] }) {
  const focus = chantiers.find((c) => c.status === "focus");
  const project = focus
    ? {
        slug: focus.slug,
        name: focus.name,
        next: null,
        docsCount: focus.docs_count,
        pendingCount: 0,
      }
    : null;
  return <FocusProjectCard project={project} />;
}

export function WeekWidget({ stats }: { stats: WeekStats }) {
  return <WeekCard stats={stats} />;
}

export function CalendarWidget() {
  return <CalendarCard />;
}

export function PostitsWidget({
  postits,
  editMode,
  onPostits,
}: {
  postits: PostIt[];
  editMode: boolean;
  onPostits: (next: PostIt[]) => void;
}) {
  return <PostItBoard postits={postits} editMode={editMode} onChange={onPostits} />;
}
