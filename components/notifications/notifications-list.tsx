"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "@/app/(app)/notifications/actions";
import type { AppNotification } from "@/lib/notifications/types";
import { NOTIFICATION_TYPE_LABEL, priorityDot } from "@/lib/notifications/types";
import { Button } from "@/components/ui/button";
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

export function NotificationsList({ initial }: { initial: AppNotification[] }) {
  const [pending, start] = useTransition();
  const unread = initial.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col gap-3">
      {unread > 0 ? (
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full"
            disabled={pending}
            onClick={() => start(() => markAllNotificationsReadAction())}
          >
            Tout marquer comme lu
          </Button>
        </div>
      ) : null}

      {initial.length === 0 ? (
        <div className="card-soft px-5 py-10 text-center">
          <p className="text-[15px] font-medium text-ink">Aucune notification</p>
          <p className="mt-1 text-[13.5px] text-muted-foreground">
            Les alertes métier (relances, hausses, analyses) apparaîtront ici.
          </p>
          <Link
            href="/accueil"
            className="mt-4 inline-flex text-[13px] font-medium text-tarineo-orange hover:underline"
          >
            Retour au tableau de bord
          </Link>
        </div>
      ) : (
        <ul className="card-soft divide-y divide-line">
          {initial.map((n) => (
            <li key={n.id}>
              <Link
                href={n.actionUrl || "/notifications"}
                onClick={() => {
                  if (!n.read) start(() => markNotificationReadAction(n.id));
                }}
                className="flex gap-3 px-5 py-4 transition-colors hover:bg-surface-2"
              >
                <span
                  className={cn("mt-1.5 size-2.5 shrink-0 rounded-full", priorityDot(n.priority))}
                  aria-hidden
                />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-baseline justify-between gap-2">
                    <span className={cn("text-[15px] text-ink", !n.read && "font-semibold")}>
                      {n.title}
                    </span>
                    <span className="text-[12px] text-muted-foreground">{relativeWhen(n.createdAt)}</span>
                  </span>
                  <span className="mt-1 block whitespace-pre-line text-[13.5px] text-muted-foreground">
                    {n.message}
                  </span>
                  <span className="mt-2 inline-block text-[11.5px] font-medium tracking-wide text-muted-foreground uppercase">
                    {NOTIFICATION_TYPE_LABEL[n.type]}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
