"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MobileNotifButton } from "./MobileNotifButton";
import { useMobileShell } from "./MobileShellContext";

export function MobileAccueilHeader() {
  const { prenom, avatarUrl, notifications } = useMobileShell();
  const initiale = prenom.charAt(0).toUpperCase();

  return (
    <header className="flex items-center justify-between px-0.5 pb-0.5 pt-0.5 lg:hidden">
      <div className="flex min-w-0 items-center gap-[15px]">
        <Link href="/compte" className="shrink-0">
          <Avatar className="size-[55px] ring-2 ring-white shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">{initiale}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="min-w-0 flex flex-col gap-[5px]">
          <p className="truncate text-[19px] font-semibold leading-tight tracking-[-0.3px] text-black">
            Bonjour, {prenom}
          </p>
          <p className="text-[12px] leading-tight text-[#383838]">Bon retour !</p>
        </div>
      </div>
      <MobileNotifButton notifications={notifications} />
    </header>
  );
}
