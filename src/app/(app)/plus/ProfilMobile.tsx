"use client";

import Link from "next/link";
import {
  Building2Icon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CreditCardIcon,
  HelpCircleIcon,
  LogOutIcon,
  ReceiptIcon,
  ShieldIcon,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { MobileNotifButton } from "@/components/tarineo/mobile/MobileNotifButton";
import { useMobileShell } from "@/components/tarineo/mobile/MobileShellContext";
import { AppStagger, AppStaggerItem } from "@/components/tarineo/motion/AppStagger";
import { BoutonPortailStripe } from "@/app/(app)/parametres/BoutonPortailStripe";
import { deconnexionAction } from "@/app/(app)/deconnexionAction";
import { ProfilPreferences } from "./ProfilPreferences";
import { cn } from "@/lib/utils";

export type ProfilMobileData = {
  nom: string;
  email: string;
  avatarUrl: string | null;
  entreprise: {
    raisonSociale: string;
    siret: string;
    adresse: string;
    telephone: string;
    emailContact: string;
  } | null;
  planLabel: string;
  abonnementActif: boolean;
  prochaineFacturation: string | null;
  prixMensuel: number | null;
  aCompteStripe: boolean;
};

function formaterSiret(siret: string): string {
  const chiffres = siret.replace(/\s/g, "");
  if (chiffres.length !== 14) return siret;
  return `${chiffres.slice(0, 3)} ${chiffres.slice(3, 6)} ${chiffres.slice(6, 9)} ${chiffres.slice(9)}`;
}

function LigneInfo({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  const contenu = (
    <>
      <div className="min-w-0 flex-1">
        <p className="text-[12px] font-medium uppercase tracking-[0.04em] text-[#8a96a3]">{label}</p>
        <p className="mt-0.5 truncate text-[15px] font-medium leading-snug text-[#0f1c28]">{value}</p>
      </div>
      {href ? (
        <ChevronRightIcon className="size-4 shrink-0 text-[#C5CCD3]" strokeWidth={2} aria-hidden />
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex min-h-[56px] items-center gap-3 px-4 py-3.5 transition-colors duration-150 active:bg-muted/50"
      >
        {contenu}
      </Link>
    );
  }

  return <div className="flex min-h-[56px] items-center gap-3 px-4 py-3.5">{contenu}</div>;
}

function LigneLien({
  href,
  titre,
  externe,
}: {
  href: string;
  titre: string;
  externe?: boolean;
}) {
  const classe =
    "flex min-h-[52px] items-center gap-3 px-4 py-3.5 transition-colors duration-150 active:bg-muted/50";

  const contenu = (
    <>
      <span className="min-w-0 flex-1 text-[15px] font-medium text-[#0f1c28]">{titre}</span>
      <ChevronRightIcon className="size-4 shrink-0 text-[#C5CCD3]" strokeWidth={2} aria-hidden />
    </>
  );

  if (externe) {
    return (
      <a href={href} className={classe}>
        {contenu}
      </a>
    );
  }

  return (
    <Link href={href} className={classe}>
      {contenu}
    </Link>
  );
}

export function ProfilMobile({ data }: { data: ProfilMobileData }) {
  const { notifications } = useMobileShell();
  const initiale = (data.nom.charAt(0) || "T").toUpperCase();
  const entrepriseNom = data.entreprise?.raisonSociale ?? "Entreprise non renseignée";
  const hrefEntreprise = "/parametres";

  return (
    <AppStagger className="flex flex-col gap-5 pb-8 lg:hidden" stagger={0.04} delayChildren={0}>
      {/* Header */}
      <AppStaggerItem>
        <header className="flex items-center justify-between gap-3 pt-1">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            <Link
              href="/accueil"
              aria-label="Retour à l'accueil"
              className="flex size-11 shrink-0 items-center justify-center rounded-full text-[#0f1c28] transition-colors duration-150 active:bg-black/[0.04]"
            >
              <ChevronLeftIcon className="size-6" strokeWidth={2} />
            </Link>
            <h1 className="truncate text-[22px] font-bold tracking-[-0.4px] text-[#0f1c28]">Profil</h1>
          </div>
          <MobileNotifButton notifications={notifications} />
        </header>
      </AppStaggerItem>

      {/* Bloc identité */}
      <AppStaggerItem>
        <section className="flex flex-col items-center px-2 pt-1 text-center">
          <Avatar className="size-[76px] shadow-[0_4px_16px_rgba(15,28,40,0.08)] ring-4 ring-white">
            {data.avatarUrl ? <AvatarImage src={data.avatarUrl} alt="" /> : null}
            <AvatarFallback className="bg-primary/12 text-[28px] font-semibold text-primary">
              {initiale}
            </AvatarFallback>
          </Avatar>

          <h2 className="mt-3.5 text-[22px] font-bold leading-tight tracking-[-0.3px] text-[#0f1c28]">
            {data.nom}
          </h2>
          <p className="mt-1 max-w-[280px] truncate text-[14px] text-[#8a96a3]">{entrepriseNom}</p>

          <Badge
            className={cn(
              "mt-3 rounded-full border-0 px-3 py-1 text-[12px] font-semibold",
              data.abonnementActif
                ? "bg-primary/12 text-primary hover:bg-primary/12"
                : "bg-[#EEF0F2] text-[#53616a] hover:bg-[#EEF0F2]"
            )}
          >
            {data.planLabel}
          </Badge>

          <Button
            variant="ghost"
            size="sm"
            className="mt-3 h-9 rounded-full px-4 text-[13px] font-medium text-[#53616a] hover:bg-black/[0.04] hover:text-[#0f1c28]"
            render={<Link href="/compte" />}
            nativeButton={false}
          >
            Modifier mon profil
          </Button>
        </section>
      </AppStaggerItem>

      {/* Mon entreprise */}
      <AppStaggerItem>
        <section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
          <header className="flex items-center gap-2 px-4 pb-1 pt-4">
            <Building2Icon className="size-4 text-primary" strokeWidth={2} aria-hidden />
            <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-[#0f1c28]">Mon entreprise</h2>
          </header>
          {data.entreprise ? (
            <div>
              <LigneInfo label="Entreprise" value={data.entreprise.raisonSociale} href={hrefEntreprise} />
              <Separator className="bg-[#EEF0F2]" />
              <LigneInfo label="SIRET" value={formaterSiret(data.entreprise.siret)} href={hrefEntreprise} />
              <Separator className="bg-[#EEF0F2]" />
              <LigneInfo label="Adresse" value={data.entreprise.adresse || "—"} href={hrefEntreprise} />
              <Separator className="bg-[#EEF0F2]" />
              <LigneInfo label="Téléphone" value={data.entreprise.telephone || "—"} href={hrefEntreprise} />
              <Separator className="bg-[#EEF0F2]" />
              <LigneInfo label="Email" value={data.entreprise.emailContact || data.email} href={hrefEntreprise} />
            </div>
          ) : (
            <div className="px-4 py-5">
              <p className="text-[14px] leading-relaxed text-[#8a96a3]">
                Renseignez votre entreprise pour générer des devis clients professionnels.
              </p>
              <Button
                className="mt-4 h-10 rounded-full px-5"
                render={<Link href={hrefEntreprise} />}
                nativeButton={false}
              >
                Compléter mon entreprise
              </Button>
            </div>
          )}
        </section>
      </AppStaggerItem>

      {/* Facturation clients */}
      <AppStaggerItem>
        <section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
          <header className="flex items-center gap-2 px-4 pb-1 pt-4">
            <ReceiptIcon className="size-4 text-primary" strokeWidth={2} aria-hidden />
            <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-[#0f1c28]">Facturation clients</h2>
          </header>
          <div>
            <LigneLien href="/devis-clients" titre="Devis clients" />
            <Separator className="bg-[#EEF0F2]" />
            <LigneLien href="/factures-clients" titre="Factures clients" />
            <Separator className="bg-[#EEF0F2]" />
            <LigneLien href="/clients" titre="Clients" />
          </div>
        </section>
      </AppStaggerItem>

      {/* Abonnement */}
      <AppStaggerItem>
        <section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
          <header className="flex items-center gap-2 px-4 pb-1 pt-4">
            <CreditCardIcon className="size-4 text-primary" strokeWidth={2} aria-hidden />
            <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-[#0f1c28]">Mon abonnement</h2>
          </header>

          <div className="px-4 pb-5 pt-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[17px] font-semibold tracking-[-0.2px] text-[#0f1c28]">{data.planLabel}</p>
              <Badge
                className={cn(
                  "rounded-full border-0 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.06em]",
                  data.abonnementActif
                    ? "bg-primary/12 text-primary hover:bg-primary/12"
                    : "bg-[#FEE2E2] text-[#B91C1C] hover:bg-[#FEE2E2]"
                )}
              >
                {data.abonnementActif ? "Actif" : "Inactif"}
              </Badge>
            </div>

            <p className="mt-2 text-[14px] leading-snug text-[#8a96a3]">
              {data.abonnementActif
                ? "Votre abonnement est actif"
                : "Activez un abonnement pour débloquer toutes les fonctionnalités"}
            </p>

            {(data.prochaineFacturation || data.prixMensuel !== null) && (
              <div className="mt-4 grid gap-3 rounded-[14px] bg-[#F7F7F5] px-3.5 py-3">
                {data.prochaineFacturation && (
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] text-[#8a96a3]">Prochaine facturation</span>
                    <span className="text-[14px] font-medium text-[#0f1c28]">{data.prochaineFacturation}</span>
                  </div>
                )}
                {data.prixMensuel !== null && (
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] text-[#8a96a3]">Prix</span>
                    <span className="text-[14px] font-semibold text-[#0f1c28]">
                      {data.prixMensuel}&nbsp;€/mois
                    </span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4">
              {data.aCompteStripe ? (
                <BoutonPortailStripe label="Gérer mon abonnement" />
              ) : (
                <Button
                  variant="outline"
                  className="h-11 w-full rounded-full border-[#E6E9EB] bg-white text-sm font-medium text-foreground"
                  render={<Link href="/parametres?onglet=abonnement" />}
                  nativeButton={false}
                >
                  Gérer mon abonnement
                </Button>
              )}
            </div>
          </div>
        </section>
      </AppStaggerItem>

      {/* Préférences */}
      <AppStaggerItem>
        <ProfilPreferences />
      </AppStaggerItem>

      {/* Sécurité */}
      <AppStaggerItem>
        <section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
          <header className="flex items-center gap-2 px-4 pb-1 pt-4">
            <ShieldIcon className="size-4 text-primary" strokeWidth={2} aria-hidden />
            <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-[#0f1c28]">Sécurité</h2>
          </header>
          <div>
            <LigneLien href="/compte" titre="Modifier mon mot de passe" />
            <Separator className="bg-[#EEF0F2]" />
            <LigneLien href="/compte" titre="Authentification" />
            <Separator className="bg-[#EEF0F2]" />
            <LigneLien href="/compte" titre="Appareils connectés" />
          </div>
        </section>
      </AppStaggerItem>

      {/* Aide */}
      <AppStaggerItem>
        <section className="overflow-hidden rounded-[20px] bg-white shadow-[0_4px_14px_rgba(15,28,40,0.04)] ring-1 ring-foreground/8">
          <header className="flex items-center gap-2 px-4 pb-1 pt-4">
            <HelpCircleIcon className="size-4 text-primary" strokeWidth={2} aria-hidden />
            <h2 className="text-[15px] font-semibold tracking-[-0.2px] text-[#0f1c28]">Besoin d&apos;aide ?</h2>
          </header>
          <div>
            <LigneLien href="/contact" titre="Centre d'aide" />
            <Separator className="bg-[#EEF0F2]" />
            <LigneLien href="mailto:contact@tarineo.com" titre="Contacter Tarinéo" externe />
            <Separator className="bg-[#EEF0F2]" />
            <LigneLien
              href="mailto:contact@tarineo.com?subject=Signaler%20un%20probl%C3%A8me"
              titre="Signaler un problème"
              externe
            />
          </div>
        </section>
      </AppStaggerItem>

      {/* Déconnexion */}
      <AppStaggerItem>
        <form action={deconnexionAction} className="flex justify-center pt-1 pb-2">
          <button
            type="submit"
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full px-5 text-[15px] font-medium text-[#C45C5C] transition-colors duration-150 active:bg-red-50"
          >
            <LogOutIcon className="size-4 opacity-70" strokeWidth={2} aria-hidden />
            Déconnexion
          </button>
        </form>
      </AppStaggerItem>
    </AppStagger>
  );
}
