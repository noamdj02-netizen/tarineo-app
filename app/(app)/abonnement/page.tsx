import { ArrowLeft, ArrowRight, CreditCard } from "lucide-react";
import Link from "next/link";
import { Reveal, RevealGroup } from "@/components/motion/reveal";
import { PageHead } from "@/components/shell/page-head";
import { aiUsedThisMonth, planFor } from "@/lib/billing/plan";
import { FOUNDER, LOYALTY_TIERS, PLAN_LABEL, type Limits } from "@/lib/billing/plans";
import { isStripeConfigured } from "@/lib/billing/stripe";
import { getDb } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata = { title: "Abonnement" };

const ERRORS: Record<string, string> = {
  config: "Le paiement n’est pas encore branché sur ce serveur (clés Stripe manquantes).",
  deja: "Tu as déjà un abonnement actif.",
  complet: "Les places Fondateur sont toutes prises. Le plan Pro reste disponible.",
  stripe: "Stripe n’a pas répondu. Réessaie dans un instant.",
};

const dateFr = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

export default async function AbonnementPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string; ok?: string; erreur?: string }>;
}) {
  const q = await searchParams;
  const db = await getDb();
  if (!db) return null;

  const head = { count: "exact" as const, head: true };
  const [info, ai, projects, schemas, subRow, seats] = await Promise.all([
    planFor(db),
    aiUsedThisMonth(db),
    db.supabase.from("projects").select("id", head).eq("user_id", db.user.id),
    db.supabase.from("project_schemas").select("id", head).eq("user_id", db.user.id),
    db.supabase.from("subscriptions").select("started_at").eq("user_id", db.user.id).maybeSingle(),
    db.supabase.rpc("founder_seats_taken"),
  ]);
  const seatsLeft = Math.max(0, FOUNDER.seats - (seats.data ?? 0));
  const wanted = q.plan === "founder" ? "founder" : "pro";
  const interval = q.interval === "year" ? "year" : "month";
  const today =
    info.plan === "founder"
      ? `${FOUNDER.price} € une fois`
      : info.plan === "pro"
        ? `${LOYALTY_TIERS[info.tier][info.interval ?? "month"]} € / ${info.interval === "year" ? "an" : "mois"}`
        : "0 €";

  return (
    <section className="mx-auto max-w-[760px]">
      <Link
        href="/compte"
        className="mb-4 inline-flex min-h-10 items-center gap-2 text-[14px] text-muted-foreground hover:text-ink"
      >
        <ArrowLeft className="size-4" aria-hidden />
        Retour au compte
      </Link>
      <PageHead art="landing-revenus" label="Abonnement" title={`Tu paies ${today},`} tail={`plan ${PLAN_LABEL[info.plan]}.`}>
        {info.plan === "free"
          ? "Tu es sur le plan Gratuit. Passe Pro quand tu veux : ton prix baissera chaque année."
          : info.plan === "founder"
            ? "Tu es Fondateur : Pro à vie, sans abonnement. Merci !"
            : "Tu es Pro. Ton prix baisse à chaque anniversaire d’abonnement."}
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
            <Usage label="Projets" used={projects.count ?? 0} max={info.limits.projects} />
            <Usage label="Questions IA ce mois" used={ai} max={info.limits.aiPerMonth} />
            <Usage label="Schémas" used={schemas.count ?? 0} max={info.limits.schemas} />
          </div>
        </Reveal>

        {info.plan === "pro" ? (
          <Reveal className="card-soft flex flex-col gap-4 p-5 sm:p-6">
            <p className="mono-label">/ Prix fidélité ///</p>
            <Loyalty tier={info.tier} startedAt={subRow.data?.started_at ?? null} interval={info.interval ?? "month"} />
            {info.periodEnd ? (
              <p className="text-[14px] text-muted-foreground">
                {info.cancelAtPeriodEnd ? "Se termine le " : "Prochaine facture le "}
                <b className="text-ink">{dateFr(info.periodEnd)}</b>.
              </p>
            ) : null}
          </Reveal>
        ) : null}

        {info.plan === "free" ? (
          <Reveal className="flex flex-col gap-4 rounded-[24px] bg-ink p-6 text-accent-ink shadow-lift sm:p-7">
            <p className="font-mono text-[11px] tracking-[0.14em] text-accent-ink/60 uppercase">
              {wanted === "founder" ? "/ Fondateur ///" : "/ Passer Pro ///"}
            </p>
            {wanted === "pro" ? (
              <div className="flex gap-2">
                {(["month", "year"] as const).map((iv) => (
                  <Link
                    key={iv}
                    href={`/abonnement?plan=pro&interval=${iv}`}
                    className={`min-h-10 rounded-pill px-4 text-[13px] font-medium leading-10 ${
                      interval === iv ? "bg-accent-ink text-ink" : "border border-white/20 text-accent-ink/80"
                    }`}
                  >
                    {iv === "month" ? "Mensuel" : "Annuel · 2 mois offerts"}
                  </Link>
                ))}
              </div>
            ) : null}
            <p className="font-display text-[26px] leading-tight font-semibold tracking-tightest">
              {wanted === "founder"
                ? `${FOUNDER.price} € une fois, Pro à vie.`
                : `${LOYALTY_TIERS[0][interval]} € ${interval === "month" ? "par mois" : "par an"}, puis ${LOYALTY_TIERS[1][interval]} €, puis ${LOYALTY_TIERS[2][interval]} €.`}
            </p>
            <p className="text-[14.5px] text-accent-ink/70">
              {wanted === "founder"
                ? `${seatsLeft} place${seatsLeft > 1 ? "s" : ""} restante${seatsLeft > 1 ? "s" : ""} sur ${FOUNDER.seats}.`
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
              {wanted === "pro" ? (
                <Link href="/abonnement?plan=founder" className="text-[14px] text-accent-ink/70 hover:text-accent-ink">
                  ou Fondateur · 149 € une fois
                </Link>
              ) : (
                <Link href="/abonnement?plan=pro" className="text-[14px] text-accent-ink/70 hover:text-accent-ink">
                  ou Pro · 15 € / mois
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

function Loyalty({ tier, startedAt, interval }: { tier: number; startedAt: string | null; interval: "month" | "year" }) {
  const next = LOYALTY_TIERS[tier + 1];
  let nextDate: string | null = null;
  if (next && startedAt) {
    const d = new Date(startedAt);
    d.setUTCFullYear(d.getUTCFullYear() + tier + 1);
    nextDate = dateFr(d.toISOString());
  }
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2">
        {LOYALTY_TIERS.map((t, i) => (
          <div
            key={t.fromYear}
            className={cn(
              "rounded-[14px] border p-3",
              i === tier ? "border-ink bg-ink text-accent-ink" : i < tier ? "border-line text-muted-foreground line-through" : "border-line",
            )}
          >
            <p className="font-display text-[20px] font-semibold tracking-tightest">{t[interval]} €</p>
            <p className={cn("text-[12px]", i === tier ? "text-accent-ink/70" : "text-muted-foreground")}>{t.label}</p>
          </div>
        ))}
      </div>
      <p className="text-[14px] text-muted-foreground">
        {next && nextDate ? (
          <>
            Ton prix passe à <b className="text-ink">{next[interval]} €</b> le <b className="text-ink">{nextDate}</b>.
          </>
        ) : (
          "Tu as atteint le prix le plus bas. Merci de ta fidélité !"
        )}
      </p>
    </div>
  );
}
