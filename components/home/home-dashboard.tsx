"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { saveDashboardLayout } from "@/app/(app)/accueil/dashboard-actions";
import { ActionCards, type ActionCard } from "@/components/home/action-cards";
import { CalendarCard } from "@/components/home/calendar-card";
import { ColumnResizer } from "@/components/home/column-resizer";
import { DashboardCustomize } from "@/components/home/dashboard-customize";
import { DashboardWidget } from "@/components/home/dashboard-widget";
import {
  DashboardProjectsWidget,
  DashboardSchemasWidget,
  type DashboardProjectRow,
  type DashboardSchemaRow,
} from "@/components/home/dashboard-library-widgets";
import { PostItBoard } from "@/components/home/post-it-board";
import { PromptHero } from "@/components/home/prompt-hero";
import { WeekCard } from "@/components/home/week-card";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import type { WeekStats } from "@/lib/home/week";
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
  cards,
  week,
  initialLayout,
  projects,
  schemas,
}: {
  firstName?: string | null;
  cards: ActionCard[];
  week: WeekStats | null;
  initialLayout: DashboardPrefs;
  projects: DashboardProjectRow[];
  schemas: DashboardSchemaRow[];
}) {
  const [prefs, setPrefs] = useState<DashboardPrefs>(() =>
    normalizeDashboardPrefs(initialLayout),
  );
  const [editMode, setEditMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const local = loadDashboardPrefsLocal();
    const merged = normalizeDashboardPrefs({
      ...local,
      ...initialLayout,
      leftColumn: initialLayout.leftColumn?.length ? initialLayout.leftColumn : local.leftColumn,
      rightColumn: initialLayout.rightColumn?.length ? initialLayout.rightColumn : local.rightColumn,
      postits:
        initialLayout.postits.length > 0 &&
        JSON.stringify(initialLayout.postits) !== JSON.stringify(DEFAULT_DASHBOARD_PREFS.postits)
          ? initialLayout.postits
          : local.postits,
    });
    setPrefs(merged);
    setHydrated(true);
    // fusion locale une seule fois au montage
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
    persist(prefs);
  }, [prefs, hydrated, persist]);

  const w = prefs.widgets;

  const renderWidget = (key: WidgetKey, column: "left" | "right") => {
    if (!w[key]) return null;
    const onDropWidget = (dragged: WidgetKey, _fromCol: "left" | "right") => {
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
        return shell(<PromptHero firstName={firstName} featured />);
      case "actions":
        return shell(
          <div className="flex flex-col gap-2">
            <p className="mono-label px-0.5">{"/ Actions rapides ///"}</p>
            <ActionCards cards={cards} layout="strip" />
          </div>,
        );
      case "week":
        return week ? shell(<WeekCard stats={week} compact />) : null;
      case "calendar":
        return shell(
          <CalendarCard
            layout="stack"
            dense
            className="xl:max-h-[min(72vh,640px)] xl:overflow-y-auto"
          />,
        );
      case "postits":
        return shell(
          <PostItBoard
            postits={prefs.postits}
            editMode={editMode}
            dense
            onChange={(postits) => setPrefs((p) => ({ ...p, postits }))}
          />,
        );
      case "projects":
        return shell(<DashboardProjectsWidget projects={projects} />);
      case "schemas":
        return shell(<DashboardSchemasWidget schemas={schemas} />);
      default:
        return null;
    }
  };

  return (
    <>
      <RevealGroup className="mx-auto flex max-w-[760px] flex-col gap-6 pt-[1vh] pb-4 sm:pt-[4vh] lg:hidden">
        <div className="flex justify-end">
          <DashboardCustomize
            prefs={prefs}
            editMode={editMode}
            onEditMode={setEditMode}
            onPrefs={setPrefs}
          />
        </div>
        {w.prompt ? (
          <Reveal>
            <PromptHero firstName={firstName} />
          </Reveal>
        ) : null}
        <div className="flex flex-col gap-3">
          {w.calendar ? (
            <Reveal>
              <CalendarCard />
            </Reveal>
          ) : null}
          {w.week && week ? (
            <Reveal>
              <WeekCard stats={week} />
            </Reveal>
          ) : null}
        </div>
        {w.actions ? (
          <div className="flex flex-col gap-3">
            <p className="mono-label">{"/ Actions rapides ///"}</p>
            <ActionCards cards={cards} />
          </div>
        ) : null}
        {w.postits ? (
          <PostItBoard
            postits={prefs.postits}
            editMode={editMode}
            onChange={(postits) => setPrefs((p) => ({ ...p, postits }))}
          />
        ) : null}
        {w.projects ? <DashboardProjectsWidget projects={projects} /> : null}
        {w.schemas ? <DashboardSchemasWidget schemas={schemas} /> : null}
      </RevealGroup>

      <div className="mx-auto hidden w-full max-w-[1320px] flex-col gap-3 pb-5 lg:flex lg:pt-1">
        <header className="flex flex-wrap items-end justify-between gap-2 px-0.5">
          <div>
            <p className="mono-label">{"/ Cockpit ///"}</p>
            <h1 className="mt-0.5 font-display text-[22px] font-semibold tracking-tightest">
              Tableau de bord
            </h1>
          </div>
          <DashboardCustomize
            prefs={prefs}
            editMode={editMode}
            onEditMode={setEditMode}
            onPrefs={setPrefs}
          />
        </header>

        {editMode ? (
          <p className="text-[12.5px] text-muted-foreground">
            Glisse les blocs pour les réordonner · Tire la barre entre les colonnes pour ajuster la
            largeur
          </p>
        ) : null}

        {w.prompt ? (
          <div className="mb-1 w-full">{renderWidget("prompt", "left")}</div>
        ) : null}

        <div id="home-dashboard-columns" className="flex min-h-0 items-start gap-0 xl:gap-1">
          <div
            className="flex min-w-0 flex-col gap-2.5"
            style={{ width: `${prefs.columnSplit}%` }}
          >
            {activeWidgetsInColumn(prefs, "left")
              .filter((key) => key !== "prompt")
              .map((key) => renderWidget(key, "left"))}
          </div>

          <ColumnResizer onChange={(columnSplit) => setPrefs((p) => ({ ...p, columnSplit }))} />

          <div className="flex min-w-0 flex-1 flex-col gap-2.5 xl:sticky xl:top-[4.75rem] xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain">
            {activeWidgetsInColumn(prefs, "right")
              .filter((key) => key !== "prompt")
              .map((key) => renderWidget(key, "right"))}
          </div>
        </div>
      </div>
    </>
  );
}
