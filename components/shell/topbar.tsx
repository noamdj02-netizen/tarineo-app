"use client";

import { CreditCard, LogOut, Search, User } from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { TarineoHdMascot } from "@/components/tarineo-hd-mascot";
import { PLAN_LABEL, type PlanId } from "@/lib/billing/plans";
import type { Viewer } from "@/lib/session";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { useTheme } from "@/components/theme/theme-provider";
import { CommandPalette, useCommandPalette } from "./command-palette";
import { Logo } from "./logo";

/** Barre du haut : recherche ⌘K, pastille du plan (vers /abonnement), avatar. */
export function Topbar({ viewer, planId }: { viewer: Viewer | null; planId: PlanId }) {
  const palette = useCommandPalette();
  const { resolved } = useTheme();

  return (
    <header
      className="sticky top-0 z-20 flex shrink-0 flex-col border-b border-line bg-surface transition-[background-color,border-color,color] duration-[180ms] ease-[cubic-bezier(0.2,0.8,0.2,1)] motion-reduce:transition-none lg:z-10"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {viewer?.needsOnboarding ? (
        <Link
          href="/onboarding"
          className="border-b border-line bg-accent-soft px-4 py-2.5 text-center text-[13px] font-medium text-ink sm:px-6"
        >
          Finis ta configuration (chantier, documents…) — continuer
        </Link>
      ) : null}
      <div className="flex h-14 min-h-14 w-full items-center gap-2 overflow-x-clip px-4 sm:gap-3 sm:px-6">
        <Logo theme={resolved} size={26} showWordmark chrome="bar" className="min-w-0 shrink lg:hidden" />

        <div className="hidden min-w-0 flex-1 items-center gap-2.5 md:flex">
          <Button
            type="button"
            variant="outline"
            onClick={() => palette.setOpen(true)}
            className="flex h-9 min-w-0 flex-1 max-w-md justify-start gap-2.5 rounded-[10px] border-line bg-search px-3 font-normal text-muted-foreground placeholder:text-[#737373] hover:bg-search"
          >
            <Search className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-left text-[13.5px]">Rechercher</span>
            <kbd className="hidden rounded-[6px] border border-line bg-surface px-1.5 py-0.5 font-mono text-[10.5px] text-ink/70 lg:inline">
              ⌘K
            </kbd>
          </Button>
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            onClick={() => palette.setOpen(true)}
            aria-label="Rechercher"
            className="md:hidden"
          >
            <Search className="size-5" strokeWidth={1.75} aria-hidden />
          </Button>
          <ThemeToggle />
          <PlanBadge planId={planId} />
          <AvatarMenu viewer={viewer} />
        </div>
      </div>

      <CommandPalette open={palette.open} onClose={() => palette.setOpen(false)} />
    </header>
  );
}

function PlanBadge({ planId }: { planId: PlanId }) {
  const label = PLAN_LABEL[planId];
  return (
    <Badge
      variant={planId === "pro" ? "default" : "outline"}
      className={cn(
        "hidden h-8 max-w-[min(100%,200px)] truncate rounded-full px-3 py-1.5 text-[13px] font-medium leading-tight tracking-[-0.02em] lg:inline-flex",
        planId === "founder" && "border-line bg-surface-2 text-ink shadow-soft",
        planId === "free" && "border-line bg-surface-2 text-muted-foreground hover:text-ink",
      )}
      render={<Link href="/abonnement" />}
    >
      {planId === "free" ? (
        <>
          <span>{label}</span>
          <span className="text-ink/55">·</span>
          <span className="text-ink/80">Passer Pro</span>
        </>
      ) : (
        label
      )}
    </Badge>
  );
}

function AvatarMenu({ viewer }: { viewer: Viewer | null }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Mon compte"
        className="btn-dark relative size-9 overflow-hidden rounded-full p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 lg:size-10"
      >
        <Avatar className="size-9 border-0 after:hidden lg:size-10">
          {viewer?.avatarUrl ? <AvatarImage src={viewer.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-transparent font-mono text-[13px] text-accent-ink">
            {viewer?.initial ?? "·"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 py-2 font-normal">
            <TarineoHdMascot name="05-bras-croises" className="-my-1 h-12 w-14" label="" />
            <div className="min-w-0">
              <p className="mono-label">/ Compte</p>
              <p className="mt-1 truncate text-sm text-foreground">
                {viewer?.email ?? "Non connecté"}
              </p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/compte" />}>
            <User />
            Compte
          </DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/abonnement" />}>
            <CreditCard />
            Abonnement
          </DropdownMenuItem>
        </DropdownMenuGroup>
        {viewer?.canSignOut ? (
          <>
            <DropdownMenuSeparator />
            <form action="/auth/signout" method="post">
              <DropdownMenuItem variant="destructive" render={<button type="submit" className="w-full" />}>
                <LogOut />
                Se déconnecter
              </DropdownMenuItem>
            </form>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
