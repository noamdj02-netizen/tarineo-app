import { ArrowLeft, CreditCard, Languages, Palette, Shield } from "lucide-react";
import Link from "next/link";
import { SignOutButton } from "@/components/auth/sign-out-button";
import { PageHead } from "@/components/shell/page-head";
import { sessionIsOwner } from "@/lib/admin/guard";
import { getPlan } from "@/lib/billing/plan";
import { FOUNDER, PLAN_LABEL, PRO, STARTER } from "@/lib/billing/plans";
import { getViewer } from "@/lib/session";
import { WIZARD_STEPS } from "@/lib/onboarding-wizard";
import { ApiKeysCard } from "@/components/account/api-keys-card";
import { AppearanceSettings } from "@/components/theme/appearance-settings";
import { AvatarForm, LocaleForm, NameForm, PasswordForm } from "./forms";
import { OnboardingLaunch } from "./onboarding-launch";

export const metadata = { title: "Compte" };

const TIPS = [
  "Un chantier ouvert à la fois : les devis s’y rangent tout seuls.",
  "Déposez le PDF Cedeo, transformez, envoyez au client.",
  "⌘K cherche un chantier ou une pièce. ⌘J ouvre l’assistant.",
  "Les mentions PDF se règlent dans Mon entreprise.",
];

export default async function ComptePage() {
  const [viewer, plan, owner] = await Promise.all([getViewer(), getPlan(), sessionIsOwner()]);
  if (!viewer) return null;
  const info = plan ?? {
    plan: "free" as const,
    interval: "month" as const,
    tier: 0 as const,
    periodEnd: null,
  };
  const iv = info.interval ?? "month";
  const price =
    info.plan === "founder"
      ? `${FOUNDER.price} € une fois`
      : info.plan === "starter"
        ? `${STARTER[iv]} € / ${iv === "year" ? "an" : "mois"}`
        : info.plan === "pro"
          ? `${PRO[iv]} € / ${iv === "year" ? "an" : "mois"}`
          : "0 €";

  return (
    <section className="mx-auto max-w-[720px]">
      <Link
        href="/accueil"
        className="mb-4 inline-flex min-h-10 items-center gap-2 text-[14px] text-muted-foreground hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour à l’accueil
      </Link>
      <PageHead
        label="Compte"
        title="Compte"
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { label: "Compte" },
        ]}
      >
        Profil, apparence, abonnement et accès.
      </PageHead>

      <div className="flex flex-col gap-4">
        <Link
          href="/entreprise"
          className="card-soft flex min-h-14 items-center justify-between px-5 text-[15px] font-medium"
        >
          Mon entreprise
          <span className="text-[13px] font-normal text-muted-foreground">SIRET, TVA, logo sur les PDF</span>
        </Link>
        <Link
          href="/support"
          className="card-soft flex min-h-14 items-center justify-between px-5 text-[15px] font-medium"
        >
          Support
          <span className="text-[13px] font-normal text-muted-foreground">FAQ et contact</span>
        </Link>
        {owner ? (
          <Link
            href="/admin"
            className="card-soft flex min-h-14 items-center justify-between px-5 text-[15px] font-medium"
          >
            Admin
            <span className="text-[13px] font-normal text-muted-foreground">Founder Analytics</span>
          </Link>
        ) : null}
        <div id="configuration" className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-3">/ Configuration initiale ///</p>
          <p className="text-[14.5px] leading-relaxed text-muted-foreground">
            Accueil guidé : vous, l’entreprise, le premier chantier, puis le tableau de bord.
          </p>
          <ol className="mt-4 flex flex-col gap-2">
            {WIZARD_STEPS.map((step, i) => (
              <li key={step} className="flex gap-3 text-[14px] leading-snug text-ink/85">
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
          <div className="mt-5">
            <OnboardingLaunch needsContinue={viewer.needsOnboarding} />
          </div>
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-4">/ Photo ///</p>
          <AvatarForm avatarUrl={viewer.avatarUrl} initial={viewer.initial} />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-4">/ Identité ///</p>
          <NameForm firstName={viewer.firstName} lastName={viewer.lastName} email={viewer.email} />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2">
            <Languages className="size-4 text-muted-foreground" aria-hidden />
            <span className="mono-label mb-0">/ Langue ///</span>
          </p>
          <LocaleForm locale={viewer.locale} />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2">
            <Palette className="size-4 text-muted-foreground" aria-hidden />
            <span className="mono-label mb-0">/ Apparence ///</span>
          </p>
          <AppearanceSettings />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2">
            <Shield className="size-4 text-muted-foreground" aria-hidden />
            <span className="mono-label mb-0">/ Mot de passe ///</span>
          </p>
          <PasswordForm />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2">
            <CreditCard className="size-4 text-muted-foreground" aria-hidden />
            <span className="mono-label mb-0">/ Abonnement ///</span>
          </p>
          <p className="font-display text-[28px] font-semibold tracking-tightest">
            {owner ? "Studio · illimité" : `${PLAN_LABEL[info.plan]} · ${price}`}
          </p>
          <p className="mt-1 text-[14px] text-muted-foreground">
            {owner
              ? "Compte studio : chantiers, analyses et PDF sans plafond."
              : info.plan === "free"
                ? "Essai : déposez vos devis, créez les pièces client. Passez Pro quand vous voulez."
                : info.plan === "founder"
                  ? "Pro à vie, un seul paiement."
                  : info.plan === "starter"
                    ? "Starter : l’essentiel pour une petite équipe."
                    : "Pro : analyses et pièces sans plafond."}
          </p>
          <Link
            href="/abonnement"
            className="btn-dark mt-4 inline-flex min-h-11 items-center rounded-pill px-5 text-[14px] font-medium"
          >
            Voir l’utilisation et changer d’offre
          </Link>
        </div>

        {owner ? <ApiKeysCard /> : null}

        <div className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-3">/ Conseils ///</p>
          <ul className="flex flex-col gap-2">
            {TIPS.map((t) => (
              <li key={t} className="text-[14.5px] leading-relaxed text-ink/80">
                {t}
              </li>
            ))}
          </ul>
        </div>

        {viewer.canSignOut ? (
          <SignOutButton
            className="inline-flex min-h-11 w-auto justify-center rounded-pill border border-line px-5 text-[14px] text-muted-foreground hover:bg-accent-soft hover:text-ink"
          />
        ) : null}
      </div>
    </section>
  );
}
