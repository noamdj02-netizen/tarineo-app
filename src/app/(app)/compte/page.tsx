import Link from "next/link";
import { redirect } from "next/navigation";
import { auth, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { estCleStockageAvatar, resoudreUrlAvatar } from "@/lib/avatarUtilisateur";
import { BoutonSuppression } from "./BoutonSuppression";
import { FormulaireMotDePasse } from "./FormulaireMotDePasse";
import { GestionAbonnement } from "./GestionAbonnement";
import { PhotoProfil } from "./PhotoProfil";
import { supprimerMonCompte } from "./actions";

const LIBELLE_PLAN: Record<string, string> = { starter: "Starter", pro: "Pro", equipe: "Équipe" };

export default async function ComptePage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/connexion");
  }

  let utilisateur: {
    passwordHash: string | null;
    plan: string | null;
    stripeSubscriptionId: string | null;
    name: string | null;
    email: string;
    image: string | null;
  } | null = null;
  let dbIndisponible = false;

  try {
    utilisateur = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        passwordHash: true,
        plan: true,
        stripeSubscriptionId: true,
        name: true,
        email: true,
        image: true,
      },
    });
  } catch {
    dbIndisponible = true;
  }

  if (!utilisateur && !dbIndisponible) {
    redirect("/connexion");
  }

  const nomAffiche = utilisateur?.name ?? session.user.name ?? "—";
  const emailAffiche = utilisateur?.email ?? session.user.email ?? "—";
  const avatarUrl = await resoudreUrlAvatar(utilisateur?.image);
  const initiale = (nomAffiche.charAt(0) || "T").toUpperCase();
  const photoPersonnalisee = Boolean(utilisateur?.image && estCleStockageAvatar(utilisateur.image));

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

      {!dbIndisponible && (
        <PhotoProfil avatarUrl={avatarUrl} initiale={initiale} photoPersonnalisee={photoPersonnalisee} />
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

      <section className="app-card p-5 sm:p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Informations légales</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Consultez les politiques et conditions applicables à votre utilisation de Tarineo.
        </p>
        <Link href="/legal" className="mt-4 inline-flex app-btn-secondary">
          Voir les documents légaux
        </Link>
      </section>

      <section className="app-card p-5 sm:p-6">
        <h2 className="text-sm font-medium text-muted-foreground">Vos données (RGPD)</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Téléchargez une copie de vos documents et informations enregistrées chez Tarineo.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/api/compte/export-donnees" className="inline-flex app-btn-secondary" download>
            Export JSON
          </Link>
          <Link href="/api/compte/export-donnees?format=zip" className="inline-flex app-btn-secondary" download>
            Export ZIP
          </Link>
        </div>
      </section>

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
            Cette action est définitive : abonnement Stripe annulé, fichiers supprimés du stockage, et données effacées
            en base, conformément au RGPD.
          </p>
          <form action={supprimerMonCompte} className="mt-4">
            <BoutonSuppression />
          </form>
        </section>
      )}
    </div>
  );
}
