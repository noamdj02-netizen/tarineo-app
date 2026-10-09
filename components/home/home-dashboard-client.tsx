"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { saveDashboardLayout } from "@/app/(app)/accueil/dashboard-actions";
import { PageHeader } from "@/components/app-ui/page-header";
import { ColumnResizer } from "@/components/home/column-resizer";
import { DashboardCustomize } from "@/components/home/dashboard-customize";
import { DashboardWidget } from "@/components/home/dashboard-widget";
import { HomeImportButton } from "@/components/home/home-import-button";
import {
  buildActions,
  BTN_PRIMARY,
  BTN_SECONDARY,
  EASE,
  SURFACE,
} from "@/components/home/home-dashboard-model";
import {
  ActionsSection,
  CalendarWidget,
  DevisFacturesSection,
  FocusWidget,
  MetierWidgetsSection,
  PostitsWidget,
  ProjectsSection,
  PromptWidget,
  WeekWidget,
} from "@/components/home/home-dashboard-sections";
import type { CompanyProfile } from "@/lib/metier/company";
import type { FollowUpView } from "@/lib/metier/follow-ups";
import type { ChantierCard, DocumentCard, Party, PriceAlert } from "@/lib/metier/types";
import type { AppNotification } from "@/lib/notifications/types";
import {
  deactivateWidget,
  loadDashboardPrefsLocal,
  normalizeDashboardPrefs,
  reorderWidget,
  saveDashboardPrefsLocal,
  TRIAGE_PINNED_WIDGETS,
  type DashboardPrefs,
  type WidgetKey,
} from "@/lib/home/dashboard-prefs";
import type { WeekStats } from "@/lib/home/week";
import { TopPriceIncreases } from "@/components/tarineo/analytics/top-price-increases";
import { adaptTopPriceIncreases } from "@/lib/tarineo/adapters";
import { R } from "@/lib/routes";
import { DashboardTour } from "@/components/home/dashboard-tour";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

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
    <div className={className}>
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
    </div>
  );
}

export type HomeDashboardClientProps = {
  initialPrefs: DashboardPrefs;
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
  articles?: { label: string; amount: number; qty: number }[];
  outbound?: DocumentCard[];
  documents?: DocumentCard[];
  recentPieces?: DocumentCard[];
  company?: CompanyProfile | null;
  actionNotifications?: AppNotification[];
  weekStats: WeekStats;
  /** @deprecated Accueil n’affiche plus la ferme d’objectifs ; conservé pour compat appelants. */
  distributorGoalsHt?: Record<string, number>;
  showDashboardTour?: boolean;
};

export function HomeDashboardClient({
  initialPrefs,
  firstName,
  chantiers,
  clients = [],
  pendingDocs = [],
  devisAEnvoyer = [],
  facturesClient = 0,
  relancesDue = [],
  followUps: _followUps = [],
  alerts = [],
  months: _months = [],
  enseignes: _enseignes = [],
  articles = [],
  documents = [],
  recentPieces = [],
  company = null,
  actionNotifications = [],
  weekStats,
  showDashboardTour = false,
}: HomeDashboardClientProps) {
  const who = firstName?.trim() || "vous";
  const [prefs, setPrefs] = useState(() => normalizeDashboardPrefs(initialPrefs));
  const [editMode, setEditMode] = useState(false);
  const [dragOver, setDragOver] = useState<WidgetKey | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const local = loadDashboardPrefsLocal();
    setPrefs(normalizeDashboardPrefs(local));
  }, []);

  const persistPrefs = useCallback((next: DashboardPrefs | ((prev: DashboardPrefs) => DashboardPrefs)) => {
    setPrefs((prev) => {
      const normalized = normalizeDashboardPrefs(typeof next === "function" ? next(prev) : next);
      saveDashboardPrefsLocal(normalized);
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        void saveDashboardLayout(normalized);
      }, 400);
      return normalized;
    });
  }, []);

  const actifs = useMemo(
    () =>
      [...chantiers.filter((c) => c.status === "focus"), ...chantiers.filter((c) => c.status === "pause")].slice(0, 3),
    [chantiers],
  );
  const actions = useMemo(
    () =>
      buildActions({
        devisAEnvoyer,
        alerts,
        pendingDocs,
        relancesDue,
        documents,
        actionNotifications,
      }).slice(0, 6),
    [devisAEnvoyer, alerts, pendingDocs, relancesDue, documents, actionNotifications],
  );

  /** Colonnes optionnelles uniquement (triage fixe hors widgets). */
  const leftKeys = prefs.leftColumn.filter(
    (k) => prefs.widgets[k] && !TRIAGE_PINNED_WIDGETS.includes(k),
  );
  const rightKeys = prefs.rightColumn.filter(
    (k) => prefs.widgets[k] && !TRIAGE_PINNED_WIDGETS.includes(k),
  );
  const mobileKeys = [...leftKeys, ...rightKeys.filter((k) => !leftKeys.includes(k))];
  const showOptionalColumns = leftKeys.length > 0 || rightKeys.length > 0;

  const makeDropHandler = (targetKey: WidgetKey, targetColumn: "left" | "right") => {
    return (dragged: WidgetKey, _fromCol: "left" | "right") => {
      if (!dragged || dragged === targetKey) return;
      persistPrefs((p) => reorderWidget(p, dragged, targetKey, targetColumn));
      setDragOver(null);
    };
  };

  const renderWidgetBody = (key: WidgetKey) => {
    switch (key) {
      case "prompt":
        return <PromptWidget firstName={firstName} />;
      case "focus":
        return <FocusWidget chantiers={chantiers} />;
      case "calendar":
        return <CalendarWidget />;
      case "week":
        return <WeekWidget stats={weekStats} />;
      case "postits":
        return (
          <PostitsWidget
            postits={prefs.postits}
            editMode={editMode}
            onPostits={(postits) => persistPrefs({ ...prefs, postits })}
          />
        );
      case "metier":
        return <MetierWidgetsSection pendingDocs={pendingDocs} alerts={alerts} chantiers={chantiers} />;
      default:
        return null;
    }
  };

  const wrapWidget = (key: WidgetKey, column: "left" | "right") => {
    const body = renderWidgetBody(key);
    if (!body) return null;
    return (
      <DashboardWidget
        key={key}
        id={key}
        column={column}
        editMode={editMode}
        ring={dragOver === key}
        onDragStart={() => setDragOver(null)}
        onDragOver={() => setDragOver(key)}
        onDrop={makeDropHandler(key, column)}
        onRemove={
          editMode
            ? () => persistPrefs((p) => deactivateWidget(p, key))
            : undefined
        }
      >
        {body}
      </DashboardWidget>
    );
  };

  const columnStyle = {
    gridTemplateColumns: `${prefs.columnSplit}fr 4px ${100 - prefs.columnSplit}fr`,
  };

  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col pb-4">
      <DashboardTour open={showDashboardTour} />
      <Reveal>
        <PageHeader
          dense
          className="mb-6"
          crumbs={[{ label: "Accueil" }]}
          title={`Bonjour, ${who}`}
          description="Ce qui mérite votre attention aujourd’hui."
          action={
            <>
              <Link href={R.devisNouveau} className={BTN_PRIMARY}>
                <Plus className="mr-1.5 size-3.5" strokeWidth={2.2} aria-hidden />
                Nouveau devis
              </Link>
              <HomeImportButton chantiers={chantiers} clients={clients} className={BTN_SECONDARY} />
              <details className="relative">
                <summary
                  className={cn(
                    BTN_SECONDARY,
                    "cursor-pointer list-none [&::-webkit-details-marker]:hidden",
                  )}
                >
                  Plus
                </summary>
                <div className="absolute right-0 z-20 mt-1.5 flex min-w-[12.5rem] flex-col gap-1 rounded-xl border border-line bg-surface p-1.5 shadow-lift">
                  <Link
                    href={R.nouveauChantier}
                    className="rounded-lg px-3 py-2.5 text-[13px] font-medium text-ink hover:bg-surface-2"
                  >
                    Nouveau chantier
                  </Link>
                  <div data-tour="compose" className="border-t border-line pt-1">
                    <DashboardCustomize
                      variant="header"
                      prefs={prefs}
                      editMode={editMode}
                      onEditMode={setEditMode}
                      onPrefs={persistPrefs}
                    />
                  </div>
                </div>
              </details>
            </>
          }
        />
      </Reveal>

      <RevealGroup className="mb-6 grid list-none grid-cols-2 gap-3 p-0 lg:grid-cols-4" stagger={0.05} delay={0.04}>
        <Reveal className="min-w-0">
          <Kpi
            href={R.clientDevis}
            label="Devis à envoyer"
            value={String(devisAEnvoyer.length)}
            hint={devisAEnvoyer.length ? "prêts côté client" : "aucun en attente"}
            accent="bg-tarineo-orange"
          />
        </Reveal>
        <Reveal className="min-w-0">
          <Kpi
            href={R.hausses}
            label="Hausses"
            value={String(alerts.length)}
            hint={alerts.length ? "prix fournisseur" : "aucune alerte"}
            accent="bg-[#F59E0B]"
          />
        </Reveal>
        <Reveal className="min-w-0">
          <Kpi
            href={R.clientFacture}
            label="Factures client"
            value={String(facturesClient)}
            hint={facturesClient ? "pièces émises" : "aucune pièce"}
            accent="bg-[#16A34A]"
          />
        </Reveal>
        <Reveal className="min-w-0">
          <Kpi
            href={R.relances}
            label="Relances"
            value={String(relancesDue.length)}
            hint={relancesDue.length ? "à traiter" : "rien de dû"}
            accent="bg-[#9A9A9A]"
          />
        </Reveal>
      </RevealGroup>

      <Reveal>
        <div data-tour="prompt" className="mb-6">
          <PromptWidget firstName={firstName} />
        </div>
      </Reveal>

      {/* Bandeau triage fixe : À traiter → chantiers + hausses */}
      <Reveal>
        <div className="mb-6">
          <ActionsSection actions={actions} />
        </div>
      </Reveal>

      <Reveal>
        <div
          data-tour="triage-board"
          className="mb-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]"
        >
          <ProjectsSection actifs={actifs} documents={documents} />
          {alerts.length > 0 ? (
            <TopPriceIncreases
              items={adaptTopPriceIncreases(alerts, 5, articles)}
              title="Hausses à surveiller"
              href={R.hausses}
              compact
            />
          ) : (
            <section className={cn(SURFACE, "px-5 py-[18px]")}>
              <p className="text-[11px] font-medium tracking-[0.05em] text-muted-foreground uppercase">
                Hausses
              </p>
              <p className="mt-2 text-[14px] text-muted-foreground">
                Importez un devis fournisseur pour détecter les écarts de prix.
              </p>
              <div className="mt-4">
                <HomeImportButton chantiers={chantiers} clients={clients} />
              </div>
            </section>
          )}
        </div>
      </Reveal>

      {showOptionalColumns ? (
        <>
          <div
            id="home-dashboard-columns"
            className="mb-8 hidden items-start gap-0 lg:grid"
            style={columnStyle}
          >
            <div className="flex min-w-0 flex-col gap-6">{leftKeys.map((k) => wrapWidget(k, "left"))}</div>
            <ColumnResizer
              onChange={(split) => persistPrefs({ ...prefs, columnSplit: Math.round(split) })}
              onCommit={(split) => persistPrefs({ ...prefs, columnSplit: Math.round(split) })}
            />
            <div className="flex min-w-0 flex-col gap-6">{rightKeys.map((k) => wrapWidget(k, "right"))}</div>
          </div>
          <div className="mb-8 flex flex-col gap-6 lg:hidden">
            {mobileKeys.map((k) => wrapWidget(k, leftKeys.includes(k) ? "left" : "right"))}
          </div>
        </>
      ) : null}

      <DevisFacturesSection recentPieces={recentPieces} company={company} />
    </div>
  );
}
