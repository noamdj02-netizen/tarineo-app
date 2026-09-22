"use client";

import Link from "next/link";
import { BellIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
import type { NotifUi } from "@/lib/notifications";

export function MobileNotifButton({ notifications }: { notifications: NotifUi[] }) {
  const nonLues = notifications.filter((n) => n.nonLu).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifications"
        render={
          <Button
            variant="secondary"
            size="icon"
            className="relative size-11 rounded-[22px] bg-white shadow-[0_4px_16px_rgba(15,23,36,0.06)]"
          />
        }
      >
        <BellIcon className="size-5 text-[#0f1c28]" />
        {nonLues > 0 && (
          <span className="absolute right-2.5 top-1.5 size-2 rounded-full bg-primary" aria-hidden />
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,360px)] p-2">
        <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-foreground">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Aucune alerte pour l&apos;instant.
          </p>
        ) : (
          <DropdownMenuGroup className="max-h-[min(60vh,320px)] overflow-y-auto">
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                nativeButton={false}
                render={
                  <Link
                    prefetch={false}
                    href={notif.href}
                    className="flex-col items-start gap-1 whitespace-normal rounded-xl px-3 py-3"
                  />
                }
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{notif.titre}</p>
                  {notif.nonLu && <Badge className="size-2 min-w-2 p-0" />}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{notif.message}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
