import { ArrowLeft, CreditCard, Languages, LogOut, Shield } from "lucide-react";
import Link from "next/link";
import { PageHead } from "@/components/shell/page-head";
import { getPlan } from "@/lib/billing/plan";
import { LOYALTY_TIERS, PLAN_LABEL } from "@/lib/billing/plans";
import { getViewer } from "@/lib/session";
import { AvatarForm, LocaleForm, NameForm, PasswordForm } from "./forms";

export const metadata = { title: "Compte" };

const TIPS = [
  "Un seul projet en Focus jusqu’à sa première vente.",
  "Note chaque soir une ligne dans le journal du projet : ça nourrit le copilote.",
  "Dépose un fichier (devis, brief) dans la barre d’accueil pour le résumer.",
  "⌘J ouvre l’assistant sans quitter la page. ⌘K cherche partout.",
  "Connecte ton agenda dans Planning pour voir tes rendez-vous au même endroit.",
];

export default async function ComptePage() {
  const [viewer, plan] = await Promise.all([getViewer(), getPlan()]);
  if (!viewer) return null;
  const info = plan ?? {
    plan: "free" as const,
    interval: "month" as const,
    tier: 0 as const,
    periodEnd: null,
  };
  const price =
    info.plan === "founder"
      ? "149 € une fois"
      : info.plan === "pro"
        ? `${LOYALTY_TIERS[info.tier][info.interval ?? "month"]} € / ${info.interval === "year" ? "an" : "mois"}`
        : "0 €";

  return (
    <section className="mx-auto max-w-[720px]">
      <Link
        href="/accueil"
        className="mb-4 inline-flex min-h-10 items-center gap-2 text-[14px] text-muted hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour à l’accueil
      </Link>
      <PageHead art="onboarding-configurer" label="Compte" title="Ton profil," tail="tes réglages.">
        Photo, prénom, langue, mot de passe et abonnement. Tout est ici.
      </PageHead>

      <div className="flex flex-col gap-4">
        <div className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-4">/ Photo ///</p>
          <AvatarForm avatarUrl={viewer.avatarUrl} initial={viewer.initial} />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-4">/ Identité ///</p>
          <NameForm firstName={viewer.firstName} email={viewer.email} />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2">
            <Languages className="size-4 text-muted" aria-hidden />
            <span className="mono-label mb-0">/ Langue ///</span>
          </p>
          <LocaleForm locale={viewer.locale} />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2">
            <Shield className="size-4 text-muted" aria-hidden />
            <span className="mono-label mb-0">/ Mot de passe ///</span>
          </p>
          <PasswordForm />
        </div>

        <div className="card-soft p-5 sm:p-6">
          <p className="mb-4 flex items-center gap-2">
            <CreditCard className="size-4 text-muted" aria-hidden />
            <span className="mono-label mb-0">/ Abonnement ///</span>
          </p>
          <p className="font-display text-[28px] font-semibold tracking-tightest">
            {PLAN_LABEL[info.plan]} · {price}
          </p>
          <p className="mt-1 text-[14px] text-muted">
            {info.plan === "free"
              ? "Gratuit : 2 projets, 30 questions IA / mois, 3 schémas. Pro commence à 15 € / mois, puis 12 €, puis 9 €."
              : info.plan === "pro"
                ? `Tu paies ${price} aujourd’hui. Le prix baisse tout seul à chaque anniversaire.`
                : "Pro à vie, un seul paiement."}
          </p>
          <Link
            href="/abonnement"
            className="btn-dark mt-4 inline-flex min-h-11 items-center rounded-pill px-5 text-[14px] font-medium"
          >
            Voir l’utilisation et changer d’offre
          </Link>
        </div>

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
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="inline-flex min-h-11 items-center gap-2 rounded-pill border border-line px-5 text-[14px] text-muted hover:text-ink"
            >
              <LogOut className="size-4" aria-hidden />
              Se déconnecter
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
