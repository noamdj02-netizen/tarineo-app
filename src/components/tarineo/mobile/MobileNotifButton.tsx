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
            className="relative size-[55px] rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.06)]"
          />
        }
      >
        <BellIcon className="size-[30px] text-[#171717]" strokeWidth={1.5} />
        {nonLues > 0 && (
          <span className="absolute right-3 top-3 size-2 rounded-full bg-[#e63b0b]" aria-hidden />
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
