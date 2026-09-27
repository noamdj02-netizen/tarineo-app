"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveDashboardLayout } from "@/app/(app)/accueil/dashboard-actions";
import { CalendarCard } from "@/components/home/calendar-card";
import { ColumnResizer } from "@/components/home/column-resizer";
import { DashboardCustomize } from "@/components/home/dashboard-customize";
import { DashboardWidget } from "@/components/home/dashboard-widget";
import { DashboardTour } from "@/components/home/dashboard-tour";
import { FocusProjectCard, type FocusProject } from "@/components/home/focus-project-card";
import { ChantiersWidget, HaussesWidget, PendingDocsWidget } from "@/components/home/dashboard-metier-widgets";
import { DocumentDrop } from "@/components/metier/document-drop";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import type { ChantierCard, DocumentCard, Party, PriceAlert } from "@/lib/metier/types";
import {
  activeWidgetsInColumn,
  DEFAULT_DASHBOARD_PREFS,
  loadDashboardPrefsLocal,
  normalizeDashboardPrefs,
  reorderWidget,
  saveDashboardPrefsLocal,
  type DashboardPrefs,
  type WidgetKey,
} from "@/lib/home/dashboard-prefs";

export function HomeDashboard({
  firstName,
  chantiers,
  clients = [],
  pendingDocs = [],
  alerts = [],
  initialLayout,
  focus = null,
  showTour = false,
}: {
  firstName?: string | null;
  chantiers: ChantierCard[];
  clients?: Party[];
  pendingDocs?: DocumentCard[];
  alerts?: PriceAlert[];
  initialLayout: DashboardPrefs;
  focus?: FocusProject | null;
  showTour?: boolean;
}) {
  const [prefs, setPrefs] = useState<DashboardPrefs>(() => normalizeDashboardPrefs(initialLayout));
  const [editMode, setEditMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const skipHydratePersist = useRef(true);

  useEffect(() => {
    const local = loadDashboardPrefsLocal();
    setPrefs(
      normalizeDashboardPrefs({
        ...local,
        ...initialLayout,
        widgets: {
          ...DEFAULT_DASHBOARD_PREFS.widgets,
          ...local.widgets,
          ...initialLayout.widgets,
          week: false,
          postits: false,
          metier: false,
        },
        leftColumn: initialLayout.leftColumn?.length ? initialLayout.leftColumn : local.leftColumn,
        rightColumn: initialLayout.rightColumn?.length ? initialLayout.rightColumn : local.rightColumn,
      }),
    );
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback((next: DashboardPrefs) => {
    const normalized = normalizeDashboardPrefs(next);
    saveDashboardPrefsLocal(normalized);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      void saveDashboardLayout(normalized);
    }, 700);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (skipHydratePersist.current) {
      skipHydratePersist.current = false;
      return;
    }
    persist(prefs);
  }, [prefs, hydrated, persist]);

  const w = prefs.widgets;

  const renderWidget = (key: WidgetKey, column: "left" | "right") => {
    if (!w[key]) return null;
    if (key === "week" || key === "postits" || key === "metier") {
      return null;
    }
    const onDropWidget = (dragged: WidgetKey) => {
      setPrefs((p) => reorderWidget(p, dragged, key, column));
    };
    const shell = (child: React.ReactNode) => (
      <DashboardWidget
        key={key}
        id={key}
        column={column}
        editMode={editMode}
        ring={editMode}
        onDragStart={() => {}}
        onDragOver={() => {}}
        onDrop={onDropWidget}
      >
        {child}
      </DashboardWidget>
    );
    switch (key) {
      case "prompt":
        return shell(
          <div data-tour="prompt" className="flex flex-col gap-2">
            <p className="text-[13px] text-muted-foreground">
              {firstName ? `${firstName}, ` : ""}déposez un devis ou une facture.
            </p>
            <DocumentDrop chantiers={chantiers} clients={clients} compact />
          </div>,
        );
      case "focus":
        return shell(<FocusProjectCard project={focus} />);
      case "actions":
        return shell(<PendingDocsWidget docs={pendingDocs} />);
      case "projects":
        return shell(<ChantiersWidget chantiers={chantiers} />);
      case "schemas":
        return shell(<HaussesWidget alerts={alerts} />);
      case "calendar":
        return shell(
          <CalendarCard
            layout="stack"
            dense
            className="xl:max-h-[min(72vh,640px)] xl:overflow-y-auto"
          />,
        );
      default:
        return null;
    }
  };

  return (
    <>
      <DashboardTour open={showTour} />
      <RevealGroup className="mx-auto flex max-w-[760px] flex-col gap-5 pt-[1vh] pb-4 sm:pt-[3vh] lg:hidden">
        <div className="flex items-center justify-end" data-tour="compose">
          <DashboardCustomize prefs={prefs} editMode={editMode} onEditMode={setEditMode} onPrefs={setPrefs} />
        </div>
        {w.prompt ? (
          <Reveal>
            <DocumentDrop chantiers={chantiers} clients={clients} compact />
          </Reveal>
        ) : null}
        {w.calendar ? (
          <Reveal>
            <CalendarCard />
          </Reveal>
        ) : null}
        {w.focus ? (
          <Reveal>
            <FocusProjectCard project={focus} />
          </Reveal>
        ) : null}
        {w.actions ? (
          <Reveal>
            <PendingDocsWidget docs={pendingDocs} />
          </Reveal>
        ) : null}
        {w.projects ? (
          <Reveal>
            <ChantiersWidget chantiers={chantiers} />
          </Reveal>
        ) : null}
        {w.schemas ? (
          <Reveal>
            <HaussesWidget alerts={alerts} />
          </Reveal>
        ) : null}
      </RevealGroup>

      <div className="mx-auto hidden w-full max-w-[1320px] flex-col gap-4 pb-5 lg:flex lg:pt-1">
        <header className="flex flex-wrap items-center justify-between gap-2 px-0.5">
          <p className="mono-label">{"/ Tableau de bord ///"}</p>
          <div data-tour="compose">
            <DashboardCustomize prefs={prefs} editMode={editMode} onEditMode={setEditMode} onPrefs={setPrefs} />
          </div>
        </header>
        {w.prompt ? <div className="mb-1 w-full">{renderWidget("prompt", "left")}</div> : null}
        <div id="home-dashboard-columns" className="flex min-h-0 items-start gap-0 xl:gap-1">
          <div className="flex min-w-0 flex-col gap-2.5" style={{ width: `${prefs.columnSplit}%` }}>
            {activeWidgetsInColumn(prefs, "left")
              .filter((key) => key !== "prompt" && key !== "week")
              .map((key) => renderWidget(key, "left"))}
          </div>
          <ColumnResizer
            onChange={(columnSplit) => setPrefs((p) => ({ ...p, columnSplit }))}
            onCommit={(columnSplit) => setPrefs((p) => ({ ...p, columnSplit }))}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2.5 xl:sticky xl:top-[4.75rem] xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto">
            {activeWidgetsInColumn(prefs, "right")
              .filter((key) => key !== "prompt")
              .map((key) => renderWidget(key, "right"))}
          </div>
        </div>
      </div>
    </>
  );
}
