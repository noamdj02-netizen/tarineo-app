import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { chargerEtatOnboarding } from "@/lib/onboarding";
import { choisirImportMaintenant, choisirImportPlusTard } from "./actions";

export default async function OnboardingChoixPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/connexion");

  const etat = await chargerEtatOnboarding(session.user.id);
  if (etat.aDesDocuments || etat.parcoursTermine) {
    redirect("/accueil");
  }
  if (etat.importDiffer) {
    redirect("/accueil");
  }

  const prenom = (session.user.name?.split(" ")[0] ?? "Artisan").replace(/^./, (c) => c.toUpperCase());

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-lg flex-col justify-center px-2 py-10">
      <p className="text-sm font-medium uppercase tracking-wider text-primary">Bienvenue</p>
      <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-4xl">
        Bonjour {prenom}.
      </h1>
      <p className="mt-4 text-base leading-relaxed text-muted-foreground">
        Importez quelques documents et Tarinéo construit automatiquement votre espace — fournisseurs,
        produits, historique de prix.
      </p>

      <p className="mt-10 text-lg font-medium text-foreground">Vous avez vos documents sous la main&nbsp;?</p>

      <form action={choisirImportMaintenant} className="mt-6">
        <button
          type="submit"
          className="flex h-14 w-full items-center justify-center rounded-full bg-primary text-base font-semibold text-white hover:opacity-95"
        >
          Importer maintenant
        </button>
      </form>

      <form action={choisirImportPlusTard} className="mt-3">
        <button
          type="submit"
          className="flex h-14 w-full items-center justify-center rounded-full border border-border bg-card text-base font-medium text-foreground hover:bg-secondary"
        >
          Je le ferai plus tard
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Sur téléphone, en camion ou chez un client : vous pourrez reprendre depuis n&apos;importe quel appareil.
      </p>
    </div>
  );
}
