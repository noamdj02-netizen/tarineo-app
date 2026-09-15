import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { DEMO_UTILISATEUR } from "@/lib/uiDemo";
import { BoutonSuppression } from "./BoutonSuppression";
import { FormulaireMotDePasse } from "./FormulaireMotDePasse";
import { GestionAbonnement } from "./GestionAbonnement";

const LIBELLE_PLAN: Record<string, string> = { starter: "Starter", pro: "Pro", equipe: "Équipe" };

async function supprimerMonCompte() {
  "use server";

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/connexion");
  }

  await prisma.user.delete({ where: { id: session.user.id } });

  await signOut({ redirectTo: "/" });
}

export default async function ComptePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/connexion");
  }

  const emailSession = session.user.email ?? "";
  const email =
    emailSession ||
    (session.user.id ? DEMO_UTILISATEUR.email : "");
  const nom =
    session.user.name ??
    (email.toLowerCase() === DEMO_UTILISATEUR.email ? DEMO_UTILISATEUR.nom : null);

  let utilisateur: {
    passwordHash: string | null;
    plan: string | null;
    stripeSubscriptionId: string | null;
    name: string | null;
    email: string;
  } | null = null;
  let dbIndisponible = false;

  try {
    utilisateur = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true, plan: true, stripeSubscriptionId: true, name: true, email: true },
    });
  } catch {
    dbIndisponible = true;
  }

  if (!utilisateur && !dbIndisponible) {
    redirect("/connexion");
  }

  const nomAffiche = utilisateur?.name ?? nom ?? DEMO_UTILISATEUR.nom;
  const emailAffiche = utilisateur?.email ?? email;

  let abonnement: { intervalle: "month" | "year"; dateFin: string; resiliationProgrammee: boolean } | null = null;
  if (utilisateur?.stripeSubscriptionId) {
    try {
      const subscription = await stripe.subscriptions.retrieve(utilisateur.stripeSubscriptionId);
      const item = subscription.items.data[0];
      if (item) {
        abonnement = {
          intervalle: item.price.recurring?.interval === "year" ? "year" : "month",
          dateFin: new Date(item.current_period_end * 1000).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          }),
          resiliationProgrammee: subscription.cancel_at_period_end,
        };
      }
    } catch {
      // Stripe indisponible ou abonnement invalide — on ignore silencieusement.
    }
  }

  return (
    <div className="app-page flex flex-col gap-5">
      <h1 className="app-display text-2xl font-semibold text-[var(--foreground)]">Mon compte</h1>

      {dbIndisponible && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Connexion à la base de données impossible. Les informations affichées proviennent de votre session.
        </p>
      )}

      <section className="app-card p-5 sm:p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Nom</h2>
        <p className="mt-1 text-base font-medium text-foreground">{nomAffiche}</p>
      </section>

      <section className="app-card p-5 sm:p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Adresse email</h2>
        <p className="mt-1">{emailAffiche}</p>
      </section>

      {utilisateur?.passwordHash && <FormulaireMotDePasse />}

      {abonnement && (
        <GestionAbonnement
          planLabel={LIBELLE_PLAN[utilisateur?.plan ?? ""] ?? "—"}
          intervalle={abonnement.intervalle}
          dateFin={abonnement.dateFin}
          resiliationDejaProgrammee={abonnement.resiliationProgrammee}
        />
      )}

      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/" });
        }}
        className="mt-4"
      >
        <button type="submit" className="w-full app-btn-secondary sm:w-auto">
          Déconnexion
        </button>
      </form>

      {!dbIndisponible && (
        <section className="mt-8 app-banner-warn">
          <h2 className="text-lg font-semibold text-red-600">Supprimer mon compte</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Cette action est définitive et efface immédiatement toutes vos données : devis, factures, historique de
            prix, et informations personnelles, conformément au RGPD.
          </p>
          <form action={supprimerMonCompte} className="mt-4">
            <BoutonSuppression />
          </form>
        </section>
      )}
    </div>
  );
}
