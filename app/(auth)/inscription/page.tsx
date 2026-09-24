import Link from "next/link";
import { AuthCard } from "@/components/auth/auth-ui";
import { SignupForm } from "./signup-form";

export const metadata = { title: "Créer un compte" };

/** Après confirmation : l'app, ou directement le paiement si un plan a été choisi sur /prix. */
function nextFor(plan?: string, interval?: string, q?: string) {
  const paid = plan === "pro" || plan === "starter" || plan === "founder";
  if (!paid) {
    return q ? `/onboarding?${new URLSearchParams({ ask: q.slice(0, 500) })}` : "/onboarding";
  }
  const sp = new URLSearchParams({ plan: plan! });
  if ((plan === "pro" || plan === "starter") && (interval === "month" || interval === "year")) {
    sp.set("interval", interval);
  }
  return `/onboarding?next=${encodeURIComponent(`/abonnement?${sp}`)}`;
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string; interval?: string; q?: string }>;
}) {
  const { plan, interval, q } = await searchParams;
  return (
    <AuthCard
      art="onboarding-premier-pas"
      label="Inscription"
      title="Crée ton cockpit."
      text={
        plan === "pro" || plan === "starter" || plan === "founder"
          ? "Crée ton compte : essai Pro sans carte, puis tu choisis ta formule."
          : "Gratuit, sans carte bancaire. Une minute suffit."
      }
      footer={
        <>
          Déjà un compte ?{" "}
          <Link href="/login" className="font-medium text-ink underline-offset-4 hover:underline">
            Se connecter
          </Link>
        </>
      }
    >
      <SignupForm next={nextFor(plan, interval, q)} />
    </AuthCard>
  );
}
