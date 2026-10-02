"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  CalendarPlus,
  ChevronLeft,
  ChevronRight,
  Link2,
  Loader2,
  Plus,
  X,
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { createPortal } from "react-dom";
import {
  addCalendarEvent,
  deleteCalendarEvent,
  getCalendar,
  removeCalendarFeed,
  saveCalendarFeed,
} from "@/app/(app)/accueil/actions";
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { EASE } from "@/components/motion/reveal";
import type { CalEvent, CalendarFeedInfo } from "@/lib/calendar/types";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["L", "M", "M", "J", "V", "S", "D"];
const pad = (n: number) => String(n).padStart(2, "0");
const keyOf = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const eventDay = (e: CalEvent) => e.day ?? keyOf(new Date(e.start));
const timeOf = (iso: string) =>
  new Date(iso).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

/** Lundi de la semaine qui contient le 1er du mois, puis 42 jours. */
function gridOf(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const start = new Date(first);
  start.setDate(1 - ((first.getDay() + 6) % 7));
  return Array.from({ length: 42 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

type Loaded = {
  events: CalEvent[];
  feed: CalendarFeedInfo;
  feedError: string | null;
};

/** Planning façon Calendrier Apple : grille du mois + agenda du jour. */
export function CalendarCard({
  layout = "split",
  className,
  dense,
}: {
  /** `split` = mois | agenda côte à côte ; `stack` = empilé (colonne dashboard). */
  layout?: "split" | "stack";
  className?: string;
  dense?: boolean;
}) {
  const reduce = useReducedMotion();
  const today = keyOf(new Date());
  const [month, setMonth] = useState(() => {
    const n = new Date();
    return new Date(n.getFullYear(), n.getMonth(), 1);
  });
  const [selected, setSelected] = useState(today);
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, startLoading] = useTransition();
  const [adding, setAdding] = useState(false);
  const [connectOpen, setConnectOpen] = useState(false);

  const days = useMemo(() => gridOf(month), [month]);

  const load = useCallback(() => {
    const from = days[0];
    const to = new Date(days[41]);
    to.setDate(to.getDate() + 1);
    startLoading(async () => {
      const res = await getCalendar(from.toISOString(), to.toISOString());
      if (res.ok) {
        setData({
          events: res.events,
          feed: res.feed,
          feedError: res.feedError,
        });
        setError(null);
      } else setError(res.error);
    });
  }, [days]);

  useEffect(load, [load]);

  const byDay = useMemo(() => {
    const m = new Map<string, CalEvent[]>();
    for (const e of data?.events ?? []) {
      const k = eventDay(e);
      m.set(k, [...(m.get(k) ?? []), e]);
    }
    return m;
  }, [data]);

  const dayEvents = byDay.get(selected) ?? [];
  const selDate = new Date(`${selected}T12:00:00`);
  const monthLabel = month.toLocaleDateString("fr-FR", {
    month: "long",
    year: "numeric",
  });

  function shiftMonth(n: number) {
    setMonth((m) => new Date(m.getFullYear(), m.getMonth() + n, 1));
  }

  function goToday() {
    const n = new Date();
    setMonth(new Date(n.getFullYear(), n.getMonth(), 1));
    setSelected(today);
  }

  return (
    <section
      className={cn("card-soft flex flex-col gap-4 p-4 sm:p-5", className)}
      aria-label="Planning"
    >
      <header className="flex flex-wrap items-center gap-2">
        <div className="mr-auto">
          <p className="mono-label">{"/ Planning ///"}</p>
          <h2 className="mt-1 font-display text-[22px] leading-none font-semibold tracking-tight first-letter:uppercase">
            {monthLabel}
          </h2>
        </div>
        {loading ? (
          <Loader2
            className="size-4 animate-spin text-muted-foreground"
            aria-label="Chargement"
          />
        ) : null}
        <button
          type="button"
          onClick={goToday}
          className="min-h-9 rounded-pill border border-line px-3 text-[12.5px] hover:bg-accent-soft"
        >
          Aujourd’hui
        </button>
        <div className="flex">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Mois précédent"
            className="grid size-9 place-items-center rounded-pill hover:bg-accent-soft"
          >
            <ChevronLeft className="size-4" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Mois suivant"
            className="grid size-9 place-items-center rounded-pill hover:bg-accent-soft"
          >
            <ChevronRight className="size-4" aria-hidden />
          </button>
        </div>
      </header>

      <div
        className={cn(
          "grid gap-5",
          layout === "split" && "md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]",
        )}
      >
        {/* grille du mois */}
        <div>
          <div className="grid grid-cols-7 text-center font-mono text-[10.5px] text-muted-foreground">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="py-1.5">
                {d}
              </span>
            ))}
          </div>
          <div
            className="grid grid-cols-7 gap-y-0.5"
            role="grid"
            aria-label={monthLabel}
          >
            {days.map((d) => {
              const k = keyOf(d);
              const inMonth = d.getMonth() === month.getMonth();
              const isToday = k === today;
              const isSel = k === selected;
              const evs = byDay.get(k) ?? [];
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => {
                    setSelected(k);
                    if (!inMonth)
                      setMonth(new Date(d.getFullYear(), d.getMonth(), 1));
                  }}
                  aria-pressed={isSel}
                  aria-label={`${d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}${evs.length ? `, ${evs.length} événement${evs.length > 1 ? "s" : ""}` : ""}`}
                  className="group flex flex-col items-center gap-0.5 py-0.5"
                >
                  <span
                    className={cn(
                      "grid size-9 place-items-center rounded-full text-[13.5px] tabular-nums transition-colors duration-200",
                      isToday
                        ? "bg-brand-orange font-semibold text-white"
                        : isSel
                          ? "bg-wash-orange font-semibold ring-1 ring-brand-orange/30"
                          : inMonth
                            ? "group-hover:bg-accent-soft"
                            : "text-muted-foreground/60 group-hover:bg-accent-soft",
                    )}
                  >
                    {d.getDate()}
                  </span>
                  <span className="flex h-1.5 gap-0.5" aria-hidden>
                    {evs.slice(0, 3).map((e) => (
                      <span
                        key={e.id}
                        className={cn(
                          "size-1 rounded-full",
                          e.source === "ical" ? "bg-glow-3" : "bg-ink/60",
                        )}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* agenda du jour */}
        <div
          className={cn(
            "flex flex-col rounded-2xl bg-surface-2 p-3.5",
            dense ? "min-h-[200px]" : "min-h-[260px]",
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <p className="text-[14px] font-semibold first-letter:uppercase">
              {selDate.toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </p>
            <button
              type="button"
              onClick={() => setAdding((a) => !a)}
              aria-expanded={adding}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-pill bg-surface px-3 text-[12.5px] shadow-soft hover:shadow-lift"
            >
              {adding ? (
                <X className="size-3.5" aria-hidden />
              ) : (
                <Plus className="size-3.5" aria-hidden />
              )}
              {adding ? "Annuler" : "Ajouter"}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {adding ? (
              <AddEventForm
                key="add"
                day={selected}
                onDone={() => {
                  setAdding(false);
                  load();
                }}
              />
            ) : null}
          </AnimatePresence>

          <ul className="mt-3 flex flex-col gap-1.5">
            <AnimatePresence initial={false}>
              {dayEvents.map((e) => (
                <motion.li
                  key={e.id}
                  layout={!reduce}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: EASE }}
                  className="group flex items-center gap-3 rounded-xl bg-surface px-3 py-2.5 shadow-soft"
                >
                  <span
                    className={cn(
                      "h-8 w-1 flex-none rounded-full",
                      e.source === "ical" ? "bg-glow-3" : "bg-ink",
                    )}
                    aria-hidden
                  />
                  <span className="w-11 flex-none font-mono text-[11px] leading-tight text-muted-foreground">
                    {e.allDay ? (
                      "Journée"
                    ) : (
                      <>
                        {timeOf(e.start)}
                        {e.end ? (
                          <>
                            <br />
                            {timeOf(e.end)}
                          </>
                        ) : null}
                      </>
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px]">
                      {e.title}
                    </span>
                    <span className="block truncate text-[11.5px] text-muted-foreground">
                      {e.source === "ical"
                        ? data?.feed.connected
                          ? data.feed.provider
                          : "Agenda"
                        : (e.project ?? "TARINEO")}
                    </span>
                  </span>
                  {e.source === "navpit" ? (
                    <DeleteEvent id={e.id} onDeleted={load} />
                  ) : null}
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>

          {dayEvents.length === 0 && !adding ? (
            <div className="m-auto flex flex-col items-center gap-1 py-4 text-center text-[13px] text-muted-foreground">
              <TarineoHdMascot name="01-pouce-leve" className="h-16 w-20" label="" />
              Rien de prévu ce jour-là.
            </div>
          ) : null}

          <div className="mt-auto pt-3">
            {error ? (
              <p role="alert" className="text-[12.5px] text-destructive">
                {error}
              </p>
            ) : data?.feedError ? (
              <p role="alert" className="text-[12.5px] text-destructive">
                Agenda externe : {data.feedError}
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setConnectOpen(true)}
              className="inline-flex min-h-9 items-center gap-1.5 text-[12.5px] text-muted-foreground hover:text-ink"
            >
              <Link2 className="size-3.5" aria-hidden />
              {data?.feed.connected
                ? `${data.feed.provider} connecté`
                : "Connecter Google ou Apple Calendrier"}
            </button>
          </div>
        </div>
      </div>

      <ConnectDialog
        open={connectOpen}
        feed={data?.feed ?? { connected: false }}
        onClose={() => setConnectOpen(false)}
        onChanged={load}
      />
    </section>
  );
}

function AddEventForm({ day, onDone }: { day: string; onDone: () => void }) {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState("60");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      let res;
      if (time) {
        const start = new Date(`${day}T${time}:00`);
        const end = new Date(start.getTime() + Number(duration) * 60_000);
        res = await addCalendarEvent({
          title,
          startsAt: start.toISOString(),
          endsAt: end.toISOString(),
        });
      } else {
        res = await addCalendarEvent({
          title,
          startsAt: "",
          allDay: true,
          day,
        });
      }
      if (res.ok) onDone();
      else setError(res.error);
    });
  }

  return (
    <motion.form
      onSubmit={submit}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.28, ease: EASE }}
      className="overflow-hidden"
    >
      <div className="mt-3 flex flex-col gap-2 rounded-xl bg-surface p-3 shadow-soft">
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
          placeholder="Ex : appel avec Alan"
          aria-label="Titre de l’événement"
          className="min-h-10 rounded-lg border border-line px-3 text-[14px] outline-none focus:border-ink/40"
        />
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Heure (vide = toute la journée)"
            className="min-h-10 rounded-lg border border-line px-2 font-mono text-[12.5px] outline-none focus:border-ink/40"
          />
          {time ? (
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              aria-label="Durée"
              className="min-h-10 rounded-lg border border-line bg-surface px-2 text-[12.5px] outline-none"
            >
              <option value="30">30 min</option>
              <option value="60">1 h</option>
              <option value="90">1 h 30</option>
              <option value="120">2 h</option>
              <option value="240">4 h</option>
            </select>
          ) : (
            <span className="text-[12px] text-muted-foreground">
              Sans heure : toute la journée
            </span>
          )}
          <button
            type="submit"
            disabled={pending || !title.trim()}
            className="btn-dark ml-auto inline-flex min-h-10 items-center gap-1.5 rounded-lg px-3 text-[13px] font-semibold disabled:opacity-50"
          >
            {pending ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <CalendarPlus className="size-4" aria-hidden />
            )}
            Ajouter
          </button>
        </div>
        {error ? (
          <p role="alert" className="text-[12.5px] text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </motion.form>
  );
}

function DeleteEvent({ id, onDeleted }: { id: string; onDeleted: () => void }) {
  const [armed, setArmed] = useState(false);
  const [pending, startTransition] = useTransition();
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (!armed) return setArmed(true);
        startTransition(async () => {
          const res = await deleteCalendarEvent(id);
          if (res.ok) onDeleted();
          setArmed(false);
        });
      }}
      aria-label={armed ? "Confirmer la suppression" : "Supprimer l’événement"}
      className={cn(
        "grid h-8 flex-none place-items-center rounded-pill text-[11.5px] transition-colors",
        armed
          ? "bg-destructive px-2.5 text-white"
          : "w-8 text-muted-foreground hover:bg-accent-soft hover:text-ink",
      )}
    >
      {armed ? "Supprimer" : <X className="size-3.5" aria-hidden />}
    </button>
  );
}

function ConnectDialog({
  open,
  feed,
  onClose,
  onChanged,
}: {
  open: boolean;
  feed: CalendarFeedInfo;
  onClose: () => void;
  onChanged: () => void;
}) {
  const reduce = useReducedMotion();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  function save(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await saveCalendarFeed(url);
      if (!res.ok) return setError(res.error);
      setUrl("");
      onChanged();
      onClose();
    });
  }

  function remove() {
    startTransition(async () => {
      const res = await removeCalendarFeed();
      if (!res.ok) return setError(res.error);
      onChanged();
      onClose();
    });
  }

  if (typeof document === "undefined") return null;
  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          key="connect"
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Fermer"
            onClick={onClose}
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="connect-title"
            initial={
              reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }
            }
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="card-soft relative w-full max-w-[520px] p-5 shadow-lift"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="mono-label">{"/ Agenda externe ///"}</p>
                <h2
                  id="connect-title"
                  className="mt-1 text-[20px] font-semibold tracking-tight"
                >
                  Voir ton vrai planning ici
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fermer"
                className="grid size-9 place-items-center rounded-pill text-muted-foreground hover:bg-accent-soft"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>

            <ol className="mt-4 flex flex-col gap-3 text-[13.5px] leading-snug">
              <li>
                <b className="font-semibold">Google Agenda</b> (sur ordinateur)
                : Paramètres → clique ton agenda → « Intégrer l’agenda » → copie
                l’
                <b className="font-semibold">adresse secrète au format iCal</b>.
              </li>
              <li>
                <b className="font-semibold">Apple Calendrier</b> : sur iPhone,
                Calendriers → (i) à côté de l’agenda → active « Calendrier
                public » → partage le lien. Attention : toute personne qui a ce
                lien peut voir l’agenda.
              </li>
            </ol>
            <p className="mt-3 text-[12.5px] text-muted-foreground">
              Lecture seule, relu toutes les 5 minutes. Le lien reste privé :
              seul le serveur le lit.
            </p>

            <form onSubmit={save} className="mt-4 flex flex-col gap-2">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://calendar.google.com/calendar/ical/…/basic.ics"
                aria-label="Lien iCal"
                inputMode="url"
                autoComplete="off"
                spellCheck={false}
                className="min-h-11 rounded-xl border border-line px-3 font-mono text-[12.5px] outline-none focus:border-ink/40"
              />
              {error ? (
                <p role="alert" className="text-[12.5px] text-destructive">
                  {error}
                </p>
              ) : null}
              <div className="flex items-center gap-2">
                {feed.connected ? (
                  <button
                    type="button"
                    onClick={remove}
                    disabled={pending}
                    className="min-h-10 rounded-xl px-3 text-[13px] text-muted-foreground hover:bg-accent-soft hover:text-ink"
                  >
                    Retirer {feed.provider}
                  </button>
                ) : null}
                <button
                  type="submit"
                  disabled={pending || !url.trim()}
                  className="btn-dark ml-auto inline-flex min-h-10 items-center gap-2 rounded-xl px-4 text-[13.5px] font-semibold disabled:opacity-50"
                >
                  {pending ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden />
                  ) : null}
                  {feed.connected ? "Remplacer le lien" : "Connecter"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
