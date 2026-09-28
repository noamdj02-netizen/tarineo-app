import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { PageHead } from "@/components/shell/page-head";
import { aiUsedThisMonth, planFor } from "@/lib/billing/plan";
import {
  FOUNDER,
  PLAN_LABEL,
  PRO,
  PRO_TRIAL_DAYS,
  STARTER,
  type Limits,
  type PlanId,
} from "@/lib/billing/plans";
import { fulfillCheckoutSession } from "@/lib/billing/stripe-events";
import { isStripeConfigured } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata = { title: "Abonnement" };

const ERRORS: Record<string, string> = {
  config: "Le paiement n’est pas encore branché sur ce serveur (clés Stripe manquantes).",
  deja: "Tu as déjà un abonnement actif.",
  complet: "Les places Fondateur sont toutes prises. Les formules Création et Pro restent disponibles.",
  prix: "Les prix TARINEO (lookup tarineo_starter_*, tarineo_pro_*, tarineo_founder) n’existent pas encore dans Stripe. Aucun paiement n’a été lancé.",
  stripe: "Stripe n’a pas répondu. Réessaie dans un instant.",
};

const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

function priceLabel(plan: PlanId, interval: "month" | "year") {
  if (plan === "founder") return `${FOUNDER.price} € une fois`;
  if (plan === "starter") return `${STARTER[interval]} € / ${interval === "year" ? "an" : "mois"}`;
  if (plan === "pro") return `${PRO[interval]} € / ${interval === "year" ? "an" : "mois"}`;
  return null;
}

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{
    plan?: string;
    interval?: string;
    ok?: string;
    erreur?: string;
    session_id?: string;
  }>;
}) {
  const q = await searchParams;
  const db = await getDb();
  if (!db) return null;
  if (q.ok && q.session_id) await fulfillCheckoutSession(q.session_id, db.user.id);

  const head = { count: "exact" as const, head: true };
  const [info, ai, projects, schemas, seats] = await Promise.all([
    planFor(db),
    aiUsedThisMonth(db),
    db.supabase.from("projects").select("id", head).eq("user_id", db.user.id),
    db.supabase.from("project_schemas").select("id", head).eq("user_id", db.user.id),
    db.supabase.rpc("founder_seats_taken"),
  ]);
  const seatsLeft = Math.max(0, FOUNDER.seats - (seats.data ?? 0));
  const wanted: PlanId =
    q.plan === "founder" ? "founder" : q.plan === "starter" ? "starter" : "pro";
  const interval = q.interval === "year" ? "year" : "month";
  const today = priceLabel(info.plan, info.interval ?? "month");
  const headTitle =
    info.plan === "free"
      ? "Tarifs"
      : info.isFreeTrial
        ? "Votre essai Pro"
        : `Formule ${PLAN_LABEL[info.plan]}`;
  const headDescription =
    info.plan === "free"
      ? `Essai Pro ${PRO_TRIAL_DAYS} jours sans carte, puis Création (${STARTER.month} €) ou Pro (${PRO.month} €).`
      : info.isFreeTrial
        ? info.periodEnd
          ? `Votre essai se termine le ${dateFr(info.periodEnd)}. Ajoutez un paiement avant cette date pour garder votre compte.`
          : `Profitez de tout Pro pendant ${PRO_TRIAL_DAYS} jours. Ajoutez un paiement avant la fin pour garder votre compte.`
        : info.plan === "founder"
          ? "Vous êtes Fondateur : Pro à vie, sans abonnement."
          : today
            ? `Vous êtes sur ${PLAN_LABEL[info.plan]} (${today}). Changez de formule depuis le portail Stripe si besoin.`
            : `Vous êtes sur ${PLAN_LABEL[info.plan]}.`;

  return (
    <section className="mx-auto max-w-[760px]">
      <Link
        href="/compte"
        className="mb-4 inline-flex min-h-10 items-center gap-2 text-[14px] text-muted-foreground hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour au compte
      </Link>
      <PageHead
        label="Abonnement"
        title={headTitle}
        crumbs={[
          { href: "/accueil", label: "Accueil" },
          { href: "/compte", label: "Compte" },
          { label: "Tarifs" },
        ]}
      >
        {headDescription}
      </PageHead>

      <RevealGroup className="flex flex-col gap-4">
        {q.ok ? (
          <Reveal className="rounded-[18px] bg-st-focus-soft px-5 py-4 text-[14.5px] text-st-focus-ink">
            Paiement reçu, merci ! Ton plan se met à jour dans quelques secondes (recharge la page si
            besoin).
          </Reveal>
        ) : null}
        {q.erreur && ERRORS[q.erreur] ? (
          <Reveal role="alert" className="rounded-[18px] bg-st-fini-soft px-5 py-4 text-[14.5px] text-st-fini-ink">
            {ERRORS[q.erreur]}
          </Reveal>
        ) : null}

        <Reveal className="card-soft p-5 sm:p-6">
          <p className="mono-label mb-4">/ Utilisation ///</p>
          <div className="grid gap-4 sm:grid-cols-3">
            <Usage label="Chantiers" used={projects.count ?? 0} max={info.limits.projects} />
            <Usage label="Analyses ce mois" used={ai} max={info.limits.aiPerMonth} />
            <Usage label="Alertes enregistrées" used={schemas.count ?? 0} max={info.limits.schemas} />
          </div>
        </Reveal>

        {info.plan === "pro" && !info.isFreeTrial && info.periodEnd ? (
          <Reveal className="card-soft p-5 text-[14px] text-muted-foreground sm:p-6">
            {info.cancelAtPeriodEnd ? "Se termine le " : "Prochaine facture le "}
            <b className="text-ink">{dateFr(info.periodEnd)}</b>.
          </Reveal>
        ) : null}

        {info.plan === "free" || info.isFreeTrial ? (
          <Reveal className="flex flex-col gap-4 rounded-[24px] bg-ink p-6 text-accent-ink shadow-lift sm:p-7">
            <p className="font-mono text-[11px] tracking-[0.14em] text-accent-ink/60 uppercase">
              {wanted === "founder"
                ? "/ Fondateur ///"
                : info.isFreeTrial
                  ? "/ Garder TARINEO après l’essai ///"
                  : "/ Passer en payant ///"}
            </p>
            {wanted !== "founder" ? (
              <div className="flex flex-wrap gap-2">
                {(["starter", "pro"] as const).map((p) => (
                  <Link
                    key={p}
                    href={`/abonnement?plan=${p}&interval=${interval}`}
                    className={`min-h-10 rounded-pill px-4 text-[13px] font-medium leading-10 ${
                      wanted === p ? "bg-accent-ink text-ink" : "border border-white/20 text-accent-ink/80"
                    }`}
                  >
                    {PLAN_LABEL[p]}
                  </Link>
                ))}
                <div className="flex gap-2">
                  {(["month", "year"] as const).map((iv) => (
                    <Link
                      key={iv}
                      href={`/abonnement?plan=${wanted}&interval=${iv}`}
                      className={`min-h-10 rounded-pill px-4 text-[13px] font-medium leading-10 ${
                        interval === iv ? "border border-white/40 text-accent-ink" : "text-accent-ink/60"
                      }`}
                    >
                      {iv === "month" ? "Mensuel" : "Annuel"}
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            <p className="font-display text-[26px] leading-tight font-semibold tracking-tightest">
              {wanted === "founder"
                ? `${FOUNDER.price} € une fois, Pro à vie.`
                : `${priceLabel(wanted, interval)} · ${wanted === "starter" ? "documents, historique, 3 enseignes" : "tous les distributeurs + devis client"}.`}
            </p>
            <p className="text-[14.5px] text-accent-ink/70">
              {wanted === "founder"
                ? `${seatsLeft} place${seatsLeft > 1 ? "s" : ""} restante${seatsLeft > 1 ? "s" : ""} sur ${FOUNDER.seats}.`
                : info.isFreeTrial
                  ? "Sans paiement avant la fin de l’essai, ton compte sera supprimé automatiquement."
                  : "Paiement sécurisé par Stripe. Résiliable à tout moment."}
            </p>
            <form action="/api/billing/checkout" method="post" className="flex flex-wrap items-center gap-3">
              <input type="hidden" name="plan" value={wanted} />
              <input type="hidden" name="interval" value={interval} />
              <button
                type="submit"
                disabled={!isStripeConfigured() || (wanted === "founder" && seatsLeft === 0)}
                className="inline-flex min-h-12 items-center gap-2 rounded-pill bg-accent-ink px-6 text-[15px] font-medium text-ink transition-transform duration-300 ease-out-soft hover:-translate-y-0.5 disabled:opacity-50"
              >
                <CreditCard className="size-4" aria-hidden />
                Payer avec Stripe
              </button>
              <Link href="/prix" className="inline-flex items-center gap-1.5 text-[14px] text-accent-ink/70 hover:text-accent-ink">
                Comparer les offres
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
              {wanted !== "founder" ? (
                <Link
                  href={wanted === "starter" ? "/abonnement?plan=pro" : "/abonnement?plan=starter"}
                  className="text-[14px] text-accent-ink/70 hover:text-accent-ink"
                >
                  {wanted === "starter"
                    ? `ou Pro · ${PRO.month} € / mois`
                    : `ou Création · ${STARTER.month} € / mois`}
                </Link>
              ) : (
                <Link href="/abonnement?plan=pro" className="text-[14px] text-accent-ink/70 hover:text-accent-ink">
                  ou abonnement Pro
                </Link>
              )}
            </form>
          </Reveal>
        ) : info.hasCustomer ? (
          <Reveal>
            <form action="/api/billing/portal" method="post">
              <button
                type="submit"
                className="btn-dark inline-flex min-h-12 items-center gap-2 rounded-pill px-6 text-[15px] font-medium"
              >
                <CreditCard className="size-4" aria-hidden />
                Gérer ma carte et mes factures
              </button>
            </form>
          </Reveal>
        ) : null}
      </RevealGroup>
    </section>
  );
}

function Usage({ label, used, max }: { label: string; used: number; max: Limits["projects"] }) {
  const pct = max ? Math.min(100, (used / max) * 100) : 0;
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[13px] text-muted-foreground">{label}</p>
      <p className="font-display text-[24px] leading-none font-semibold tracking-tightest">
        {used}
        <span className="text-[14px] font-normal text-muted-foreground"> / {max ?? "∞"}</span>
      </p>
      <div className="h-1.5 overflow-hidden rounded-pill bg-line">
        <div
          className={cn(
            "h-full origin-left animate-[bar-grow-x_0.9s_var(--ease-out-soft)_both] rounded-pill",
            pct >= 100 ? "bg-st-fini" : pct >= 80 ? "bg-st-pause" : "bg-ink",
          )}
          style={{ width: max ? `${pct}%` : "100%", opacity: max ? 1 : 0.15 }}
        />
      </div>
    </div>
  );
}
