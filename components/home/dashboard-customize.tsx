"use client";

import { Bell, Calendar, FolderKanban, Inbox, LayoutGrid, MessageSquare, RotateCcw, Sparkles, Star } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  activateWidget,
  autoArrangeDashboard,
  deactivateWidget,
  DEFAULT_DASHBOARD_PREFS,
  normalizeDashboardPrefs,
  type DashboardPrefs,
  type WidgetKey,
} from "@/lib/home/dashboard-prefs";
import { cn } from "@/lib/utils";

type CatalogItem = {
  key: WidgetKey;
  title: string;
  description: string;
  icon: LucideIcon;
    group: "board" | "library";
};

const CATALOG: CatalogItem[] = [
  {
    key: "prompt",
    title: "Dépôt",
    description: "Glissez un devis ou une facture",
    icon: MessageSquare,
    group: "board",
  },
  {
    key: "calendar",
    title: "Planning",
    description: "RDV chantier et relances",
    icon: Calendar,
    group: "board",
  },
  {
    key: "focus",
    title: "Chantier en cours",
    description: "Le chantier ouvert",
    icon: Star,
    group: "board",
  },
  {
    key: "actions",
    title: "À traiter",
    description: "Devis importés à transformer",
    icon: Inbox,
    group: "board",
  },
  {
    key: "projects",
    title: "Chantiers",
    description: "Ouverts et en pause",
    icon: FolderKanban,
    group: "board",
  },
  {
    key: "schemas",
    title: "Hausses",
    description: "Derniers écarts de prix",
    icon: Bell,
    group: "board",
  },
];

export function DashboardCustomize({
  prefs,
  editMode,
  onEditMode,
  onPrefs,
}: {
  prefs: DashboardPrefs;
  editMode: boolean;
  onEditMode: (v: boolean) => void;
  onPrefs: (p: DashboardPrefs) => void;
}) {
  const [open, setOpen] = useState(false);

  function reset() {
    onPrefs(normalizeDashboardPrefs(DEFAULT_DASHBOARD_PREFS));
    onEditMode(false);
    setOpen(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => onEditMode(!editMode)}
        className={
          editMode
            ? "pressable btn-dark rounded-pill px-3.5 text-[13px] font-medium"
            : "dash-chip pressable"
        }
      >
        <LayoutGrid className="size-3.5" aria-hidden />
        {editMode ? "Terminer" : "Composer"}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={<button type="button" className="dash-chip pressable" />}
        >
          <Sparkles className="size-3.5" aria-hidden />
          Ajouter
        </DialogTrigger>
        <DialogContent className="flex max-h-[min(88vh,640px)] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-xl">
          <DialogHeader className="border-b border-line px-5 pt-5 pb-4">
            <DialogTitle className="font-display text-lg tracking-tight">
              Composer ton tableau
            </DialogTitle>
            <DialogDescription>
              Choisis ce qui s’affiche sur l’accueil. « Mettre devant » épingle le bloc en haut de
              sa colonne.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[min(52vh,420px)] flex-1">
            <div className="flex flex-col gap-6 px-5 py-4">
              {(["board"] as const).map((group) => (
                <div key={group}>
                  <p className="mono-label mb-3">{"/ Tableau ///"}</p>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {CATALOG.filter((c) => c.group === group).map((item) => {
                      const active = prefs.widgets[item.key];
                      const Icon = item.icon;
                      return (
                        <li key={item.key}>
                          <article
                            className={cn(
                              "flex h-full flex-col gap-3 rounded-xl border p-3.5 transition-colors",
                              active
                                ? "border-ink/15 bg-accent-soft/80"
                                : "border-line bg-surface hover:border-ink/10",
                            )}
                          >
                            <div className="flex items-start gap-2.5">
                              <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-surface-2">
                                <Icon className="size-4" aria-hidden />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <h3 className="text-[14px] font-semibold tracking-[-0.02em]">
                                    {item.title}
                                  </h3>
                                  {active ? (
                                    <Badge variant="secondary" className="rounded-full text-[10px]">
                                      Actif
                                    </Badge>
                                  ) : null}
                                </div>
                                <p className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                            <div className="mt-auto flex flex-wrap gap-1.5">
                              {active ? (
                                <>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="default"
                                    className="h-8 rounded-full text-xs"
                                    onClick={() => {
                                      onPrefs(activateWidget(prefs, item.key, { front: true }));
                                      onEditMode(true);
                                    }}
                                  >
                                    Mettre devant
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="h-8 rounded-full text-xs"
                                    onClick={() => onPrefs(deactivateWidget(prefs, item.key))}
                                  >
                                    Retirer
                                  </Button>
                                </>
                              ) : (
                                <Button
                                  type="button"
                                  size="sm"
                                  className="h-8 rounded-full text-xs"
                                  onClick={() => {
                                    onPrefs(activateWidget(prefs, item.key, { front: true }));
                                    onEditMode(true);
                                  }}
                                >
                                  Ajouter au tableau
                                </Button>
                              )}
                            </div>
                          </article>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </ScrollArea>

          <DialogFooter className="flex-wrap border-t border-line bg-surface-2/50 px-5 py-3 sm:justify-between">
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="rounded-full"
                onClick={() => onPrefs(autoArrangeDashboard(prefs))}
              >
                Disposition auto
              </Button>
              <Button type="button" variant="ghost" size="sm" className="rounded-full" onClick={reset}>
                <RotateCcw data-icon="inline-start" aria-hidden />
                Réinitialiser
              </Button>
            </div>
            <Button type="button" size="sm" className="rounded-full" onClick={() => setOpen(false)}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
