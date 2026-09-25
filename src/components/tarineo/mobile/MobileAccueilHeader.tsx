"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNotifButton } from "./MobileNotifButton";
import { useMobileShell } from "./MobileShellContext";

export function MobileAccueilHeader() {
  const { prenom, avatarUrl, notifications } = useMobileShell();
  const initiale = prenom.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between gap-3 pb-1 lg:hidden">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <Link href="/compte" className="shrink-0">
          <Avatar className="size-11 ring-2 ring-white shadow-sm">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">{initiale}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[20px] font-bold leading-tight tracking-[-0.3px] text-[#0f1c28]">
            Bonjour, {prenom}
          </p>
          <p className="truncate text-[13px] leading-snug text-[#8a96a3]">
            Ce qui mérite votre attention
          </p>
        </div>
      </div>
      <MobileNotifButton notifications={notifications} />
    </header>
  );
}
