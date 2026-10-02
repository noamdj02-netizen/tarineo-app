"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/(app)/notifications/actions";
import type { AppNotification } from "@/lib/notifications/types";
import { NOTIFICATION_TYPE_LABEL, priorityDot } from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

function relativeWhen(iso: string) {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "";
  const min = Math.round((Date.now() - t) / 60_000);
  if (min < 1) return "À l’instant";
  if (min < 60) return `Il y a ${min} min`;
  const h = Math.round(min / 60);
  if (h < 48) return `Il y a ${h} h`;
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
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
  const [pending, start] = useTransition();

  useEffect(() => {
    setUnread(initialUnread);
    setItems(initialItems);
  }, [initialUnread, initialItems]);

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
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            aria-label={unread ? `${unread} notifications non lues` : "Notifications"}
            className="relative"
          />
        }
      >
        <Bell className="size-5" strokeWidth={1.75} aria-hidden />
        {unread > 0 ? (
          <span className="absolute top-1.5 right-1.5 grid min-w-[16px] place-items-center rounded-full bg-tarineo-orange px-1 text-[10px] font-semibold text-white tabular-nums">
            {unread > 9 ? "9+" : unread}
          </span>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,360px)] p-0">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center justify-between gap-2 px-4 py-3 font-normal">
            <span className="text-[14px] font-medium text-ink">Notifications</span>
            {unread > 0 ? (
              <button
                type="button"
                disabled={pending}
                onClick={markAll}
                className="text-[12.5px] font-medium text-tarineo-orange hover:underline"
              >
                Tout lire
              </button>
            ) : null}
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="m-0" />
        {items.length === 0 ? (
          <p className="px-4 py-6 text-center text-[13.5px] text-muted-foreground">
            Aucune notification pour le moment.
          </p>
        ) : (
          <ul className="max-h-[360px] overflow-y-auto py-1">
            {items.map((n) => (
              <li key={n.id}>
                <DropdownMenuItem
                  className="cursor-pointer items-start gap-2.5 rounded-none px-4 py-3"
                  render={<Link href={n.actionUrl || "/notifications"} />}
                  onClick={() => {
                    if (!n.read) markOne(n.id);
                  }}
                >
                  <span
                    className={cn("mt-1.5 size-2 shrink-0 rounded-full", priorityDot(n.priority))}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className={cn("block text-[13.5px] text-ink", !n.read && "font-medium")}>
                      {n.title}
                    </span>
                    <span className="mt-0.5 block truncate text-[12.5px] text-muted-foreground">
                      {n.message.split("\n")[0]}
                    </span>
                    <span className="mt-1 block text-[11.5px] text-muted-foreground">
                      {NOTIFICATION_TYPE_LABEL[n.type]} · {relativeWhen(n.createdAt)}
                    </span>
                  </span>
                </DropdownMenuItem>
              </li>
            ))}
          </ul>
        )}
        <DropdownMenuSeparator className="m-0" />
        <div className="p-2">
          <Link
            href="/notifications"
            className="flex min-h-10 items-center justify-center rounded-xl text-[13px] font-medium text-tarineo-orange hover:bg-accent-soft"
          >
            Voir toutes les notifications →
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
