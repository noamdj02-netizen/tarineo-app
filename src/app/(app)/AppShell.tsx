"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { BellIcon, ChevronDownIcon, LogOutIcon, MenuIcon, SearchIcon } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { IconDocument, IconInvoice, IconSettings, IconWidget } from "@/components/tarineo/NavIcons";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { DEMO_NOTIFICATIONS } from "@/lib/uiDemo";
import { deconnexionAction } from "./deconnexionAction";

function MenuNotifications() {
  const nonLues = DEMO_NOTIFICATIONS.filter((n) => n.nonLu).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="relative inline-flex size-11 items-center justify-center rounded-full bg-secondary text-foreground xl:size-14"
        aria-label="Notifications"
      >
        <BellIcon className="size-5" />
        {nonLues > 0 && (
          <span className="absolute right-2.5 top-2.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-white xl:right-3 xl:top-3">
            {nonLues}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[min(100vw-2rem,360px)] p-2">
        {/* Le libellé doit vivre DANS le groupe qu'il nomme : Base UI lève sinon
            « MenuGroupContext is missing » à chaque ouverture du menu. Rendu collant
            pour rester visible quand la liste défile. */}
        <DropdownMenuGroup className="max-h-[min(60vh,320px)] overflow-y-auto">
          <DropdownMenuLabel className="sticky top-0 z-10 bg-popover px-2 py-1.5 text-sm font-semibold text-foreground">
            Notifications <span className="font-normal text-muted-foreground">(exemples)</span>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {DEMO_NOTIFICATIONS.map((notif) => (
            <DropdownMenuItem key={notif.id} className="flex-col items-start gap-1 whitespace-normal rounded-xl px-3 py-3">
              <div className="flex w-full items-start justify-between gap-2">
                <p className="text-sm font-medium text-foreground">{notif.titre}</p>
                {notif.nonLu && <span className="mt-1 size-2 shrink-0 rounded-full bg-primary" />}
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{notif.message}</p>
              <p className="text-[11px] text-muted-foreground">{notif.date}</p>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem nativeButton={false} render={<Link href="/documents" className="w-full justify-center text-center" />}>
          Importer un document
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

const LIENS_NAV = [
  { id: "dashboard", href: "/accueil", libelle: "Dashboard" },
  { id: "documents", href: "/documents", libelle: "Mes documents" },
  { id: "fournisseurs", href: "/fournisseurs", libelle: "Bibliothèque" },
  { id: "veille", href: "/veille", libelle: "Veille" },
  { id: "facturation", href: "/devis-clients", libelle: "Facturation clients" },
  { id: "analyses", href: "/analyses", libelle: "Analyses" },
  { id: "parametres", href: "/parametres", libelle: "Paramètres" },
];

const LIENS_TOP = [
  { href: "/accueil", libelle: "Dashboard" },
  { href: "/documents", libelle: "Mes documents" },
  { href: "/fournisseurs", libelle: "Fournisseurs" },
  { href: "/devis-clients", libelle: "Facturation" },
  { href: "/analyses", libelle: "Analyses" },
];

const SOUS_LIENS_DOCUMENTS = [
  { href: "/documents", libelle: "Tous" },
  { href: "/documents?type=DEVIS", libelle: "Devis fournisseurs" },
  { href: "/documents?type=FACTURE", libelle: "Factures" },
  { href: "/documents?type=BON_COMMANDE", libelle: "Bons de commande" },
  { href: "/documents?type=BON_ENLEVEMENT", libelle: "Bons d'enlèvement" },
];

const SOUS_LIENS_FACTURATION = [
  { href: "/devis-clients", libelle: "Devis clients" },
  { href: "/factures-clients", libelle: "Factures clients" },
];

function iconeNav(id: string) {
  const cls = "size-6 shrink-0";
  if (id === "dashboard" || id === "analyses" || id === "fournisseurs" || id === "veille") {
    return <IconWidget className={cls} />;
  }
  if (id === "documents") return <IconDocument className={cls} />;
  if (id === "facturation") return <IconInvoice className={cls} />;
  return <IconSettings className={cls} />;
}

function useTiroirSidebar(cle: string, defautOuvert: boolean) {
  const [ouvert, setOuvert] = useState(defautOuvert);

  useEffect(() => {
    try {
      const stocke = localStorage.getItem(cle);
      // Lecture d'un système externe (localStorage), impossible au premier rendu
      // puisqu'il n'existe pas côté serveur — exception assumée à la règle, et non un
      // état dérivé d'un autre état React. Même motif que dans FormulaireDevis.tsx.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stocke === "0") setOuvert(false);
      if (stocke === "1") setOuvert(true);
    } catch {
      // ignore
    }
  }, [cle]);

  function basculer() {
    const suivant = !ouvert;
    setOuvert(suivant);
    try {
      localStorage.setItem(cle, suivant ? "1" : "0");
    } catch {
      // ignore
    }
  }

  return { ouvert, basculer };
}

function SousMenuLiens({
  liens,
  onNavigate,
}: {
  liens: { href: string; libelle: string }[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function estActif(href: string) {
    const [path, query] = href.split("?");
    const surSection = pathname === path || pathname.startsWith(`${path}/`);
    if (!surSection) return false;
    if (path === "/documents") {
      if (!query) return !searchParams.get("type");
      return searchParams.get("type") === new URLSearchParams(query).get("type");
    }
    return pathname === path || pathname.startsWith(`${path}/`);
  }

  return (
    <div>
      {liens.map((lien) => {
        const actif = estActif(lien.href);
        return (
          <Link
            key={lien.href}
            href={lien.href}
            onClick={onNavigate}
            aria-current={actif ? "page" : undefined}
            className={cn(
              "block py-2.5 pl-[60px] pr-6 text-sm font-normal transition-colors",
              actif ? "text-primary" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {lien.libelle}
          </Link>
        );
      })}
    </div>
  );
}

function LienNavAvecTiroir({
  id,
  href,
  libelle,
  sousLiens,
  actif,
  onNavigate,
}: {
  id: string;
  href: string;
  libelle: string;
  sousLiens: { href: string; libelle: string }[];
  actif: boolean;
  onNavigate?: () => void;
}) {
  const { ouvert, basculer } = useTiroirSidebar(`tarineo-sidebar-${id}`, actif);

  return (
    <div>
      <div
        className={cn(
          "flex items-center rounded-[10px] transition-colors",
          actif ? "bg-[#FFF0E8] text-primary" : "text-muted-foreground hover:text-foreground"
        )}
      >
        <Link
          href={href}
          onClick={onNavigate}
          aria-current={actif ? "page" : undefined}
          className="flex min-w-0 flex-1 items-center gap-3 px-6 py-3.5 text-base font-normal"
        >
          {iconeNav(id)}
          {libelle}
        </Link>
        <button
          type="button"
          onClick={basculer}
          className="mr-3 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors hover:bg-black/5"
          aria-expanded={ouvert}
          aria-label={ouvert ? `Replier ${libelle}` : `Déplier ${libelle}`}
        >
          <ChevronDownIcon className={cn("size-4 transition-transform duration-200", ouvert && "rotate-180")} />
        </button>
      </div>
      {ouvert && <SousMenuLiens liens={sousLiens} onNavigate={onNavigate} />}
    </div>
  );
}

function LienNavDocuments({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const actif = pathname === "/documents" || pathname.startsWith("/documents/");

  return (
    <LienNavAvecTiroir
      id="documents"
      href="/documents"
      libelle="Mes documents"
      sousLiens={SOUS_LIENS_DOCUMENTS}
      actif={actif}
      onNavigate={onNavigate}
    />
  );
}

function LienNavFacturation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const actif =
    pathname.startsWith("/devis-clients") ||
    pathname.startsWith("/factures-clients") ||
    pathname.startsWith("/facturation-clients");

  return (
    <LienNavAvecTiroir
      id="facturation"
      href="/devis-clients"
      libelle="Facturation clients"
      sousLiens={SOUS_LIENS_FACTURATION}
      actif={actif}
      onNavigate={onNavigate}
    />
  );
}

function IconLifeBuoy({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn("size-4", className)} fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
      <circle cx="12" cy="12" r="8.25" />
      <circle cx="12" cy="12" r="3.1" />
      <path d="M6.2 6.2l2.2 2.2M15.6 15.6l2.2 2.2M17.8 6.2l-2.2 2.2M8.4 15.6l-2.2 2.2" />
    </svg>
  );
}

function PiedSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const lien =
    "inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border border-[#E6E9EB] bg-white px-4 text-sm font-medium text-[#172935] transition-colors hover:bg-[#F8F8F8]";

  return (
    <div className="flex flex-col gap-2">
      <a href="mailto:contact@tarineo.com" onClick={onNavigate} className={lien}>
        <IconLifeBuoy />
        Support
      </a>
      <Link href="/compte" onClick={onNavigate} className={lien}>
        Mon compte
      </Link>
      <form action={deconnexionAction}>
        <button type="submit" className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-white hover:opacity-95">
          <LogOutIcon className="size-4" />
          Déconnexion
        </button>
      </form>
    </div>
  );
}

function ContenuSidebar({
  prenom,
  dateLabel,
  onNavigate,
}: {
  prenom: string;
  dateLabel: string;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();

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

        <nav className="w-full rounded-[24px] bg-secondary">
          {LIENS_NAV.map((lien) => {
            if (lien.id === "documents") {
              return <LienNavDocuments key={lien.id} onNavigate={onNavigate} />;
            }
            if (lien.id === "facturation") {
              return <LienNavFacturation key={lien.id} onNavigate={onNavigate} />;
            }
            const actif =
              lien.href === "/accueil"
                ? pathname === "/accueil"
                : pathname === lien.href || pathname.startsWith(`${lien.href}/`);
            return (
              <Link
                key={lien.id}
                href={lien.href}
                onClick={onNavigate}
                aria-current={actif ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[10px] px-6 py-3.5 text-base font-normal transition-colors",
                  actif ? "bg-[#FFF0E8] text-primary" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {iconeNav(lien.id)}
                {lien.libelle}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-6 lg:mt-auto">
        <PiedSidebar onNavigate={onNavigate} />
      </div>
    </>
  );
}

function MenuCompte({ prenom, email }: { prenom: string; email: string }) {
  const initiale = (prenom.charAt(0) || "T").toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="inline-flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#ff9f9f] xl:size-14"
        aria-label="Mon compte"
      >
        <Avatar size="lg" className="size-full bg-transparent after:hidden">
          <AvatarFallback className="bg-[#ff9f9f] text-base font-semibold text-foreground">{initiale}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>{email}</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link href="/parametres" />}>Paramètres</DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/compte" />}>Mon compte</DropdownMenuItem>
          <DropdownMenuItem render={<Link href="/clients" />}>Clients</DropdownMenuItem>
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

function TopBar({ prenom, email }: { prenom: string; email: string }) {
  const pathname = usePathname();

  function navTopActif(href: string) {
    if (href === "/accueil") return pathname === "/accueil";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <header className="sticky top-0 z-30 hidden bg-background lg:block">
      <div className="w-full px-6 pt-6 xl:px-8 xl:pt-8">
        <div className="flex h-16 items-center justify-between gap-3 rounded-full bg-card py-2 pl-4 pr-2 xl:h-[76px] xl:py-[10px] xl:pl-6 xl:pr-[10px]">
          <div className="flex min-w-0 items-center gap-4 xl:gap-[70px]">
            <BrandLogo href="/accueil" wordmarkStyle="dashboard" iconClassName="h-10 w-11 xl:h-[56px] xl:w-[62px]" className="shrink-0 gap-1" priority />

            <nav className="hidden items-center rounded-full bg-secondary xl:flex" aria-label="Navigation principale">
              {LIENS_TOP.map((lien) => {
                const actif = navTopActif(lien.href);
                return (
                  <Link
                    key={lien.href}
                    href={lien.href}
                    className={cn(
                      "flex h-12 items-center rounded-full px-5 text-base font-normal transition-colors xl:h-14 xl:px-6",
                      actif ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {lien.libelle}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex shrink-0 items-center gap-2 xl:gap-[18px]">
            <Link
              href="/documents"
              className="hidden h-11 items-center gap-2 rounded-full bg-secondary px-4 text-sm text-muted-foreground xl:inline-flex xl:h-14 xl:w-[230px] xl:justify-start"
            >
              <SearchIcon className="size-4" />
              <span className="hidden xl:inline">Rechercher...</span>
            </Link>
            <MenuNotifications />
            <MenuCompte prenom={prenom} email={email} />
          </div>
        </div>
      </div>
    </header>
  );
}

export function AppShell({
  email,
  prenom,
  dateLabel,
  children,
}: {
  email: string;
  prenom: string;
  dateLabel: string;
  children: React.ReactNode;
}) {
  const [menuOuvert, setMenuOuvert] = useState(false);

  return (
    <>
      <Suspense fallback={<div className="hidden h-[108px] lg:block" />}>
        <TopBar prenom={prenom} email={email} />
      </Suspense>

      <div className="flex w-full min-w-0 flex-1 gap-4 px-4 pb-8 pt-4 sm:px-6 lg:gap-8 lg:px-8 lg:pt-6">
        <aside className="sticky top-[108px] hidden h-[calc(100dvh-140px)] w-[240px] shrink-0 flex-col self-start overflow-y-auto rounded-[24px] bg-card p-4 xl:w-[264px] lg:flex">
          <div className="flex min-h-0 flex-1 flex-col justify-between">
            <ContenuSidebar prenom={prenom} dateLabel={dateLabel} />
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="mb-4 flex items-center justify-between rounded-full bg-card px-4 py-2.5 lg:hidden">
            <BrandLogo href="/accueil" wordmarkStyle="dashboard" iconClassName="size-10" className="gap-2" />
            <Sheet open={menuOuvert} onOpenChange={setMenuOuvert}>
              <SheetTrigger
                className="inline-flex size-11 items-center justify-center rounded-full bg-secondary text-foreground"
                aria-label="Ouvrir le menu"
              >
                <MenuIcon />
              </SheetTrigger>
              <SheetContent side="left" className="w-[min(100%,320px)] overflow-y-auto bg-card p-4">
                <SheetHeader className="px-0">
                  <SheetTitle>Bon retour, {prenom}</SheetTitle>
                  <SheetDescription className="capitalize">{dateLabel}</SheetDescription>
                </SheetHeader>
                <ContenuSidebar prenom={prenom} dateLabel={dateLabel} onNavigate={() => setMenuOuvert(false)} />
              </SheetContent>
            </Sheet>
          </div>

          <main className="min-w-0 flex-1 overflow-x-hidden pb-24 lg:pb-0">{children}</main>
        </div>
      </div>
    </>
  );
}
