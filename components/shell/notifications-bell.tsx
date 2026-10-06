"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/(app)/notifications/actions";
import type { AppNotification } from "@/lib/notifications/types";
import { priorityDot } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

function relativeWhen(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const min = Math.round((Date.now() - t) / 60_000);
  if (min < 1) return "À l’instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `il y a ${h} h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function sortForPanel(items: AppNotification[]) {
  return [...items].sort((a, b) => {
    if (a.read !== b.read) return a.read ? 1 : -1;
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
}

export function NotificationsBell({
  initialUnread,
  initialItems,
}: {
  initialUnread: number;
  initialItems: AppNotification[];
}) {
  const [unread, setUnread] = useState(initialUnread);
  const [items, setItems] = useState(initialItems);
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();

  useEffect(() => {
    setUnread(initialUnread);
    setItems(initialItems);
  }, [initialUnread, initialItems]);

  const sorted = useMemo(() => sortForPanel(items), [items]);

  function markOne(id: string) {
    start(async () => {
      await markNotificationReadAction(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      setUnread((u) => Math.max(0, u - 1));
    });
  }

  function markAll() {
    start(async () => {
      await markAllNotificationsReadAction();
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnread(0);
    });
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger
        type="button"
        aria-label={unread ? `${unread} notifications non lues` : "Notifications"}
        className={cn(
          "relative inline-flex size-11 shrink-0 items-center justify-center rounded-xl text-ink transition-colors",
          "hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-tarineo-orange/35",
        )}
      >
        <Bell className="size-5" strokeWidth={1.75} aria-hidden />
        {unread > 0 ? (
          <span
            className="absolute top-1 right-1 grid min-w-[18px] place-items-center rounded-full bg-tarineo-orange px-1 py-0.5 text-[10px] font-semibold leading-none text-white tabular-nums ring-2 ring-surface"
            aria-hidden
          >
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="z-[100] w-[min(100vw-2rem,380px)] overflow-hidden rounded-2xl border border-line bg-surface p-0 shadow-lift"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between gap-2 px-4 py-3.5 font-normal">
            <span className="font-display text-[15px] font-semibold tracking-tight text-ink">Notifications</span>
            {unread > 0 ? (
              <button
                type="button"
                disabled={pending}
                onClick={(e) => {
                  e.preventDefault();
                  markAll();
                }}
                className="text-[12.5px] font-medium text-muted-foreground transition-colors hover:text-tarineo-orange"
              >
                Tout lire
              </button>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="m-0 bg-line" />
        {sorted.length === 0 ? (
          <p className="px-4 py-8 text-center text-[13.5px] text-muted-foreground">
            Aucune notification pour le moment.
          </p>
        ) : (
          <ul className="max-h-[min(60vh,400px)] overflow-y-auto overscroll-contain">
            {sorted.map((n) => (
              <li key={n.id} className="border-b border-line last:border-b-0">
                <Link
                  href={n.actionUrl || "/notifications"}
                  onClick={() => {
                    setOpen(false);
                    if (!n.read) markOne(n.id);
                  }}
                  className={cn(
                    "flex gap-3 px-4 py-3.5 transition-colors hover:bg-surface-2",
                    !n.read && "bg-tarineo-orange/[0.04]",
                  )}
                >
                  <span
                    className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", priorityDot(n.priority))}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start justify-between gap-2">
                      <span className={cn("text-[13.5px] leading-snug text-ink", !n.read && "font-semibold")}>
                        {n.title}
                      </span>
                      <span className="shrink-0 text-[11.5px] text-muted-foreground tabular-nums">
                        {relativeWhen(n.createdAt)}
                      </span>
                    </span>
                    <span className="mt-1 block text-[12.5px] leading-snug text-muted-foreground">
                      {n.message.split("\n")[0]}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        <DropdownMenuSeparator className="m-0 bg-line" />
        <div className="p-2">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className="flex min-h-10 items-center justify-center rounded-xl text-[13px] font-medium text-tarineo-orange transition-colors hover:bg-tarineo-orange/8"
          >
            Voir toutes les notifications →
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
