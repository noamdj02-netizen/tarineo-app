"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/BrandLogo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMobileShell } from "./MobileShellContext";
import { cn } from "@/lib/utils";

export function MobilePageHeader({
  title,
  subtitle,
  backHref,
  className,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  className?: string;
}) {
  const { prenom, avatarUrl, companyName } = useMobileShell();
  const initiale = prenom.charAt(0).toUpperCase();
  const sousTitre = subtitle ?? (companyName ? `${prenom} · ${companyName}` : prenom);

  return (
    <header className={cn("px-1 pb-3 pt-2 lg:hidden", className)}>
      {backHref && (
        <Link href={backHref} className="mb-2 inline-flex text-sm text-muted-foreground">
          ← Retour
        </Link>
      )}
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          <BrandLogo
            href="/accueil"
            wordmarkStyle="dashboard"
            showWordmark
            iconClassName="size-5"
            className="mb-1 gap-2 [&_span]:text-[11px] [&_span]:font-semibold [&_span]:text-[#53616a]"
          />
          <h1 className="text-2xl font-semibold text-[#172935]">{title}</h1>
          <p className="mt-1 truncate text-[13px] text-[#53616a]">{sousTitre}</p>
        </div>
        <Link href="/compte" className="shrink-0">
          <Avatar className="size-10">
            {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">{initiale}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}
