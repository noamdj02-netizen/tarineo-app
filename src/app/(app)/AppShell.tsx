"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BellIcon, ChevronDownIcon, LifeBuoyIcon, LogOutIcon } from "lucide-react";
import { ROUTES_DOCUMENTS_PAR_TYPE } from "@/lib/documentLabels";
import { BrandLogo } from "@/components/BrandLogo";
import {
  IconAnalyses,
  IconDocument,
  IconFournisseurs,
  IconInvoice,
  IconSettings,
  IconWidget,
} from "@/components/tarineo/NavIcons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { NotifUi } from "@/lib/notifications";
import type { NavBadges } from "@/lib/navBadges";
import { BoutonImporterNav } from "@/components/tarineo/BoutonImporterNav";
import { AppPageEnter } from "@/components/tarineo/motion/AppPageEnter";
import { MobileShellProvider } from "@/components/tarineo/mobile/MobileShellContext";
import { MobileSplash } from "@/components/tarineo/mobile/MobileSplash";
import { RechercheGlobale } from "./RechercheGlobale";
import { deconnexionAction } from "./deconnexionAction";

export type { NotifUi };

const classeLienSidebarBase =
  "relative flex items-center gap-3 rounded-xl px-4 py-3 text-base font-normal transition-[color,background-color,transform,box-shadow] duration-200 ease-out active:scale-[0.98] motion-reduce:active:scale-100";
const classeLienSidebarActif =
  "bg-primary/10 text-primary shadow-[inset_3px_0_0_0_var(--primary)]";
const classeLienSidebarInactif = "text-muted-foreground hover:bg-foreground/[0.04] hover:text-foreground";

const classeSousLienBase =
  "mx-3 block rounded-xl py-2.5 pr-4 text-sm transition-[color,background-color,transform] duration-200 ease-out hover:bg-foreground/[0.04] active:scale-[0.99] motion-reduce:active:scale-100";

const RACCOURCIS_DOCUMENTS = [
  { href: "/documents?hausse=1", libelle: "Hausses détectées", cle: "hausses" as const },
  { href: "/documents?verifier=1", libelle: "À vérifier", cle: "aVerifier" as const },
];

function MenuNotifications({ notifications }: { notifications: NotifUi[] }) {
  const nonLues = notifications.filter((n) => n.nonLu).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Notifications"
        render={
          <Button
            variant="secondary"
            size="icon"
            className="relative size-10 rounded-full transition-transform duration-150 ease-out active:scale-[0.97] motion-reduce:active:scale-100"
          />
        }
      >
        <BellIcon />
        {nonLues > 0 && (
          <Badge className="absolute right-2 top-2 size-4 min-w-4 p-0 text-[10px] xl:right-2.5 xl:top-2.5">
            {nonLues > 9 ? "9+" : nonLues}
          </Badge>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,360px)] p-2">
        <DropdownMenuLabel className="px-2 py-1.5 text-sm font-semibold text-foreground">Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Aucune alerte pour l&apos;instant. Importez un devis pour détecter les hausses.
          </p>
        ) : (
          <DropdownMenuGroup className="max-h-[min(60vh,320px)] overflow-y-auto">
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                nativeButton={false}
                render={<Link prefetch={false} href={notif.href} className="flex-col items-start gap-1 whitespace-normal rounded-xl px-3 py-3" />}
              >
                <div className="flex w-full items-start justify-between gap-2">
                  <p className="text-sm font-medium text-foreground">{notif.titre}</p>
                  {notif.nonLu && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{notif.message}</p>
                <p className="text-[11px] text-muted-foreground">{notif.date}</p>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem nativeButton={false} render={<Link prefetch={false} href="/documents?hausse=1" className="w-full justify-center text-center" />}>
          Voir les hausses
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const LIENS_NAV = [
  { id: "dashboard", href: "/accueil", libelle: "Accueil" },
  { id: "documents", href: "/documents", libelle: "Mes documents" },
  { id: "fournisseurs", href: "/fournisseurs", libelle: "Fournisseurs" },
  { id: "analyses", href: "/analyses", libelle: "Analyses" },
  { id: "facturation", href: "/facturation-clients", libelle: "Facturation clients" },
  { id: "parametres", href: "/parametres", libelle: "Paramètres" },
];

const SOUS_LIENS_DOCUMENTS = [
  { href: "/documents", libelle: "Tous" },
  { href: "/coffre", libelle: "Mon coffre" },
  { href: ROUTES_DOCUMENTS_PAR_TYPE.DEVIS, libelle: "Devis fournisseurs" },
  { href: ROUTES_DOCUMENTS_PAR_TYPE.FACTURE, libelle: "Factures fournisseurs" },
  { href: ROUTES_DOCUMENTS_PAR_TYPE.BON_COMMANDE, libelle: "Bons de commande" },
  { href: ROUTES_DOCUMENTS_PAR_TYPE.BON_ENLEVEMENT, libelle: "Bons d'enlèvement" },
];

const SOUS_LIENS_FACTURATION = [
  { href: "/devis-clients", libelle: "Devis clients" },
  { href: "/factures-clients", libelle: "Factures clients" },
  { href: "/clients", libelle: "Clients" },
  { href: "/facturation-clients", libelle: "Facturation électronique" },
];

function iconeNav(id: string) {
  const cls = "size-6 shrink-0";
  if (id === "dashboard") return <IconWidget className={cls} />;
  if (id === "documents") return <IconDocument className={cls} />;
  if (id === "fournisseurs") return <IconFournisseurs className={cls} />;
  if (id === "analyses") return <IconAnalyses className={cls} />;
  if (id === "facturation") return <IconInvoice className={cls} />;
  if (id === "parametres") return <IconSettings className={cls} />;
  return <IconWidget className={cls} />;
}

function lienSidebarActif(pathname: string, href: string): boolean {
  const base = href.split("?")[0];
  if (base === "/documents" && href === "/documents") {
    return pathname === "/documents";
  }
  if (pathname === base) return true;
  if (base.startsWith("/documents/")) return pathname === base;
  if (base !== "/accueil") return pathname.startsWith(`${base}/`);
  return false;
}

function SousMenu({
  liens,
  raccourcis,
  badgesNav,
  onNavigate,
  ouvert,
}: {
  liens: { href: string; libelle: string }[];
  raccourcis?: { href: string; libelle: string; cle: keyof NavBadges }[];
  badgesNav?: NavBadges;
  onNavigate?: () => void;
  ouvert: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const raccourcisVisibles =
    raccourcis?.filter((r) => badgesNav && badgesNav[r.cle] > 0) ?? [];

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5 pb-2 pt-1 transition-opacity duration-200",
        ouvert ? "opacity-100" : "opacity-0",
      )}
    >
      {liens.map((lien) => {
        const actif = lienSidebarActif(pathname, lien.href);
        return (
          <Link
            key={lien.href}
            href={lien.href}
            prefetch={false}
            onClick={onNavigate}
            aria-current={actif ? "page" : undefined}
            className={cn(
              classeSousLienBase,
              "pl-11",
              actif
                ? "bg-primary/10 font-medium text-primary shadow-[inset_3px_0_0_0_var(--primary)]"
                : "text-foreground/70 hover:text-foreground",
            )}
          >
            {lien.libelle}
          </Link>
        );
      })}
      {raccourcisVisibles.length > 0 && (
        <>
          <Separator className="mx-4 my-2" />
          <p className="px-5 pb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Alertes
          </p>
          {raccourcisVisibles.map((lien) => {
            const actif =
              pathname.startsWith("/documents") &&
              ((lien.cle === "hausses" && searchParams.get("hausse") === "1") ||
                (lien.cle === "aVerifier" && searchParams.get("verifier") === "1"));
            return (
              <Link
                key={lien.href}
                href={lien.href}
                prefetch={false}
                onClick={onNavigate}
                aria-current={actif ? "page" : undefined}
                className={cn(
                  classeSousLienBase,
                  "flex items-center justify-between gap-2 pl-11",
                  actif
                    ? "bg-primary/10 font-medium text-primary shadow-[inset_3px_0_0_0_var(--primary)]"
                    : "text-foreground/70 hover:text-foreground",
                )}
              >
                <span>{lien.libelle}</span>
                {badgesNav && (
                  <Badge className="min-w-5 justify-center px-1.5">
                    {badgesNav[lien.cle] > 9 ? "9+" : badgesNav[lien.cle]}
                  </Badge>
                )}
              </Link>
            );
          })}
        </>
      )}
    </div>
  );
}

function LienNavAvecSousMenu({
  id,
  href,
  libelle,
  sousLiens,
  raccourcis,
  badgesNav,
  badgeTotal,
  onNavigate,
}: {
  id: string;
  href: string;
  libelle: string;
  sousLiens: { href: string; libelle: string }[];
  raccourcis?: { href: string; libelle: string; cle: keyof NavBadges }[];
  badgesNav?: NavBadges;
  badgeTotal?: number;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const sectionActive = sousLiens.some((l) => lienSidebarActif(pathname, l.href));
  const actif = lienSidebarActif(pathname, href) || sectionActive;
  const [ouvert, setOuvert] = useState(sectionActive);
  const [sectionActivePrecedente, setSectionActivePrecedente] = useState(sectionActive);
  if (sectionActive !== sectionActivePrecedente) {
    setSectionActivePrecedente(sectionActive);
    if (sectionActive) setOuvert(true);
  }

  return (
    <Collapsible open={ouvert} onOpenChange={setOuvert}>
      <div
        className={cn(
          "mx-1 flex items-center rounded-xl pr-1 transition-all duration-200",
          actif ? classeLienSidebarActif : "hover:bg-foreground/[0.04]",
        )}
      >
        <Link
          href={href}
          prefetch={false}
          onClick={onNavigate}
          aria-current={actif && !sectionActive ? "page" : undefined}
          className={cn(
            classeLienSidebarBase,
            "min-w-0 flex-1 py-3",
            actif ? "text-primary" : classeLienSidebarInactif,
            actif && "shadow-none",
          )}
        >
          {iconeNav(id)}
          <span className="min-w-0 flex-1 truncate">{libelle}</span>
          {badgeTotal != null && badgeTotal > 0 && (
            <Badge className="mr-1 min-w-5 shrink-0 justify-center px-1.5">
              {badgeTotal > 9 ? "9+" : badgeTotal}
            </Badge>
          )}
        </Link>
        <CollapsibleTrigger
          aria-label={ouvert ? `Replier ${libelle}` : `Déplier ${libelle}`}
          aria-expanded={ouvert}
          render={
            <Button
              variant="ghost"
              size="icon-sm"
              className={cn(
                "mr-1 shrink-0 rounded-full transition-transform duration-200",
                actif ? "text-primary hover:bg-card/60" : "text-muted-foreground",
              )}
            />
          }
        >
          <ChevronDownIcon className={cn("transition-transform duration-300 ease-out", ouvert && "rotate-180")} />
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <SousMenu
          liens={sousLiens}
          raccourcis={raccourcis}
          badgesNav={badgesNav}
          onNavigate={onNavigate}
          ouvert={ouvert}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}

function PiedSidebar({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        className="h-11 w-full rounded-full"
        render={<a href="mailto:contact@tarineo.com" onClick={onNavigate} />}
      >
        <LifeBuoyIcon data-icon="inline-start" />
        Support
      </Button>
      <Button
        variant="outline"
        className="h-11 w-full rounded-full"
        render={<Link href="/legal" prefetch={false} onClick={onNavigate} />}
      >
        Informations légales
      </Button>
      <Button
        variant="outline"
        className="h-11 w-full rounded-full"
        render={<Link href="/compte" prefetch={false} onClick={onNavigate} />}
      >
        Mon compte
      </Button>
      <form action={deconnexionAction}>
        <Button type="submit" className="h-11 w-full rounded-full">
          <LogOutIcon data-icon="inline-start" />
          Déconnexion
        </Button>
      </form>
    </div>
  );
}

function ContenuSidebar({
  prenom,
  dateLabel,
  badgesNav,
  onNavigate,
}: {
  prenom: string;
  dateLabel: string;
  badgesNav: NavBadges;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const alertesDocuments = badgesNav.aVerifier + badgesNav.hausses;

  return (
    <>
      <div className="flex flex-col gap-8 lg:gap-11">
        <div className="hidden lg:block">
          <p className="max-w-[224px] text-[28px] leading-[1.15] text-foreground xl:text-[32px]">
            <span className="font-normal">Bon retour, </span>
            <span className="font-medium">{prenom}</span>
          </p>
          <p className="mt-2 text-sm capitalize text-muted-foreground">{dateLabel}</p>
        </div>

        <nav className="flex w-full flex-col gap-1 rounded-[24px] bg-secondary p-1" aria-label="Navigation principale">
          {LIENS_NAV.map((lien) => {
            if (lien.id === "documents") {
              return (
                <LienNavAvecSousMenu
                  key={lien.id}
                  id={lien.id}
                  href={lien.href}
                  libelle={lien.libelle}
                  sousLiens={SOUS_LIENS_DOCUMENTS}
                  raccourcis={RACCOURCIS_DOCUMENTS}
                  badgesNav={badgesNav}
                  badgeTotal={alertesDocuments}
                  onNavigate={onNavigate}
                />
              );
            }
            if (lien.id === "facturation") {
              return (
                <LienNavAvecSousMenu
                  key={lien.id}
                  id={lien.id}
                  href="/devis-clients"
                  libelle={lien.libelle}
                  sousLiens={SOUS_LIENS_FACTURATION}
                  onNavigate={onNavigate}
                />
              );
            }
            const actif =
              lien.href === "/accueil"
                ? pathname === "/accueil"
                : pathname === lien.href || pathname.startsWith(`${lien.href}/`);
            return (
              <Link
                key={lien.id}
                href={lien.href}
                prefetch={false}
                onClick={onNavigate}
                aria-current={actif ? "page" : undefined}
                className={cn(
                  classeLienSidebarBase,
                  "mx-1",
                  actif ? classeLienSidebarActif : classeLienSidebarInactif,
                )}
              >
                {iconeNav(lien.id)}
                {lien.libelle}
              </Link>
            );
          })}
        </nav>

        {pathname === "/accueil" && alertesDocuments > 0 && (
          <div className="flex flex-col gap-2 rounded-[20px] border border-primary/15 bg-card p-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">À faire</p>
            {badgesNav.aVerifier > 0 && (
              <Link
                href="/documents?verifier=1"
                prefetch={false}
                onClick={onNavigate}
                className="flex items-center justify-between gap-2 rounded-xl bg-secondary px-3 py-2.5 text-sm text-foreground transition-all duration-200 hover:bg-primary/10 hover:translate-x-0.5"
              >
                <span>Documents à vérifier</span>
                <Badge>{badgesNav.aVerifier}</Badge>
              </Link>
            )}
            {badgesNav.hausses > 0 && (
              <Link
                href="/documents?hausse=1"
                prefetch={false}
                onClick={onNavigate}
                className="flex items-center justify-between gap-2 rounded-xl bg-secondary px-3 py-2.5 text-sm text-foreground transition-all duration-200 hover:bg-primary/10 hover:translate-x-0.5"
              >
                <span>Hausses à consulter</span>
                <Badge>{badgesNav.hausses}</Badge>
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 lg:mt-auto">
        <PiedSidebar onNavigate={onNavigate} />
      </div>
    </>
  );
}

function MenuCompte({ prenom, email, avatarUrl }: { prenom: string; email: string; avatarUrl?: string | null }) {
  const initiale = (prenom.charAt(0) || "T").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Mon compte"
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-10 shrink-0 overflow-hidden rounded-full p-0 transition-transform duration-200 active:scale-95"
          />
        }
      >
        <Avatar size="lg" className="size-full bg-transparent after:hidden">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt="" className="object-cover" /> : null}
          <AvatarFallback className="bg-primary/15 text-base font-semibold text-foreground">{initiale}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link prefetch={false} href="/parametres" />}>Paramètres</DropdownMenuItem>
          <DropdownMenuItem render={<Link prefetch={false} href="/compte" />}>Mon compte</DropdownMenuItem>
          <DropdownMenuItem render={<Link prefetch={false} href="/entreprise" />}>Mon entreprise</DropdownMenuItem>
          <DropdownMenuItem render={<a href="mailto:contact@tarineo.com" />}>Support</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <form action={deconnexionAction}>
            <DropdownMenuItem variant="destructive" render={<button type="submit" className="w-full cursor-default" />}>
              <LogOutIcon />
              Déconnexion
            </DropdownMenuItem>
          </form>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function TopBar({
  prenom,
  email,
  avatarUrl,
  notifications,
}: {
  prenom: string;
  email: string;
  avatarUrl?: string | null;
  notifications: NotifUi[];
}) {
  return (
    <header className="sticky top-0 z-30 hidden bg-background/90 backdrop-blur-md lg:block">
      <div className="w-full px-6 py-4 xl:px-8">
        <div className="flex h-14 items-center gap-3 rounded-full border border-border/60 bg-card/95 py-2 pl-4 pr-2 shadow-sm transition-shadow duration-200 hover:shadow-md xl:pl-5 xl:pr-3">
          <BrandLogo
            href="/accueil"
            wordmarkStyle="dashboard"
            iconClassName="h-7 w-8"
            className="shrink-0 gap-1"
            priority
          />

          <Suspense fallback={<Skeleton className="hidden h-11 min-w-0 flex-1 rounded-full md:block" />}>
            <RechercheGlobale className="hidden min-w-0 flex-1 md:flex" />
          </Suspense>

          <div className="flex shrink-0 items-center gap-1.5 xl:gap-2">
            <BoutonImporterNav />
            <MenuNotifications notifications={notifications} />
            <MenuCompte prenom={prenom} email={email} avatarUrl={avatarUrl} />
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  email,
  prenom,
  avatarUrl = null,
  companyName = null,
  dateLabel,
  notifications = [],
  badgesNav = { aVerifier: 0, hausses: 0 },
  children,
}: {
  email: string;
  prenom: string;
  avatarUrl?: string | null;
  companyName?: string | null;
  dateLabel: string;
  notifications?: NotifUi[];
  badgesNav?: NavBadges;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const modeOnboarding = pathname.startsWith("/onboarding");

  if (modeOnboarding) {
    return (
      <main className="min-h-dvh bg-background px-4 py-6 sm:px-6">
        <AppPageEnter>{children}</AppPageEnter>
      </main>
    );
  }

  return (
    <>
      <MobileSplash />
      <Suspense fallback={<div className="hidden h-[88px] lg:block" aria-hidden="true" />}>
        <TopBar prenom={prenom} email={email} avatarUrl={avatarUrl} notifications={notifications} />
      </Suspense>

      <div className="flex w-full min-w-0 flex-1 gap-4 px-[25px] pb-8 pt-3 sm:px-6 lg:gap-8 lg:px-8 lg:pt-5 lg:bg-background">
        <aside className="sticky top-[88px] hidden h-[calc(100dvh-112px)] w-[240px] shrink-0 flex-col self-start overflow-y-auto scroll-smooth rounded-[24px] border border-border/50 bg-card p-4 shadow-sm xl:w-[264px] lg:flex">
          <div className="flex min-h-0 flex-1 flex-col justify-between">
            <Suspense fallback={<Skeleton className="h-64 rounded-[24px]" />}>
              <ContenuSidebar prenom={prenom} dateLabel={dateLabel} badgesNav={badgesNav} />
            </Suspense>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <MobileShellProvider
            value={{ prenom, avatarUrl, companyName, notifications }}
          >
            <main className="min-w-0 flex-1 overflow-x-hidden bg-[#f6f7f9] pb-28 lg:bg-transparent lg:pb-0">
              <AppPageEnter>{children}</AppPageEnter>
            </main>
          </MobileShellProvider>
        </div>
      </div>
    </>
  );
}
