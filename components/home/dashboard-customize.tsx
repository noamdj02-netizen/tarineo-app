"use client";

import {
  Calendar,
  LayoutDashboard,
  LayoutGrid,
  MessageSquare,
  RotateCcw,
  Shapes,
  Sparkles,
  StickyNote,
  TrendingUp,
  Zap,
} from "lucide-react";
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
  group: "cockpit" | "library";
};

const CATALOG: CatalogItem[] = [
  {
    key: "prompt",
    title: "Copilote",
    description: "Question du jour + envoi vers le chat",
    icon: MessageSquare,
    group: "cockpit",
  },
  {
    key: "calendar",
    title: "Planning",
    description: "Calendrier et agenda du jour",
    icon: Calendar,
    group: "cockpit",
  },
  {
    key: "week",
    title: "Ma semaine",
    description: "Activité des 7 derniers jours",
    icon: TrendingUp,
    group: "cockpit",
  },
  {
    key: "actions",
    title: "Actions rapides",
    description: "Raccourcis focus, anatomie, thèmes",
    icon: Zap,
    group: "cockpit",
  },
  {
    key: "postits",
    title: "Post-its",
    description: "Notes libres sur ton tableau",
    icon: StickyNote,
    group: "cockpit",
  },
  {
    key: "projects",
    title: "Mes projets",
    description: "Liste tes projets à ouvrir en un clic",
    icon: LayoutDashboard,
    group: "library",
  },
  {
    key: "schemas",
    title: "Schémas",
    description: "Derniers schémas importés ou générés",
    icon: Shapes,
    group: "library",
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
      <Button
        type="button"
        variant={editMode ? "default" : "outline"}
        size="sm"
        className="rounded-full"
        onClick={() => onEditMode(!editMode)}
      >
        <LayoutGrid data-icon="inline-start" aria-hidden />
        {editMode ? "Terminer" : "Personnaliser"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          render={
            <Button type="button" variant="outline" size="sm" className="rounded-full" />
          }
        >
          <Sparkles data-icon="inline-start" aria-hidden />
          Ajouter des blocs
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
              {(["cockpit", "library"] as const).map((group) => (
                <div key={group}>
                  <p className="mono-label mb-3">
                    {group === "cockpit" ? "/ Cockpit ///" : "/ Bibliothèque ///"}
                  </p>
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
