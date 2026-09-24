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
import { Illustration } from "@/components/illustration";
import { PLAN_LABEL, type PlanId } from "@/lib/billing/plans";
import type { Viewer } from "@/lib/session";
import { cn } from "@/lib/utils";
import { CommandPalette, useCommandPalette } from "./command-palette";
import { Logo } from "./logo";

/** Barre du haut : recherche ⌘K, pastille du plan (vers /abonnement), avatar. */
export function Topbar({ viewer, planId }: { viewer: Viewer | null; planId: PlanId }) {
  const palette = useCommandPalette();

  return (
    <header
      className="sticky top-0 z-20 flex shrink-0 flex-col border-b border-line bg-surface/85 backdrop-blur-md lg:z-10"
      style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
    >
      {viewer?.needsOnboarding ? (
        <Link
          href="/onboarding"
          className="border-b border-line bg-accent-soft px-4 py-2.5 text-center text-[13px] font-medium text-ink sm:px-6"
        >
          Finis ta configuration (prénom, projets, IA…) — continuer
        </Link>
      ) : null}
      <div className="flex min-h-15 w-full items-center gap-3 px-4 sm:px-6">
        <Logo className="text-[24px] lg:hidden" />

        <Button
          type="button"
          variant="outline"
          onClick={() => palette.setOpen(true)}
          className="hidden h-10 w-full max-w-md justify-start gap-2.5 rounded-full border-line bg-surface-2 px-4 font-normal text-muted-foreground hover:bg-surface sm:flex"
        >
          <Search aria-hidden />
          <span className="flex-1 text-left">Rechercher…</span>
          <kbd className="rounded-md border border-line bg-surface px-1.5 py-0.5 font-mono text-[10.5px] text-ink/70">
            ⌘K
          </kbd>
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            size="icon-lg"
            onClick={() => palette.setOpen(true)}
            aria-label="Rechercher"
            className="rounded-full sm:hidden"
          >
            <Search aria-hidden />
          </Button>
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
        "hidden h-8 max-w-[min(100%,200px)] truncate rounded-full px-3 py-1.5 text-[13px] font-medium leading-tight tracking-[-0.02em] sm:inline-flex",
        planId === "founder" && "border-ink/12 bg-[#f6f2ea] text-ink shadow-soft",
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
        className="btn-dark relative size-10 overflow-hidden rounded-full p-0 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <Avatar className="size-10 border-0 after:hidden">
          {viewer?.avatarUrl ? <AvatarImage src={viewer.avatarUrl} alt="" /> : null}
          <AvatarFallback className="bg-transparent font-mono text-[13px] text-accent-ink">
            {viewer?.initial ?? "·"}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex items-center gap-3 py-2 font-normal">
            <Illustration name="onboarding-configurer" className="-my-1 size-12" />
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
