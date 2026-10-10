"use client";

import {
  useCallback,
  useEffect,
  useId,
  useState,
  type ElementType,
  type KeyboardEvent,
} from "react";
import { useReducedMotion } from "framer-motion";
import {
  Bell,
  ChevronDown,
  FileText,
  Mail,
  Send,
  TrendingUp,
} from "lucide-react";

import { Badge } from "@/components/site/landing-v2/components/ui/Badge";
import { LandingFlipCta } from "@/components/site/landing-v2/components/ui/LandingFlipCta";
import { LANDING_SIGNUP } from "@/lib/site/landing-v2-auth";
import { DEMO_MARK } from "@/lib/site/tarineo";
import { cn } from "@/lib/utils";

type Tone = "accent" | "ink" | "muted";

type Activity = {
  id: string;
  Icon: ElementType;
  title: string;
  description: string;
  time: string;
  tone: Tone;
  unread?: boolean;
};

const ACTIVITIES: Activity[] = [
  {
    id: "hausse-1",
    Icon: TrendingUp,
    title: "Hausse détectée",
    description: "Chauffe-eau 200 L · Cedeo · +12 % vs habituel",
    time: "À l’instant",
    tone: "accent",
    unread: true,
  },
  {
    id: "relance-1",
    Icon: Mail,
    title: "Relance fournisseur",
    description: "Brouillon prêt pour négocier le devis 2026-014",
    time: "Il y a 2 min",
    tone: "ink",
    unread: true,
  },
  {
    id: "devis-1",
    Icon: FileText,
    title: "Devis client généré",
    description: "Chantier Dupont · devis mis à jour avec les nouveaux prix",
    time: "Il y a 18 min",
    tone: "muted",
  },
  {
    id: "relance-2",
    Icon: Send,
    title: "Relance envoyée",
    description: "Point.P · demande de révision sur 3 lignes",
    time: "Il y a 1 h",
    tone: "ink",
  },
  {
    id: "hausse-2",
    Icon: TrendingUp,
    title: "Nouvelle alerte prix",
    description: "Tube PER Ø16 · Rexel · +7 % sur 30 jours",
    time: "Hier",
    tone: "accent",
  },
];

const iconTone: Record<Tone, string> = {
  accent: "border-accent/20 bg-accent-soft text-accent-700",
  ink: "border-ink-900/10 bg-ink-900 text-paper-0",
  muted: "border-line bg-paper-50 text-ink-600",
};

const EASE = "duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]";

/** Tiroir d’activités Tarineo — slide + états UI (exemple landing). */
export function LandingActivityDropdown({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [unreadIds, setUnreadIds] = useState(
    () => new Set(ACTIVITIES.filter((a) => a.unread).map((a) => a.id)),
  );
  const reduce = useReducedMotion();
  const panelId = useId();
  const labelId = useId();
  const unreadCount = unreadIds.size;

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  const markAllRead = useCallback(() => {
    setUnreadIds(new Set());
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: globalThis.KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  function onTriggerKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === "ArrowDown" && !open) {
      e.preventDefault();
      setOpen(true);
    }
  }

  return (
    <div
      className={cn(
        "w-full max-w-md overflow-hidden border border-line bg-paper-0 shadow-float ring-1 ring-ink-900/[0.04]",
        "transition-[border-radius,box-shadow]",
        EASE,
        open ? "rounded-3xl shadow-[0_24px_48px_-28px_rgb(10_10_10/0.28)]" : "rounded-2xl",
        className,
      )}
    >
      <button
        type="button"
        className={cn(
          "flex min-h-[4.25rem] w-full items-center gap-3.5 px-4 py-3.5 text-left select-none",
          "outline-none transition-colors duration-200",
          "hover:bg-paper-50/80 active:bg-paper-100/70",
          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/45",
        )}
        aria-expanded={open}
        aria-controls={panelId}
        aria-labelledby={labelId}
        onClick={toggle}
        onKeyDown={onTriggerKeyDown}
      >
        <span
          className={cn(
            "relative grid size-11 shrink-0 place-items-center rounded-xl border border-line bg-paper-50 text-ink-700",
            "transition-colors duration-200",
            open && "border-accent/25 bg-accent-soft text-accent-700",
          )}
        >
          <Bell className="size-5" strokeWidth={1.75} aria-hidden />
          {unreadCount > 0 ? (
            <span className="absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full bg-accent px-1 py-0.5 text-[10px] font-semibold leading-none text-white ring-2 ring-paper-0 nums">
              {unreadCount}
            </span>
          ) : null}
        </span>

        <span className="min-w-0 flex-1 overflow-hidden">
          <span className="flex flex-wrap items-center gap-2">
            <span id={labelId} className="text-[0.9375rem] font-semibold tracking-tight text-ink-900">
              {unreadCount > 0
                ? `${unreadCount} nouvelle${unreadCount > 1 ? "s" : ""} activité${unreadCount > 1 ? "s" : ""}`
                : "Activités à jour"}
            </span>
            <Badge tone="accent" size="sm">
              {DEMO_MARK}
            </Badge>
          </span>
          <span
            className={cn(
              "block overflow-hidden text-sm text-ink-400 transition-all",
              EASE,
              open ? "mt-0 max-h-0 opacity-0" : "mt-0.5 max-h-6 opacity-100",
            )}
          >
            Relances · hausses · devis générés
          </span>
        </span>

        <span
          className={cn(
            "grid size-11 shrink-0 place-items-center rounded-full text-ink-400",
            "transition-colors duration-200",
            "group-hover:text-ink-600",
          )}
          aria-hidden
        >
          <ChevronDown
            className={cn(
              "size-5 transition-transform",
              EASE,
              open && "rotate-180",
            )}
          />
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-label="Fil d’activités exemple"
        className={cn(
          "grid transition-[grid-template-rows,opacity]",
          reduce ? "duration-150" : EASE,
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
        hidden={!open && reduce ? true : undefined}
        inert={!open ? true : undefined}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="border-t border-line px-2 pt-1 pb-3">
            {ACTIVITIES.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
                <span className="grid size-12 place-items-center rounded-xl border border-line bg-paper-50 text-ink-400">
                  <Bell className="size-5" strokeWidth={1.75} aria-hidden />
                </span>
                <p className="text-sm font-medium text-ink-900">Aucune alerte pour l’instant</p>
                <p className="text-xs text-ink-400">
                  Les hausses et relances apparaîtront ici.
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-0.5" role="list">
                {ACTIVITIES.map((activity, index) => {
                  const Icon = activity.Icon;
                  const unread = unreadIds.has(activity.id);
                  return (
                    <li key={activity.id}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full min-h-14 items-start gap-3 rounded-xl px-3 py-3 text-left",
                          "outline-none transition-colors duration-150",
                          "hover:bg-paper-50 active:bg-paper-100",
                          "focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent/40",
                          !reduce && "transition-[transform,opacity]",
                          !reduce && EASE,
                          open || reduce
                            ? "translate-y-0 opacity-100"
                            : "translate-y-3 opacity-0",
                        )}
                        style={
                          reduce || !open
                            ? undefined
                            : { transitionDelay: `${60 + index * 55}ms` }
                        }
                        onClick={() => {
                          setUnreadIds((prev) => {
                            const next = new Set(prev);
                            next.delete(activity.id);
                            return next;
                          });
                        }}
                      >
                        <span
                          className={cn(
                            "relative mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl border",
                            iconTone[activity.tone],
                          )}
                        >
                          <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                          {unread ? (
                            <span
                              className="absolute -top-0.5 -right-0.5 size-2 rounded-full bg-accent ring-2 ring-paper-0"
                              aria-hidden
                            />
                          ) : null}
                        </span>

                        <span className="min-w-0 flex-1">
                          <span className="flex items-baseline justify-between gap-2">
                            <span
                              className={cn(
                                "text-sm tracking-tight text-ink-900",
                                unread ? "font-semibold" : "font-medium",
                              )}
                            >
                              {activity.title}
                            </span>
                            <span className="shrink-0 font-mono text-[11px] text-ink-400 nums">
                              {activity.time}
                            </span>
                          </span>
                          <span className="mt-0.5 block text-sm leading-snug text-ink-500 line-clamp-2">
                            {activity.description}
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}

            <div className="mt-2 flex flex-col gap-2 border-t border-line px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
              <button
                type="button"
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className={cn(
                  "min-h-11 rounded-lg px-3 text-left text-xs font-medium text-ink-500",
                  "outline-none transition-colors",
                  "hover:bg-paper-50 hover:text-ink-800",
                  "focus-visible:ring-2 focus-visible:ring-accent/40",
                  "disabled:pointer-events-none disabled:opacity-40",
                )}
              >
                Tout marquer comme lu
              </button>
              <LandingFlipCta
                href={LANDING_SIGNUP}
                label="Ouvrir dans l’app"
                variant="ink"
                size="sm"
                className="w-full sm:w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
