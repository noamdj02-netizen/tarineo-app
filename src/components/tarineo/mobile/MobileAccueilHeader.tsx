"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNotifButton } from "./MobileNotifButton";
import { useMobileShell } from "./MobileShellContext";

export function MobileAccueilHeader() {
  const { prenom, avatarUrl, notifications } = useMobileShell();
  const initiale = prenom.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between px-1 pb-1.5 pt-2.5 lg:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <Link href="/compte" className="shrink-0">
          <Avatar className="size-12 ring-2 ring-white shadow-sm">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">{initiale}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0">
          <p className="truncate text-xl font-bold tracking-[-0.3px] text-[#0f1c28]">Bonjour, {prenom}</p>
          <p className="text-[13px] text-[#8a96a3]">Bon retour !</p>
        </div>
      </div>
      <MobileNotifButton notifications={notifications} />
    </header>
  );
}
